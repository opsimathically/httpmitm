# Benchmarking Context

## Purpose

The benchmark suite provides local performance diagnostics for `@opsimathically/httpmitm`. It is not part of `npm run verify` because benchmark results are hardware-, OS-, and Node-version-dependent.

## Commands

- `npm run bench`: build and run the standard benchmark profile.
- `npm run bench:quick`: build and run a smaller smoke profile.
- `npm run bench:json`: build and emit JSON to stdout.
- `node --expose-gc benchmarks/run-benchmarks.mjs`: run directly after build with cleaner memory readings.

## Covered Workloads

- Direct HTTP upstream baseline.
- HTTP proxy passthrough throughput and latency.
- HTTP header callback overhead.
- Single-flight proxy latency.
- Buffered request and response body memory behavior.
- HTTPS exact-host memory leaf certificate generation rate.
- HTTPS registrable-domain wildcard certificate reuse.
- WebSocket frame rate with and without callbacks.
- Proxy start and awaited close lifecycle timing.

## Notes

- Benchmarks import `../dist/index.mjs`; run `npm run build` before direct benchmark invocation.
- Local JSON outputs should go under `benchmarks/results/`, which is ignored by git.
- Compare benchmark runs only across controlled profiles and environments.
