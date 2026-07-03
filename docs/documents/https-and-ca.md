[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / https-and-ca

# HTTPS And CA Handling

HTTPS interception works by accepting CONNECT traffic, generating a leaf certificate for the target host, and signing that leaf certificate with a generated local CA.

## CA Directory

Set `ssl_ca_dir` to control where CA and generated certificate material is stored.

```typescript
await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  ssl_ca_dir: "/tmp/httpmitm-ca",
});
```

Trust `ssl_ca_dir/certs/ca.pem` in the client that sends HTTPS requests through the proxy. Treat this directory as sensitive credential material because it contains CA private key material capable of signing certificates trusted by that client.

## Upstream TLS Trust

Client trust of the generated MITM CA is separate from the proxy's trust of upstream HTTPS servers. If upstream services use private or self-signed certificates, pass an explicit `https_agent`.

```typescript
import https from "node:https";

await httpmitm.start({
  ssl_ca_dir: "/tmp/httpmitm-ca",
  https_agent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
```

Use a stricter custom CA bundle instead of `rejectUnauthorized: false` when you can.

## Operational Notes

- Use a stable `ssl_ca_dir` when client trust should survive process restarts.
- Use an isolated `ssl_ca_dir` per test suite when tests run concurrently.
- Never commit generated CA material.
- Remove generated CA trust from clients after local testing is complete.
