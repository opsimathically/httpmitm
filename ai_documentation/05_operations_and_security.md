# Operations And Security Notes

## CA And TLS

- HTTPS interception generates and caches CA and leaf certificates in `ssl_ca_dir`.
- Production users must protect this directory like credential material.
- README must document how to trust the generated CA for local testing.

## Limits And Timeouts

- Default body limits are intentionally conservative for a buffering MITM proxy.
- Increase limits only when callback code and host memory sizing are understood.
- Callback timeout defaults to 30 seconds.
- Binary transform timeout defaults to 5 seconds.

## Logging

- The default logger is silent.
- Configure `logger` to capture limit violations, callback timeouts, and binary transform failures.
- Logger metadata must not include full payload bodies.

## zstd

- zstd support depends on an external `zstd` binary on `PATH`.
- Transforms are bounded by timeout and output size.
- Missing binary behavior must be covered by tests and documented in README.

## Dependency Policy

- Runtime dependencies must be necessary at runtime.
- Build-only, test-only, and type-only dependencies belong in `devDependencies`.
- `npm audit --omit=dev` must pass for release unless this file documents a temporary exception with rationale and removal criteria.

Current production audit status: zero known vulnerabilities.

Externally referenced declaration packages (`@types/node`, `@types/node-forge`, `@types/semaphore`, `@types/ws`) are runtime dependencies because generated public declarations reference those modules.
