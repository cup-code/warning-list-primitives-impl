# 预警状态逻辑共享实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将两个应用重复的批量选择 mixin 和预警详情 Vuex 模块收敛到 `@link/warning-feature`，同时保持应用原路径、调用接口和独立构建能力不变。

**架构：** `batchInfo` 作为无宿主依赖的默认导出直接共享；`detailInfo` 的原业务主体整体移入 `createDetailInfoModule(api)`，由应用 shim 注入 7 个本地预警 API。两个应用继续从原路径导入，页面和根 Store 不改动。

**技术栈：** pnpm 10 Workspace、Vue 2.7、Vuex 3、ESM、Node.js `node:test`、Rsbuild。

## 全局约束

- 只修改 `/Users/jxz/project/new/front/project/link-shared`；原始 `link-front_new` 与 `link-warning` 保持只读。
- `batchInfo` 迁移前 SHA-256 为 `fe2e44d29913a22f23054d9559c5cbc4d50d006c902878a47f676476f5278fc3`。
- `detailInfo` 迁移前 SHA-256 为 `acb85c022d2981264d6f33835af981632fc4eab4296e0be2625a143866922287`；除移除宿主 import、增加依赖校验、函数边界和 state 实例隔离外，业务主体保持机械等价。
- 不修改页面、`apps/*/src/store/index.js`、路由或预警 API 实现。
- 不新增外部依赖，不迁移 `selectMachine.vue`、报表工具或其他文件。
- 最终必须通过全量测试、两个应用生产构建和来源摘要验证。

---

## 文件结构

- 创建 `packages/warning-feature/src/state/batchSelection.js`：批量选择 mixin 唯一实现。
- 创建 `packages/warning-feature/src/state/batchSelection.test.mjs`：mixin 状态与方法契约。
- 创建 `packages/warning-feature/src/state/createDetailInfoModule.js`：API 注入的 Vuex 模块工厂。
- 创建 `packages/warning-feature/src/state/createDetailInfoModule.test.mjs`：依赖、state、mutation、action 契约。
- 修改 `packages/warning-feature/package.json`：增加两个显式子路径导出。
- 修改 `package.json`：让 `test:warning-feature` 同时运行 `state` 测试。
- 修改两个应用的 `store/batchInfo.js`：默认导出共享 mixin。
- 修改两个应用的 `store/detailInfo.js`：注入本地 API 并默认导出共享 Vuex 模块。
- 创建 `scripts/migration/shared-warning-state.test.mjs`：应用 shim 与依赖方向测试。
- 创建 `docs/migration/shared-warning-state-verification.md`：第四阶段验证记录。

### Task 1：共享批量选择 mixin

**文件：**
- 创建：`packages/warning-feature/src/state/batchSelection.test.mjs`
- 创建：`packages/warning-feature/src/state/batchSelection.js`
- 修改：`packages/warning-feature/package.json`
- 修改：`package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/store/batchInfo.js`
- 修改：`apps/link-warning/src/views/ForewarningManagement/store/batchInfo.js`

**接口：**
- 产出：`@link/warning-feature/batch-selection` 默认导出 Vue mixin；应用原 `batchInfo` 路径继续默认导出同一对象。

- [ ] **Step 1：编写失败的 mixin 契约测试**

创建 `packages/warning-feature/src/state/batchSelection.test.mjs`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import batchSelection from './batchSelection.js'

function createContext() {
  return { ...batchSelection.data() }
}

test('批量选择 mixin 保持固定接口和独立初始状态', () => {
  assert.deepEqual(Object.keys(batchSelection.methods).sort(), [
    'cancelBatch',
    'handleCheckAllChange',
    'handleChecked',
    'onSelected',
  ])
  const first = batchSelection.data()
  const second = batchSelection.data()
  assert.deepEqual(first, {
    isBatch: false,
    selected: [],
    checkboxGroup: [],
    checkAll: false,
    isIndeterminate: true,
  })
  assert.notEqual(first.selected, second.selected)
  assert.notEqual(first.checkboxGroup, second.checkboxGroup)
})

test('全选和取消恢复现有状态转换', () => {
  const rows = [{ id: 'a' }, { id: 'b' }]
  const context = createContext()
  batchSelection.methods.handleCheckAllChange.call(context, true, rows)
  assert.deepEqual(context, {
    isBatch: false,
    selected: rows,
    checkboxGroup: ['a', 'b'],
    checkAll: true,
    isIndeterminate: false,
  })
  batchSelection.methods.cancelBatch.call(context)
  assert.deepEqual(context, {
    isBatch: false,
    selected: [],
    checkboxGroup: [],
    checkAll: false,
    isIndeterminate: true,
  })
})

test('ID 勾选和表格选择保持现有状态转换', () => {
  const rows = [{ id: 'a' }, { id: 'b' }]
  const checked = createContext()
  batchSelection.methods.handleChecked.call(checked, ['b'], rows)
  assert.deepEqual(checked.selected, [rows[1]])
  assert.equal(checked.checkAll, false)
  assert.equal(checked.isIndeterminate, true)

  const selected = createContext()
  batchSelection.methods.onSelected.call(selected, rows, rows)
  assert.deepEqual(selected.checkboxGroup, ['a', 'b'])
  assert.equal(selected.checkAll, true)
  assert.equal(selected.isIndeterminate, false)
})
```

- [ ] **Step 2：扩展共享功能测试脚本并验证红阶段**

将根 `package.json` 的脚本改为：

```json
"test:warning-feature": "node --test packages/warning-feature/src/video-warning/*.test.mjs packages/warning-feature/src/state/*.test.mjs"
```

运行：

```bash
NPM_AUTH=test pnpm test:warning-feature
```

预期：因 `batchSelection.js` 不存在而失败，已有 6 个预警 API 测试不出现行为失败。

- [ ] **Step 3：复制唯一实现并增加包导出**

机械复制且不格式化：

```bash
mkdir -p packages/warning-feature/src/state
cp apps/link-front/src/views/ForewarningManagement/store/batchInfo.js packages/warning-feature/src/state/batchSelection.js
```

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./batch-selection": "./src/state/batchSelection.js"
```

- [ ] **Step 4：将两个应用原文件替换为转发**

两个 `store/batchInfo.js` 都改为：

```js
export { default } from '@link/warning-feature/batch-selection'
```

- [ ] **Step 5：验证 mixin 测试和全量测试**

```bash
NPM_AUTH=test pnpm test:warning-feature
NPM_AUTH=test pnpm test
```

预期：共享功能测试 9 项通过；当时全量测试全部通过。

- [ ] **Step 6：提交 Task 1**

```bash
git add package.json packages/warning-feature apps/link-front/src/views/ForewarningManagement/store/batchInfo.js apps/link-warning/src/views/ForewarningManagement/store/batchInfo.js
git commit -m "refactor: share warning batch selection state"
```

### Task 2：共享预警详情 Vuex 模块

**文件：**
- 创建：`packages/warning-feature/src/state/createDetailInfoModule.test.mjs`
- 创建：`packages/warning-feature/src/state/createDetailInfoModule.js`
- 修改：`packages/warning-feature/package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/store/detailInfo.js`
- 修改：`apps/link-warning/src/views/ForewarningManagement/store/detailInfo.js`
- 创建：`scripts/migration/shared-warning-state.test.mjs`

**接口：**
- 消费：7 个函数组成的 `api` 对象。
- 产出：`createDetailInfoModule(api): { namespaced, state, mutations, actions }`；应用原 `detailInfo` 路径继续默认导出 Vuex 模块。

- [ ] **Step 1：编写失败的 Vuex 工厂测试**

创建 `packages/warning-feature/src/state/createDetailInfoModule.test.mjs`，包含以下完整 fixture 与断言：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { createDetailInfoModule } from './createDetailInfoModule.js'

const apiNames = [
  'allWarningAudit', 'allWarningList', 'attentionAlarm',
  'clientWarningAudit', 'clientWarningList',
  'maintenanceWarningAudit', 'maintenanceWarningList',
]

function createFixture(overrides = {}) {
  const calls = []
  const api = Object.fromEntries(apiNames.map(name => [name, async (params) => {
    calls.push([name, params])
    return { data: { code: 200, result: { list: [] } } }
  }]))
  Object.assign(api, overrides)
  return { module: createDetailInfoModule(api), calls }
}

test('工厂校验全部宿主 API', () => {
  for (const name of apiNames) {
    const api = Object.fromEntries(apiNames.map(item => [item, () => {}]))
    delete api[name]
    assert.throws(() => createDetailInfoModule(api), new RegExp(name))
  }
})

test('模块保持固定结构且每次创建独立 state', () => {
  const first = createFixture().module
  const second = createFixture().module
  assert.equal(first.namespaced, true)
  assert.deepEqual(first.state, {
    detailForms: {}, userType: '', queryForm: {}, lists: [],
    currentIndex: 0, currentId: '', isLoading: false, hasOperations: false,
  })
  assert.notEqual(first.state, second.state)
  assert.notEqual(first.state.detailForms, second.state.detailForms)
  assert.notEqual(first.state.queryForm, second.state.queryForm)
  assert.notEqual(first.state.lists, second.state.lists)
  assert.deepEqual(Object.keys(first.mutations).sort(), [
    'REMOVE_LIST_ITEM', 'SET_CURRENT_ID', 'SET_CURRENT_INDEX',
    'SET_DETAIL_FORMS', 'SET_HAS_OPERATIONS', 'SET_LISTS',
    'SET_LOADING', 'SET_QUERY_FORM', 'SET_USER_TYPE', 'UPDATE_LIST_ITEM',
  ])
  assert.deepEqual(Object.keys(first.actions).sort(), [
    'getDetailInfo', 'nextDetail', 'prevDetail', 'resetState',
    'setCurrentDetail', 'submitAudit', 'toggleAttention',
  ])
})

test('列表 action 选择对应 API 并保持格式化与 commit 顺序', async () => {
  const rows = [{ id: '2', alarmLevel: '2', customerStatus: 3,
    customerDisposeUserName: '', customerDisposeTime: '' }]
  const { module, calls } = createFixture({
    clientWarningList: async (params) => {
      calls.push(['clientWarningList', params])
      return { data: { result: { list: rows } } }
    },
  })
  const commits = []
  await module.actions.getDetailInfo({
    state: module.state,
    commit: (...args) => commits.push(args),
  }, { userType: 'CustomerStatus', queryForm: { page: 1 } })
  assert.deepEqual(calls, [['clientWarningList', { page: 1 }]])
  assert.equal(commits[0][0], 'SET_LOADING')
  assert.deepEqual(commits[1], ['SET_LISTS', [{
    ...rows[0], auditStatus: 3, alarmLevel: '二级',
    auditUser: '--', auditTime: '--',
  }]])
  assert.deepEqual(commits.at(-1), ['SET_LOADING', false])
})

test('审核和关注 action 保持 API 参数与返回契约', async () => {
  const auditCalls = []
  const attentionCalls = []
  const { module } = createFixture({
    clientWarningAudit: async (params) => {
      auditCalls.push(params); return { data: { code: 200 } }
    },
    attentionAlarm: async (params) => {
      attentionCalls.push(params); return { data: { code: 200 } }
    },
  })
  module.state.userType = 'CustomerStatus'
  module.state.detailForms = { id: 'alarm-1' }
  module.state.lists = [{ id: 'alarm-1' }]
  const commits = []
  const context = { state: module.state, commit: (...args) => commits.push(args), dispatch: () => {} }
  const audit = await module.actions.submitAudit(context, {
    status: 2, type: 9, opinion: 'ok',
  })
  assert.deepEqual(auditCalls, [{ alarmId: 'alarm-1', status: 2, opinion: 'ok' }])
  assert.equal(audit.success, true)
  assert.equal(audit.shouldReturn, true)
  const attention = await module.actions.toggleAttention(context, 1)
  assert.deepEqual(attentionCalls, [{ alarmId: 'alarm-1', isAttention: 1 }])
  assert.deepEqual(attention, { success: true, message: '关注成功' })
})
```

- [ ] **Step 2：编写失败的应用迁移测试**

创建 `scripts/migration/shared-warning-state.test.mjs`，读取两个应用的 `batchInfo.js` 和 `detailInfo.js`，断言：

```js
assert.equal(frontBatch, warningBatch)
assert.equal(frontBatch, "export { default } from '@link/warning-feature/batch-selection'\n")
assert.equal(frontDetail, warningDetail)
assert.match(frontDetail, /createDetailInfoModule/)
assert.match(frontDetail, /@link\/warning-feature\/detail-info/)
assert.match(frontDetail, /@\/http\/videoWarning\/warning-api/)
for (const forbidden of ['@/', 'apps/', 'router', 'store/index']) {
  assert.equal(sharedFactory.includes(forbidden), false)
}
```

同时解析静态 `import ... from`，要求 detail shim 的来源集合严格等于：

```js
[
  '@/http/videoWarning/warning-api',
  '@link/warning-feature/detail-info',
]
```

运行：

```bash
NPM_AUTH=test pnpm test
```

预期：因工厂文件、包导出和应用 shim 尚未实现而失败；Task 1 测试继续通过。

- [ ] **Step 3：以机械边界变换创建 Vuex 工厂**

先复制原文件：

```bash
cp apps/link-front/src/views/ForewarningManagement/store/detailInfo.js packages/warning-feature/src/state/createDetailInfoModule.js
```

然后仅做以下结构变换：

1. 删除顶部 `@/http/videoWarning/warning-api` import。
2. 在文件顶部增加 `requiredApiNames` 和逐项函数类型校验。
3. 增加 `export function createDetailInfoModule(api) {`，校验后从 `api` 解构 7 个同名函数。
4. 将原来的 `alarmLevelList`、`state`、`mutations`、`actions` 保持在函数体中，业务语句不改写。
5. 将末尾 `export default { ... }` 改为 `return { ... }`，随后闭合工厂函数。

依赖校验固定为：

```js
const requiredApiNames = [
  'allWarningAudit',
  'allWarningList',
  'attentionAlarm',
  'clientWarningAudit',
  'clientWarningList',
  'maintenanceWarningAudit',
  'maintenanceWarningList',
]

export function createDetailInfoModule(api = {}) {
  for (const name of requiredApiNames) {
    if (typeof api[name] !== 'function') {
      throw new TypeError(`createDetailInfoModule requires api.${name} to be a function`)
    }
  }
  const {
    allWarningAudit, allWarningList, attentionAlarm,
    clientWarningAudit, clientWarningList,
    maintenanceWarningAudit, maintenanceWarningList,
  } = api
```

- [ ] **Step 4：增加包导出并替换两个应用 shim**

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./detail-info": "./src/state/createDetailInfoModule.js"
```

两个应用的 `store/detailInfo.js` 必须逐字一致：

```js
import { createDetailInfoModule } from '@link/warning-feature/detail-info'
import {
  allWarningAudit,
  allWarningList,
  attentionAlarm,
  clientWarningAudit,
  clientWarningList,
  maintenanceWarningAudit,
  maintenanceWarningList,
} from '@/http/videoWarning/warning-api'

export default createDetailInfoModule({
  allWarningAudit,
  allWarningList,
  attentionAlarm,
  clientWarningAudit,
  clientWarningList,
  maintenanceWarningAudit,
  maintenanceWarningList,
})
```

- [ ] **Step 5：验证工厂与应用契约**

```bash
NPM_AUTH=test pnpm test:warning-feature
NPM_AUTH=test pnpm test:migration
NPM_AUTH=test pnpm test
```

预期：共享功能测试 13 项通过，迁移测试新增约束通过，全量测试无失败。

- [ ] **Step 6：机械核对业务主体**

编写一次性只读 Node 脚本，通过 `git show <分支起点>:apps/link-front/src/views/ForewarningManagement/store/detailInfo.js` 读取迁移前基线。将基线去掉 import/export 外壳，将共享工厂去掉校验/函数外壳并规范缩进，然后比较以下内容与顺序：

- `alarmLevelList`
- state 字段及初始值
- mutation 名称与函数体
- action 名称与函数体
- `namespaced: true`

结果必须为相等；将比较方法和结果记录到 Task 报告，不提交一次性脚本。

- [ ] **Step 7：提交 Task 2**

```bash
git add packages/warning-feature apps/link-front/src/views/ForewarningManagement/store/detailInfo.js apps/link-warning/src/views/ForewarningManagement/store/detailInfo.js scripts/migration/shared-warning-state.test.mjs
git commit -m "refactor: share warning detail state"
```

### Task 3：双构建、来源校验与迁移记录

**文件：**
- 更新（若内容变化）：`docs/migration/shared-source-audit.json`
- 更新：`docs/migration/source-after.json`
- 创建：`docs/migration/shared-warning-state-verification.md`

**接口：**
- 消费：Task 1、Task 2 的共享状态实现与应用 shim。
- 产出：可复查的测试、构建、审计和来源只读证据。

- [ ] **Step 1：运行生产构建与共享审计**

```bash
NPM_AUTH=verify pnpm build
pnpm audit:shared
```

预期：两个应用构建成功；两个目标应用文件仍位于 `identicalFiles`，内容已变为相同 shim。若审计 JSON 因分类不变而无文本差异，在验证文档中准确说明原因。

- [ ] **Step 2：重新生成并比较来源摘要**

```bash
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\\n') })" > docs/migration/source-after.json
pnpm verify:sources
```

预期输出：`来源目录未发生变化`。

- [ ] **Step 3：创建中文验证记录**

`docs/migration/shared-warning-state-verification.md` 必须记录：

- `batchSelection.js` 与 `createDetailInfoModule.js` 的共享路径和包导出。
- 两个应用 shim 的兼容策略。
- 实际测试总数、失败数和命令退出码。
- 两个生产构建的实际结果和耗时。
- 两个来源目录的文件数、基线摘要和迁移后摘要。
- `detailInfo` 业务主体机械对照方法与结果。
- 审计 JSON 是否产生差异以及准确原因。
- 未纳入范围：`selectMachine.vue`、报表与其他差异页面。

- [ ] **Step 4：执行最终验证**

```bash
NPM_AUTH=verify pnpm test
NPM_AUTH=verify pnpm build
pnpm verify:sources
git diff --check
git status --short
```

预期：全量测试无失败、两个构建成功、来源未变化、`git diff --check` 无输出，状态只包含预期验证材料。

- [ ] **Step 5：提交验证材料**

```bash
git add docs/migration/shared-source-audit.json docs/migration/source-after.json docs/migration/shared-warning-state-verification.md
git commit -m "docs: verify shared warning state logic"
```

## 计划自检

- 规格覆盖：mixin、Vuex 工厂、7 个 API、原路径兼容、状态隔离、双构建和来源只读均有对应步骤。
- 占位符检查：所有代码路径、接口、测试命令与预期结果已明确。
- 类型一致性：包导出、应用 shim、工厂名称和 7 个 API 名称逐项一致。
- 范围检查：仅迁移两个状态文件，不触碰页面、根 Store 或下一阶段候选文件。
