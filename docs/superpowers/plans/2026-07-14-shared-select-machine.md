# 一体机选择组件共享实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将两个应用重复的 `SelectMachine` 收敛到 `@link/shared-ui`，由应用薄包装层注入本地 API，同时保持原路径、Props、模板、事件和异常行为不变。

**架构：** 可独立测试的查询选择与响应解析逻辑放在共享 UI 包同目录的 `selectMachineLogic.js`，唯一 Vue SFC 使用这些函数维护查询和选择状态。两个应用原 `selectMachine.vue` 仅保留宿主 API 导入、公共 Props 声明以及 `$attrs`/`$listeners` 透传；共享包通过 peer dependencies 复用宿主 Vue 2.7 和 vue-query 运行时。

**技术栈：** pnpm 10 Workspace、Vue 2.7.16、`@tanstack/vue-query` 4.33、Element UI、Rsbuild、Node.js `node:test`、ESM。

## 全局约束

- 不修改任何现有调用页面、路由、Store、HTTP 模块或其他候选共享文件。
- `value: String = ''`、`type: String = ''`、`disabled: Boolean = false` 保持不变。
- `type === 'all'` 调用 `allMachineListApi({ isPage: false })` 并读取 `data.result`；其他模式调用 `machineListApi({ isPage: false })` 并读取 `data.result.list`。
- `change` 继续发送选中的完整一体机对象；清空或标识未知时继续发送 `undefined`。
- 共享 SFC 的根 `div`、Element UI 结构、`请选择所属一体机` 文案以及 `success=false`、空列表、未知 `value` 行为保持不变。
- 共享源码不得包含 `@/`、`apps/`、宿主 Store、Router 或具体 HTTP 模块引用。
- `vue` 与 `@tanstack/vue-query` 只能作为 `@link/shared-ui` 的 peer dependencies，不新增运行时副本。
- 原始来源目录 `/Users/jxz/project/new/front/project/link-front_new` 与 `/Users/jxz/project/new/front/project/link-warning` 不得修改。

---

## 文件结构

- 创建 `packages/shared-ui/src/forewarning-management/selectMachineLogic.js`：API 选择、响应归一化、名称恢复和选中对象解析。
- 创建 `packages/shared-ui/src/forewarning-management/SelectMachine.vue`：唯一模板、查询状态和交互实现。
- 修改 `packages/shared-ui/package.json`：导出共享组件并声明 peer dependencies。
- 修改两个应用的 `src/views/ForewarningManagement/components/selectMachine.vue`：保留原路径的宿主适配层。
- 创建 `scripts/migration/shared-select-machine.test.mjs`：固定纯逻辑、共享 SFC、包导出和包装层契约。
- 修改 `docs/migration/shared-source-audit.json`：记录迁移后的重复源审计结果。
- 修改 `docs/migration/source-after.json`：重新记录未修改的来源项目摘要。
- 创建 `docs/migration/shared-select-machine-verification.md`：记录机械对照、测试、构建、审计与来源校验结果。

### Task 1：用可执行契约固定选择器行为

**文件：**
- 创建：`scripts/migration/shared-select-machine.test.mjs`
- 创建：`packages/shared-ui/src/forewarning-management/selectMachineLogic.js`

**接口：**
- 消费：宿主传入的 `type: string`、`allMachineListApi(params): Promise`、`machineListApi(params): Promise`，以及形如 `{ data: { success, result } }` 的响应。
- 产出：`createMachineListQuery(type, allMachineListApi, machineListApi)`、`extractMachineList(response, isAll)`、`findMachineName(machineList, value)`、`findMachine(machineList, value)`。

- [ ] **Step 1：创建失败的纯逻辑与迁移契约测试**

创建 `scripts/migration/shared-select-machine.test.mjs`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createMachineListQuery,
  extractMachineList,
  findMachine,
  findMachineName,
} from '../../packages/shared-ui/src/forewarning-management/selectMachineLogic.js'

test('普通模式只调用分页列表 API', async () => {
  const calls = []
  const allMachineListApi = async (params) => {
    calls.push(['all', params])
  }
  const machineListApi = async (params) => {
    calls.push(['normal', params])
    return { data: { success: true, result: { list: [] } } }
  }

  const query = createMachineListQuery('', allMachineListApi, machineListApi)
  await query()

  assert.deepEqual(calls, [['normal', { isPage: false }]])
})

test('all 模式只调用全量列表 API', async () => {
  const calls = []
  const allMachineListApi = async (params) => {
    calls.push(['all', params])
    return { data: { success: true, result: [] } }
  }
  const machineListApi = async (params) => {
    calls.push(['normal', params])
  }

  const query = createMachineListQuery('all', allMachineListApi, machineListApi)
  await query()

  assert.deepEqual(calls, [['all', { isPage: false }]])
})

test('响应解析保持普通、all 和失败响应的原行为', () => {
  const machines = [{ id: 'm1', machineName: '一体机 1' }]
  assert.deepEqual(
    extractMachineList({ data: { success: true, result: { list: machines } } }, false),
    machines,
  )
  assert.deepEqual(
    extractMachineList({ data: { success: true, result: machines } }, true),
    machines,
  )
  assert.equal(
    extractMachineList({ data: { success: false, result: machines } }, true),
    undefined,
  )
})

test('名称恢复和 change 参数保持完整对象或 undefined', () => {
  const machine = { id: 'm1', machineName: '一体机 1', tenantId: 't1' }
  const machines = [machine]

  assert.equal(findMachineName(machines, 'm1'), '一体机 1')
  assert.equal(findMachineName(machines, 'missing'), undefined)
  assert.equal(findMachine(machines, 'm1'), machine)
  assert.equal(findMachine(machines, ''), undefined)
  assert.equal(findMachine(machines, 'missing'), undefined)
})

```

- [ ] **Step 2：运行测试并确认因共享逻辑缺失而失败**

```bash
NPM_AUTH=test node --test scripts/migration/shared-select-machine.test.mjs
```

预期：`ERR_MODULE_NOT_FOUND`，缺少 `selectMachineLogic.js`。

- [ ] **Step 3：实现最小纯逻辑模块**

创建 `packages/shared-ui/src/forewarning-management/selectMachineLogic.js`：

```js
export function createMachineListQuery(type, allMachineListApi, machineListApi) {
  return () => (
    type === 'all'
      ? allMachineListApi({ isPage: false })
      : machineListApi({ isPage: false })
  )
}

export function extractMachineList(response, isAll) {
  if (!response?.data?.success) {
    return undefined
  }

  return isAll ? response.data.result : response.data.result.list
}

export function findMachine(machineList, value) {
  return machineList.find(item => item.id === value)
}

export function findMachineName(machineList, value) {
  return findMachine(machineList, value)?.machineName
}
```

- [ ] **Step 4：运行测试并确认纯逻辑用例全部通过**

```bash
NPM_AUTH=test node --test scripts/migration/shared-select-machine.test.mjs
```

预期：4 个测试全部通过。

- [ ] **Step 5：提交行为契约和纯逻辑**

```bash
git add scripts/migration/shared-select-machine.test.mjs packages/shared-ui/src/forewarning-management/selectMachineLogic.js
git commit -m "test: define shared machine selector contract"
```

### Task 2：建立唯一共享组件并接入两个应用

**文件：**
- 创建：`packages/shared-ui/src/forewarning-management/SelectMachine.vue`
- 修改：`packages/shared-ui/package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/components/selectMachine.vue`
- 修改：`apps/link-warning/src/views/ForewarningManagement/components/selectMachine.vue`

**接口：**
- 消费：Task 1 的四个纯函数；两个宿主包装层注入 `allMachineListApi` 和 `machineListApi`。
- 产出：`@link/shared-ui/forewarning-management/select-machine` 默认 Vue 组件；两个应用原相对路径继续提供 `value`、`type`、`disabled` 和 `change(machine | undefined)` 契约。

- [ ] **Step 1：追加失败的共享包与包装层契约测试**

在文件顶部的 `assert` 导入后增加：

```js
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
```

在四个共享逻辑导入之后增加：

```js
const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)
```

然后在 `scripts/migration/shared-select-machine.test.mjs` 末尾追加：

```js
test('共享包和包装层暴露稳定的 SelectMachine 契约', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  assert.equal(
    packageJson.exports['./forewarning-management/select-machine'],
    './src/forewarning-management/SelectMachine.vue',
  )
  assert.deepEqual(packageJson.peerDependencies, {
    '@tanstack/vue-query': '^4.33.0',
    vue: '2.7.16',
  })

  const sharedSource = await readWorkspaceFile(
    'packages/shared-ui/src/forewarning-management/SelectMachine.vue',
  )
  assert.doesNotMatch(sharedSource, /@\//)
  assert.doesNotMatch(sharedSource, /apps\//)
  assert.doesNotMatch(sharedSource, /\b(?:Store|Router)\b/)
  assert.match(sharedSource, /allMachineListApi:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(sharedSource, /machineListApi:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(sharedSource, /placeholder="请选择所属一体机"/)
  assert.match(sharedSource, /:disabled="disabled"/)
  assert.match(sharedSource, /emit\('change', machine\)/)

  const wrappers = await Promise.all(appRoots.map(appRoot => (
    readWorkspaceFile(`${appRoot}/src/views/ForewarningManagement/components/selectMachine.vue`)
  )))
  assert.equal(wrappers[0], wrappers[1])
  assert.match(wrappers[0], /@link\/shared-ui\/forewarning-management\/select-machine/)
  assert.match(wrappers[0], /@\/http\/videoWarning\/warning-api/)
  assert.match(wrappers[0], /v-bind="\$attrs"/)
  assert.match(wrappers[0], /v-on="\$listeners"/)
  assert.match(wrappers[0], /:all-machine-list-api="allMachineListApi"/)
  assert.match(wrappers[0], /:machine-list-api="machineListApi"/)
})
```

运行：

```bash
NPM_AUTH=test node --test scripts/migration/shared-select-machine.test.mjs
```

预期：前四个测试通过；新增测试因共享包尚未导出 `select-machine` 而失败。

- [ ] **Step 2：创建共享 SelectMachine SFC**

创建 `packages/shared-ui/src/forewarning-management/SelectMachine.vue`：

```vue
<script>
import { useQuery } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import {
  createMachineListQuery,
  extractMachineList,
  findMachine,
  findMachineName,
} from './selectMachineLogic.js'

export default {
  name: 'SelectMachine',
  props: {
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    allMachineListApi: {
      type: Function,
      required: true,
    },
    machineListApi: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const machineLists = ref([])
    const machineName = ref('')
    const isAll = props.type === 'all'

    useQuery({
      queryKey: ['machineList', props.type],
      queryFn: createMachineListQuery(
        props.type,
        props.allMachineListApi,
        props.machineListApi,
      ),
      onSuccess: (response) => {
        const machines = extractMachineList(response, isAll)
        if (machines !== undefined) {
          machineLists.value = machines
        }
      },
    })

    watch(
      () => props.value,
      (newValue) => {
        machineName.value = newValue
      },
      { immediate: true },
    )

    watch(
      machineLists,
      (newValue) => {
        if (newValue.length > 0) {
          machineName.value = findMachineName(newValue, props.value)
        }
      },
      { immediate: true },
    )

    const onChangeMachine = (value) => {
      const machine = findMachine(machineLists.value, value)
      machineName.value = value
      emit('change', machine)
    }

    return {
      machineLists,
      machineName,
      onChangeMachine,
    }
  },
}
</script>

<template>
  <div>
    <el-select
      v-model="machineName"
      clearable
      placeholder="请选择所属一体机"
      :disabled="disabled"
      @change="onChangeMachine"
    >
      <el-option
        v-for="item in machineLists"
        :key="item.id"
        :label="item.machineName"
        :value="item.id"
      />
    </el-select>
  </div>
</template>
```

不得顺带更改现有查询失败、空列表、未知值或清空选择行为。

- [ ] **Step 3：增加共享包导出和 peer dependencies**

将 `packages/shared-ui/package.json` 改为：

```json
{
  "name": "@link/shared-ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./forewarning-management/chart-card": "./src/forewarning-management/ChartCard.vue",
    "./forewarning-management/chart-container": "./src/forewarning-management/ChartContainer.vue",
    "./forewarning-management/select-machine": "./src/forewarning-management/SelectMachine.vue",
    "./forewarning-management/skill-table": "./src/forewarning-management/SkillTable.vue"
  },
  "peerDependencies": {
    "@tanstack/vue-query": "^4.33.0",
    "vue": "2.7.16"
  }
}
```

- [ ] **Step 4：将两个应用原文件替换为相同宿主适配层**

两个 `apps/*/src/views/ForewarningManagement/components/selectMachine.vue` 均使用以下完整内容：

```vue
<script>
import SharedSelectMachine from '@link/shared-ui/forewarning-management/select-machine'
import { allMachineList, machineList } from '@/http/videoWarning/warning-api'

export default {
  name: 'SelectMachine',
  components: { SharedSelectMachine },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      allMachineListApi: allMachineList,
      machineListApi: machineList,
    }
  },
}
</script>

<template>
  <SharedSelectMachine
    v-bind="$attrs"
    :value="value"
    :type="type"
    :disabled="disabled"
    :all-machine-list-api="allMachineListApi"
    :machine-list-api="machineListApi"
    v-on="$listeners"
  />
</template>
```

两个文件必须逐字一致并以换行结尾；不得修改现有页面导入。

- [ ] **Step 5：运行选择器契约测试**

```bash
NPM_AUTH=test node --test scripts/migration/shared-select-machine.test.mjs
```

预期：5 个测试全部通过。

- [ ] **Step 6：运行迁移与全量测试**

```bash
NPM_AUTH=test pnpm test:migration
NPM_AUTH=test pnpm test
```

预期：所有迁移测试及 `warning-feature` 测试通过，无既有用例回归。

- [ ] **Step 7：检查共享源码边界和改动格式**

```bash
rg -n "@/|apps/|\bStore\b|\bRouter\b" packages/shared-ui/src/forewarning-management/SelectMachine.vue packages/shared-ui/src/forewarning-management/selectMachineLogic.js
git diff --check
```

预期：两条命令均无输出。

- [ ] **Step 8：提交共享组件和适配层**

```bash
git add packages/shared-ui/package.json packages/shared-ui/src/forewarning-management/SelectMachine.vue apps/link-front/src/views/ForewarningManagement/components/selectMachine.vue apps/link-warning/src/views/ForewarningManagement/components/selectMachine.vue
git commit -m "refactor: share machine selector component"
```

### Task 3：完成双应用构建、审计和验证记录

**文件：**
- 修改：`docs/migration/shared-source-audit.json`
- 修改：`docs/migration/source-after.json`
- 创建：`docs/migration/shared-select-machine-verification.md`

**接口：**
- 消费：Task 2 完成的共享组件、包导出和两个应用包装层。
- 产出：可复查的共享源审计、来源项目摘要和中文验证记录。

- [ ] **Step 1：运行两个应用生产构建**

```bash
NPM_AUTH=verify pnpm build
```

预期：`@link/link-front` 与 `@link/link-warning` 均构建成功，产物分别位于根目录 `dist/link-front` 和 `dist/link-warning`。若 Workspace `.vue` 未进入编译链，只允许在两个 `rsbuild.config.js` 中为 `@link/shared-ui` 源目录加入最小 `source.include`，补充对应契约断言后重新运行本步骤。

- [ ] **Step 2：更新并检查共享源审计**

```bash
pnpm audit:shared
```

预期：命令成功；两个应用的 `selectMachine.vue` 被识别为相同薄包装，唯一业务实现只存在于 `packages/shared-ui`。

- [ ] **Step 3：重新生成并验证来源项目摘要**

```bash
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\\n') })" > docs/migration/source-after.json
pnpm verify:sources
```

预期输出：`来源目录未发生变化`。

- [ ] **Step 4：编写真实验证记录**

创建 `docs/migration/shared-select-machine-verification.md`：

```markdown
# 一体机选择组件共享验证

## 范围

- `packages/shared-ui/src/forewarning-management/SelectMachine.vue`
- `packages/shared-ui/src/forewarning-management/selectMachineLogic.js`
- 两个应用原 `ForewarningManagement/components/selectMachine.vue`

## 机械对照

- 记录公共 Props、查询参数、两种响应结构、根节点、Element UI 结构和中文文案的对照结果。
- 记录两个包装层逐字一致，并只承担共享组件、宿主 API 和属性事件透传。
- 记录共享源码耦合审计无命中。

## 验证结果

- 选择器契约测试：记录实际通过数量。
- 全量迁移测试：记录实际通过数量。
- 全量测试：记录实际通过数量。
- 生产构建：记录 `link-front`、`link-warning` 的实际结果。
- 共享源审计：记录实际命令结果。
- 来源校验：记录 `pnpm verify:sources` 的实际结果。

## 未纳入范围

未修改现有调用页面、HTTP 模块、Store、Router、其他候选共享组件或错误提示策略。
```

必须用真实命令输出替换“记录实际……”内容，不得填写未经执行的结论。

- [ ] **Step 5：执行最终验证**

```bash
NPM_AUTH=verify node --test scripts/migration/shared-select-machine.test.mjs
NPM_AUTH=verify pnpm test
NPM_AUTH=verify pnpm build
pnpm audit:shared
pnpm verify:sources
git diff --check
git status --short
```

预期：选择器契约、全量测试和两个生产构建均通过；共享源审计成功；来源目录未发生变化；`git diff --check` 无输出；`git status --short` 只列出本任务预期的审计和验证文档。

- [ ] **Step 6：提交验证材料**

```bash
git add docs/migration/shared-source-audit.json docs/migration/source-after.json docs/migration/shared-select-machine-verification.md
git commit -m "docs: verify shared machine selector"
```

## 计划自检

- 设计覆盖：API 注入、两种响应结构、失败响应、值同步、名称恢复、完整对象事件、包装层透传、peer dependencies、双应用构建、共享源审计和来源校验均有对应步骤。
- 占位扫描：计划中没有 `TBD`、`TODO` 或未定义实现；验证文档模板明确要求以真实结果替换说明文字。
- 类型一致性：四个纯函数、两个 API Props、包导出路径及包装层绑定名称在所有任务中一致。
- 范围检查：计划只覆盖 `SelectMachine` 共享化，不包含页面改造或无关重构。
