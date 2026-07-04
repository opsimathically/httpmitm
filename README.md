# @opsimathically/httpmitm

`@opsimathically/httpmitm` is a TypeScript HTTP, HTTPS, and WebSocket man-in-the-middle proxy for Node.js. It wraps a fork of `node-http-mitm-proxy` with awaited interception callbacks, typed callback contexts, plugin chaining, bounded body/frame buffering, callback timeouts, and deterministic package outputs for public npm usage.

Use this package only for traffic you own or are explicitly authorized to inspect. HTTPS interception uses a generated local CA; protect persisted `ssl_ca_dir` material as credential material when disk-backed storage is enabled.

## Requirements

- Node.js `>=20`
- npm package outputs: CommonJS, ESM, TypeScript declarations, and source maps
- Optional `zstd` binary on `PATH` for `content-encoding: zstd`

## Install

```bash
npm install @opsimathically/httpmitm
```

ESM:

```typescript
import { HTTPMITM } from "@opsimathically/httpmitm";
```

CommonJS:

```javascript
const { HTTPMITM } = require("@opsimathically/httpmitm");
```

## Quick Start

```typescript
import { HTTPMITM } from "@opsimathically/httpmitm";

const httpmitm = new HTTPMITM();

const server = await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  ssl_ca_dir: "/tmp/httpmitm-ca",
  http: {
    client_to_server: {
      requestHeaders: async ({ context }) => {
        console.log("request", context.request.method, context.request.url);
        return { state: "PASSTHROUGH" };
      },
    },
    server_to_client: {
      responseData: async ({ context }) => {
        if (context.decode_error) {
          console.warn("response decode failed", context.decode_error);
        }
        return { state: "PASSTHROUGH" };
      },
    },
  },
});

console.log(`proxy listening on ${server.host}:${server.listen_port}`);

process.once("SIGINT", async () => {
  await server.close();
});
```

Configure HTTP clients to use the proxy at `127.0.0.1:4444`. For default disk-backed HTTPS interception, trust the generated CA certificate at `ssl_ca_dir/certs/ca.pem` in the client making requests through the proxy. For memory-backed root CA mode, trust `server.ca.cert_pem`.

## Interception Model

HTTPMITM waits for each configured callback before forwarding the affected traffic. A callback may return:

- `PASSTHROUGH`: forward the original request, response, or frame unchanged.
- `MODIFIED`: apply returned headers, body data, status, or WebSocket data before forwarding.
- `TERMINATE`: close the affected connection.

If a callback returns `undefined`, it behaves like `PASSTHROUGH`. Callback errors and timeouts follow `callback_error_policy`, which defaults to `TERMINATE`.

HTTP callbacks are grouped by direction:

```typescript
await httpmitm.start({
  http: {
    client_to_server: {
      requestHeaders: async ({ context }) => ({ state: "PASSTHROUGH" }),
      requestData: async ({ context }) => ({ state: "PASSTHROUGH" }),
    },
    server_to_client: {
      responseHeaders: async ({ context }) => ({ state: "PASSTHROUGH" }),
      responseData: async ({ context }) => ({ state: "PASSTHROUGH" }),
    },
  },
});
```

Data callbacks receive decoded body data when decoding succeeds. The original wire bytes remain available as `raw_data`, the callback-facing data is available as `data`, and decode failures are reported through `decode_error`. When a data callback returns modified `data`, HTTPMITM re-encodes it using the active `Content-Encoding` header before forwarding.

Supported HTTP content encodings:

- `gzip`, `x-gzip`
- `deflate`, `x-deflate`
- `br`
- `zstd`
- `compress`, `x-compress`

Unsupported or corrupt encodings are surfaced through `decode_error`; passthrough callbacks forward the original bytes.

## WebSocket Interception

WebSocket hooks can observe or modify the upgrade decision, client-to-server frames, server-to-client frames, and close events.

```typescript
await httpmitm.start({
  websocket: {
    onServerUpgrade: async ({ context }) => ({ state: "PASSTHROUGH" }),
    onFrameSent: async ({ context }) => {
      if (context.frame_type === "message") {
        return { state: "MODIFIED", data: "client replacement message" };
      }
      return { state: "PASSTHROUGH" };
    },
    onFrameReceived: async ({ context }) => ({ state: "PASSTHROUGH" }),
    onConnectionTerminated: async ({ context }) => {
      console.log("websocket closed", context.code);
    },
  },
});
```

Frame callbacks receive `message`, `ping`, and `pong` frames. Oversized frames are terminated according to `limits.websocket_frame_bytes`.

## Plugins

`plugins` are ordered hook containers. Plugin hooks may return the normal interception states plus plugin-only `CONTINUE`.

- Plugins run in array order.
- `CONTINUE` runs the next plugin hook.
- `PASSTHROUGH`, `MODIFIED`, and `TERMINATE` stop the plugin chain.
- If every plugin returns `CONTINUE` or omits the hook, the instance callback from `start()` runs.
- Plugins must implement at least one supported HTTP or WebSocket hook.

```typescript
import { HTTPMITM, type httpmitm_plugin_i } from "@opsimathically/httpmitm";

class AuditPlugin implements httpmitm_plugin_i {
  plugin_name = "audit";

  http = {
    client_to_server: {
      requestHeaders: async ({ context }) => {
        console.log(context.connection_id, context.request.url);
        return { state: "CONTINUE" };
      },
    },
  };
}

const httpmitm = new HTTPMITM();
await httpmitm.start({
  plugins: [new AuditPlugin()],
});
```

## HTTPS And Certificates

HTTPS CONNECT traffic is intercepted by generating a local CA certificate and leaf certificates for requested hosts. For backward compatibility, callers that only use `ssl_ca_dir` get the existing disk-backed behavior: the root CA and per-host leaf certificates are stored under `ssl_ca_dir`.

- Set a stable `ssl_ca_dir` if clients need to trust the same CA across restarts.
- Trust `ssl_ca_dir/certs/ca.pem` only in the test client or controlled environment using the proxy.
- Do not commit, publish, or casually share generated CA private keys.

Certificate storage can be controlled independently for the root CA and leaf certificates:

```typescript
const server = await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  certificates: {
    root_ca: { storage: "memory" },
    leaf_certificates: {
      storage: "memory",
      wildcard: "registrable_domain",
      cache: {
        max_entries: 1000,
        ttl_ms: 3_600_000,
      },
    },
  },
});

console.log(server.ca.cert_pem);
```

Recommended low-disk-churn mode persists the root CA for stable browser trust and keeps leaf certificates in memory:

```typescript
await httpmitm.start({
  ssl_ca_dir: "/tmp/httpmitm-ca",
  certificates: {
    root_ca: { storage: "disk" },
    leaf_certificates: { storage: "memory" },
  },
});
```

When `certificates.leaf_certificates.wildcard` is `registrable_domain`, HTTPMITM uses Public Suffix List parsing to reuse valid wildcard leaf certificates such as `example.com` plus `*.example.com`. IP addresses, `localhost`, single-label hosts, and deeper names that a registrable-domain wildcard cannot cover fall back to exact-host certificates. A universal wildcard certificate is not supported because browsers will not accept one for arbitrary domains.

If upstream HTTPS services use private or self-signed certificates, pass an explicit upstream HTTPS agent:

```typescript
import https from "node:https";
import { HTTPMITM } from "@opsimathically/httpmitm";

const httpmitm = new HTTPMITM();

await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  ssl_ca_dir: "/tmp/httpmitm-ca",
  https_agent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
```

## Limits, Timeouts, And Logging

HTTPMITM buffers full request bodies, response bodies, and WebSocket frames when matching data callbacks are active. Defaults are intentionally bounded:

| Option | Default | Behavior |
| --- | ---: | --- |
| `limits.request_body_bytes` | `10 MiB` | Maximum buffered HTTP request body |
| `limits.response_body_bytes` | `25 MiB` | Maximum buffered HTTP response body |
| `limits.websocket_frame_bytes` | `16 MiB` | Maximum WebSocket frame payload |
| `limits.callback_timeout_ms` | `30_000` | Maximum callback execution time |
| `limits.binary_transform_timeout_ms` | `5_000` | Maximum external transform time, including zstd |

Invalid or non-positive limit values fall back to defaults. Limit violations terminate the affected connection and emit a structured `logger.warn` diagnostic when a logger is configured. The default logger is silent.

```typescript
await httpmitm.start({
  callback_error_policy: "TERMINATE",
  limits: {
    request_body_bytes: 5 * 1024 * 1024,
    response_body_bytes: 10 * 1024 * 1024,
    websocket_frame_bytes: 4 * 1024 * 1024,
    callback_timeout_ms: 10_000,
    binary_transform_timeout_ms: 2_500,
  },
  logger: {
    warn: (message, metadata) => console.warn(message, metadata),
    error: (message, metadata) => console.error(message, metadata),
  },
});
```

## zstd Support

`content-encoding: zstd` support shells out to the local `zstd` binary. If `zstd` is missing, times out, exits with an error, or produces too much output, callbacks receive the original bytes and a `decode_error` or encode failure path. Install `zstd` on hosts that need to inspect or modify zstd-compressed payloads.

## Lifecycle

`start()` returns an object with:

- `proxy`: the low-level forked proxy instance.
- `host`: the configured host, defaulting to `localhost`.
- `listen_port`: the actual HTTP proxy port.
- `close()`: an async shutdown method.

`HTTPMITM.stop()` and the returned `close()` method await shutdown of the HTTP, HTTPS, WebSocket, and generated SSL servers where possible. Await shutdown before reusing a port or exiting a test.

## API Reference And Guides

Full documentation is generated into [`docs/README.md`](docs/README.md). It includes guide pages and TypeDoc API reference for the public classes, callbacks, result types, plugin interfaces, logger, and limit options.

## Build And Verify

```bash
npm install
npm run build
npm test
npm run verify
```

`npm run verify` runs build, typecheck, lint, docs generation, tests, production audit, npm pack dry-run, and package install smoke tests. Release verification is local-script based; this project intentionally does not use GitHub workflow files.

## Package Contents

The npm package is controlled by the `files` allowlist and includes:

- `dist/index.js`
- `dist/index.mjs`
- `dist/index.d.ts`
- `dist/index.d.mts`
- source maps
- `README.md`
- `LICENSE.txt`

Generated `docs/` output is kept in the repository for readers but is not included in the npm tarball.

## Troubleshooting

- Callback times out: reduce callback work, increase `limits.callback_timeout_ms`, or configure `callback_error_policy: "PASSTHROUGH"` only when fail-open behavior is acceptable.
- Body or frame is terminated: raise the matching limit after confirming memory capacity and expected payload sizes.
- HTTPS client rejects certificates: trust `ssl_ca_dir/certs/ca.pem` for disk-backed root CA mode, or `server.ca.cert_pem` for memory-backed root CA mode.
- Upstream self-signed TLS fails: pass `https_agent` with the upstream trust policy you need.
- zstd payloads are not decoded: install the `zstd` binary and ensure it is on `PATH`.
- Corrupt or unsupported `Content-Encoding`: inspect `context.decode_error`; passthrough forwards original bytes.
