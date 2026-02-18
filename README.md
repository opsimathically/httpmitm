# HTTPMITM

This project is a TypeScript MITM proxy built from a fork of `node-http-mitm-proxy`.
It adds strict async interception for HTTP and WebSocket flows.

## Core Behavior

- Interception callbacks are awaited before forwarding traffic.
- Callback states:
  - `PASSTHROUGH`: forward original data unchanged.
  - `MODIFIED`: apply callback-provided headers/data, recalculate protocol metadata as needed.
  - `TERMINATE`: abort the active connection.
- Callback failures default to `TERMINATE` (configurable with `callback_error_policy`).
- HTTP data callbacks automatically decode and re-encode `Content-Encoding` payloads:
  - `gzip`, `x-gzip`
  - `deflate`, `x-deflate`
  - `br`
  - `zstd`
  - `compress`, `x-compress`
  - Note: `zstd` support uses the local `zstd` binary on PATH.

## Install

```bash
npm install @opsimathically/httpmitm
```

## Build From Source

```bash
npm install
npm run build
```

## Usage

```typescript
import { HTTPMITM } from './classes/httpmitm/HTTPMITM.class';

(async function () {
  const httpmitm = new HTTPMITM();

  await httpmitm.start({
    host: '0.0.0.0',
    listen_port: 4444,
    callback_error_policy: 'TERMINATE',
    http: {
      client_to_server: {
        requestHeaders: async ({ context }) => {
          return {
            state: 'MODIFIED',
            headers: [{ name: 'x-request-header', value: 'modified' }]
          };
        },
        requestData: async ({ context }) => {
          return {
            state: 'MODIFIED',
            headers: [{ name: 'x-request-body-modified', value: 'true' }],
            data: 'modified request body'
          };
        }
      },
      server_to_client: {
        responseHeaders: async ({ context }) => {
          return {
            state: 'MODIFIED',
            headers: [{ name: 'x-response-header', value: 'modified' }]
          };
        },
        responseData: async ({ context }) => {
          return {
            state: 'MODIFIED',
            data: 'modified response body'
          };
        }
      }
    },
    websocket: {
      onServerUpgrade: async ({ context }) => {
        return {
          state: 'PASSTHROUGH'
        };
      },
      onFrameSent: async ({ context }) => {
        return {
          state: 'MODIFIED',
          data: 'client-to-server modified frame'
        };
      },
      onFrameReceived: async ({ context }) => {
        return {
          state: 'MODIFIED',
          data: 'server-to-client modified frame'
        };
      },
      onConnectionTerminated: async ({ context }) => {
        // optional cleanup/logging
      }
    }
  });
})();
```

## Callback Context

Each callback receives a `context` object. The fields below are always present.

### Shared Context Fields (HTTP + WebSocket)

- `connection_id`: stable identifier for the intercepted connection.
- `connection_started_at_ms`: unix timestamp (ms) when tracking started.
- `intercepted_at_ms`: unix timestamp (ms) when this callback fired.
- `protocol`: `"http"` or `"websocket"`.
- `is_ssl`: `true` for TLS traffic.
- `direction`: callback direction (`"client_to_server"` or `"server_to_client"`).
- `event`: callback event name (for example `request_data`, `response_data`, `frame`).
- `remote_ip`: remote endpoint IP if known, else `null`.
- `remote_port`: remote endpoint port if known, else `null`.
- `remote_host`: remote target host if known, else `null`.
- `client_ip`: client endpoint IP if known, else `null`.
- `client_port`: client endpoint port if known, else `null`.
- `client_host`: client host if known, else `null`.
- `handles`: low-level request/response/socket handles.

If any connection detail cannot be resolved, it is set to `null`.

### HTTP Callback-Specific Context Fields

#### `requestHeaders`

- `request`: request metadata (`method`, `url`, `http_version`, `headers`).

#### `requestData`

- `request`: request metadata.
- `content_encoding`: raw `Content-Encoding` header value or `null`.
- `content_encodings`: parsed encodings array (for example `["gzip"]`, `["br"]`).
- `raw_data`: body bytes exactly as seen on the wire.
- `decoded_data`: decoded body bytes (if decoding succeeded) or raw fallback.
- `data_is_decoded`: `true` if decode succeeded (or no encoding), else `false`.
- `decode_error`: decode failure message or `null`.
- `data`: alias of `decoded_data` for convenience.

`data` is the decoded form. If you return modified `data`, HTTPMITM re-encodes using the current `Content-Encoding` header before forwarding.

#### `responseHeaders`

- `request`: request metadata.
- `response`: response metadata (`status_code`, `status_message`, `http_version`, `headers`).

#### `responseData`

- `request`: request metadata.
- `response`: response metadata.
- `content_encoding`: raw `Content-Encoding` header value or `null`.
- `content_encodings`: parsed encodings array.
- `raw_data`: body bytes exactly as seen on the wire.
- `decoded_data`: decoded body bytes (if decoding succeeded) or raw fallback.
- `data_is_decoded`: `true` if decode succeeded (or no encoding), else `false`.
- `decode_error`: decode failure message or `null`.
- `data`: alias of `decoded_data` for convenience.

`data` is the decoded form. If you return modified `data`, HTTPMITM re-encodes using the current `Content-Encoding` header before forwarding.

### WebSocket Callback-Specific Context Fields

#### `onServerUpgrade`

- `upgrade_request`: upgrade request metadata (`url`, `method`, `http_version`, `headers`).

#### `onFrameSent` / `onFrameReceived`

- `frame_type`: `"message" | "ping" | "pong"`.
- `data`: frame payload.
- `flags`: frame flags (if provided by the ws layer).

#### `onConnectionTerminated`

- `closed_by_server`: `true` if upstream initiated close.
- `code`: close code.
- `message`: close message.

### Handles Reference

HTTP callback `context.handles` includes:

- `raw_context`
- `connect_request`
- `client_to_proxy_request`
- `proxy_to_client_response`
- `proxy_to_server_request`
- `server_to_proxy_response`

WebSocket callback `context.handles` includes:

- `raw_context`
- `connect_request`
- `client_to_proxy_websocket`
- `proxy_to_server_websocket`

### Example: Using Remote and Client Fields

```typescript
responseData: async ({ context }) => {
  if (context.remote_host === "api.example.com" && context.client_ip) {
    console.log("client", context.client_ip, "->", context.remote_host);
  }

  return { state: "PASSTHROUGH" };
}
```

## Test

```bash
npm test
```
