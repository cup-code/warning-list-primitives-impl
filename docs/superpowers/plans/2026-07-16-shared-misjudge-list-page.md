# Shared Misjudge List Page Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the duplicated `link-warning` and `link-front` `misjudgeList.vue` business implementation with one shared page while preserving original routes, cache behavior, queries, batch processing, and independent builds.

**Architecture:** A shared `MisjudgeListPage.vue` owns the existing page behavior and directly composes shared warning components. Each application supplies an identical `misjudgeListHost` containing HTTP, storage, machine, batch, and local warning-list capabilities. Original route files become byte-identical wrappers that delegate `beforeRouteLeave` to the shared child. The common `WarningListConfig` moves to shared UI and remains re-exported from each application config.

**Tech Stack:** Vue 2.7, Vue Router 3 in-component guards, `@tanstack/vue-query`, Element UI, pnpm workspaces, Node.js test runner, Rsbuild production builds.

## Global Constraints

- Preserve both original `ForewarningManagement/misjudgeList.vue` paths, route names, route dynamic imports, component name, template behavior, and scoped styles.
- Preserve cache keys `misjudgeListFilter`, `misjudgeListChecked`, and `misjudgeListStatus`, including the existing duplicate filter deletion.
- Preserve default `{ pageNum: 1, pageSize: 12, customerStatus: ['3'] }`, all query keys, response-field reads, infinite scrolling, refresh interval, filters, layouts, and batch-selection behavior.
- Preserve route-leave behavior: clear cache/timer only when the destination is neither a detail path nor `misjudgeList`; call `next()` exactly once.
- Original wrappers must be byte-identical and explicitly delegate `beforeRouteLeave` through `this.$refs.page.handleRouteLeave(to, from, next)`.
- Application hosts expose exactly the twelve capabilities in the approved design and are byte-identical; the existing nested `warningListHost.detailPayloadMode` remains the only warning/front navigation difference.
- Shared source must not import `@/`, `apps/`, an application router, or application globals.
- Move only `WarningListConfig`; retain `cameraListConfig`, `machineListConfig`, `tableListConfig`, and front-only `cardSirenColumns` in their established ownership.
- Do not modify the other five warning-list pages. They continue importing `WarningListConfig` through local `./config`.
- Do not clean logs, duplicate calls, naming, or historical formatting unrelated to the single-source migration.
- Host validation runs in development/test and skips production using direct `process.env.NODE_ENV`.
- Follow TDD: observe each focused test fail for the intended missing behavior before implementation.
- Use `apply_patch`, task-scoped commits, an isolated worktree, and preserve unrelated parent-worktree changes.

## Interfaces

Exact host shape:

```js
{
  tenantControlList: Function,
  getDepartListSimple: Function,
  getUserListByRoleFn: Function,
  allWarningList: Function,
  getStorageItem: Function,
  setStorageItem: Function,
  delStorageItem: Function,
  allMachineList: Function,
  machineList: Function,
  batchAttentionAlarm: Function,
  batchAttentionAlarmInternal: Function,
  warningListHost: Object,
}
```

Shared exports:

```text
@link/shared-ui/forewarning-management/warning-list/pages/misjudge
@link/shared-ui/forewarning-management/warning-list/warning-table-config
```

Shared page public method:

```js
handleRouteLeave(to, from, next)
```

## Task 1: Lock the page migration boundary with a RED contract

**Files:**

- Create: `scripts/migration/shared-misjudge-list-page.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing migration contract**

Use `node:test`, `node:assert/strict`, and source-file reads following existing migration tests. Assert:

- package exports map exactly to `pages/MisjudgeListPage.vue` and `pages/warningListTableConfig.js`;
- the shared page, host-capability module, and table config contain no `@/` or `apps/`;
- both original `misjudgeList.vue` files exist and import the shared page plus `./misjudgeListHost`;
- both wrappers contain `ref="page"`, `$attrs`, `$listeners`, and exact route-guard delegation;
- wrapper sources are byte-identical;
- both `misjudgeListHost.js` files expose the exact twelve keys and are byte-identical;
- both application configs import/re-export the shared `WarningListConfig` and retain their other local symbols;
- the other five page pairs do not import the new shared page directly;
- router files and the other five page files are outside the implementation diff range.

Add `packages/shared-ui/src/forewarning-management/warning-list/pages/*.test.mjs` to `test:shared-ui`.

**Step 2: Confirm RED**

```bash
node --test scripts/migration/shared-misjudge-list-page.test.mjs
```

Expected: failures for missing exports, shared files, hosts, and wrappers; no syntax/harness failure.

**Step 3: Commit**

```bash
git add scripts/migration/shared-misjudge-list-page.test.mjs package.json
git commit -m "test: lock shared misjudge list boundary"
```

## Task 2: Add the host contract and identical application adapters

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeListHostCapabilities.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeListHostCapabilities.js`
- Create: `apps/link-warning/src/views/ForewarningManagement/misjudgeListHost.js`
- Create: `apps/link-front/src/views/ForewarningManagement/misjudgeListHost.js`

**Step 1: Write failing host tests**

Test named exports:

```js
misjudgeListHostRequirements
assertMisjudgeListHost(host, componentName)
validateMisjudgeListHost(host, componentName, environment)
```

Assert the eleven API/storage values are functions, `warningListHost` is a non-null object, missing/invalid capabilities produce component-scoped errors, a valid host is returned unchanged, and production validation returns `undefined` while test/development validates.

**Step 2: Confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeListHostCapabilities.test.mjs
```

Expected: `ERR_MODULE_NOT_FOUND` for the capability module.

**Step 3: Implement the validator**

Define the requirements as a frozen explicit object. Use `Object.prototype.hasOwnProperty.call`, restrict `warningListHost` to a non-null object, and default the environment parameter directly from `process.env.NODE_ENV`.

**Step 4: Implement both byte-identical hosts**

Each host imports:

```js
import { tenantControlList } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUserListByRoleFn } from '@/http/safe-production/user-manage-api'
import {
  allMachineList,
  allWarningList,
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
  machineList,
} from '@/http/videoWarning/warning-api'
import { delStorageItem, getStorageItem, setStorageItem } from '@/utils/storage'
import warningListHost from './warningListHost'
```

Export the exact twelve-key object without wrappers that alter arguments or responses.

**Step 5: Confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeListHostCapabilities.test.mjs
diff -u apps/link-warning/src/views/ForewarningManagement/misjudgeListHost.js apps/link-front/src/views/ForewarningManagement/misjudgeListHost.js
```

Expected: all host tests pass; `diff` exits 0.

**Step 6: Commit**

```bash
git add packages/shared-ui/src/forewarning-management/warning-list/pages apps/link-warning/src/views/ForewarningManagement/misjudgeListHost.js apps/link-front/src/views/ForewarningManagement/misjudgeListHost.js
git commit -m "feat: add misjudge list host boundary"
```

## Task 3: Move `WarningListConfig` to shared UI

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.js`
- Modify: `packages/shared-ui/package.json`
- Modify: `apps/link-warning/src/views/ForewarningManagement/config.js`
- Modify: `apps/link-front/src/views/ForewarningManagement/config.js`

**Step 1: Write a failing deep-equality test**

Lock the current six columns in order:

```js
[
  { label: '摄像头名称', prop: 'cameraName' },
  { label: '预警名称', prop: 'warningName' },
  { label: '预警等级', prop: 'warningLevel' },
  { label: '预警开始时间', prop: 'warningStartTime' },
  { label: '处理状态', prop: 'warningStatus' },
  { label: '操作', prop: 'operation', width: 150, slot: 'operation' },
]
```

**Step 2: Confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.test.mjs
```

Expected: missing module failure.

**Step 3: Extract only the common config**

Export `WarningListConfig` as a named export, add the package subpath, remove both local declarations, and import/re-export the shared symbol from each application config. Preserve the warning/front `machineListConfig` difference and front-only `cardSirenColumns` exactly.

**Step 4: Confirm GREEN and compatibility**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.test.mjs
node --test scripts/migration/shared-misjudge-list-page.test.mjs
```

Expected: config test passes; migration test remains RED only for the not-yet-extracted page/wrappers.

**Step 5: Commit**

```bash
git add packages/shared-ui/package.json packages/shared-ui/src/forewarning-management/warning-list/pages/warningListTableConfig.* apps/link-warning/src/views/ForewarningManagement/config.js apps/link-front/src/views/ForewarningManagement/config.js
git commit -m "refactor: share warning list table config"
```

## Task 4: Extract route-leave logic as a tested shared contract

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeRouteLeave.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeRouteLeave.js`

**Step 1: Write failing pure tests**

Test:

```js
shouldClearMisjudgeCache(path)
runMisjudgeRouteLeave({ to, clearCache, next })
```

Cover:

- `/detail/warningDetail` does not clear;
- a path containing `misjudgeList` does not clear;
- an unrelated path clears once;
- `next` is called exactly once in every case;
- `clearCache` exceptions propagate and do not call `next`, matching the current synchronous guard behavior;
- missing/non-string paths are treated as unrelated and clear.

**Step 2: Confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeRouteLeave.test.mjs
```

Expected: missing module failure.

**Step 3: Implement smallest pure functions**

Use the current substring rules exactly: `path.includes('/detail')` and `path.includes('misjudgeList')`. Do not add route-name logic or normalize paths.

**Step 4: Confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeRouteLeave.test.mjs
```

Expected: all route-leave cases pass.

**Step 5: Commit**

```bash
git add packages/shared-ui/src/forewarning-management/warning-list/pages/misjudgeRouteLeave.*
git commit -m "test: preserve misjudge route leave behavior"
```

## Task 5: Extract the shared `MisjudgeListPage`

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/MisjudgeListPage.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/pages/MisjudgeListPage.vue`
- Modify: `packages/shared-ui/package.json`

**Step 1: Write a failing page contract test**

Assert the shared SFC:

- declares required `host` and validates it;
- imports `@link/warning-feature/batch-selection`;
- imports `WarningInfo`, `CheckGroup`, `ForewarningList`, `SelectMachine`, and `BatchDeal` through shared relative paths;
- imports shared `WarningListConfig` and route-leave helper;
- uses only host functions for the four queries and three storage operations;
- passes `host.warningListHost` to warning primitives;
- passes machine APIs to `SelectMachine` and batch APIs to `BatchDeal`;
- contains all three cache keys, default filter values, current query keys, interval behavior, layouts, ref `tableRef`, and selection handlers;
- exposes `handleRouteLeave(to, from, next)` and delegates to `runMisjudgeRouteLeave` with `this.clearCache`;
- retains the normalized legacy template and scoped style contract;
- contains no `@/`, `apps/`, `$router`, or application storage/global access.

Add a normalized semantic comparison helper in the test: compare the extracted page against the pre-extraction common source after removing only the import/host/route-guard adaptation regions. The comparison must fail on unrelated template, style, default-value, query-key, or method changes.

**Step 2: Confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/MisjudgeListPage.test.mjs
```

Expected: missing SFC failure.

**Step 3: Extract the shared page**

Start from the normalized `link-warning` source because it is semantically identical to front. Make only these adaptations:

- replace application imports with `host` calls and shared relative imports;
- replace the local config/mixin imports with shared sources;
- add and validate the `host` prop;
- pass nested host/API props;
- replace the automatic `beforeRouteLeave` option with public `handleRouteLeave` using the pure helper.

Do not reformat or simplify unrelated behavior beyond the repository formatter needed for the new file.

**Step 4: Confirm focused GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/*.test.mjs
```

Expected: all host, config, route-leave, and page contract tests pass.

**Step 5: Commit**

```bash
git add packages/shared-ui/package.json packages/shared-ui/src/forewarning-management/warning-list/pages/MisjudgeListPage.*
git commit -m "refactor: extract shared misjudge list page"
```

## Task 6: Replace both route pages with guard-delegating wrappers

**Files:**

- Replace: `apps/link-warning/src/views/ForewarningManagement/misjudgeList.vue`
- Replace: `apps/link-front/src/views/ForewarningManagement/misjudgeList.vue`
- Modify: `scripts/migration/shared-misjudge-list-page.test.mjs` only if a test expectation needs correction without weakening the approved contract

**Step 1: Extend the failing wrapper contract if needed**

Lock this wrapper behavior:

```vue
<script>
import MisjudgeListPage from '@link/shared-ui/forewarning-management/warning-list/pages/misjudge'
import misjudgeListHost from './misjudgeListHost'

export default {
  name: 'MisjudgeListRoute',
  inheritAttrs: false,
  components: { MisjudgeListPage },
  data: () => ({ misjudgeListHost }),
  beforeRouteLeave(to, from, next) {
    const page = this.$refs.page
    if (!page) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('[MisjudgeListRoute] shared page ref is unavailable')
      }
      next()
      return undefined
    }
    return page.handleRouteLeave(to, from, next)
  },
}
</script>

<template>
  <MisjudgeListPage
    ref="page"
    v-bind="$attrs"
    :host="misjudgeListHost"
    v-on="$listeners"
  />
</template>
```

**Step 2: Confirm wrapper contract remains RED**

```bash
node --test scripts/migration/shared-misjudge-list-page.test.mjs
```

Expected: failures for old full-page files rather than wrappers.

**Step 3: Replace both pages byte-identically**

Use the exact wrapper contract above in both applications. Do not modify router files or other pages.

**Step 4: Confirm GREEN**

```bash
node --test scripts/migration/shared-misjudge-list-page.test.mjs
node --test packages/shared-ui/src/forewarning-management/warning-list/pages/*.test.mjs
```

Expected: migration and all page tests pass.

**Step 5: Commit**

```bash
git add apps/link-warning/src/views/ForewarningManagement/misjudgeList.vue apps/link-front/src/views/ForewarningManagement/misjudgeList.vue scripts/migration/shared-misjudge-list-page.test.mjs
git commit -m "refactor: share misjudge list page"
```

## Task 7: Verify, review, and document the migration

**Files:**

- Create: `docs/migration/shared-misjudge-list-page-verification.md`
- Modify: `docs/migration/shared-source-audit.json` (generated)
- Do not modify: `docs/migration/source-after.json` unless the established generator proves regeneration is required

**Step 1: Run fresh integrity and test commands**

```bash
git diff --check
pnpm test:shared-ui
pnpm test:migration
pnpm test
pnpm audit:shared
pnpm verify:sources
pnpm install --frozen-lockfile
```

Expected: all commands exit 0; capture exact test counts and audit values.

**Step 2: Verify scope and contracts**

Check:

```bash
diff -u apps/link-warning/src/views/ForewarningManagement/misjudgeList.vue apps/link-front/src/views/ForewarningManagement/misjudgeList.vue
diff -u apps/link-warning/src/views/ForewarningManagement/misjudgeListHost.js apps/link-front/src/views/ForewarningManagement/misjudgeListHost.js
git diff --name-only d20c79b..HEAD
```

Expected: both diffs exit 0; no route or other five page file appears in the range.

**Step 3: Clean and build independently**

Remove only `dist/link-warning` and `dist/link-front`. Record a SHA-256 manifest after the warning build, run the front build, and compare the warning manifest again:

```bash
pnpm build:warning
pnpm build:front
```

Expected: both exit 0; each writes only its own output; warning hashes remain unchanged after front.

**Step 4: Write verification evidence**

Document exact commands, test counts, durations, build durations/file counts, audit values, wrapper/host byte equality, unchanged route/page scope, route-guard delegation, and known limitation that Vue components are not runtime-mounted.

**Step 5: Independent review**

Require task review and final branch review with Critical/Important/Minor classification. Fix every Critical or Important finding and rerun the covering tests/builds. Record unresolved Minor findings honestly.

**Step 6: Commit evidence**

```bash
git add docs/migration/shared-misjudge-list-page-verification.md docs/migration/shared-source-audit.json
git commit -m "docs: verify shared misjudge list page"
```

## Final Acceptance Checklist

- [ ] `misjudgeList` business implementation exists once in shared UI.
- [ ] Both route files are byte-identical guard-delegating wrappers.
- [ ] Both application hosts are byte-identical and expose exactly twelve capabilities.
- [ ] Existing `warningListHost` preserves the warning/front detail payload difference.
- [ ] Route leave clears only for unrelated destinations and calls `next()` exactly once.
- [ ] All cache keys, defaults, queries, timers, layouts, and batch behavior are preserved.
- [ ] `WarningListConfig` has one implementation; unrelated configs remain local.
- [ ] The other five list pages and routers are unchanged.
- [ ] Shared source has no application reverse dependency.
- [ ] Full tests, audit, source verification, frozen install, and both clean builds pass.
- [ ] Independent review reports zero Critical and zero Important findings.

