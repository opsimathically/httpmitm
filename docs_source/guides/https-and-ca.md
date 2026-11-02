# HTTPS And CA Handling

HTTPS interception accepts CONNECT traffic, presents a generated leaf certificate to the client, and signs that leaf certificate with a generated local CA.

## Compatibility Disk Mode

The default disk storage layout is compatible with earlier releases. If you only pass `ssl_ca_dir`, HTTPMITM persists the root CA and exact-host leaf certificates under that directory.

```typescript
await httpmitm.start({
  host: "127.0.0.1",
  listen_port: 4444,
  ssl_ca_dir: "/tmp/httpmitm-ca",
});
```

Trust `ssl_ca_dir/certs/ca.pem` in the client that sends HTTPS requests through the proxy. Treat this directory as sensitive credential material because it contains CA private key material capable of signing certificates trusted by that client.

By default, the generated root CA uses RSA-2048 and generated leaf certificates use ECDSA P-256. This keeps browser and operating-system CA trust conservative while making per-host leaf generation much faster than RSA leaves. Set `certificates.leaf_certificates.key_algorithm: "rsa_2048"` when a client requires RSA leaf certificates.

## Memory And Hybrid Modes

The `certificates` option controls root CA and leaf certificate storage independently.

Fully memory-only mode writes no CA or leaf certificate material to disk. Trust the returned `server.ca.cert_pem` in the client using the proxy.

```typescript
const server = await httpmitm.start({
  certificates: {
    root_ca: { storage: "memory", key_algorithm: "rsa_2048" },
    leaf_certificates: {
      storage: "memory",
      key_algorithm: "ecdsa_p256",
    },
  },
});
```

When the `certificates` object is omitted, compatibility mode stores the root CA and exact-host leaf certificates on disk. When `certificates` is provided, root and leaf storage still default to `disk`, but the leaf wildcard strategy defaults to `registrable_domain`.

If disk root CA material already exists and an explicit `root_ca.key_algorithm` conflicts with that material, startup fails. Choose a different `ssl_ca_dir` or remove the old CA files when intentionally changing the root CA algorithm.

Hybrid mode keeps browser trust stable by persisting only the root CA while keeping leaf certificates in memory.

```typescript
await httpmitm.start({
  ssl_ca_dir: "/tmp/httpmitm-ca",
  certificates: {
    root_ca: { storage: "disk", key_algorithm: "rsa_2048" },
    leaf_certificates: {
      storage: "memory",
      wildcard: "registrable_domain",
      key_algorithm: "ecdsa_p256",
      cache: { max_entries: 1000, ttl_ms: 3_600_000 },
    },
  },
});
```

Fully RSA mode remains supported:

```typescript
await httpmitm.start({
  ssl_ca_dir: "/tmp/httpmitm-ca-rsa",
  certificates: {
    root_ca: { storage: "disk", key_algorithm: "rsa_2048" },
    leaf_certificates: { key_algorithm: "rsa_2048" },
  },
});
```

## Leaf Certificate Reuse

`wildcard: "registrable_domain"` uses Public Suffix List parsing to generate reusable leaf certificates for valid registrable-domain wildcards, such as `example.com` and `*.example.com`. It falls back to exact-host certificates for IP addresses, `localhost`, single-label hosts, parse failures, and deeper hostnames that a registrable-domain wildcard cannot cover.

`wildcard: "exact_host"` generates one leaf certificate per exact requested hostname.

A memory-backed root CA is process-local. If you combine a memory root with disk-backed leaf certificates, those leaf files are signed by an ephemeral CA and should not be treated as durable across process restarts. Persist the root CA when clients need stable trust.

## Supplied Root CA Material

Applications that store root CA material in a database or secret manager can supply the existing certificate and private key directly from memory.

```typescript
const root_ca_from_database = await loadRootCaFromDatabase();

const server = await httpmitm.start({
  certificates: {
    root_ca: {
      material: {
        cert_pem: root_ca_from_database.cert_pem,
        private_key_pem: root_ca_from_database.private_key_pem,
        private_key_passphrase: root_ca_from_database.private_key_passphrase,
      },
    },
    leaf_certificates: { storage: "memory" },
  },
});
```

When `root_ca.material` is present, root CA storage defaults to `memory`. Supplied root CA material is never written to disk, and `storage: "disk"` plus `material` is rejected. The private key must match the certificate, the certificate must be a valid CA certificate, and any encrypted private key must include `private_key_passphrase` or be decrypted before startup.

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
- Use supplied root CA material when trust anchors are stored in a database or secret manager.
- Keep the default RSA root plus ECDSA P-256 leaves unless you have a client compatibility reason to use RSA leaves.
- Prefer disk root plus memory leaf storage for long-running local browser trust with low disk churn.
- Never commit generated CA material.
- Remove generated CA trust from clients after local testing is complete.
