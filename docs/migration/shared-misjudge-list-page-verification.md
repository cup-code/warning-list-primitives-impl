# Shared misjudge list page verification

Verified from the migration branch at `3cc5c10` plus the generated audit update. All durations below are fresh wall-clock measurements from 2026-07-17 (Asia/Shanghai); Node test durations are included separately where the runner reported them.

## Integrity, tests, audit, and installation

| Command | Exit | Wall time | Evidence |
| --- | ---: | ---: | --- |
| `git diff --check` | 0 | 0.058s | No output. |
| `pnpm test:shared-ui` | 0 | 0.644s | 60 tests: 60 passed, 0 failed, 0 skipped/cancelled/todo; runner duration 236.398959ms. |
| `pnpm test:migration` | 0 | 0.806s | 72 tests: 72 passed, 0 failed, 0 skipped/cancelled/todo; runner duration 554.622042ms. |
| `pnpm test` | 0 | 1.678s | Three reported suites: 72/72 migration, 29/29 API, and 60/60 shared UI (161/161 total); runner durations 467.122583ms, 99.841875ms, and 184.049875ms. |
| `pnpm audit:shared` | 0 | 0.483s | Regenerated `shared-source-audit.json`. |
| `pnpm verify:sources` | 0 | 0.280s | `source-before.json` and `source-after.json` comparison passed. |
| `pnpm install --frozen-lockfile` | 0 | 1.573s | Lockfile was up to date; pnpm reported completion in 1.4s with pnpm 10.14.0. |

The generated shared-source audit records: smaller 481, larger 1,870, common 474, identical 344, different 130, smaller-only 7, and larger-only 1,396. `docs/migration/source-after.json` was not modified; its SHA-256 remained `986f8d5d62fef7fcdf42599534f596415d218c74a4f8d3db85cfc818ce65b2b0`.

## Scope and contract evidence

- `misjudgeList.vue` is byte-identical between `link-warning` and `link-front`: 768 bytes, SHA-256 `c987b66c4d1704036ce63127bbef5ba8dbff429dfb85e3e801a677bc57d5a5a1`.
- `misjudgeListHost.js` is byte-identical between the applications: 802 bytes, SHA-256 `c382894b04e34d971e8b54acb880b5b6fb6c7934983033dc3d5161358f2c8643`.
- Each host exposes exactly 12 capabilities: `tenantControlList`, `getDepartListSimple`, `getUserListByRoleFn`, `allWarningList`, `getStorageItem`, `setStorageItem`, `delStorageItem`, `allMachineList`, `machineList`, `batchAttentionAlarm`, `batchAttentionAlarmInternal`, and `warningListHost`.
- The route wrapper imports the shared page and local host once, binds the page ref, and delegates navigation to `page.handleRouteLeave(to, from, next)`. Its missing-ref production fallback calls `next()` once.
- The shared route helper preserves detail and `misjudgeList` destinations, clears cache only for unrelated destinations, and calls `next()` exactly once. The shared UI suite exercises all three path cases and asserts both clear count and next count.
- The existing warning-list hosts retain their sole intentional difference: warning uses `detailPayloadMode: 'id'`, front uses `detailPayloadMode: 'form'`; replacing that value makes the files identical.
- `WarningListConfig` has one implementation file, `packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.js`. Unrelated application configs remain local.
- Shared UI contains zero imports matching an application path or alias, so it has no application reverse dependency.
- `git diff --name-only d20c79b..HEAD` reports 20 files. No router and none of `warningList.vue`, `customMisjudgeList.vue`, `clientWarningList.vue`, `attentionList.vue`, or `allTenantWaringList.vue` appears in that range.

The shared page, host-capability, route-leave, table-config, and migration contract tests cover preserved cache keys/defaults, queries, timers, layout and batch behavior at source/helper-contract level. The two production builds additionally compile the migrated page in each application.

## Independent clean builds

Only `dist/link-warning` and `dist/link-front` were removed before building.

| Command | Exit | Wall time | Output |
| --- | ---: | ---: | --- |
| `pnpm build:warning` | 0 | 10.623s | 199 files, 14,479,118 bytes; manifest SHA-256 `c1206a7c9ffcc80ffc46ed0f38171d95b98100543b32b5922cbc85e4c34683bd`. |
| `pnpm build:front` | 0 | 32.072s | 2,398 files, 150,238,175 bytes; manifest SHA-256 `b14797e549cec7c28dfcdb2a861d1f5202f3b0a5c02450a8ec6a46a398decd14`. |

After the front build, the warning output still contained 199 files and its complete path/size/SHA-256 manifest remained byte-for-byte identical, with the same manifest hash `c1206a7c9ffcc80ffc46ed0f38171d95b98100543b32b5922cbc85e4c34683bd`. This demonstrates that each build wrote only its own output directory.

## Review and limitation

The integration compatibility fix at `3cc5c10` received independent review with zero Critical, zero Important, and zero Minor findings. Final verification found no unresolved migration findings.

Known limitation: the automated coverage uses Node source/contract tests and pure helper tests. It does not runtime-mount `MisjudgeListPage.vue` in a Vue 2 browser environment and does not perform browser interaction or visual regression testing. Successful production compilation in both hosts reduces integration risk but is not a substitute for a mounted Vue runtime or end-to-end test.
