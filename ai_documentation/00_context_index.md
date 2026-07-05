# HTTPMITM Production Readiness Context

## Current Goal

Prepare `@opsimathically/httpmitm` for a public npm production release on Node.js 26+ without adding GitHub workflow files.

## Current Status

- Release blockers addressed: build, declarations, package metadata, local gates, package smoke test.
- Runtime hardening added: limits, callback timeout, logger, native Node.js zstd transform, awaited shutdown.
- Test suite expanded from the original 18 e2e tests to the current certificate, encoding, WebSocket, package, and lifecycle coverage.
- Production audit passes with zero known production vulnerabilities.
- Opt-in local benchmark suite added under `benchmarks/`; it is intentionally separate from `npm run verify`.

## Documentation Map

- `01_production_readiness_roadmap.md`: phased implementation checklist and acceptance gates.
- `02_findings_and_remediation.md`: audit findings, chosen fixes, and verification status.
- `03_public_api_contract.md`: public package API, runtime options, and breaking changes.
- `04_test_matrix.md`: required test coverage for release readiness.
- `05_operations_and_security.md`: operating, security, dependency, and runtime notes.
- `06_benchmarking.md`: local benchmark coverage, profiles, and interpretation notes.

## Active Assumptions

- Node.js support baseline is `>=26`.
- This is a public npm package, not a hosted proxy service.
- Breaking changes are allowed when they improve safety, typing, or release correctness.
- CI/GitHub workflow files are out of scope; all gates are local npm scripts.
- The forked proxy internals remain a documented legacy boundary; public wrapper code and release gates are linted and typed.

## Verification Commands

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run docs`
- `npm test`
- `npm run audit:prod`
- `npm run pack:dry`
- `npm run smoke:package`
- `npm run verify`
- `npm run bench:quick`
- `npm run bench`
