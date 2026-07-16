# Shared Warning List Primitives Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the three warning-list primitives and their shared table configuration into `@link/shared-ui` so `link-warning` and `link-front` consume one implementation while retaining their original import paths, behavior, and independent build outputs.

**Architecture:** Shared Vue 2 components own all rendering and common interaction. Each application supplies a thin `warningListHost` for dictionary lookup, file-prefix lookup, routing, and its one intentional detail-payload difference. Original application component paths remain as forwarding wrappers; each application `config.js` re-exports only the shared `tableListConfig` and keeps unrelated local configuration.

**Tech Stack:** Vue 2.7 Options/Composition APIs, Element UI, pnpm workspaces, Node.js built-in test runner, Vite production builds.

## Global Constraints

- Preserve all existing route paths, page imports, props, emitted events, slots, CSS, and public ref methods.
- Preserve `link-warning` detail payload as `{ detailId: row.id, type, form }` and `link-front` detail payload as `{ detailForm: row, type, form }`.
- Preserve `warningInfo.vue`'s emitted `itemTap` payload as `{ detailId: item.id, type, form }` in both applications.
- `components/list.vue`, `components/checkGroup.vue`, and `components/warningInfo.vue` must remain at their original paths as wrappers.
- The list wrapper must explicitly expose `setSelections(ids)` and forward it to the shared child.
- Shared source must not import `@/`, `apps/`, an application router, application mixins, or application globals.
- Do not move `cameraListConfig`, `machineListConfig`, `WarningListConfig`, or front-only `cardSirenColumns` into the shared package.
- Do not modify the six consuming list pages in this slice.
- Host validation runs in development/test and is skipped in production by checking `process.env.NODE_ENV` directly.
- Follow test-first order: observe the targeted test fail before adding each production implementation.
- Use `apply_patch` for edits, keep commits task-scoped, and preserve unrelated worktree changes.

## Interfaces

The application host has this exact shape:

```js
{
  detailPayloadMode: 'id' | 'form',
  getDictList(type): Array,
  getFilePrefix(): string,
  pushWarningDetail(data): void,
}
```

Shared exports:

```text
@link/shared-ui/forewarning-management/warning-list/check-group
@link/shared-ui/forewarning-management/warning-list/list
@link/shared-ui/forewarning-management/warning-list/warning-info
@link/shared-ui/forewarning-management/warning-list/table-config
```

The shared list public contract remains:

```text
props: tableData, type, height, allType, loading, form, selection, host
emit: selection
method: setSelections(ids)
```

## Task 1: Lock the migration boundary with a failing contract test

**Files:**

- Create: `scripts/migration/shared-warning-list-primitives.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing migration test**

Add Node tests that assert:

```js
const exports = {
  './forewarning-management/warning-list/check-group':
    './src/forewarning-management/warning-list/CheckGroup.vue',
  './forewarning-management/warning-list/list':
    './src/forewarning-management/warning-list/ForewarningList.vue',
  './forewarning-management/warning-list/warning-info':
    './src/forewarning-management/warning-list/WarningInfo.vue',
  './forewarning-management/warning-list/table-config':
    './src/forewarning-management/warning-list/tableListConfig.js',
}
```

The same test file must also verify:

- all four export entries exist in `packages/shared-ui/package.json`;
- the three shared Vue files and host-capability module do not contain `@/` or `apps/`;
- both applications retain all three original wrapper paths;
- each wrapper imports the expected shared export and `warningListHost`;
- both list wrappers contain `setSelections(ids)` and call `this.$refs.sharedList.setSelections(ids)`;
- both `config.js` files import/re-export the shared `tableListConfig`;
- both config files retain their local symbols, and only front retains `cardSirenColumns`;
- both application host modules expose the same keys, with only `detailPayloadMode` differing (`id` vs `form`);
- the six existing consuming pages are not rewritten to import `@link/shared-ui` directly.

Update `test:shared-ui` so it includes:

```json
"packages/shared-ui/src/forewarning-management/warning-list/*.test.mjs"
```

**Step 2: Run the targeted test and confirm RED**

Run:

```bash
node --test scripts/migration/shared-warning-list-primitives.test.mjs
```

Expected: FAIL because the shared exports/files and wrappers do not exist yet. Confirm the failure is an assertion or missing-file failure for this feature, not syntax or harness failure.

**Step 3: Commit the red contract**

```bash
git add scripts/migration/shared-warning-list-primitives.test.mjs package.json
git commit -m "test: lock shared warning list boundary"
```

## Task 2: Implement and test host capability validation and payload creation

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/warningListHostCapabilities.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/warningListHostCapabilities.js`
- Create: `apps/link-warning/src/views/ForewarningManagement/warningListHost.js`
- Create: `apps/link-front/src/views/ForewarningManagement/warningListHost.js`

**Step 1: Write failing pure-unit tests**

Test these named exports:

```js
warningListHostRequirements
assertWarningListHost(host, componentName)
validateWarningListHost(host, componentName, environment)
createWarningDetailData(row, context, detailPayloadMode)
```

Cover:

- `id` returns `{ detailId: row.id, type, form }`;
- `form` returns `{ detailForm: row, type, form }`;
- `allType: true` overrides `type` to `'all'`;
- an unsupported mode throws an error naming the mode;
- missing host, missing function, and invalid mode throw descriptive component-scoped errors;
- validation returns `undefined` in production and validates in test/development.

Use representative fixtures:

```js
const row = { id: 'warning-1', cameraName: 'Camera A' }
const context = { type: 'AuditStatus', allType: false, form: { pageNum: 2 } }
```

**Step 2: Run the unit test and confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/warningListHostCapabilities.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `warningListHostCapabilities.js`.

**Step 3: Implement the smallest pure capability module**

Use exact requirements:

```js
export const warningListHostRequirements = {
  detailPayloadMode: 'string',
  getDictList: 'function',
  getFilePrefix: 'function',
  pushWarningDetail: 'function',
}
```

`assertWarningListHost` validates the three functions and restricts `detailPayloadMode` to `id` or `form`. `validateWarningListHost` must use a default argument of `process.env.NODE_ENV` and return without validation for `'production'`. `createWarningDetailData` contains the only `detailId/detailForm` branch in shared code.

**Step 4: Implement thin application hosts**

Each host imports its local router and Vue, then delegates:

```js
import Vue from 'vue'
import router from '@/router'

const warningListHost = {
  detailPayloadMode: 'id', // link-front uses 'form'
  getDictList(type) {
    return Vue.prototype.$dictUtils.getDictList(type)
  },
  getFilePrefix() {
    const globalData = JSON.parse(localStorage.getItem('globalData'))
    return globalData?.minioFilePrefix || ''
  },
  pushWarningDetail(data) {
    return router.push({
      path: '/detail/warningDetail',
      query: { data: JSON.stringify(data) },
    })
  },
}

export default warningListHost
```

Keep the two files structurally identical except for `detailPayloadMode`.

**Step 5: Run the unit test and confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/warningListHostCapabilities.test.mjs
```

Expected: all host capability and payload tests pass.

**Step 6: Commit**

```bash
git add packages/shared-ui/src/forewarning-management/warning-list apps/link-warning/src/views/ForewarningManagement/warningListHost.js apps/link-front/src/views/ForewarningManagement/warningListHost.js
git commit -m "feat: add warning list host boundary"
```

## Task 3: Extract the shared table configuration

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/tableListConfig.test.mjs`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/tableListConfig.js`
- Modify: `packages/shared-ui/package.json`
- Modify: `apps/link-warning/src/views/ForewarningManagement/config.js`
- Modify: `apps/link-front/src/views/ForewarningManagement/config.js`

**Step 1: Write the failing configuration test**

Assert a deep equality against the six current columns:

```js
[
  { label: '摄像头名称', prop: 'cameraName' },
  { label: '审核状态', prop: 'auditStatus', slot: 'status' },
  { label: '预警日期', prop: 'alarmDate' },
  { label: '预警类型', prop: 'alarmType' },
  { label: '预警等级', prop: 'alarmLevel', slot: 'level' },
  { label: '操作', prop: 'operation', width: 150, slot: 'operation' },
]
```

**Step 2: Run and confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/tableListConfig.test.mjs
```

Expected: FAIL because the shared module does not exist.

**Step 3: Move only `tableListConfig`**

Export it as a named export from `tableListConfig.js`. Add the package export. In both application configs, remove the local declaration and add:

```js
import { tableListConfig } from '@link/shared-ui/forewarning-management/warning-list/table-config'
```

Keep `tableListConfig` in each existing export block. Do not normalize or merge unrelated config differences such as `machineListConfig.loginUrl` width or `cardSirenColumns`.

**Step 4: Run focused tests and confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/tableListConfig.test.mjs
node --test scripts/migration/shared-warning-list-primitives.test.mjs
```

Expected: table configuration test passes; migration test still fails only for not-yet-created component implementations/wrappers.

**Step 5: Commit**

```bash
git add packages/shared-ui/package.json packages/shared-ui/src/forewarning-management/warning-list/tableListConfig.* apps/link-warning/src/views/ForewarningManagement/config.js apps/link-front/src/views/ForewarningManagement/config.js
git commit -m "refactor: share warning table configuration"
```

## Task 4: Extract `WarningInfo`

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/WarningInfo.vue`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/WarningInfo.test.mjs`
- Modify: `packages/shared-ui/package.json`
- Replace: `apps/link-warning/src/views/ForewarningManagement/components/warningInfo.vue`
- Replace: `apps/link-front/src/views/ForewarningManagement/components/warningInfo.vue`

**Step 1: Write a failing structural test**

Assert that shared `WarningInfo.vue`:

- declares props `item`, `customStyle`, `type`, `allType`, `form`, and required `host`;
- validates host capabilities;
- uses `host.getDictList(this.type)` for status and tag calculations;
- initializes `filePrefix` through `host.getFilePrefix()`;
- emits `itemTap` with `{ detailId, type, form }` unchanged;
- retains the existing template and scoped styles.

Assert both wrappers import the warning-info export, forward `$attrs` and `$listeners`, pass `warningListHost`, and are byte-for-byte identical.

**Step 2: Run and confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/WarningInfo.test.mjs
```

Expected: FAIL because shared `WarningInfo.vue` and the wrappers are absent.

**Step 3: Extract the component and replace original files with wrappers**

Copy existing template/styles without behavior changes. Replace implicit mixin/global access with host calls. The wrapper shape is:

```vue
<script>
import WarningInfo from '@link/shared-ui/forewarning-management/warning-list/warning-info'
import warningListHost from '../warningListHost'

export default {
  name: 'WarningInfoHost',
  inheritAttrs: false,
  components: { WarningInfo },
  data: () => ({ warningListHost }),
}
</script>

<template>
  <WarningInfo v-bind="$attrs" :host="warningListHost" v-on="$listeners" />
</template>
```

**Step 4: Run and confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/WarningInfo.test.mjs
```

Expected: all WarningInfo structure/contract tests pass.

**Step 5: Commit**

```bash
git add packages/shared-ui apps/link-warning/src/views/ForewarningManagement/components/warningInfo.vue apps/link-front/src/views/ForewarningManagement/components/warningInfo.vue
git commit -m "refactor: share warning info card"
```

## Task 5: Extract `CheckGroup`

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/CheckGroup.vue`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/CheckGroup.test.mjs`
- Modify: `packages/shared-ui/package.json`
- Replace: `apps/link-warning/src/views/ForewarningManagement/components/checkGroup.vue`
- Replace: `apps/link-front/src/views/ForewarningManagement/components/checkGroup.vue`

**Step 1: Write a failing structural test**

Cover all existing props (`tableData`, `height`, `form`, `type`, `allType`, `isBatch`, `checkboxGroup`), immediate watchers, local checkbox/list state, and the `check` event. Assert nested `WarningInfo` receives `host` and all existing bindings.

Assert both original-path wrappers import the check-group export, inject `warningListHost`, forward `$attrs/$listeners`, and are byte-for-byte identical.

**Step 2: Run and confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/CheckGroup.test.mjs
```

Expected: FAIL because shared `CheckGroup.vue` and wrappers do not exist.

**Step 3: Extract component and add wrappers**

Copy the current common implementation, change its nested import to `./WarningInfo.vue`, add required `host`, validate it, and pass `:host="host"` to `WarningInfo`. Replace both app files with identical wrappers using the same pattern as Task 4.

**Step 4: Run and confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/CheckGroup.test.mjs
```

Expected: all CheckGroup structure/contract tests pass.

**Step 5: Commit**

```bash
git add packages/shared-ui apps/link-warning/src/views/ForewarningManagement/components/checkGroup.vue apps/link-front/src/views/ForewarningManagement/components/checkGroup.vue
git commit -m "refactor: share warning check group"
```

## Task 6: Extract `ForewarningList` and preserve its ref API

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/warning-list/ForewarningList.vue`
- Create: `packages/shared-ui/src/forewarning-management/warning-list/ForewarningList.test.mjs`
- Modify: `packages/shared-ui/package.json`
- Replace: `apps/link-warning/src/views/ForewarningManagement/components/list.vue`
- Replace: `apps/link-front/src/views/ForewarningManagement/components/list.vue`

**Step 1: Write failing behavior/structure tests**

Assert the shared component preserves:

- all seven existing public props plus required `host`;
- the `selection` event and `CTable` `select` forwarding;
- table, status, level, and operation slots;
- status/tag/level behavior;
- `setSelections(ids)` forwarding to `this.$refs.tables.setSelection(ids)`;
- view handling through `createWarningDetailData(row, context, host.detailPayloadMode)` and `host.pushWarningDetail(data)`;
- no direct `$router`, `$dictUtils`, `@/`, or `apps/` references.

Assert each app wrapper:

```vue
<ForewarningList
  ref="sharedList"
  v-bind="$attrs"
  :host="warningListHost"
  v-on="$listeners"
/>
```

and:

```js
setSelections(ids) {
  return this.$refs.sharedList.setSelections(ids)
}
```

The wrappers must otherwise be byte-for-byte identical.

**Step 2: Run and confirm RED**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/ForewarningList.test.mjs
```

Expected: FAIL because shared `ForewarningList.vue` and wrappers do not exist.

**Step 3: Extract common implementation**

Import `tableListConfig`, `createWarningDetailData`, and `validateWarningListHost` locally. Replace the old branch and router call with:

```js
const data = createWarningDetailData(row, {
  type: props.type,
  allType: props.allType,
  form: props.form,
}, props.host.detailPayloadMode)
props.host.pushWarningDetail(data)
```

Replace dictionary reads with `props.host.getDictList(props.type)`. Preserve the template/styles from the existing component.

**Step 4: Replace both application files with identical ref-proxy wrappers**

The wrapper must use `inheritAttrs: false`, inject the local host, forward attributes/listeners, and proxy `setSelections`. This is required because existing pages call `$refs.tableRef.setSelections(ids)`.

**Step 5: Run focused tests and confirm GREEN**

```bash
node --test packages/shared-ui/src/forewarning-management/warning-list/*.test.mjs
node --test scripts/migration/shared-warning-list-primitives.test.mjs
```

Expected: all warning-list unit and migration tests pass.

**Step 6: Commit**

```bash
git add packages/shared-ui apps/link-warning/src/views/ForewarningManagement/components/list.vue apps/link-front/src/views/ForewarningManagement/components/list.vue package.json scripts/migration/shared-warning-list-primitives.test.mjs
git commit -m "refactor: share warning list primitives"
```

## Task 7: Verify both applications and document the migration

**Files:**

- Create: `docs/migration/shared-warning-list-primitives-verification.md`
- Modify: `docs/migration/shared-source-audit.json` (generated)
- Modify only if source manifests are intentionally part of the established workflow: `docs/migration/source-after.json`

**Step 1: Run formatting/static integrity checks**

```bash
git diff --check
pnpm test:shared-ui
pnpm test:migration
pnpm test
```

Expected: zero whitespace errors and every test passes.

**Step 2: Run shared-source audit and source verification**

```bash
pnpm audit:shared
pnpm verify:sources
```

Expected: audit completes and records more single-source/common implementation; source verification reports no missing application source. If the manifest workflow requires regeneration, use the repository's existing manifest generator before rerunning `verify:sources`; do not hand-edit generated JSON.

**Step 3: Build each application independently from a clean output**

Remove only the two owned build-output directories, then run:

```bash
pnpm install --frozen-lockfile
pnpm build:warning
pnpm build:front
```

Expected:

- warning build succeeds and writes `dist/link-warning`;
- front build succeeds and writes `dist/link-front`;
- building one application does not require or overwrite the other's output;
- existing route paths and dynamic import source paths remain unchanged.

**Step 4: Record evidence**

Write `docs/migration/shared-warning-list-primitives-verification.md` with:

- exact commands and pass/fail status;
- total test counts;
- both build durations and output file counts;
- audit summary (`smaller`, `larger`, `common`, `identical`, `different`, `smallerOnly`, `largerOnly`);
- confirmed intentional difference (`detailPayloadMode` only);
- confirmed unchanged ref API and independent output directories;
- any non-blocking warnings.

**Step 5: Request independent review**

Review against the design and this plan. Require explicit Critical/Important/Minor classification. Resolve every Critical or Important finding, rerun affected tests/builds, and update the verification document.

**Step 6: Final commit**

```bash
git add docs/migration/shared-warning-list-primitives-verification.md docs/migration/shared-source-audit.json
git add docs/migration/source-after.json # only if regenerated by the established workflow
git commit -m "docs: verify shared warning list primitives"
```

## Final Acceptance Checklist

- [ ] All four shared package exports resolve.
- [ ] All three original component paths exist in both applications.
- [ ] Both applications use byte-identical wrappers; only host `detailPayloadMode` differs.
- [ ] `link-warning` routes with `detailId`; `link-front` routes with `detailForm`.
- [ ] `WarningInfo` continues emitting `detailId` in both applications.
- [ ] Parent `$refs.tableRef.setSelections(ids)` calls still reach `CTable.setSelection(ids)`.
- [ ] `tableListConfig` has one implementation while unrelated configs stay local.
- [ ] Shared source has no application imports/globals.
- [ ] Complete tests, source verification, audit, and both production builds pass.
- [ ] Independent review reports zero Critical and zero Important findings.
- [ ] No unrelated pages, routes, or configs changed.
