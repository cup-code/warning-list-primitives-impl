# Shared warning-list primitives verification

Verified on 2026-07-16 from commit `327c263` in the isolated `warning-list-primitives-impl` worktree.

## Command evidence

| Command | Status | Evidence |
| --- | --- | --- |
| `git diff --check` | PASS | Exit 0; no whitespace errors. |
| `pnpm test:shared-ui` | PASS | 40 passed, 0 failed, 0 skipped; Node test duration 271.594 ms. |
| `pnpm test:migration` | PASS | 65 passed, 0 failed, 0 skipped; Node test duration 1607.839 ms. |
| `pnpm test` | PASS | 134 passed total: migration/audit 65, warning-feature 29, shared-ui 40; 0 failed and 0 skipped. |
| `pnpm audit:shared` | PASS | Exit 0; regenerated `shared-source-audit.json`. |
| `pnpm verify:sources` | PASS | Exit 0; reported `来源目录未发生变化` (source directories unchanged). The established `source-after.json` did not require regeneration. |
| `pnpm install --frozen-lockfile` | PASS | Exit 0 in 1.2 s; all 6 workspace projects, lockfile current, resolution skipped. |
| `pnpm build:warning` | PASS | Exit 0 in 12 s; `dist/link-warning` contains 199 files (14,478,382 bytes). |
| `pnpm build:front` | PASS | Exit 0 in 42 s; `dist/link-front` contains 2,398 files (150,237,058 bytes). |

Before building, only `dist/link-warning` and `dist/link-front` were removed. A SHA-256 manifest of all 199 warning-build files was captured after `build:warning` and compared after `build:front`; it was byte-identical. This confirms independent outputs and that the front build did not overwrite the warning output.

## Audit result

The generated shared-source audit records:

| smaller | larger | common | identical | different | smallerOnly | largerOnly |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 480 | 1869 | 473 | 342 | 131 | 7 | 1396 |

Compared with the previous audit, common paths increased from 472 to 473, identical paths increased from 339 to 342, and different paths decreased from 133 to 131. The three warning component wrappers moved from `different` to `identical`; the new local host is the remaining intentional application-specific boundary.

## Migration contract evidence

- All four shared package subpaths resolve: `list`, `table-config`, `warning-info`, and `check-group`.
- The original `components/list.vue`, `components/checkGroup.vue`, and `components/warningInfo.vue` paths exist in both applications. All three wrapper pairs are byte-identical.
- A diff of the two `warningListHost.js` files contains one line only: warning uses `detailPayloadMode: 'id'`, while front uses `detailPayloadMode: 'form'`. The shared payload helper therefore produces `detailId` for `link-warning` and `detailForm` for `link-front`.
- `WarningInfo` remains independent of `detailPayloadMode` and continues emitting `itemTap` data containing `detailId` in both applications.
- The legacy imperative ref chain remains intact: consuming pages call `$refs.tableRef.setSelections(ids)`, the wrapper proxies `setSelections(ids)`, and shared `ForewarningList` calls `this.$refs.tables.setSelection(ids)` on `CTable`.
- `tableListConfig` has one shared implementation. Other symbols in each application's `config.js` remain local.
- Shared warning-list source has no application imports or application globals; migration tests cover the allowed dependency boundary.
- Against the pre-implementation commit `3fee88a`, no consuming page or router/route file changed. The six consuming pages retain their existing application-local component import paths, and both production builds resolve those dynamic paths.

## Non-blocking warnings and limitations

- pnpm reports unresolved `${NPM_AUTH}` substitution while reading `.npmrc`; no registry fetch was needed because the frozen lockfile and installation were already current.
- pnpm reports that application-level `resolutions` fields do not take effect and should be configured at the workspace root. This is pre-existing and did not block install, tests, or builds.
- Rsbuild warns that each output directory is outside the application root and therefore is not automatically cleaned. The verification explicitly removed only the two owned output directories before building.
- As documented in Task 6, the focused Vue component tests are source-contract tests: they read and assert SFC source rather than mounting or executing the Vue 2 components in a browser/runtime harness. Both clean production builds compile the SFCs, but interactive runtime behavior is not covered by those focused tests.

## Review classification

Independent review against Task 7 and the final acceptance checklist reported **Critical: 0; Important: 0; Minor: 1.** The sole Minor finding was that this section initially described only self-review instead of recording the required independent review. This documentation finding is resolved by the present text. No code or generated-artifact inconsistency was found; the reviewer independently confirmed the 134/134 test result, source verification, whitespace check, audit counts, byte-identical wrappers, one-line host difference, exports, ref chain, payload contracts, and changed-file scope.

Post-resolution classification: **Critical: 0; Important: 0; unresolved Minor: 0.** Generated changes are limited to the established audit artifact and this evidence document; production behavior is unchanged.
