import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { once } from "node:events";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import test from "node:test";
import {
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  gunzipSync,
  gzipSync,
  inflateSync,
} from "node:zlib";
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

function RunBinaryTransform(params: {
  command: string;
  args: string[];
  input_data: Buffer;
}): Buffer {
  const result = spawnSync(params.command, params.args, {
    input: params.input_data,
    encoding: null,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error((result.stderr || Buffer.alloc(0)).toString("utf8"));
  }
  return (result.stdout || Buffer.alloc(0)) as Buffer;
}

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

test("HTTP responseData supports x-gzip and x-deflate aliases", async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      if (request.url === "/x-gzip") {
        const compressed_body = gzipSync(Buffer.from("x-gzip-upstream", "utf8"));
        response.writeHead(200, {
          "content-type": "text/plain",
          "content-encoding": "x-gzip",
          "content-length": String(compressed_body.length),
        });
        response.end(compressed_body);
        return;
      }

      const compressed_body = deflateSync(Buffer.from("x-deflate-upstream", "utf8"));
      response.writeHead(200, {
        "content-type": "text/plain",
        "content-encoding": "x-deflate",
        "content-length": String(compressed_body.length),
      });
      response.end(compressed_body);
    },
  });

  const seen_content_encodings: string[] = [];

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "x_encoding_aliases" }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            seen_content_encodings.push(context.content_encoding || "");
            if (context.content_encoding === "x-gzip") {
              assert.equal(context.data.toString("utf8"), "x-gzip-upstream");
              return {
                state: "MODIFIED",
                data: "x-gzip-modified",
              };
            }

            assert.equal(context.content_encoding, "x-deflate");
            assert.equal(context.data.toString("utf8"), "x-deflate-upstream");
            return {
              state: "MODIFIED",
              data: "x-deflate-modified",
            };
          },
        },
      },
    },
  });

  try {
    const gzip_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/x-gzip",
    });
    assert.equal(gzip_response.headers["content-encoding"], "x-gzip");
    assert.equal(gunzipSync(gzip_response.raw_body).toString("utf8"), "x-gzip-modified");

    const deflate_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/x-deflate",
    });
    assert.equal(deflate_response.headers["content-encoding"], "x-deflate");
    assert.equal(
      inflateSync(deflate_response.raw_body).toString("utf8"),
      "x-deflate-modified"
    );

    assert.deepEqual(seen_content_encodings.sort(), ["x-deflate", "x-gzip"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("HTTP responseData supports zstd encoding decode and re-encode", async () => {
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      const encoded_body = RunBinaryTransform({
        command: "zstd",
        args: ["-q", "-c", "--no-progress"],
        input_data: Buffer.from("zstd-upstream-body", "utf8"),
      });
      response.writeHead(200, {
        "content-type": "text/plain",
        "content-encoding": "zstd",
        "content-length": String(encoded_body.length),
      });
      response.end(encoded_body);
    },
  });

  let callback_saw_data = "";

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "zstd_decode_encode" }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            callback_saw_data = context.data.toString("utf8");
            assert.equal(context.content_encoding, "zstd");
            return {
              state: "MODIFIED",
              data: "zstd-modified-body",
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
      path: "/zstd",
    });

    assert.equal(callback_saw_data, "zstd-upstream-body");
    assert.equal(response.headers["content-encoding"], "zstd");
    const decoded_response_body = RunBinaryTransform({
      command: "zstd",
      args: ["-d", "-q", "-c", "--no-progress"],
      input_data: response.raw_body,
    }).toString("utf8");
    assert.equal(decoded_response_body, "zstd-modified-body");
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

test("HTTP responseData supports compress and x-compress encoding", async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      response.writeHead(200, {
        "content-type": "text/plain",
      });
      response.end(request.url === "/x-compress" ? "x-compress-origin" : "compress-origin");
    },
  });

  const seen_encodings: string[] = [];

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "compress_xcompress" }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            if (context.request.url === "/x-compress") {
              seen_encodings.push("x-compress");
              return {
                state: "MODIFIED",
                headers: [{ name: "content-encoding", value: "x-compress" }],
                data: "x-compress-modified",
              };
            }
            seen_encodings.push("compress");
            return {
              state: "MODIFIED",
              headers: [{ name: "content-encoding", value: "compress" }],
              data: "compress-modified",
            };
          },
        },
      },
    },
  });

  try {
    const compress_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/compress",
    });
    assert.equal(compress_response.headers["content-encoding"], "compress");
    assert.equal(compress_response.raw_body[0], 0x1f);
    assert.equal(compress_response.raw_body[1], 0x9d);
    const compress_decoded = RunBinaryTransform({
      command: "uncompress",
      args: ["-c"],
      input_data: compress_response.raw_body,
    }).toString("utf8");
    assert.equal(compress_decoded, "compress-modified");

    const x_compress_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/x-compress",
    });
    assert.equal(x_compress_response.headers["content-encoding"], "x-compress");
    assert.equal(x_compress_response.raw_body[0], 0x1f);
    assert.equal(x_compress_response.raw_body[1], 0x9d);
    const x_compress_decoded = RunBinaryTransform({
      command: "uncompress",
      args: ["-c"],
      input_data: x_compress_response.raw_body,
    }).toString("utf8");
    assert.equal(x_compress_decoded, "x-compress-modified");

    assert.deepEqual(seen_encodings.sort(), ["compress", "x-compress"]);
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

test("Plugin chain executes in deterministic order and falls through to instance callback after CONTINUE", async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class PluginOne {
    plugin_name = "plugin_one";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("plugin_one");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  class PluginTwo {
    plugin_name = "plugin_two";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("plugin_two");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_order_continue" }),
      plugins: [new PluginOne(), new PluginTwo()],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push("instance");
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
      method: "GET",
      path: "/plugin-order",
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, true);
    assert.deepEqual(execution_order, ["plugin_one", "plugin_two", "instance"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("Plugin PASSTHROUGH short-circuits chain and skips instance callback", async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class ContinuePlugin {
    plugin_name = "continue_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("continue_plugin");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  class PassthroughPlugin {
    plugin_name = "passthrough_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("passthrough_plugin");
          return { state: "PASSTHROUGH" as const };
        },
      },
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = "should_not_run";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("should_not_run");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_passthrough_shortcircuit" }),
      plugins: [
        new ContinuePlugin(),
        new PassthroughPlugin(),
        new ShouldNotRunPlugin(),
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push("instance");
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
      method: "GET",
      path: "/plugin-passthrough",
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, ["continue_plugin", "passthrough_plugin"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("Plugin MODIFIED short-circuits chain and skips instance callback", async () => {
  let upstream_header_seen = "";
  let instance_callback_called = false;
  const execution_order: string[] = [];

  class ContinuePlugin {
    plugin_name = "continue_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("continue_plugin");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  class ModifiedPlugin {
    plugin_name = "modified_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("modified_plugin");
          return {
            state: "MODIFIED" as const,
            headers: [{ name: "x-from-plugin", value: "true" }],
          };
        },
      },
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = "should_not_run";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("should_not_run");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      upstream_header_seen = String(request.headers["x-from-plugin"] || "");
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_modified_shortcircuit" }),
      plugins: [
        new ContinuePlugin(),
        new ModifiedPlugin(),
        new ShouldNotRunPlugin(),
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push("instance");
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
      method: "GET",
      path: "/plugin-modified",
    });

    assert.equal(response.status_code, 200);
    assert.equal(upstream_header_seen, "true");
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, ["continue_plugin", "modified_plugin"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("Plugin TERMINATE short-circuits chain and aborts connection", async () => {
  let upstream_request_count = 0;
  let instance_callback_called = false;
  const execution_order: string[] = [];

  class ContinuePlugin {
    plugin_name = "continue_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("continue_plugin");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  class TerminatePlugin {
    plugin_name = "terminate_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("terminate_plugin");
          return { state: "TERMINATE" as const };
        },
      },
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = "should_not_run";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("should_not_run");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

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
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_terminate_shortcircuit" }),
      plugins: [
        new ContinuePlugin(),
        new TerminatePlugin(),
        new ShouldNotRunPlugin(),
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push("instance");
            return { state: "PASSTHROUGH" };
          },
        },
      },
    },
  });

  try {
    const result = await SendHttpRequestViaProxyAllowError({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: "GET",
      path: "/plugin-terminate",
    });
    await Delay({ ms: 75 });

    assert.equal(result.response, null);
    assert.ok(result.error);
    assert.equal(upstream_request_count, 0);
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, ["continue_plugin", "terminate_plugin"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("Plugin missing hook is skipped and all CONTINUE reaches instance callback", async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class MissingHookPlugin {
    plugin_name = "missing_hook";
    http = {
      client_to_server: {
        requestData: async () => ({ state: "CONTINUE" as const }),
      },
    };
  }

  class ContinuePlugin {
    plugin_name = "continue_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push("continue_plugin");
          return { state: "CONTINUE" as const };
        },
      },
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_missing_hook_continue" }),
      plugins: [new MissingHookPlugin(), new ContinuePlugin()],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push("instance");
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
      method: "GET",
      path: "/plugin-missing-hook",
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, true);
    assert.deepEqual(execution_order, ["continue_plugin", "instance"]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test("Invalid plugin without hooks is rejected with clear error", async () => {
  class InvalidPlugin {
    plugin_name = "invalid_plugin";
  }

  const httpmitm = new HTTPMITM();
  await assert.rejects(
    async () => {
      await httpmitm.start({
        host: "127.0.0.1",
        listen_port: 0,
        ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_invalid" }),
        plugins: [new InvalidPlugin()],
      });
    },
    (error: Error) =>
      error.message.includes("must implement at least one callback hook")
  );
});

test("Plugin throw/reject behavior follows callback_error_policy", async () => {
  class ThrowingPlugin {
    plugin_name = "throwing_plugin";
    http = {
      client_to_server: {
        requestHeaders: async () => {
          throw new Error("plugin failure");
        },
      },
    };
  }

  let terminate_policy_upstream_count = 0;
  const terminate_policy_upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      terminate_policy_upstream_count += 1;
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("unexpected");
    },
  });

  const terminate_policy_mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_throw_terminate_policy" }),
      callback_error_policy: "TERMINATE",
      plugins: [new ThrowingPlugin()],
    },
  });

  try {
    const terminate_result = await SendHttpRequestViaProxyAllowError({
      proxy_port: terminate_policy_mitm_server.listen_port,
      target_port: terminate_policy_upstream_server.port,
      method: "GET",
      path: "/plugin-throw-terminate",
    });
    await Delay({ ms: 75 });
    assert.equal(terminate_result.response, null);
    assert.ok(terminate_result.error);
    assert.equal(terminate_policy_upstream_count, 0);
  } finally {
    await terminate_policy_mitm_server.close();
    await CloseHttpServer({ server: terminate_policy_upstream_server.server });
  }

  let passthrough_policy_upstream_count = 0;
  const passthrough_policy_upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      passthrough_policy_upstream_count += 1;
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const passthrough_policy_mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_throw_passthrough_policy" }),
      callback_error_policy: "PASSTHROUGH",
      plugins: [new ThrowingPlugin()],
    },
  });

  try {
    const passthrough_result = await SendHttpRequestViaProxy({
      proxy_port: passthrough_policy_mitm_server.listen_port,
      target_port: passthrough_policy_upstream_server.port,
      method: "GET",
      path: "/plugin-throw-passthrough",
    });
    assert.equal(passthrough_result.status_code, 200);
    assert.equal(passthrough_policy_upstream_count, 1);
  } finally {
    await passthrough_policy_mitm_server.close();
    await CloseHttpServer({ server: passthrough_policy_upstream_server.server });
  }
});

test("No plugins keeps legacy callback behavior unchanged", async () => {
  let instance_callback_count = 0;
  let upstream_header_seen = "";

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      upstream_header_seen = String(request.headers["x-legacy"] || "");
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("ok");
    },
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: "127.0.0.1",
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: "plugin_none_legacy_unchanged" }),
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_count += 1;
            return {
              state: "MODIFIED",
              headers: [{ name: "x-legacy", value: "true" }],
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
      path: "/no-plugins",
    });
    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_count, 1);
    assert.equal(upstream_header_seen, "true");
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});
