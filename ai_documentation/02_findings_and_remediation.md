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
  - Fix: make the manual sample type-correct or exclude it from release gates.
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

- Finding: zstd transforms used synchronous child processes.
  - Fix: use async child processes with timeout and bounded output.
  - Verification: zstd decode/re-encode and missing-binary tests pass.

## Security

- Finding: production audit reported vulnerable direct dependencies.
  - Fix: upgrade patched direct dependencies and remove unused runtime dependencies.
  - Verification: `npm run audit:prod` reports zero vulnerabilities.
