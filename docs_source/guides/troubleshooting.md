# Troubleshooting

## HTTPS Clients Reject Certificates

Trust the generated CA certificate at `ssl_ca_dir/certs/ca.pem` in the client using the proxy. Make sure the client is connecting through the proxy instance that uses the same `ssl_ca_dir`.

## Upstream HTTPS Fails With Private Certificates

Client trust of the MITM CA does not control upstream trust. Pass an `https_agent` configured with the upstream CA bundle or explicit test-only trust settings.

## Callback Timeout

Callbacks are bounded by `limits.callback_timeout_ms`, defaulting to `30_000`. Reduce callback work, move slow work out of the traffic path, or raise the timeout. The default `callback_error_policy` terminates timed-out traffic.

## Body Or Frame Limit Termination

Request bodies, response bodies, and WebSocket frames are bounded. Raise the matching limit only after confirming expected payload size and process memory capacity.

## zstd Decode Failure

Install `zstd` and ensure it is on `PATH`. If zstd is missing or times out, data callbacks receive original bytes and `decode_error` explains the failure.

## Corrupt Or Unsupported Content-Encoding

Inspect `context.decode_error`. Passthrough forwards original bytes. If you return modified data after a decode failure, ensure your callback also returns headers that describe the bytes you are forwarding.

## Port Reuse Fails In Tests

Always await `server.close()` or `httpmitm.stop()` before starting another proxy on the same port.
