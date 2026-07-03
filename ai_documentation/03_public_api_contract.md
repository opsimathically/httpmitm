# Public API Contract

## Runtime Support

- Supported Node.js version: `>=20`.
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
- `limits.binary_transform_timeout_ms`: maximum external binary transform time. Default: `5_000`.
- `logger`: optional structured logger with `debug`, `info`, `warn`, and `error` methods.

## Runtime Behavior

- Interception callbacks are awaited before affected traffic is forwarded.
- Callback states remain `PASSTHROUGH`, `MODIFIED`, and `TERMINATE`.
- Plugin callbacks may additionally return `CONTINUE`.
- Callback errors and timeouts follow `callback_error_policy`; the default remains fail-closed termination.
- Limit violations terminate the affected connection and emit a warning diagnostic when a logger is configured.
- zstd support requires a `zstd` binary on `PATH`; missing or timed-out transforms surface as decode/encode errors.
- `stop()` and the returned server `close()` method await server shutdown.
