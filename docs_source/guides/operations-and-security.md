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

Invalid or non-positive values fall back to defaults. Limit violations terminate the affected connection and emit a structured warning when `logger.warn` is configured.

## Logging

The default logger is silent. Configure `logger` to capture diagnostics such as callback timeouts, limit violations, and content-decoding failures.

Logger metadata is intentionally structured and should not include full payload bodies. Treat logs as sensitive if they include URLs, headers, hostnames, or connection identifiers.

## Certificate Storage

Root CA and leaf certificates can be disk-backed or memory-backed. Disk-backed root CA mode provides stable client trust across restarts. Memory-backed root CA mode writes no CA material to disk, but clients must trust the returned `server.ca.cert_pem` for that process.

Existing root CA material can be supplied through `certificates.root_ca.material` for database-backed or secret-manager-backed trust anchors. Supplied material is memory-only: the library does not write the supplied root certificate or private key to disk, and `storage: "disk"` plus `material` is rejected. The private key is used for leaf signing and is not exposed on the returned server handle.

Root CA and leaf certificates can use `rsa_2048` or `ecdsa_p256` keys. The default is RSA-2048 for the root CA and ECDSA P-256 for leaf certificates. This preserves broad root-import compatibility while reducing per-host generation cost. Explicit disk root algorithm mismatches fail during startup so an existing trust anchor is not silently replaced with a different key type.

Memory leaf certificates are cached with an LRU/TTL policy. Defaults are `1000` entries and `3_600_000` milliseconds. Use memory leaf storage to avoid unbounded `ssl_ca_dir/certs` and `ssl_ca_dir/keys` growth from per-host certificates.

When `certificates` is omitted, compatibility mode uses disk-backed root CA storage and exact-host disk leaf certificates. When `certificates` is provided, storage defaults remain disk-backed and the leaf wildcard strategy defaults to `registrable_domain`. A memory root with disk leaf storage is supported, but the leaf files are signed by an ephemeral CA and are not durable trust material across process restarts.

## zstd

`content-encoding: zstd` uses Node.js 26's built-in `node:zlib` Zstandard APIs. No external `zstd` executable is required. zstd compression and decompression run through Node's native zlib bindings and libuv threadpool.

Corrupt or unsupported zstd payloads are surfaced as decode or encode failures rather than crashing the proxy.

## Package Verification

The local verification gate is:

```bash
npm run verify
```

It runs build, typecheck, lint, docs generation, tests, production audit, npm pack dry-run, and package install smoke tests.

## Release Versioning

Set the intended semver in `package.json` before publishing. The current API and runtime baseline include breaking changes compared with earlier Node 20-era builds: Node.js `>=26`, native zstd through `node:zlib`, no deprecated compatibility option surface, and ECDSA P-256 leaf certificates by default.

## Package Contents

The npm tarball is controlled by the package `files` allowlist. Generated repository docs are not included in the published package unless the allowlist is changed intentionally.
