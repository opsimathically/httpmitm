[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / operations-and-security

# Operations And Security

## Authorized Use

Use HTTPMITM only in environments where traffic interception is expected and authorized. Proxied payloads can contain credentials, tokens, personal data, and private application state.

## Limits

Defaults are intentionally bounded because the proxy buffers bodies and frames for data callbacks:

| Option | Default |
| --- | ---: |
| `limits.request_body_bytes` | `10 MiB` |
| `limits.response_body_bytes` | `25 MiB` |
| `limits.websocket_frame_bytes` | `16 MiB` |
| `limits.callback_timeout_ms` | `30_000` |
| `limits.binary_transform_timeout_ms` | `5_000` |

Invalid or non-positive values fall back to defaults. Limit violations terminate the affected connection and emit a structured warning when `logger.warn` is configured.

## Logging

The default logger is silent. Configure `logger` to capture diagnostics such as callback timeouts, limit violations, and binary transform failures.

Logger metadata is intentionally structured and should not include full payload bodies. Treat logs as sensitive if they include URLs, headers, hostnames, or connection identifiers.

## zstd

`content-encoding: zstd` requires an external `zstd` binary on `PATH`. zstd transforms run out of process and are bounded by timeout and output size. Missing or failing zstd transforms are surfaced as decode or encode failures rather than crashing the proxy.

## Package Verification

The local verification gate is:

```bash
npm run verify
```

It runs build, typecheck, lint, docs generation, tests, production audit, npm pack dry-run, and package install smoke tests.

## Package Contents

The npm tarball is controlled by the package `files` allowlist. Generated repository docs are not included in the published package unless the allowlist is changed intentionally.
