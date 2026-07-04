[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / benchmarking

# Benchmarking

HTTPMITM includes an opt-in benchmark suite under `benchmarks/`. Benchmarks are intentionally separate from `npm run verify` because throughput, latency, memory, and frame-rate numbers vary by hardware, operating system, Node.js version, and background system load.

## Commands

```bash
npm run bench
npm run bench:quick
npm run bench:json
```

`npm run bench` builds the package and runs the standard profile against `dist/`. `npm run bench:quick` runs a smaller profile for a fast local check. `npm run bench:json` emits a machine-readable report.

For cleaner memory readings, expose V8 GC when running the benchmark file directly:

```bash
npm run build
node --expose-gc benchmarks/run-benchmarks.mjs
```

## Measured Workloads

- Direct HTTP baseline without HTTPMITM.
- HTTP proxy passthrough throughput and latency.
- HTTP header callback overhead.
- Single-flight HTTP latency distribution.
- Buffered request and response body memory behavior.
- HTTPS exact-host memory leaf certificate generation rate.
- HTTPS registrable-domain wildcard certificate reuse.
- WebSocket round-trip frame rate with and without awaited callbacks.
- Proxy start plus awaited close lifecycle timing.

## Profiles And Output

Use `--profile quick`, `--profile standard`, or `--profile heavy` when running `benchmarks/run-benchmarks.mjs` directly. Workload sizes can also be overridden through `BENCH_*` environment variables or matching CLI options. Local JSON output should be written under `benchmarks/results/`, which is ignored by git.

Benchmark numbers are comparative diagnostics, not release gates. Compare only runs collected with the same profile, package revision, Node.js version, and host class.
