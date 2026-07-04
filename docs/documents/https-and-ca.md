[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / https-and-ca

# HTTPS And CA Handling

HTTPS interception accepts CONNECT traffic, presents a generated leaf certificate to the client, and signs that leaf certificate with a generated local CA.

## Compatibility Disk Mode

The default behavior is compatible with earlier releases. If you only pass `ssl_ca_dir`, HTTPMITM persists the root CA and exact-host leaf certificates under that directory.

```typescript
await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  ssl_ca_dir: "/tmp/httpmitm-ca",
});
```

Trust `ssl_ca_dir/certs/ca.pem` in the client that sends HTTPS requests through the proxy. Treat this directory as sensitive credential material because it contains CA private key material capable of signing certificates trusted by that client.

## Memory And Hybrid Modes

The `certificates` option controls root CA and leaf certificate storage independently.

Fully memory-only mode writes no CA or leaf certificate material to disk. Trust the returned `server.ca.cert_pem` in the client using the proxy.

```typescript
const server = await httpmitm.start({
  certificates: {
    root_ca: { storage: "memory" },
    leaf_certificates: { storage: "memory" },
  },
});
```

Hybrid mode keeps browser trust stable by persisting only the root CA while keeping leaf certificates in memory.

```typescript
await httpmitm.start({
  ssl_ca_dir: "/tmp/httpmitm-ca",
  certificates: {
    root_ca: { storage: "disk" },
    leaf_certificates: {
      storage: "memory",
      wildcard: "registrable_domain",
      cache: { max_entries: 1000, ttl_ms: 3_600_000 },
    },
  },
});
```

## Leaf Certificate Reuse

`wildcard: "registrable_domain"` uses Public Suffix List parsing to generate reusable leaf certificates for valid registrable-domain wildcards, such as `example.com` and `*.example.com`. It falls back to exact-host certificates for IP addresses, `localhost`, single-label hosts, parse failures, and deeper hostnames that a registrable-domain wildcard cannot cover.

`wildcard: "exact_host"` generates one leaf certificate per exact requested hostname.

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

- Use disk-backed root CA storage when client trust should survive process restarts.
- Use memory leaf storage to avoid directories full of per-domain leaf certificates.
- Never commit generated CA material.
- Remove generated CA trust from clients after local testing is complete.
