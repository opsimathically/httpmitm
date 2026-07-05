[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / getting-started

# Getting Started

## Install

```bash
npm install @opsimathically/httpmitm
```

`@opsimathically/httpmitm` supports Node.js `>=26` and publishes CommonJS, ESM, TypeScript declarations, and source maps.

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

Configure client software to use the proxy host and port. For default disk-backed HTTPS traffic, the client must trust `ssl_ca_dir/certs/ca.pem`. If `certificates.root_ca.storage` is `memory`, trust the returned `server.ca.cert_pem`.

Default HTTPS certificate handling is compatibility-oriented: with only `ssl_ca_dir`, HTTPMITM writes the root CA and exact-host leaf certificates to disk. Configure `certificates.leaf_certificates.storage: "memory"` to avoid per-host leaf certificate files. If your application stores an existing root CA in a database or secret manager, pass it through `certificates.root_ca.material`; supplied root material is memory-only and is never written by the library.

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

## Publishing A Release

Before publishing, update `package.json` to the intended semver. The current production-ready API requires Node.js `>=26`, uses built-in Node zlib for zstd, removes deprecated compatibility options, and defaults leaf certificates to ECDSA P-256. Treat those as major-version material if the previous published package exposed the older Node 20-era baseline.
