import { once } from "node:events";
import { mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { cpus } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import tls from "node:tls";
import Forge from "node-forge";
import WebSocket, { WebSocketServer } from "ws";

import { HTTPMITM } from "../dist/index.mjs";

const MB = 1024 * 1024;

const profiles = {
  quick: {
    httpRequests: 250,
    httpConcurrency: 10,
    warmupRequests: 25,
    memoryRequests: 12,
    memoryConcurrency: 3,
    memoryBodyBytes: 128 * 1024,
    certCount: 6,
    certConcurrency: 2,
    wsFrames: 500,
    wsWindow: 16,
    wsPayloadBytes: 64,
    lifecycleIterations: 3
  },
  standard: {
    httpRequests: 1000,
    httpConcurrency: 25,
    warmupRequests: 100,
    memoryRequests: 40,
    memoryConcurrency: 4,
    memoryBodyBytes: 512 * 1024,
    certCount: 20,
    certConcurrency: 4,
    wsFrames: 2000,
    wsWindow: 32,
    wsPayloadBytes: 128,
    lifecycleIterations: 5
  },
  heavy: {
    httpRequests: 5000,
    httpConcurrency: 100,
    warmupRequests: 500,
    memoryRequests: 100,
    memoryConcurrency: 8,
    memoryBodyBytes: 1024 * 1024,
    certCount: 75,
    certConcurrency: 8,
    wsFrames: 10000,
    wsWindow: 128,
    wsPayloadBytes: 256,
    lifecycleIterations: 10
  }
};

function getArgValue(name) {
  const args = process.argv.slice(2);
  const prefix = `${name}=`;
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === name) {
      return args[index + 1];
    }
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length);
    }
  }
  return undefined;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function getNumberOption(name, fallback) {
  const envName = `BENCH_${name.toUpperCase()}`;
  const raw = process.env[envName] || getArgValue(`--${name}`);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getConfig() {
  const profileName =
    getArgValue("--profile") || process.env.BENCH_PROFILE || "standard";
  const profile = profiles[profileName];
  if (!profile) {
    throw new Error(
      `Unknown benchmark profile "${profileName}". Expected quick, standard, or heavy.`
    );
  }

  return {
    profileName,
    httpRequests: getNumberOption("http_requests", profile.httpRequests),
    httpConcurrency: getNumberOption(
      "http_concurrency",
      profile.httpConcurrency
    ),
    warmupRequests: getNumberOption("warmup_requests", profile.warmupRequests),
    memoryRequests: getNumberOption("memory_requests", profile.memoryRequests),
    memoryConcurrency: getNumberOption(
      "memory_concurrency",
      profile.memoryConcurrency
    ),
    memoryBodyBytes: getNumberOption(
      "memory_body_bytes",
      profile.memoryBodyBytes
    ),
    certCount: getNumberOption("cert_count", profile.certCount),
    certConcurrency: getNumberOption("cert_concurrency", profile.certConcurrency),
    wsFrames: getNumberOption("ws_frames", profile.wsFrames),
    wsWindow: getNumberOption("ws_window", profile.wsWindow),
    wsPayloadBytes: getNumberOption("ws_payload_bytes", profile.wsPayloadBytes),
    lifecycleIterations: getNumberOption(
      "lifecycle_iterations",
      profile.lifecycleIterations
    )
  };
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function formatNumber(value, fractionDigits = 2) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  });
}

function bytesToMiB(value) {
  return value / MB;
}

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * sortedValues.length) - 1)
  );
  return sortedValues[index];
}

function summarizeLatency(durationMsValues) {
  const sorted = [...durationMsValues].sort((a, b) => a - b);
  return {
    min_ms: sorted[0] || 0,
    p50_ms: percentile(sorted, 50),
    p90_ms: percentile(sorted, 90),
    p95_ms: percentile(sorted, 95),
    p99_ms: percentile(sorted, 99),
    max_ms: sorted[sorted.length - 1] || 0
  };
}

function summarizeBenchmark(params) {
  return {
    name: params.name,
    description: params.description,
    unit: params.unit,
    primary_metric: params.primary_metric,
    metrics: params.metrics
  };
}

async function closeNodeServer(server) {
  if (!server.listening) {
    return;
  }
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function closeWebSocketServer(server) {
  await new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function startHttpServer(handler) {
  const server = http.createServer(handler);
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    server,
    port: server.address().port
  };
}

function generateSelfSignedCertificate() {
  const keys = Forge.pki.rsa.generateKeyPair(2048);
  const cert = Forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject([{ name: "commonName", value: "127.0.0.1" }]);
  cert.setIssuer([{ name: "commonName", value: "127.0.0.1" }]);
  cert.setExtensions([
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" }
      ]
    }
  ]);
  cert.sign(keys.privateKey, Forge.md.sha256.create());
  return {
    key: Forge.pki.privateKeyToPem(keys.privateKey),
    cert: Forge.pki.certificateToPem(cert)
  };
}

async function startHttpsServer(handler) {
  const tlsOptions = generateSelfSignedCertificate();
  const server = https.createServer(tlsOptions, handler);
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    server,
    port: server.address().port
  };
}

async function startWebSocketEchoServer() {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  server.on("connection", (socket) => {
    socket.on("message", (message) => {
      socket.send(message);
    });
  });
  return {
    server,
    port: server.address().port
  };
}

async function startMitm(startParams = {}) {
  const httpmitm = new HTTPMITM();
  const server = await httpmitm.start({
    host: "127.0.0.1",
    listen_port: 0,
    certificates: {
      root_ca: { storage: "memory" },
      leaf_certificates: { storage: "memory" }
    },
    ...startParams
  });
  return {
    httpmitm,
    server
  };
}

async function runConcurrent(params) {
  let nextIndex = 0;
  const results = new Array(params.total);
  const workerCount = Math.min(params.concurrency, params.total);

  async function worker() {
    while (nextIndex < params.total) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await params.task(currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      await worker();
    })
  );
  return results;
}

async function sendDirectHttpRequest(params) {
  const startedAt = performance.now();
  return await new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port: params.targetPort,
        method: params.method || "GET",
        path: params.path || "/",
        headers: params.headers || {}
      },
      (response) => {
        let bytes = 0;
        response.on("data", (chunk) => {
          bytes += Buffer.byteLength(chunk);
        });
        response.on("end", () => {
          resolve({
            durationMs: performance.now() - startedAt,
            statusCode: response.statusCode || 0,
            bytes
          });
        });
      }
    );
    request.on("error", reject);
    if (params.body) {
      request.write(params.body);
    }
    request.end();
  });
}

async function sendHttpRequestViaProxy(params) {
  const body = params.body ? Buffer.from(params.body) : undefined;
  const startedAt = performance.now();
  return await new Promise((resolve, reject) => {
    const headers = {
      host: `127.0.0.1:${params.targetPort}`,
      ...(params.headers || {})
    };
    if (body && !headers["content-length"]) {
      headers["content-length"] = String(body.length);
    }
    const request = http.request(
      {
        host: "127.0.0.1",
        port: params.proxyPort,
        method: params.method || "GET",
        path: `http://127.0.0.1:${params.targetPort}${params.path || "/"}`,
        headers
      },
      (response) => {
        let bytes = 0;
        response.on("data", (chunk) => {
          bytes += Buffer.byteLength(chunk);
        });
        response.on("end", () => {
          resolve({
            durationMs: performance.now() - startedAt,
            statusCode: response.statusCode || 0,
            bytes
          });
        });
      }
    );
    request.on("error", reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });
}

async function runHttpLoad(params) {
  if (params.warmupRequests > 0) {
    await runConcurrent({
      total: params.warmupRequests,
      concurrency: Math.min(params.concurrency, params.warmupRequests),
      task: params.request
    });
  }

  const startedAt = performance.now();
  const results = await runConcurrent({
    total: params.total,
    concurrency: params.concurrency,
    task: params.request
  });
  const elapsedSeconds = (performance.now() - startedAt) / 1000;
  const durations = results.map((result) => result.durationMs);
  const failed = results.filter((result) => result.statusCode >= 400).length;
  const bytes = results.reduce((sum, result) => sum + result.bytes, 0);

  return {
    requests: params.total,
    concurrency: params.concurrency,
    elapsed_seconds: elapsedSeconds,
    requests_per_second: params.total / elapsedSeconds,
    transfer_mib_per_second: bytes / MB / elapsedSeconds,
    failed_responses: failed,
    ...summarizeLatency(durations)
  };
}

function createMemorySampler() {
  let interval;
  const samples = [];

  function sample() {
    samples.push(process.memoryUsage());
  }

  return {
    start() {
      if (global.gc) {
        global.gc();
      }
      sample();
      interval = setInterval(sample, 25);
    },
    stop() {
      if (interval) {
        clearInterval(interval);
      }
      sample();
      if (global.gc) {
        global.gc();
      }
      sample();
      const baseline = samples[0];
      const final = samples[samples.length - 1];
      const peak = samples.reduce(
        (currentPeak, item) => ({
          rss: Math.max(currentPeak.rss, item.rss),
          heapUsed: Math.max(currentPeak.heapUsed, item.heapUsed),
          external: Math.max(currentPeak.external, item.external)
        }),
        { rss: 0, heapUsed: 0, external: 0 }
      );

      return {
        gc_available: Boolean(global.gc),
        baseline_rss_mib: bytesToMiB(baseline.rss),
        peak_rss_mib: bytesToMiB(peak.rss),
        final_rss_mib: bytesToMiB(final.rss),
        peak_rss_delta_mib: bytesToMiB(peak.rss - baseline.rss),
        baseline_heap_mib: bytesToMiB(baseline.heapUsed),
        peak_heap_mib: bytesToMiB(peak.heapUsed),
        final_heap_mib: bytesToMiB(final.heapUsed),
        peak_heap_delta_mib: bytesToMiB(peak.heapUsed - baseline.heapUsed),
        peak_external_mib: bytesToMiB(peak.external),
        sample_count: samples.length
      };
    }
  };
}

async function withTimeout(promise, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function waitForTlsSecureConnect(socket) {
  await new Promise((resolve, reject) => {
    const onSecureConnect = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      socket.off("secureConnect", onSecureConnect);
      socket.off("error", onError);
    };
    socket.once("secureConnect", onSecureConnect);
    socket.once("error", onError);
  });
}

async function sendHttpsConnectRequestViaProxy(params) {
  const startedAt = performance.now();
  const socket = net.connect({
    host: "127.0.0.1",
    port: params.proxyPort
  });
  await once(socket, "connect");

  socket.write(
    [
      `CONNECT ${params.connectHost}:${params.targetPort} HTTP/1.1`,
      `Host: ${params.connectHost}:${params.targetPort}`,
      "",
      ""
    ].join("\r\n")
  );

  let connectResponse = Buffer.alloc(0);
  while (!connectResponse.includes(Buffer.from("\r\n\r\n"))) {
    const [chunk] = await once(socket, "data");
    connectResponse = Buffer.concat([connectResponse, chunk]);
  }
  invariant(
    connectResponse.toString("utf8").startsWith("HTTP/1.1 200 OK"),
    `Unexpected CONNECT response: ${connectResponse.toString("utf8")}`
  );

  const tlsSocket = tls.connect({
    socket,
    servername: params.servername,
    ca: Buffer.from(params.caCertPem),
    rejectUnauthorized: true
  });
  await withTimeout(
    waitForTlsSecureConnect(tlsSocket),
    10_000,
    "TLS secureConnect"
  );

  tlsSocket.write(
    [
      "GET / HTTP/1.1",
      `Host: 127.0.0.1:${params.targetPort}`,
      "Connection: close",
      "",
      ""
    ].join("\r\n")
  );

  let responseBytes = 0;
  await new Promise((resolve, reject) => {
    tlsSocket.on("data", (chunk) => {
      responseBytes += Buffer.byteLength(chunk);
    });
    tlsSocket.once("end", resolve);
    tlsSocket.once("error", reject);
  });

  return {
    durationMs: performance.now() - startedAt,
    bytes: responseBytes
  };
}

async function measureWebSocketFrames(params) {
  const payloadSuffix = "x".repeat(Math.max(0, params.payloadBytes - 16));
  const inFlight = new Map();
  const durations = [];
  let sent = 0;
  let received = 0;
  const startedAt = performance.now();

  await new Promise((resolve, reject) => {
    function pump() {
      while (sent < params.totalFrames && inFlight.size < params.windowSize) {
        const frameId = sent;
        sent += 1;
        inFlight.set(frameId, performance.now());
        params.client.send(`${frameId}:${payloadSuffix}`);
      }
    }

    params.client.on("message", (message) => {
      const text = message.toString();
      const separatorIndex = text.indexOf(":");
      const frameId = Number(text.slice(0, separatorIndex));
      const frameStartedAt = inFlight.get(frameId);
      if (typeof frameStartedAt === "number") {
        inFlight.delete(frameId);
        durations.push(performance.now() - frameStartedAt);
      }
      received += 1;
      if (received >= params.totalFrames) {
        resolve();
        return;
      }
      pump();
    });
    params.client.once("error", reject);
    pump();
  });

  const elapsedSeconds = (performance.now() - startedAt) / 1000;
  return {
    frames: params.totalFrames,
    window: params.windowSize,
    payload_bytes: params.payloadBytes,
    elapsed_seconds: elapsedSeconds,
    frames_per_second: params.totalFrames / elapsedSeconds,
    ...summarizeLatency(durations)
  };
}

async function benchmarkDirectHttp(config) {
  const upstream = await startHttpServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
  });

  try {
    const metrics = await runHttpLoad({
      total: config.httpRequests,
      concurrency: config.httpConcurrency,
      warmupRequests: config.warmupRequests,
      request: async () =>
        await sendDirectHttpRequest({ targetPort: upstream.port })
    });
    return summarizeBenchmark({
      name: "http_direct_baseline",
      description: "Direct HTTP upstream baseline without HTTPMITM.",
      unit: "requests",
      primary_metric: "requests_per_second",
      metrics
    });
  } finally {
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkHttpPassthrough(config) {
  const upstream = await startHttpServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
  });
  const mitm = await startMitm();

  try {
    const metrics = await runHttpLoad({
      total: config.httpRequests,
      concurrency: config.httpConcurrency,
      warmupRequests: config.warmupRequests,
      request: async () =>
        await sendHttpRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port
        })
    });
    return summarizeBenchmark({
      name: "http_proxy_passthrough",
      description: "HTTP proxy passthrough throughput and latency.",
      unit: "requests",
      primary_metric: "requests_per_second",
      metrics
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkHttpCallbacks(config) {
  const upstream = await startHttpServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
  });
  const mitm = await startMitm({
    http: {
      client_to_server: {
        requestHeaders: async () => ({ state: "PASSTHROUGH" })
      },
      server_to_client: {
        responseHeaders: async () => ({ state: "PASSTHROUGH" })
      }
    }
  });

  try {
    const metrics = await runHttpLoad({
      total: config.httpRequests,
      concurrency: config.httpConcurrency,
      warmupRequests: config.warmupRequests,
      request: async () =>
        await sendHttpRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port
        })
    });
    return summarizeBenchmark({
      name: "http_proxy_header_callbacks",
      description: "HTTP proxy throughput with awaited header callbacks.",
      unit: "requests",
      primary_metric: "requests_per_second",
      metrics
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkHttpSerialLatency(config) {
  const upstream = await startHttpServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
  });
  const mitm = await startMitm();

  try {
    const metrics = await runHttpLoad({
      total: Math.max(50, Math.floor(config.httpRequests / 4)),
      concurrency: 1,
      warmupRequests: Math.min(25, config.warmupRequests),
      request: async () =>
        await sendHttpRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port
        })
    });
    return summarizeBenchmark({
      name: "http_proxy_serial_latency",
      description: "Single-flight HTTP proxy latency distribution.",
      unit: "requests",
      primary_metric: "p50_ms",
      metrics
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkHttpBodyMemory(config) {
  const responseBody = Buffer.alloc(config.memoryBodyBytes, 0x61);
  const upstream = await startHttpServer((request, response) => {
    request.resume();
    request.on("end", () => {
      response.writeHead(200, {
        "content-type": "application/octet-stream",
        "content-length": String(responseBody.length)
      });
      response.end(responseBody);
    });
  });
  const mitm = await startMitm({
    limits: {
      request_body_bytes: Math.max(config.memoryBodyBytes * 2, 10 * MB),
      response_body_bytes: Math.max(config.memoryBodyBytes * 2, 25 * MB)
    },
    http: {
      client_to_server: {
        requestData: async () => ({ state: "PASSTHROUGH" })
      },
      server_to_client: {
        responseData: async () => ({ state: "PASSTHROUGH" })
      }
    }
  });

  const sampler = createMemorySampler();
  const requestBody = Buffer.alloc(config.memoryBodyBytes, 0x62);

  try {
    sampler.start();
    const startedAt = performance.now();
    const results = await runConcurrent({
      total: config.memoryRequests,
      concurrency: config.memoryConcurrency,
      task: async () =>
        await sendHttpRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port,
          method: "POST",
          body: requestBody
        })
    });
    const elapsedSeconds = (performance.now() - startedAt) / 1000;
    const memory = sampler.stop();
    const durations = results.map((result) => result.durationMs);
    const transferredBytes = results.reduce(
      (sum, result) => sum + result.bytes + requestBody.length,
      0
    );

    return summarizeBenchmark({
      name: "http_body_buffering_memory",
      description:
        "Memory and throughput while requestData and responseData buffer bodies.",
      unit: "requests",
      primary_metric: "peak_rss_delta_mib",
      metrics: {
        requests: config.memoryRequests,
        concurrency: config.memoryConcurrency,
        body_bytes_each_direction: config.memoryBodyBytes,
        elapsed_seconds: elapsedSeconds,
        requests_per_second: config.memoryRequests / elapsedSeconds,
        transfer_mib_per_second: transferredBytes / MB / elapsedSeconds,
        ...summarizeLatency(durations),
        ...memory
      }
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkCertificateGeneration(config) {
  const upstream = await startHttpsServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("cert-ok");
  });
  const mitm = await startMitm({
    https_agent: new https.Agent({ rejectUnauthorized: false }),
    certificates: {
      root_ca: { storage: "memory" },
      leaf_certificates: {
        storage: "memory",
        wildcard: "exact_host",
        cache: { max_entries: config.certCount + 10, ttl_ms: 3_600_000 }
      }
    }
  });

  try {
    const startedAt = performance.now();
    const results = await runConcurrent({
      total: config.certCount,
      concurrency: config.certConcurrency,
      task: async (index) => {
        const host = `cert-${index}.example.com`;
        return await sendHttpsConnectRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port,
          caCertPem: mitm.server.ca.cert_pem,
          connectHost: host,
          servername: host
        });
      }
    });
    const elapsedSeconds = (performance.now() - startedAt) / 1000;

    return summarizeBenchmark({
      name: "https_certificate_generation_rate",
      description:
        "HTTPS CONNECT interception with unique exact-host memory leaf generation.",
      unit: "certificates",
      primary_metric: "certificates_per_second",
      metrics: {
        certificates: config.certCount,
        concurrency: config.certConcurrency,
        elapsed_seconds: elapsedSeconds,
        certificates_per_second: config.certCount / elapsedSeconds,
        leaf_cache_entries: mitm.server.proxy.ca.leafCache.size,
        generated_ssl_server_entries: Object.keys(mitm.server.proxy.sslServers)
          .length,
        ...summarizeLatency(results.map((result) => result.durationMs))
      }
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkCertificateWildcardReuse(config) {
  const upstream = await startHttpsServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("wildcard-ok");
  });
  const mitm = await startMitm({
    https_agent: new https.Agent({ rejectUnauthorized: false }),
    certificates: {
      root_ca: { storage: "memory" },
      leaf_certificates: {
        storage: "memory",
        wildcard: "registrable_domain",
        cache: { max_entries: config.certCount + 10, ttl_ms: 3_600_000 }
      }
    }
  });

  try {
    const startedAt = performance.now();
    const results = await runConcurrent({
      total: config.certCount,
      concurrency: config.certConcurrency,
      task: async (index) => {
        const host = `wild-${index}.example.com`;
        return await sendHttpsConnectRequestViaProxy({
          proxyPort: mitm.server.listen_port,
          targetPort: upstream.port,
          caCertPem: mitm.server.ca.cert_pem,
          connectHost: host,
          servername: host
        });
      }
    });
    const elapsedSeconds = (performance.now() - startedAt) / 1000;

    return summarizeBenchmark({
      name: "https_wildcard_certificate_reuse",
      description:
        "HTTPS CONNECT throughput when registrable-domain wildcard leaf reuse is enabled.",
      unit: "connects",
      primary_metric: "connects_per_second",
      metrics: {
        connects: config.certCount,
        concurrency: config.certConcurrency,
        elapsed_seconds: elapsedSeconds,
        connects_per_second: config.certCount / elapsedSeconds,
        leaf_cache_entries: mitm.server.proxy.ca.leafCache.size,
        generated_ssl_server_entries: Object.keys(mitm.server.proxy.sslServers)
          .length,
        ...summarizeLatency(results.map((result) => result.durationMs))
      }
    });
  } finally {
    await mitm.server.close();
    await closeNodeServer(upstream.server);
  }
}

async function benchmarkWebSocketFrames(config, callbackMode) {
  const upstream = await startWebSocketEchoServer();
  const websocketOptions = callbackMode
    ? {
        websocket: {
          onServerUpgrade: async () => ({ state: "PASSTHROUGH" }),
          onFrameSent: async () => ({ state: "PASSTHROUGH" }),
          onFrameReceived: async () => ({ state: "PASSTHROUGH" })
        }
      }
    : {};
  const mitm = await startMitm(websocketOptions);
  const client = new WebSocket(`ws://127.0.0.1:${mitm.server.listen_port}/`, {
    headers: {
      host: `127.0.0.1:${upstream.port}`
    }
  });

  try {
    await once(client, "open");
    const metrics = await measureWebSocketFrames({
      client,
      totalFrames: config.wsFrames,
      windowSize: config.wsWindow,
      payloadBytes: config.wsPayloadBytes
    });
    return summarizeBenchmark({
      name: callbackMode
        ? "websocket_frame_rate_callbacks"
        : "websocket_frame_rate_passthrough",
      description: callbackMode
        ? "WebSocket round-trip frame rate with awaited frame callbacks."
        : "WebSocket round-trip frame rate through HTTPMITM.",
      unit: "frames",
      primary_metric: "frames_per_second",
      metrics
    });
  } finally {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
      await once(client, "close");
    }
    await mitm.server.close();
    await closeWebSocketServer(upstream.server);
  }
}

async function benchmarkLifecycle(config) {
  const durations = [];
  for (let index = 0; index < config.lifecycleIterations; index += 1) {
    const startedAt = performance.now();
    const mitm = await startMitm();
    await mitm.server.close();
    durations.push(performance.now() - startedAt);
  }

  return summarizeBenchmark({
    name: "lifecycle_start_stop",
    description: "HTTPMITM start plus awaited close timing.",
    unit: "iterations",
    primary_metric: "p50_ms",
    metrics: {
      iterations: config.lifecycleIterations,
      ...summarizeLatency(durations)
    }
  });
}

function printHumanReport(report) {
  console.log("");
  console.log(`HTTPMITM benchmark profile: ${report.config.profileName}`);
  console.log(`Node.js: ${report.environment.node}`);
  console.log(`Platform: ${report.environment.platform}`);
  console.log("");

  for (const result of report.results) {
    const metricName = result.primary_metric;
    const metricValue = result.metrics[metricName];
    console.log(`${result.name}`);
    console.log(`  ${result.description}`);
    console.log(`  ${metricName}: ${formatNumber(metricValue)}`);
    if (typeof result.metrics.p50_ms === "number") {
      console.log(
        `  latency ms p50/p95/p99: ${formatNumber(
          result.metrics.p50_ms
        )} / ${formatNumber(result.metrics.p95_ms)} / ${formatNumber(
          result.metrics.p99_ms
        )}`
      );
    }
    if (typeof result.metrics.requests_per_second === "number") {
      console.log(
        `  requests/sec: ${formatNumber(result.metrics.requests_per_second)}`
      );
    }
    if (typeof result.metrics.frames_per_second === "number") {
      console.log(
        `  frames/sec: ${formatNumber(result.metrics.frames_per_second)}`
      );
    }
    if (typeof result.metrics.peak_rss_delta_mib === "number") {
      console.log(
        `  peak RSS delta MiB: ${formatNumber(
          result.metrics.peak_rss_delta_mib
        )}`
      );
    }
    console.log("");
  }

  if (!global.gc) {
    console.log(
      "Memory benchmark note: run with `node --expose-gc benchmarks/run-benchmarks.mjs` for cleaner GC-delimited memory readings."
    );
  }
}

async function main() {
  const config = getConfig();
  const outputPath = getArgValue("--output") || process.env.BENCH_OUTPUT_FILE;
  const jsonOutput = hasArg("--json") || process.env.BENCH_OUTPUT === "json";
  const verbose = hasArg("--verbose") || process.env.BENCH_VERBOSE === "1";

  if (!verbose) {
    console.debug = () => undefined;
    console.info = () => undefined;
  }

  const benchmarkFns = [
    benchmarkDirectHttp,
    benchmarkHttpPassthrough,
    benchmarkHttpCallbacks,
    benchmarkHttpSerialLatency,
    benchmarkHttpBodyMemory,
    benchmarkCertificateGeneration,
    benchmarkCertificateWildcardReuse,
    async (activeConfig) => await benchmarkWebSocketFrames(activeConfig, false),
    async (activeConfig) => await benchmarkWebSocketFrames(activeConfig, true),
    benchmarkLifecycle
  ];
  const results = [];

  for (const benchmarkFn of benchmarkFns) {
    results.push(await benchmarkFn(config));
  }

  const report = {
    generated_at: new Date().toISOString(),
    config,
    environment: {
      node: process.version,
      platform: `${process.platform} ${process.arch}`,
      cpus: cpus().length,
      pid: process.pid,
      gc_available: Boolean(global.gc)
    },
    results
  };

  if (outputPath) {
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printHumanReport(report);
}

await main();
