# Test Matrix

## Existing Coverage To Preserve

- HTTP async blocking, passthrough, terminate, and modified flows.
- HTTP gzip, deflate aliases, brotli, zstd, compress, and x-compress handling.
- WebSocket message modification.
- Plugin chain order, short-circuiting, invalid plugin rejection, and callback error policy.

## Required Additions

- Complete: HTTPS CONNECT/TLS interception with generated CA certificate trust.
- Complete: disk and memory root/leaf certificate storage modes.
- Complete: default RSA root plus ECDSA P-256 leaf certificate generation.
- Complete: existing legacy RSA disk root CA loading and reuse.
- Complete: explicit RSA root/RSA leaf and explicit ECDSA root/ECDSA leaf HTTPS handshakes.
- Complete: disk root key algorithm mismatch failure.
- Complete: RSA and ECDSA disk leaf cache filename separation.
- Complete: registrable-domain wildcard reuse, exact-host fallback, leaf cache TTL/LRU, and concurrent generation locking.
- Complete: keep-alive repeated requests through one proxy instance.
- Complete: concurrent delayed callbacks without cross-request leakage.
- Complete: request and response body limit enforcement.
- Complete: HTTP and WebSocket callback timeout enforcement.
- Complete: native zstd behavior without external binary access.
- Complete: unsupported and corrupt content-encoding passthrough behavior.
- Complete: WebSocket oversized frame and timeout paths.
- Complete: awaited `stop()` and immediate port reuse.
- Complete: package smoke install for CommonJS, ESM, and TypeScript declarations.

## Release Gate

`npm run verify` must run the automated test suite and package smoke tests.

Current automated suite contains 33 e2e tests.
