# HTTPMITM Production Readiness Context

## Current Goal

Prepare `@opsimathically/httpmitm` for a public npm production release on Node.js 20+ without adding GitHub workflow files.

## Current Status

- Release blockers addressed: build, declarations, package metadata, local gates, package smoke test.
- Runtime hardening added: limits, callback timeout, logger, async zstd transform, awaited shutdown.
- Test suite expanded from 18 to 33 e2e tests.
- Production audit passes with zero known production vulnerabilities.

## Documentation Map

- `01_production_readiness_roadmap.md`: phased implementation checklist and acceptance gates.
- `02_findings_and_remediation.md`: audit findings, chosen fixes, and verification status.
- `03_public_api_contract.md`: public package API, runtime options, and breaking changes.
- `04_test_matrix.md`: required test coverage for release readiness.
- `05_operations_and_security.md`: operating, security, dependency, and runtime notes.

## Active Assumptions

- Node.js support baseline is `>=20`.
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
