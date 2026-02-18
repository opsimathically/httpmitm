import assert from "node:assert";
import { once } from "node:events";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import test from "node:test";
import { brotliCompressSync, brotliDecompressSync, gunzipSync, gzipSync } from "node:zlib";
import WebSocket, { WebSocketServer } from "ws";

import { HTTPMITM } from "../../src";
import type { httpmitm_start_params_t } from "../../src";

type http_server_result_t = {
  server: http.Server;
  port: number;
};

type http_proxy_request_result_t = {
  status_code: number;
  headers: IncomingMessage["headers"];
  raw_body: Buffer;
  body: string;
};

function Delay(params: { ms: number }): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, params.ms);
  });
}

async function StartHttpServer(params: {
  handler: (request: IncomingMessage, response: ServerResponse) => void;
}): Promise<http_server_result_t> {
  const server = http.createServer(params.handler);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  return {
    server,
    port: (server.address() as AddressInfo).port,
  };
}

async function CloseHttpServer(params: { server: http.Server }): Promise<void> {
  await new Promise<void>((resolve) => {
    params.server.close(() => resolve());
  });
}

async function CloseWebSocketServer(params: {
  websocket_server: WebSocketServer;
}): Promise<void> {
  await new Promise<void>((resolve) => {
    params.websocket_server.close(() => resolve());
  });
}

function CreateSslCaDir(params: { test_name: string }): string {
  const safe_test_name = params.test_name.replace(/[^a-zA-Z0-9]/g, "_");
  return path.join("/tmp", `httpmitm_${safe_test_name}_${Date.now()}`);
}

async function StartHttpMitm(params: {
  start_params: httpmitm_start_params_t;
}): Promise<Awaited<ReturnType<HTTPMITM["start"]>> & { httpmitm: HTTPMITM }> {
  const httpmitm = new HTTPMITM();
  const server = await httpmitm.start(params.start_params);
  return {
    ...server,
    httpmitm,
  };
}

async function SendHttpRequestViaProxy(params: {
  proxy_port: number;
  target_port: number;
  method: string;
  path: string;
  body?: string | Buffer;
  headers?: Record<string, string>;
}): Promise<http_proxy_request_result_t> {
  return new Promise((resolve, reject) => {
    const request_body =
      typeof params.body === "undefined"
        ? Buffer.alloc(0)
        : Buffer.isBuffer(params.body)
          ? params.body
          : Buffer.from(params.body);
    const request_headers: Record<string, string> = {
      host: `127.0.0.1:${params.target_port}`,
      ...params.headers,
    };

    if (request_body.length > 0 && !request_headers["content-length"]) {
      request_headers["content-length"] = String(request_body.length);
    }

    const request = http.request(
      {
        host: "127.0.0.1",
        port: params.proxy_port,
        method: params.method,
        path: `http://127.0.0.1:${params.target_port}${params.path}`,
        headers: request_headers,
      },
      (response) => {
        const response_chunks: Buffer[] = [];
        response.on("data", (chunk) => {
          response_chunks.push(Buffer.from(chunk));
        });
        response.on("end", () => {
          const raw_body = Buffer.concat(response_chunks);
          resolve({
            status_code: response.statusCode || 0,
            headers: response.headers,
            raw_body,
            body: raw_body.toString("utf8"),
          });
        });
      }
    );

    request.on("error", (error) => reject(error));

    if (request_body.length > 0) {
      request.write(request_body);
    }

    request.end();
  });
}

async function SendHttpRequestViaProxyAllowError(params: {
  proxy_port: number;
  target_port: number;
  method: string;
  path: string;
}): Promise<{ response: http_proxy_request_result_t | null; error: Error | null }> {
  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: params.proxy_port,
      target_port: params.target_port,
      method: params.method,
      path: params.path,
    });
    return { response, error: null };
  } catch (error) {
    return { response: null, error: error as Error };
  }
}

test("HTTP requestData callback blocks forwarding until callback resolves", async () => {
  let upstream_received_at_ms = 0;
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on("data", (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on("end", () => {
        upstream_received_at_ms = Date.now();
        response.writeHead(200, { "content-type": "text/plain" });
        response.end(Buffer.concat(body_chunks).toString("utf8"));
      });
    },
  });

  let callback_resolved_at_ms = 0;
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "blocking" }),
      http: {
        client_to_server: {
          requestData: async () => {
            await Delay({ ms: 150 });
            callback_resolved_at_ms = Date.now();
            return { state: "PASSTHROUGH" };
          },
        },
      },
    },
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "POST",
      path: "/blocking",
      body: "blocking-test",
    });

    assert.equal(response.status_code, 200);
    assert.equal(response.body, "blocking-test");
    assert.ok(callback_resolved_at_ms > 0);
    assert.ok(upstream_received_at_ms >= callback_resolved_at_ms);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP PASSTHROUGH keeps request/response unchanged", async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on("data", (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on("end", () => {
        response.writeHead(200, {
          "content-type": "text/plain",
          "x-upstream": "present",
        });
        response.end(Buffer.concat(body_chunks).toString("utf8"));
      });
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "passthrough" }),
      http: {
        client_to_server: {
          requestHeaders: async () => ({ state: "PASSTHROUGH" }),
          requestData: async () => ({ state: "PASSTHROUGH" }),
        },
        server_to_client: {
          responseHeaders: async () => ({ state: "PASSTHROUGH" }),
          responseData: async () => ({ state: "PASSTHROUGH" }),
        },
      },
    },
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "POST",
      path: "/passthrough",
      body: "hello world",
      headers: { "x-client": "present" },
    });

    assert.equal(response.status_code, 200);
    assert.equal(response.body, "hello world");
    assert.equal(response.headers["x-upstream"], "present");
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP TERMINATE aborts the connection", async () => {
  let upstream_request_count = 0;
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      upstream_request_count += 1;
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("unexpected");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "terminate" }),
      http: {
        client_to_server: {
          requestHeaders: async () => ({ state: "TERMINATE" }),
        },
      },
    },
  });

  try {
    const result = await SendHttpRequestViaProxyAllowError({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/terminate",
    });

    await Delay({ ms: 75 });
    assert.equal(result.response, null);
    assert.ok(result.error);
    assert.equal(upstream_request_count, 0);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP MODIFIED updates body, headers, and recalculates content-length", async () => {
  let upstream_request_body = "";
  let upstream_content_length = "";

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on("data", (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on("end", () => {
        upstream_request_body = Buffer.concat(body_chunks).toString("utf8");
        upstream_content_length = String(request.headers["content-length"] || "");

        response.writeHead(200, {
          "content-type": "text/plain",
          "content-length": String(Buffer.byteLength("upstream-response")),
          "x-upstream": "true",
        });
        response.end("upstream-response");
      });
    },
  });

  const modified_request_body = "request-modified";
  const modified_response_body = "response-modified";

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "modified" }),
      http: {
        client_to_server: {
          requestData: async () => ({
            state: "MODIFIED",
            headers: [{ name: "x-request-modified", value: "true" }],
            data: modified_request_body,
          }),
        },
        server_to_client: {
          responseHeaders: async () => ({
            state: "MODIFIED",
            headers: [{ name: "x-response-modified", value: "true" }],
          }),
          responseData: async () => ({
            state: "MODIFIED",
            data: modified_response_body,
          }),
        },
      },
    },
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "POST",
      path: "/modified",
      body: "original-request",
    });

    assert.equal(upstream_request_body, modified_request_body);
    assert.equal(upstream_content_length, String(Buffer.byteLength(modified_request_body)));

    assert.equal(response.status_code, 200);
    assert.equal(response.body, modified_response_body);
    assert.equal(response.headers["x-response-modified"], "true");
    assert.equal(
      response.headers["content-length"],
      String(Buffer.byteLength(modified_response_body))
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP responseData decodes gzip for callback and re-encodes after modification", async () => {
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      const compressed_body = gzipSync(Buffer.from("gzip-upstream-body", "utf8"));
      response.writeHead(200, {
        "content-type": "text/plain",
        "content-encoding": "gzip",
        "content-length": String(compressed_body.length),
      });
      response.end(compressed_body);
    },
  });

  let callback_saw_decoded_text = "";

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "gzip_decode_encode" }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            callback_saw_decoded_text = context.decoded_data.toString("utf8");
            assert.equal(context.data.toString("utf8"), "gzip-upstream-body");
            assert.equal(context.content_encoding, "gzip");
            assert.deepEqual(context.content_encodings, ["gzip"]);
            assert.equal(context.data_is_decoded, true);
            assert.equal(context.decode_error, null);
            return {
              state: "MODIFIED",
              data: "gzip-modified-body",
            };
          },
        },
      },
    },
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/gzip",
    });

    assert.equal(callback_saw_decoded_text, "gzip-upstream-body");
    assert.equal(response.headers["content-encoding"], "gzip");
    assert.equal(
      response.headers["content-length"],
      String(response.raw_body.length)
    );
    assert.equal(gunzipSync(response.raw_body).toString("utf8"), "gzip-modified-body");
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP requestData decodes brotli for callback and re-encodes after modification", async () => {
  let upstream_content_encoding = "";
  let upstream_decoded_body = "";

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const request_chunks: Buffer[] = [];
      request.on("data", (chunk) => request_chunks.push(Buffer.from(chunk)));
      request.on("end", () => {
        const request_body_raw = Buffer.concat(request_chunks);
        upstream_content_encoding = String(request.headers["content-encoding"] || "");
        upstream_decoded_body = brotliDecompressSync(request_body_raw).toString("utf8");
        response.writeHead(200, { "content-type": "text/plain" });
        response.end("ok");
      });
    },
  });

  let callback_saw_decoded_request = "";

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "brotli_decode_encode" }),
      http: {
        client_to_server: {
          requestData: async ({ context }) => {
            callback_saw_decoded_request = context.decoded_data.toString("utf8");
            assert.equal(context.content_encoding, "br");
            assert.deepEqual(context.content_encodings, ["br"]);
            assert.equal(context.data_is_decoded, true);
            assert.equal(context.decode_error, null);
            return {
              state: "MODIFIED",
              data: "brotli-modified-request",
            };
          },
        },
      },
    },
  });

  try {
    const original_request_body = Buffer.from("brotli-original-request", "utf8");
    const compressed_request_body = brotliCompressSync(original_request_body);

    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "POST",
      path: "/brotli",
      body: compressed_request_body,
      headers: {
        "content-encoding": "br",
        "content-length": String(compressed_request_body.length),
      },
    });

    assert.equal(response.status_code, 200);
    assert.equal(callback_saw_decoded_request, "brotli-original-request");
    assert.equal(upstream_content_encoding, "br");
    assert.equal(upstream_decoded_body, "brotli-modified-request");
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("WebSocket callbacks can block and modify frame flow", async () => {
  let upstream_received_message = "";
  let upstream_received_at_ms = 0;

  const websocket_server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await once(websocket_server, "listening");
  const websocket_port = (websocket_server.address() as AddressInfo).port;

  websocket_server.on("connection", (socket) => {
    socket.on("message", (message) => {
      upstream_received_message = message.toString();
      upstream_received_at_ms = Date.now();
      socket.send(`upstream:${upstream_received_message}`);
    });
  });

  let frame_sent_resolved_at_ms = 0;
  let on_connection_terminated_called = false;

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "websocket" }),
      websocket: {
        onServerUpgrade: async () => ({ state: "PASSTHROUGH" }),
        onFrameSent: async () => {
          await Delay({ ms: 100 });
          frame_sent_resolved_at_ms = Date.now();
          return {
            state: "MODIFIED",
            data: "client-modified",
          };
        },
        onFrameReceived: async () => ({
          state: "MODIFIED",
          data: "proxy-modified-response",
        }),
        onConnectionTerminated: async () => {
          on_connection_terminated_called = true;
        },
      },
    },
  });

  const websocket_client = new WebSocket(
    `ws://127.0.0.1:${mitm_server.listen_port}/socket`,
    {
      headers: {
        host: `127.0.0.1:${websocket_port}`,
      },
    }
  );

  try {
    await once(websocket_client, "open");

    const response_message_promise = new Promise<string>((resolve, reject) => {
      websocket_client.once("message", (message) => {
        resolve(message.toString());
      });
      websocket_client.once("error", (error) => reject(error));
    });

    websocket_client.send("client-original");

    const client_received_message = await response_message_promise;

    assert.equal(upstream_received_message, "client-modified");
    assert.ok(frame_sent_resolved_at_ms > 0);
    assert.ok(upstream_received_at_ms >= frame_sent_resolved_at_ms);
    assert.equal(client_received_message, "proxy-modified-response");
  } finally {
    websocket_client.close();
    await once(websocket_client, "close");
    await Delay({ ms: 50 });

    assert.equal(on_connection_terminated_called, true);

    await mitm_server.close();
    await CloseWebSocketServer({ websocket_server });
  }
});
