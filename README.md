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

Each callback receives rich metadata, including:

- `connection_id`
- protocol + direction + event metadata
- headers/data snapshots
- request/response/websocket handles
- `connection_started_at_ms` and `intercepted_at_ms`

## Test

```bash
npm test
```
