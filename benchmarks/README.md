# HTTPMITM Benchmarks

This directory contains opt-in performance benchmarks for local analysis. The suite measures the built package in `dist/` so TypeScript loader overhead is not included.

## Commands

```bash
npm run bench
npm run bench:quick
npm run bench:json
```

`npm run bench` runs the standard profile. `npm run bench:quick` uses smaller workloads for a fast sanity pass. `npm run bench:json` emits machine-readable JSON.

For cleaner memory measurements, run the benchmark file directly with V8 GC exposed:

```bash
npm run build
node --expose-gc benchmarks/run-benchmarks.mjs
```

## Coverage

- Direct HTTP baseline.
- HTTP proxy passthrough throughput and latency.
- HTTP awaited header callback overhead.
- Single-flight HTTP latency distribution.
- Buffered request/response body memory behavior.
- HTTPS exact-host certificate generation rate for ECDSA P-256 and RSA-2048 leaves.
- HTTPS registrable-domain wildcard certificate reuse.
- WebSocket round-trip frame rate without callbacks.
- WebSocket round-trip frame rate with awaited frame callbacks.
- Proxy start plus awaited close lifecycle timing.

## Profiles

Use `--profile quick`, `--profile standard`, or `--profile heavy`.

```bash
npm run build
node benchmarks/run-benchmarks.mjs --profile heavy --output benchmarks/results/heavy.json
```

Individual workload sizes can be overridden with environment variables or matching CLI options:

- `BENCH_HTTP_REQUESTS` / `--http_requests=1000`
- `BENCH_HTTP_CONCURRENCY` / `--http_concurrency=25`
- `BENCH_MEMORY_REQUESTS` / `--memory_requests=40`
- `BENCH_MEMORY_BODY_BYTES` / `--memory_body_bytes=524288`
- `BENCH_CERT_COUNT` / `--cert_count=20`
- `BENCH_CERT_CONCURRENCY` / `--cert_concurrency=4`
- `BENCH_WS_FRAMES` / `--ws_frames=2000`
- `BENCH_WS_WINDOW` / `--ws_window=32`

Benchmark results are machine and workload dependent. Compare results only when Node.js version, host hardware, OS, benchmark profile, and package revision are controlled.
