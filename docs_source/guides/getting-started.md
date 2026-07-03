# Getting Started

## Install

```bash
npm install @opsimathically/httpmitm
```

`@opsimathically/httpmitm` supports Node.js `>=20` and publishes CommonJS, ESM, TypeScript declarations, and source maps.

## Import

ESM:

```typescript
import { HTTPMITM } from "@opsimathically/httpmitm";
```

CommonJS:

```javascript
const { HTTPMITM } = require("@opsimathically/httpmitm");
```

## Start A Proxy

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
        console.log(context.request.method, context.request.url);
        return { state: "PASSTHROUGH" };
      },
    },
  },
});

console.log(server.listen_port);
```

Configure client software to use the proxy host and port. For HTTPS traffic, the client must trust `ssl_ca_dir/certs/ca.pem`.

## Stop Cleanly

Always await shutdown in tests and long-running processes. Shutdown closes the wrapped HTTP, HTTPS, WebSocket, and generated SSL servers where possible.

```typescript
await server.close();
```

or:

```typescript
await httpmitm.stop();
```

## Verify A Source Checkout

```bash
npm install
npm run verify
```

`npm run verify` runs build, typecheck, lint, docs generation, tests, production audit, npm pack dry-run, and package install smoke tests.
