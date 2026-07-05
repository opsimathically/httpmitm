# Troubleshooting

## HTTPS Clients Reject Certificates

For disk-backed root CA mode, trust the generated CA certificate at `ssl_ca_dir/certs/ca.pem` in the client using the proxy. For memory-backed root CA mode, trust `server.ca.cert_pem`. Make sure the client is connecting through the proxy instance that generated the CA.

## Leaf Certificate Directories Grow Too Large

Use `certificates.leaf_certificates.storage: "memory"` to keep generated leaf certificates out of `ssl_ca_dir`. Use `wildcard: "registrable_domain"` to reuse valid wildcard leaves like `example.com` plus `*.example.com`.

ECDSA leaf certificate files include `.ecdsa_p256` in the filename so they can coexist with RSA leaf files. Explicit RSA leaves preserve the older exact-host filenames where practical.

## Root Algorithm Mismatch

If startup fails because an existing root CA key algorithm does not match the requested `certificates.root_ca.key_algorithm`, choose a fresh `ssl_ca_dir` or remove the old CA material after removing trust for the previous CA from affected clients.

## Supplied Root CA Material Fails Startup

When using `certificates.root_ca.material`, confirm the certificate PEM is a CA certificate, the private key PEM matches the certificate, the certificate validity window includes the current time, and `private_key_passphrase` is correct for encrypted private keys. Supplied material is memory-only, so remove `storage: "disk"` from `root_ca`.

## Upstream HTTPS Fails With Private Certificates

Client trust of the MITM CA does not control upstream trust. Pass an `https_agent` configured with the upstream CA bundle or explicit test-only trust settings.

## Callback Timeout

Callbacks are bounded by `limits.callback_timeout_ms`, defaulting to `30_000`. Reduce callback work, move slow work out of the traffic path, or raise the timeout. The default `callback_error_policy` terminates timed-out traffic.

## Body Or Frame Limit Termination

Request bodies, response bodies, and WebSocket frames are bounded. Raise the matching limit only after confirming expected payload size and process memory capacity.

## zstd Decode Failure

Confirm the process is running on Node.js `>=26`. zstd support uses built-in `node:zlib`, so no external `zstd` executable is required. Corrupt zstd payloads cause data callbacks to receive original bytes and `decode_error` explains the failure.

## Corrupt Or Unsupported Content-Encoding

Inspect `context.decode_error`. Passthrough forwards original bytes. If you return modified data after a decode failure, ensure your callback also returns headers that describe the bytes you are forwarding.

## Port Reuse Fails In Tests

Always await `server.close()` or `httpmitm.stop()` before starting another proxy on the same port.
