# Operations And Security Notes

## CA And TLS

- HTTPS interception can use disk-backed or memory-backed certificate material.
- Disk-backed root CA and leaf certificate storage uses `ssl_ca_dir`; production users must protect this directory like credential material.
- Memory-backed root CA storage exposes `server.ca.cert_pem` for client trust and writes no CA material to disk.
- Memory-backed leaf certificate storage uses an in-process LRU/TTL cache and avoids per-host leaf certificate files.
- Default certificate algorithms are RSA-2048 for root CA and ECDSA P-256 for leaf certificates.
- Explicit RSA-2048 leaf certificates remain available for compatibility; ECDSA roots are opt-in.
- Disk root CA algorithm conflicts fail at startup instead of silently replacing trust anchors.
- ECDSA disk leaf files include an algorithm suffix so RSA and ECDSA leaf caches do not collide.
- Memory root plus disk leaf mode is supported, but disk leaf files are signed by an ephemeral process-local CA and should not be treated as reusable trust material.
- README must document how to trust the generated CA for disk and memory modes.

## Limits And Timeouts

- Default body limits are intentionally conservative for a buffering MITM proxy.
- Increase limits only when callback code and host memory sizing are understood.
- Callback timeout defaults to 30 seconds.
- In-memory leaf certificate cache defaults to 1000 entries and 1 hour TTL.

## Logging

- The default logger is silent.
- Configure `logger` to capture limit violations, callback timeouts, and content-decoding failures.
- Logger metadata must not include full payload bodies.

## zstd

- zstd support uses Node.js 26 native `node:zlib` Zstandard APIs.
- No external `zstd` binary is required.
- Corrupt zstd payload behavior must be covered by tests and documented in README.

## Dependency Policy

- Runtime dependencies must be necessary at runtime.
- Build-only, test-only, and type-only dependencies belong in `devDependencies`.
- `npm audit --omit=dev` must pass for release unless this file documents a temporary exception with rationale and removal criteria.

Current production audit status: zero known vulnerabilities.

Externally referenced declaration packages (`@types/node`, `@types/node-forge`, `@types/semaphore`, `@types/ws`) are runtime dependencies because generated public declarations reference those modules.
