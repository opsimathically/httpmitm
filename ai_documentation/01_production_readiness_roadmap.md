# Production Readiness Roadmap

## Phase 1: Release Blockers

- Complete: build is noninteractive.
- Complete: CommonJS, ESM, declarations, and source maps emit.
- Complete: package uses a deterministic `files` allowlist and exports map.
- Complete: Node.js `>=26` engine metadata and local release gates exist.
- Complete: obsolete manual test code was removed; automated tests live under `test/**/*.test.ts`.

## Phase 2: Runtime Resilience

- Complete: typed request/response/WebSocket/callback limits.
- Complete: silent-by-default structured logger.
- Complete: timeout and limit termination diagnostics.
- Complete: zstd uses Node.js 26 native `node:zlib` Zstandard APIs without external binaries.
- Complete: `HTTPMITM.stop()` awaits underlying server shutdown.
- Complete: configurable disk or memory certificate storage with bounded in-memory leaf cache.
- Complete: supplied in-memory root CA material for database or secret-manager backed trust anchors.
- Complete: configurable RSA-2048 or ECDSA P-256 certificate key algorithms.

## Phase 3: Security And Dependency Cleanup

- Complete: direct runtime dependencies upgraded.
- Complete: unused runtime dependencies removed; externally referenced type packages are runtime dependencies so emitted declarations work for consumers.
- Complete: `npm audit --omit=dev` reports zero vulnerabilities.

## Phase 4: Test And Documentation Coverage

- Complete: existing e2e behavior preserved.
- Complete: tests added for HTTPS CONNECT/TLS, certificate storage modes/cache behavior, supplied root CA material, certificate algorithms, keep-alive, concurrency, limits, callback timeout, unsupported/corrupt encodings, WebSocket limit/timeout, native zstd without external binary access, shutdown port reuse, and package smoke install.
- Complete: README and documentation set updated.

## Acceptance Gate

Production readiness requires `npm run verify` to pass locally on Node.js 26+.

## Release Note

- Pending before publish: choose and apply the intended semver in `package.json`.
- The Node.js `>=26` baseline, native zstd behavior, removed deprecated options, and default ECDSA P-256 leaf certificates are breaking changes if the previously published package exposed the older Node 20-era API.
