# @opsimathically/httpmitm Documentation

`@opsimathically/httpmitm` is a Node.js MITM proxy library for controlled HTTP, HTTPS, and WebSocket inspection. It is intended for authorized test harnesses, debugging tools, protocol experiments, and internal automation where traffic interception is expected and permitted.

The preferred public API is `HTTPMITM`. The lower-level `Proxy` export remains available as a compatibility and escape-hatch surface for users who need the forked proxy internals directly.

## Start Here

- [Getting Started](guides/getting-started.md): install, import, start, and stop the proxy.
- [HTTP Interception](guides/http-interception.md): headers, bodies, content encoding, and result states.
- [HTTPS And CA Handling](guides/https-and-ca.md): CONNECT interception, disk or memory certificate storage, generated CA trust, and upstream TLS agents.
- [WebSocket Interception](guides/websocket-interception.md): upgrade handling, frames, close events, and limits.
- [Plugins](guides/plugins.md): deterministic plugin ordering and `CONTINUE` behavior.
- [Operations And Security](guides/operations-and-security.md): limits, logger behavior, zstd, audit policy, and package contents.
- [Troubleshooting](guides/troubleshooting.md): common runtime failures and where to look first.

## Safety Notice

MITM tooling can expose credentials, session tokens, private payloads, and certificate authority material. Use this package only for systems you own or are explicitly authorized to inspect. Protect persisted `ssl_ca_dir` material as sensitive credential storage, and avoid logging full request or response bodies unless your environment is designed for that data.

## API Reference

The API reference in this directory is generated from TypeScript declarations and TSDoc comments. It documents the public classes, callback contexts, interception result shapes, plugin interfaces, logger, limits, and server lifecycle return type.
