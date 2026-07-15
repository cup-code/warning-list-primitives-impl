# 预警批量处理组件共享实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `ForewarningManagement` 的批量处理条和处理弹窗迁为单一公共实现，同时保持两个应用的原路径、组件契约、业务行为和独立构建能力。

**Architecture:** 把审核选项、文案、提交参数和 API 选择抽到 `@link/warning-feature/batch-deal` 的纯函数模型；把 `BatchDeal.vue` 与 `DealDialog.vue` 放入 `@link/shared-ui`。两个应用原路径保留无额外 DOM 的薄适配组件，只负责注入各自 `@/http/videoWarning/warning-api` 中的两个 API 函数。

**Tech Stack:** pnpm 10 Workspace、Vue 2.7 SFC、`@tanstack/vue-query`、Rsbuild、Node.js `node:test`、ESM。

## Global Constraints

- 只处理 `ForewarningManagement` 的批量处理条与处理弹窗，不扩展到报表、图表、表单或列表页主体。
- 两个应用中的原文件路径必须继续存在。
- `BatchDeal` 的 Props、`checkAllChange`、`delete`、`success` 事件和现有可见 DOM 行为保持不变。
- `DealDialog` 的 Props、`update:visible`、`close`、`success` 事件、审核选项、文案和提交参数保持不变。
- 共享包不得引用 `apps/**`、`@/`、宿主 Router 或宿主 Store。
- `link-warning` 与 `link-front` 继续分别通过 `pnpm run build:warning` 和 `pnpm run build:front` 构建到各自目录。
- 不新增第三方依赖。

---

## File Structure

- Create: `packages/warning-feature/src/batch-deal/createBatchDealModel.js` — 与 Vue 无关的批量处理业务模型。
- Create: `packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs` — 业务模型行为测试。
- Modify: `packages/warning-feature/package.json` — 导出 `./batch-deal`。
- Modify: `package.json` — 将批量处理模型测试纳入 `test:warning-feature`。
- Create: `scripts/migration/shared-warning-batch-deal.test.mjs` — 公共来源、包导出和宿主适配契约。
- Create: `packages/shared-ui/src/forewarning-management/BatchDeal.vue` — 批量处理条唯一 UI 实现。
- Create: `packages/shared-ui/src/forewarning-management/DealDialog.vue` — 处理弹窗唯一 UI 实现。
- Modify: `packages/shared-ui/package.json` — 导出两个组件并声明对 `@link/warning-feature` 的 Workspace 依赖。
- Modify: `pnpm-lock.yaml` — 记录 `shared-ui` 到 `warning-feature` 的 Workspace 依赖边。
- Modify: `apps/link-warning/src/views/ForewarningManagement/components/batchDeal.vue` — 预警版 API 注入适配器。
- Modify: `apps/link-warning/src/views/ForewarningManagement/components/dealDialog.vue` — 预警版 API 注入适配器。
- Modify: `apps/link-front/src/views/ForewarningManagement/components/batchDeal.vue` — 完整版 API 注入适配器。
- Modify: `apps/link-front/src/views/ForewarningManagement/components/dealDialog.vue` — 完整版 API 注入适配器。
- Modify: `docs/migration/shared-source-audit.json` — 记录迁移后的共享来源统计。
- Create: `docs/migration/shared-warning-batch-deal-verification.md` — 记录测试、双构建和审计结果。

### Task 1: 用纯函数固定批量处理业务契约

**Files:**
- Create: `packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs`
- Create: `packages/warning-feature/src/batch-deal/createBatchDealModel.js`
- Modify: `packages/warning-feature/package.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `getBatchDealOptions(userType)`、`getBatchDealCopy(userType)`、`buildBatchDealParams(input)`、`selectBatchDealApi(userType, dependencies)`。
- Consumes: 宿主注入的 `batchAttentionAlarm` 与 `batchAttentionAlarmInternal` 函数。

- [ ] **Step 1: 编写失败的业务模型测试**

创建 `packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildBatchDealParams,
  getBatchDealCopy,
  getBatchDealOptions,
  selectBatchDealApi,
} from './createBatchDealModel.js'

test('客户处理与内部审核使用原有选项和文案', () => {
  assert.deepEqual(getBatchDealOptions('CustomerStatus'), [
    { label: '有效', value: '2' },
    { label: '误报', value: '3' },
  ])
  assert.deepEqual(getBatchDealOptions('InternalStatus'), [
    { label: '误报', value: '4' },
    { label: '有效', value: '2' },
    { label: '无效', value: '3' },
    { label: '不确定', value: '5' },
  ])
  assert.deepEqual(getBatchDealCopy('CustomerStatus'), {
    title: '批量处理预警',
    resultRequired: '请选择处理结果',
    success: '批量处理成功',
  })
  assert.deepEqual(getBatchDealCopy('InternalStatus'), {
    title: '批量审核预警',
    resultRequired: '请选择审核结果',
    success: '批量审核成功',
  })
})

test('客户提交参数不包含审核类型', () => {
  assert.deepEqual(buildBatchDealParams({
    selectedWarnings: [
      { id: 'alarm-1', tenantCode: 'tenant-a' },
      { id: 'alarm-2', tenantCode: 'tenant-b' },
    ],
    auditRes: '2',
    opinion: '已处理',
    userType: 'CustomerStatus',
    submitType: '1',
  }), {
    alarms: [
      { alarmId: 'alarm-1', tenantCode: 'tenant-a' },
      { alarmId: 'alarm-2', tenantCode: 'tenant-b' },
    ],
    status: '2',
    opinion: '已处理',
  })
})

test('内部审核提交参数保留普通和加急类型', () => {
  const input = {
    selectedWarnings: [{ id: 'alarm-1', tenantCode: 'tenant-a' }],
    auditRes: '2',
    opinion: '',
    userType: 'InternalStatus',
  }
  assert.equal(buildBatchDealParams({ ...input, submitType: '1' }).type, '1')
  assert.equal(buildBatchDealParams({ ...input, submitType: '2' }).type, '2')
})

test('根据用户类型选择原有宿主 API', () => {
  const customer = () => 'customer'
  const internal = () => 'internal'
  const dependencies = {
    batchAttentionAlarm: customer,
    batchAttentionAlarmInternal: internal,
  }

  assert.equal(selectBatchDealApi('CustomerStatus', dependencies), customer)
  assert.equal(selectBatchDealApi('InternalStatus', dependencies), internal)
  assert.equal(selectBatchDealApi('all', dependencies), internal)
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
node --test packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs
```

Expected: FAIL，错误为找不到 `createBatchDealModel.js`。

- [ ] **Step 3: 实现最小业务模型**

创建 `packages/warning-feature/src/batch-deal/createBatchDealModel.js`：

```js
const customerOptions = [
  { label: '有效', value: '2' },
  { label: '误报', value: '3' },
]

const internalOptions = [
  { label: '误报', value: '4' },
  { label: '有效', value: '2' },
  { label: '无效', value: '3' },
  { label: '不确定', value: '5' },
]

export function getBatchDealOptions(userType) {
  return userType === 'CustomerStatus' ? customerOptions : internalOptions
}

export function getBatchDealCopy(userType) {
  return userType === 'CustomerStatus'
    ? {
        title: '批量处理预警',
        resultRequired: '请选择处理结果',
        success: '批量处理成功',
      }
    : {
        title: '批量审核预警',
        resultRequired: '请选择审核结果',
        success: '批量审核成功',
      }
}

export function buildBatchDealParams({
  selectedWarnings,
  auditRes,
  opinion,
  userType,
  submitType,
}) {
  const params = {
    alarms: selectedWarnings.map(item => ({
      alarmId: item.id,
      tenantCode: item.tenantCode,
    })),
    status: auditRes,
    opinion,
  }

  if (userType !== 'CustomerStatus') params.type = submitType
  return params
}

export function selectBatchDealApi(userType, {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
}) {
  return {
    CustomerStatus: batchAttentionAlarm,
    InternalStatus: batchAttentionAlarmInternal,
    all: batchAttentionAlarmInternal,
  }[userType]
}
```

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./batch-deal": "./src/batch-deal/createBatchDealModel.js"
```

把根 `package.json` 的 `test:warning-feature` 改为：

```json
"test:warning-feature": "node --test packages/warning-feature/src/video-warning/*.test.mjs packages/warning-feature/src/state/*.test.mjs packages/warning-feature/src/report/*.test.mjs packages/warning-feature/src/batch-deal/*.test.mjs"
```

- [ ] **Step 4: 运行模型测试和预警功能测试并确认 GREEN**

Run:

```bash
node --test packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs
pnpm test:warning-feature
```

Expected: 新增 4 项模型测试通过，全部预警功能测试通过。

- [ ] **Step 5: 提交业务模型**

```bash
git add packages/warning-feature/src/batch-deal/createBatchDealModel.js
git add packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs
git add packages/warning-feature/package.json package.json
git commit -m "refactor: extract warning batch deal model"
```

### Task 2: 建立公共 UI 与宿主适配的失败契约

**Files:**
- Create: `scripts/migration/shared-warning-batch-deal.test.mjs`

**Interfaces:**
- Consumes: Task 1 的 `@link/warning-feature/batch-deal` 导出。
- Produces: 两个公共 UI 导出、禁止宿主反向依赖、原路径适配器结构的可执行契约。

- [ ] **Step 1: 编写失败的迁移契约测试**

创建 `scripts/migration/shared-warning-batch-deal.test.mjs`：

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']
const components = [
  {
    appFile: 'src/views/ForewarningManagement/components/batchDeal.vue',
    sharedFile: 'packages/shared-ui/src/forewarning-management/BatchDeal.vue',
    exportPath: './forewarning-management/batch-deal',
    exportFile: './src/forewarning-management/BatchDeal.vue',
    importPath: '@link/shared-ui/forewarning-management/batch-deal',
  },
  {
    appFile: 'src/views/ForewarningManagement/components/dealDialog.vue',
    sharedFile: 'packages/shared-ui/src/forewarning-management/DealDialog.vue',
    exportPath: './forewarning-management/deal-dialog',
    exportFile: './src/forewarning-management/DealDialog.vue',
    importPath: '@link/shared-ui/forewarning-management/deal-dialog',
  },
]

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

test('共享 UI 包显式导出批量处理组件并依赖业务模型', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  for (const component of components) {
    assert.equal(packageJson.exports[component.exportPath], component.exportFile)
  }
  assert.equal(packageJson.dependencies['@link/warning-feature'], 'workspace:*')
})

test('共享 UI 只依赖公共包和注入能力', async () => {
  for (const component of components) {
    const source = await readWorkspaceFile(component.sharedFile)
    assert.doesNotMatch(source, /from\s+['"]@\//)
    assert.doesNotMatch(source, /apps\//)
  }

  const dealDialog = await readWorkspaceFile(components[1].sharedFile)
  assert.match(dealDialog, /@link\/warning-feature\/batch-deal/)
  assert.match(dealDialog, /batchAttentionAlarm:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(dealDialog, /batchAttentionAlarmInternal:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
})

test('两个应用保留原路径并只注入宿主预警 API', async () => {
  for (const appRoot of appRoots) {
    for (const component of components) {
      const source = await readWorkspaceFile(path.join(appRoot, component.appFile))
      assert.match(source, new RegExp(component.importPath.replaceAll('/', '\\/')))
      assert.match(source, /@\/http\/videoWarning\/warning-api/)
      assert.match(source, /batchAttentionAlarm/)
      assert.match(source, /batchAttentionAlarmInternal/)
      assert.doesNotMatch(source, /<div[\s>]/)
    }
  }
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
node --test scripts/migration/shared-warning-batch-deal.test.mjs
```

Expected: FAIL，错误为缺少 `BatchDeal.vue` / `DealDialog.vue` 公共实现或对应包导出。

- [ ] **Step 3: 提交失败契约**

```bash
git add scripts/migration/shared-warning-batch-deal.test.mjs
git commit -m "test: define shared warning batch deal contract"
```

### Task 3: 迁移公共 UI 并接入两个宿主

**Files:**
- Create: `packages/shared-ui/src/forewarning-management/BatchDeal.vue`
- Create: `packages/shared-ui/src/forewarning-management/DealDialog.vue`
- Modify: `packages/shared-ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/link-warning/src/views/ForewarningManagement/components/batchDeal.vue`
- Modify: `apps/link-warning/src/views/ForewarningManagement/components/dealDialog.vue`
- Modify: `apps/link-front/src/views/ForewarningManagement/components/batchDeal.vue`
- Modify: `apps/link-front/src/views/ForewarningManagement/components/dealDialog.vue`

**Interfaces:**
- Consumes: Task 1 的四个纯函数；宿主注入的两个预警 API。
- Produces: `@link/shared-ui/forewarning-management/batch-deal` 与 `@link/shared-ui/forewarning-management/deal-dialog`。

- [ ] **Step 1: 创建公共 `DealDialog.vue`**

以 `apps/link-warning/src/views/ForewarningManagement/components/dealDialog.vue` 为模板创建 `packages/shared-ui/src/forewarning-management/DealDialog.vue`，保留原模板和样式，只进行以下脚本替换。

删除宿主 API 导入：

```js
import {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
} from '@/http/videoWarning/warning-api'
```

改为导入公共业务模型：

```js
import {
  buildBatchDealParams,
  getBatchDealCopy,
  getBatchDealOptions,
  selectBatchDealApi,
} from '@link/warning-feature/batch-deal'
```

在 `props` 中增加：

```js
batchAttentionAlarm: {
  type: Function,
  required: true,
},
batchAttentionAlarmInternal: {
  type: Function,
  required: true,
},
```

用以下实现替换原 `auditResList` 和 `dialogTitle`：

```js
const auditResList = computed(() => getBatchDealOptions(props.userType))
const dialogTitle = computed(() => getBatchDealCopy(props.userType).title)
```

删除原 `apiType`，并用以下动态选择替换 `mutationFn`，确保运行期间 `userType` 变化时仍选择正确 API：

```js
const { mutate: batchAttentionAlarmFn } = useMutation({
  mutationFn: params => selectBatchDealApi(props.userType, {
    batchAttentionAlarm: props.batchAttentionAlarm,
    batchAttentionAlarmInternal: props.batchAttentionAlarmInternal,
  })(params),
```

成功和必填提示分别改为：

```js
vm.$message.success(getBatchDealCopy(props.userType).success)
vm.$message.error(getBatchDealCopy(props.userType).resultRequired)
```

用以下代码替换 `handleSubmit` 中手工构造参数的部分：

```js
const params = buildBatchDealParams({
  selectedWarnings: props.selectedWarnings,
  auditRes: formData.value.auditRes,
  opinion: formData.value.opinion,
  userType: props.userType,
  submitType,
})
```

- [ ] **Step 2: 创建公共 `BatchDeal.vue`**

复制当前两端逐字一致的 `batchDeal.vue` 到 `packages/shared-ui/src/forewarning-management/BatchDeal.vue`。在 Props 中增加两个必填函数：

同时把组件导入的文件名大小写改为 Linux 可用的公共文件名：

```js
import DealDialog from './DealDialog.vue'
```

```js
batchAttentionAlarm: {
  type: Function,
  required: true,
},
batchAttentionAlarmInternal: {
  type: Function,
  required: true,
},
```

向内部 `DealDialog` 传递它们：

```vue
<DealDialog
  :batch-attention-alarm="batchAttentionAlarm"
  :batch-attention-alarm-internal="batchAttentionAlarmInternal"
  :userType="userType"
  :selectedWarnings="selected"
  :visible.sync="dialogVisible"
  @success="handleSuccess"
/>
```

- [ ] **Step 3: 声明公共 UI 导出和依赖**

在 `packages/shared-ui/package.json` 中增加：

```json
"dependencies": {
  "@link/warning-feature": "workspace:*"
}
```

并在 `exports` 中增加：

```json
"./forewarning-management/batch-deal": "./src/forewarning-management/BatchDeal.vue",
"./forewarning-management/deal-dialog": "./src/forewarning-management/DealDialog.vue"
```

刷新 Workspace 锁文件并验证依赖边：

```bash
NPM_AUTH=verify pnpm install --lockfile-only
node --test scripts/migration/workspace-lockfile.test.mjs
```

Expected: 锁文件测试通过，`packages/shared-ui` importer 包含 `@link/warning-feature` 的 `workspace:*` 依赖。

- [ ] **Step 4: 将两个应用的 `dealDialog.vue` 替换为相同适配器**

两个 `dealDialog.vue` 都改为：

```vue
<template>
  <SharedDealDialog
    v-bind="$attrs"
    v-on="$listeners"
    :batch-attention-alarm="batchAttentionAlarm"
    :batch-attention-alarm-internal="batchAttentionAlarmInternal"
  />
</template>

<script>
import SharedDealDialog from '@link/shared-ui/forewarning-management/deal-dialog'
import {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'DealDialogAdapter',
  components: { SharedDealDialog },
  inheritAttrs: false,
  methods: {
    batchAttentionAlarm,
    batchAttentionAlarmInternal,
  },
}
</script>
```

- [ ] **Step 5: 将两个应用的 `batchDeal.vue` 替换为相同适配器**

两个 `batchDeal.vue` 都改为：

```vue
<template>
  <SharedBatchDeal
    v-bind="$attrs"
    v-on="$listeners"
    :batch-attention-alarm="batchAttentionAlarm"
    :batch-attention-alarm-internal="batchAttentionAlarmInternal"
  />
</template>

<script>
import SharedBatchDeal from '@link/shared-ui/forewarning-management/batch-deal'
import {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'BatchDealAdapter',
  components: { SharedBatchDeal },
  inheritAttrs: false,
  methods: {
    batchAttentionAlarm,
    batchAttentionAlarmInternal,
  },
}
</script>
```

- [ ] **Step 6: 运行迁移契约和全量测试并确认 GREEN**

Run:

```bash
node --test scripts/migration/shared-warning-batch-deal.test.mjs
pnpm test
```

Expected: 新迁移契约全部通过，现有迁移、审计和预警功能测试全部通过。

- [ ] **Step 7: 提交公共 UI 和宿主适配器**

```bash
git add packages/shared-ui/package.json
git add pnpm-lock.yaml
git add packages/shared-ui/src/forewarning-management/BatchDeal.vue
git add packages/shared-ui/src/forewarning-management/DealDialog.vue
git add apps/link-warning/src/views/ForewarningManagement/components/batchDeal.vue
git add apps/link-warning/src/views/ForewarningManagement/components/dealDialog.vue
git add apps/link-front/src/views/ForewarningManagement/components/batchDeal.vue
git add apps/link-front/src/views/ForewarningManagement/components/dealDialog.vue
git commit -m "refactor: share warning batch deal components"
```

### Task 4: 完成独立双构建、来源审计和验证记录

**Files:**
- Modify: `docs/migration/shared-source-audit.json`
- Create: `docs/migration/shared-warning-batch-deal-verification.md`

**Interfaces:**
- Consumes: Task 3 的公共组件、两个宿主适配器和现有构建命令。
- Produces: 可重复的独立构建与单一来源验收证据。

- [ ] **Step 1: 分别执行两个生产构建**

Run:

```bash
NPM_AUTH=verify pnpm run build:warning
NPM_AUTH=verify pnpm run build:front
```

Expected: 两个命令分别以状态码 0 完成；产物分别位于 `dist/link-warning` 与 `dist/link-front`。

- [ ] **Step 2: 更新并检查共享来源审计**

Run:

```bash
pnpm audit:shared
```

Expected counts:

```json
{
  "smaller": 477,
  "larger": 1866,
  "common": 470,
  "identical": 324,
  "different": 146,
  "smallerOnly": 7,
  "largerOnly": 1396
}
```

`batchDeal.vue` 与 `dealDialog.vue` 必须都位于 `identicalFiles`，业务主体必须只存在于 `packages/shared-ui` 和 `packages/warning-feature`。

- [ ] **Step 3: 验证外部来源基线未变化**

Run:

```bash
pnpm verify:sources
```

Expected: 输出 `来源目录未发生变化`。

- [ ] **Step 4: 写入验证记录**

创建 `docs/migration/shared-warning-batch-deal-verification.md`：

```markdown
# 预警批量处理组件共享验证

## 范围

- 公共业务模型：`@link/warning-feature/batch-deal`
- 公共 UI：`@link/shared-ui/forewarning-management/batch-deal`
- 公共 UI：`@link/shared-ui/forewarning-management/deal-dialog`
- 两个应用保留原路径，并只注入各自的预警 API。

## 验证结果

- `node --test packages/warning-feature/src/batch-deal/createBatchDealModel.test.mjs`：PASS（4 项）
- `node --test scripts/migration/shared-warning-batch-deal.test.mjs`：PASS
- `pnpm test`：PASS
- `NPM_AUTH=verify pnpm run build:warning`：PASS，输出到 `dist/link-warning`
- `NPM_AUTH=verify pnpm run build:front`：PASS，输出到 `dist/link-front`
- `pnpm audit:shared`：PASS，`identical=324`、`different=146`
- `pnpm verify:sources`：PASS，外部来源目录未变化

## 结论

批量处理条和处理弹窗的业务主体已收敛为单一公共实现；两个应用通过原路径薄适配器注入宿主 API，并保持独立构建和独立产物。
```

- [ ] **Step 5: 运行最终验证并提交记录**

Run:

```bash
pnpm test
git diff --check
git status --short
```

Expected: 全量测试通过，`git diff --check` 无输出，状态中只包含本任务的审计和验证文档。

Commit:

```bash
git add docs/migration/shared-source-audit.json
git add docs/migration/shared-warning-batch-deal-verification.md
git commit -m "docs: verify shared warning batch deal"
```

## Follow-on Slices

完成本计划并验证双构建后，按同一门禁为以下 `ForewarningManagement` 切片分别编写计划：

1. 报表展示与报表页面；
2. 统计图表与静态分析页面；
3. 摄像头、一体机、技能和警笛表单；
4. 预警、误报、关注和租户列表页面。

每个后续切片都必须保留两端行为差异，并在进入公共包前建立宿主适配接口。

## Risks and Mitigations

- **Vue 2 适配器丢失 Props 或事件：** 适配器不声明宿主 Props，使用 `v-bind="$attrs"` 与 `v-on="$listeners"` 原样转发，并由迁移契约和双构建验证。
- **`userType` 在组件存活期间变化：** 每次 mutation 执行时动态调用 `selectBatchDealApi`，不在 `setup` 初始化时缓存 API。
- **Linux 文件系统大小写失败：** 公共组件固定使用 `BatchDeal.vue`、`DealDialog.vue`，内部导入显式写为 `./DealDialog.vue`。
- **Workspace 依赖只改 manifest 未改锁文件：** 计划显式运行 `pnpm install --lockfile-only` 和现有锁文件契约测试。
- **共享包反向依赖宿主：** 迁移测试禁止公共源码出现 `@/` 和 `apps/`，宿主 API 只通过函数 Props 注入。
- **构建互相污染：** 两个生产构建分别执行，并检查其固定输出目录；任一失败时停止该切片。
