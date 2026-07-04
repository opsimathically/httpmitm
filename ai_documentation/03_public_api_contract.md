# Public API Contract

## Runtime Support

- Supported Node.js version: `>=26`.
- Published module entry points are CommonJS, ESM, and TypeScript declarations through the package exports map.

## Public Exports

- `HTTPMITM`
- `Proxy`
- Public HTTP, WebSocket, plugin, result, context, logger, and limit types from `src/classes/httpmitm/httpmitm.types.ts`.

## Start Parameters

`HTTPMITM.start(params)` accepts the existing proxy options plus:

- `http_agent`: optional upstream HTTP agent.
- `https_agent`: optional upstream HTTPS agent.
- `limits.request_body_bytes`: maximum buffered request body size. Default: `10 MiB`.
- `limits.response_body_bytes`: maximum buffered response body size. Default: `25 MiB`.
- `limits.websocket_frame_bytes`: maximum WebSocket frame size. Default: `16 MiB`.
- `limits.callback_timeout_ms`: maximum callback execution time. Default: `30_000`.
- `logger`: optional structured logger with `debug`, `info`, `warn`, and `error` methods.
- `certificates.root_ca.storage`: root CA storage backend, `disk` or `memory`. Default: `disk`.
- `certificates.root_ca.ssl_ca_dir`: disk directory for persisted root CA material. Defaults to `ssl_ca_dir` or `.http-mitm-proxy`.
- `certificates.leaf_certificates.storage`: leaf certificate storage backend, `disk` or `memory`. Default: `disk`.
- `certificates.leaf_certificates.wildcard`: `registrable_domain` or `exact_host`. Default: `registrable_domain` when `certificates` is configured. When `certificates` is omitted entirely, legacy exact-host disk behavior is preserved.
- `certificates.leaf_certificates.cache.max_entries`: in-memory leaf cache max. Default: `1000`.
- `certificates.leaf_certificates.cache.ttl_ms`: in-memory leaf cache TTL. Default: `3_600_000`.

`HTTPMITM.start(params)` returns `ca.cert_pem`, `ca.storage`, and `ca.cert_path` when root CA storage is disk-backed.

## Runtime Behavior

- Interception callbacks are awaited before affected traffic is forwarded.
- Callback states remain `PASSTHROUGH`, `MODIFIED`, and `TERMINATE`.
- Plugin callbacks may additionally return `CONTINUE`.
- Callback errors and timeouts follow `callback_error_policy`; the default remains fail-closed termination.
- Limit violations terminate the affected connection and emit a warning diagnostic when a logger is configured.
- zstd support uses Node.js 26 native `node:zlib` Zstandard APIs; no external binary is required. Corrupt zstd payloads surface as decode/encode errors.
- `stop()` and the returned server `close()` method await server shutdown.
- Fully memory-backed certificate mode does not write root CA or leaf certificate material to disk; callers trust the returned `server.ca.cert_pem`.
- Memory root plus disk leaf mode is supported, but disk leaf files are signed by an ephemeral process-local CA and are not durable trust material across restarts.
