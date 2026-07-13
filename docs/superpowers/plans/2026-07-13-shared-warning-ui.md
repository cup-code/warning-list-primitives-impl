# 预警基础 UI 组件共享实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将 `ChartCard`、`ChartContainer`、`SkillTable` 收敛为 `@link/shared-ui` 中的唯一实现，同时保持两个应用的原导入路径和独立构建能力。

**架构：** 三个现有 Vue SFC 原样迁移到 `packages/shared-ui/src/forewarning-management`，由包的显式子路径导出。两个应用原 `.vue` 文件只保留 `<script>` 默认导出转发，因此调用方获得的就是共享组件本身，不增加包装 DOM，也不改变 Props、事件或 Slots。

**技术栈：** pnpm 10 Workspace、Vue 2.7 SFC、Rsbuild、Node.js `node:test`、ESM。

## 全局约束

- 只修改 `/Users/jxz/project/new/front/project/link-shared`，原始 `link-front_new` 与 `link-warning` 保持只读。
- 共享实现必须与迁移前文件逐字一致，SHA-256 分别为 `198babab10cf461e2a8ad8c1d5f181279a900813b187ac2d3bd23698498b0d40`、`40395fe2542c027f9b2889be3f288f230db7dbf21bf0dd091b961a284b0090f0`、`92d6d134bb53cdd283bcc91cf64684d4d48a9ec21b912ec6853f10232f3a2a0f`。
- 不修改三个组件的模板、脚本、样式、Props、Slots 或事件。
- 不新增外部依赖，不扩展到其他 `ForewarningManagement` 文件。
- 每个任务完成后保持 `pnpm test` 可通过；最终必须完成两个应用的生产构建和来源摘要验证。

---

## 文件结构

- 创建 `packages/shared-ui/src/forewarning-management/ChartCard.vue`：图表卡片唯一实现。
- 创建 `packages/shared-ui/src/forewarning-management/ChartContainer.vue`：图表布局容器唯一实现。
- 创建 `packages/shared-ui/src/forewarning-management/SkillTable.vue`：技能表格唯一实现。
- 修改 `packages/shared-ui/package.json`：声明三个稳定的组件子路径导出。
- 修改两个应用中的三个原组件文件：默认导出对应共享组件。
- 创建 `scripts/migration/shared-warning-ui.test.mjs`：共享实现、包导出和应用转发契约测试。
- 修改 `docs/migration/shared-source-audit.json`：记录迁移后的共享源统计。
- 创建 `docs/migration/shared-warning-ui-verification.md`：记录测试、构建和来源校验结果。

### Task 1：固定共享组件迁移契约

**文件：**
- 创建：`scripts/migration/shared-warning-ui.test.mjs`

**接口：**
- 消费：现有三个组件的文件内容与 `packages/shared-ui/package.json`。
- 产出：后续实现必须满足的共享路径、导出路径、基线摘要和转发格式契约。

- [ ] **Step 1：编写失败的迁移契约测试**

创建 `scripts/migration/shared-warning-ui.test.mjs`：

```js
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']
const components = [
  {
    appPath: 'src/views/ForewarningManagement/components/ChartCard.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/ChartCard.vue',
    exportPath: './forewarning-management/chart-card',
    importPath: '@link/shared-ui/forewarning-management/chart-card',
    digest: '198babab10cf461e2a8ad8c1d5f181279a900813b187ac2d3bd23698498b0d40',
  },
  {
    appPath: 'src/views/ForewarningManagement/components/ChartContainer.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/ChartContainer.vue',
    exportPath: './forewarning-management/chart-container',
    importPath: '@link/shared-ui/forewarning-management/chart-container',
    digest: '40395fe2542c027f9b2889be3f288f230db7dbf21bf0dd091b961a284b0090f0',
  },
  {
    appPath: 'src/views/ForewarningManagement/components/ReportExport/SkillTable.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/SkillTable.vue',
    exportPath: './forewarning-management/skill-table',
    importPath: '@link/shared-ui/forewarning-management/skill-table',
    digest: '92d6d134bb53cdd283bcc91cf64684d4d48a9ec21b912ec6853f10232f3a2a0f',
  },
]

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

test('共享 UI 包显式导出三个预警组件', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  for (const component of components) {
    assert.equal(packageJson.exports[component.exportPath], `./src/forewarning-management/${path.basename(component.sharedPath)}`)
  }
})

test('共享组件实现与迁移前基线逐字一致', async () => {
  for (const component of components) {
    const source = await readWorkspaceFile(component.sharedPath)
    const digest = createHash('sha256').update(source).digest('hex')
    assert.equal(digest, component.digest, component.sharedPath)
  }
})

test('两个应用只从共享 UI 包转发组件', async () => {
  for (const appRoot of appRoots) {
    for (const component of components) {
      const source = await readWorkspaceFile(path.join(appRoot, component.appPath))
      assert.equal(source, `<script>\nexport { default } from '${component.importPath}'\n</script>\n`)
    }
  }
})
```

- [ ] **Step 2：运行测试并确认按预期失败**

运行：

```bash
NPM_AUTH=test pnpm test:migration
```

预期：新增测试因 `packages/shared-ui` 尚无 `exports` 或共享组件文件而失败；已有迁移测试继续通过。

- [ ] **Step 3：提交测试边界**

```bash
git add scripts/migration/shared-warning-ui.test.mjs
git commit -m "test: define shared warning UI contract"
```

### Task 2：迁移唯一实现并接入两个应用

**文件：**
- 创建：`packages/shared-ui/src/forewarning-management/ChartCard.vue`
- 创建：`packages/shared-ui/src/forewarning-management/ChartContainer.vue`
- 创建：`packages/shared-ui/src/forewarning-management/SkillTable.vue`
- 修改：`packages/shared-ui/package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/components/ChartCard.vue`
- 修改：`apps/link-front/src/views/ForewarningManagement/components/ChartContainer.vue`
- 修改：`apps/link-front/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue`
- 修改：`apps/link-warning/src/views/ForewarningManagement/components/ChartCard.vue`
- 修改：`apps/link-warning/src/views/ForewarningManagement/components/ChartContainer.vue`
- 修改：`apps/link-warning/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue`

**接口：**
- 消费：Task 1 定义的组件路径、导出路径和 SHA-256 基线。
- 产出：三个 `@link/shared-ui/forewarning-management/*` 默认 Vue 组件导出；两个应用原路径继续默认导出相同组件。

- [ ] **Step 1：将当前相同实现复制到共享包**

```bash
mkdir -p packages/shared-ui/src/forewarning-management
cp apps/link-front/src/views/ForewarningManagement/components/ChartCard.vue packages/shared-ui/src/forewarning-management/ChartCard.vue
cp apps/link-front/src/views/ForewarningManagement/components/ChartContainer.vue packages/shared-ui/src/forewarning-management/ChartContainer.vue
cp apps/link-front/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue packages/shared-ui/src/forewarning-management/SkillTable.vue
```

不得格式化或改写复制后的文件。

- [ ] **Step 2：增加共享包显式导出**

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
    "./forewarning-management/skill-table": "./src/forewarning-management/SkillTable.vue"
  }
}
```

- [ ] **Step 3：将两个应用中的旧实现替换为默认导出转发**

`ChartCard.vue` 使用：

```vue
<script>
export { default } from '@link/shared-ui/forewarning-management/chart-card'
</script>
```

`ChartContainer.vue` 使用：

```vue
<script>
export { default } from '@link/shared-ui/forewarning-management/chart-container'
</script>
```

`ReportExport/SkillTable.vue` 使用：

```vue
<script>
export { default } from '@link/shared-ui/forewarning-management/skill-table'
</script>
```

两个应用对应文件必须逐字一致并以换行结尾。

- [ ] **Step 4：运行契约测试并确认通过**

```bash
NPM_AUTH=test pnpm test:migration
```

预期：全部迁移测试通过，新增三个测试均为 `pass`。

- [ ] **Step 5：运行全量测试**

```bash
NPM_AUTH=test pnpm test
```

预期：迁移测试和 `warning-feature` 测试全部通过。

- [ ] **Step 6：提交共享实现**

```bash
git add packages/shared-ui apps/link-front/src/views/ForewarningManagement/components/ChartCard.vue apps/link-front/src/views/ForewarningManagement/components/ChartContainer.vue apps/link-front/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue apps/link-warning/src/views/ForewarningManagement/components/ChartCard.vue apps/link-warning/src/views/ForewarningManagement/components/ChartContainer.vue apps/link-warning/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue
git commit -m "refactor: share warning UI components"
```

### Task 3：完成双应用构建与迁移审计

**文件：**
- 修改：`docs/migration/shared-source-audit.json`
- 创建：`docs/migration/shared-warning-ui-verification.md`

**接口：**
- 消费：Task 2 完成的共享组件及两个应用转发文件。
- 产出：可复查的共享源审计和第三阶段验证记录。

- [ ] **Step 1：运行两个应用的生产构建**

```bash
NPM_AUTH=verify pnpm build
```

预期：`@link/link-front` 与 `@link/link-warning` 均构建成功，输出分别位于根目录 `dist/link-front` 和 `dist/link-warning`。若 Workspace `.vue` 未进入编译链，只允许在两个 `rsbuild.config.js` 中加入 `@link/shared-ui` 源目录所需的最小 `source.include` 配置，并重新运行本步骤。

- [ ] **Step 2：更新共享源审计**

```bash
pnpm audit:shared
```

预期：命令成功，三个应用路径文件由“完全相同实现”变为“完全相同转发文件”，共享实现只存在于 `packages/shared-ui`。

- [ ] **Step 3：验证原始来源目录未变化**

重新生成迁移后清单：

```bash
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\\n') })" > docs/migration/source-after.json
pnpm verify:sources
```

预期输出：`来源目录未发生变化`。

- [ ] **Step 4：编写验证记录**

创建 `docs/migration/shared-warning-ui-verification.md`，准确记录：

```markdown
# 预警基础 UI 组件共享验证

## 范围

- `ChartCard.vue`
- `ChartContainer.vue`
- `SkillTable.vue`

## 结果

- 共享实现：`packages/shared-ui/src/forewarning-management`
- 应用接入：两个应用保留原路径并默认导出共享组件
- 契约测试：记录实际通过数量
- 全量测试：记录实际通过数量
- 生产构建：`link-front`、`link-warning` 均成功
- 来源校验：来源目录未发生变化

## 未纳入范围

`ForewarningManagement` 中其余相同文件和 34 个差异文件继续保留在应用内，后续按依赖边界逐批迁移。
```

必须用真实命令结果替换“记录实际通过数量”，不得填写未经执行的结果。

- [ ] **Step 5：执行最终验证**

```bash
NPM_AUTH=verify pnpm test
NPM_AUTH=verify pnpm build
pnpm verify:sources
git diff --check
git status --short
```

预期：测试全部通过、两个构建成功、来源目录未变化、`git diff --check` 无输出；`git status --short` 只列出本任务预期的审计和验证文档改动。

- [ ] **Step 6：提交验证材料**

```bash
git add docs/migration/shared-source-audit.json docs/migration/source-after.json docs/migration/shared-warning-ui-verification.md
git commit -m "docs: verify shared warning UI components"
```

## 计划自检

- 规格覆盖：唯一实现、显式导出、原路径兼容、双应用构建、来源只读和审计均有对应任务。
- 占位符检查：所有实现步骤均已定义；验证文档中的数量明确要求由真实结果填写。
- 接口一致性：三个包导出路径、应用转发路径和测试表中的路径逐项对应。
- 范围检查：只迁移三个已确认无应用内导入依赖的相同组件。
