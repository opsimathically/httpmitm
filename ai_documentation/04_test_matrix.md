# Test Matrix

## Existing Coverage To Preserve

- HTTP async blocking, passthrough, terminate, and modified flows.
- HTTP gzip, deflate aliases, brotli, zstd, compress, and x-compress handling.
- WebSocket message modification.
- Plugin chain order, short-circuiting, invalid plugin rejection, and callback error policy.

## Required Additions

- Complete: HTTPS CONNECT/TLS interception with generated CA certificate trust.
- Complete: keep-alive repeated requests through one proxy instance.
- Complete: concurrent delayed callbacks without cross-request leakage.
- Complete: request and response body limit enforcement.
- Complete: HTTP and WebSocket callback timeout enforcement.
- Complete: missing zstd binary behavior.
- Complete: unsupported and corrupt content-encoding passthrough behavior.
- Complete: WebSocket oversized frame and timeout paths.
- Complete: awaited `stop()` and immediate port reuse.
- Complete: package smoke install for CommonJS, ESM, and TypeScript declarations.

## Release Gate

`npm run verify` must run the automated test suite and package smoke tests.

Current automated suite contains 27 e2e tests.
