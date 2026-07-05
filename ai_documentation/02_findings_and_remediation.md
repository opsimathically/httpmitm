# Findings And Remediation

## Build And Packaging

- Finding: `npm run build` prompted inside `ts-to-zod`.
  - Fix: pass the selected config explicitly.
  - Verification: `npm run build` passes.

- Finding: declaration generation failed on `import ErrnoException = NodeJS.ErrnoException`.
  - Fix: replace the import-equals alias with a normal TypeScript type alias.
  - Verification: `dist/index.d.ts` and `dist/index.d.mts` exist after build.

- Finding: npm tarball could omit build outputs or type declarations.
  - Fix: use deterministic package metadata and a release smoke test.
  - Verification: `npm run pack:dry` and `npm run smoke:package` pass.

- Finding: repeated prepack builds could fail because `dist/*.d.ts` was included by the TypeScript project and then deleted by `tsup --clean`.
  - Fix: explicitly exclude generated output from `tsconfig.json`.
  - Verification: repeated build, pack dry-run, and smoke package runs pass.

## Type, Lint, And Docs

- Finding: manual test had an invalid interception state and caused type/docs failure.
  - Fix: remove the obsolete manual test because it was not part of automated coverage.
  - Verification: `npm run typecheck` and `npm run docs` pass.

- Finding: forked proxy internals contain legacy typing suppressions.
  - Fix: keep typed public boundaries and narrow lint scope to production-owned TypeScript while documenting remaining forked-code risk.
  - Verification: `npm run lint` passes.

## Runtime Safety

- Finding: request and response data callbacks buffer full payloads.
  - Fix: add default body limits and terminate with diagnostics when exceeded.
  - Verification: request and response limit tests pass.

- Finding: callbacks can hang indefinitely.
  - Fix: enforce `callback_timeout_ms`.
  - Verification: HTTP and WebSocket timeout tests pass.

- Finding: zstd transforms originally used child processes and depended on an external binary.
  - Fix: use Node.js 26 native `node:zlib` Zstandard APIs.
  - Verification: zstd decode/re-encode and no-external-binary tests pass.

- Finding: HTTPS interception wrote all root and leaf certificate material to disk.
  - Fix: add configurable disk or memory root CA and leaf certificate storage with in-memory LRU/TTL leaf caching and registrable-domain wildcard reuse.
  - Verification: disk compatibility, memory root, memory leaf, wildcard reuse, exact fallback, TTL/LRU, and concurrent generation tests pass.

- Finding: RSA-only leaf certificate generation is slower than necessary for high-churn HTTPS interception.
  - Fix: add configurable RSA-2048 or ECDSA P-256 certificate key algorithms with RSA root CA and ECDSA leaf certificates as the default.
  - Verification: default RSA-root/ECDSA-leaf, explicit all-RSA, explicit all-ECDSA, root mismatch, and leaf filename separation tests pass.

## Security

- Finding: production audit reported vulnerable direct dependencies.
  - Fix: upgrade patched direct dependencies and remove unused runtime dependencies.
  - Verification: `npm run audit:prod` reports zero vulnerabilities.
