# 预警报表页面单一来源实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将两个应用共有的 `ForewarningManagement` 报表导出页面、子组件、数据转换和图表逻辑迁为单一公共实现，同时保留原路径、原契约、两处行为差异和独立构建能力。

**Architecture:** 报表数据转换进入 `@link/warning-feature/report-data` 工厂，Vue 2 页面和组件进入 `@link/shared-ui/forewarning-management/report-export/**`。两个应用新增一个本地 `reportExportHost.js` 集中装配 API、上传、存储、日期、PDF、文件前缀和行为能力，所有原路径文件只保留透明适配或公共导出 shim。

**Tech Stack:** pnpm 10 Workspace、Vue 2.7 SFC、Node.js `node:test`、ESM、Rsbuild。

## Global Constraints

- 范围只包含两个应用共有的 `views/ForewarningManagement/reportExport.vue`、`components/ReportExport/**`、`test/reportChart.js` 和 `test/reportData.js`。
- 不迁移 `link-front` 独有的 `views/reportDesign/**`、事故报告、设备报表或其他业务报表。
- 两个应用中的所有原路径必须继续存在，菜单值 `views/ForewarningManagement/reportExport` 不得修改。
- `ReportExport`、`ReportForm`、`ReportPreview`、`ReportTable`、`SkillTable`、`StatGrid` 的现有名称、Props、默认值、事件和可见 DOM 行为保持兼容。
- `link-warning` 的 `StatGrid` 使用动态 `timeTitle`，`link-front` 固定显示“本周报告预警实况”。
- `link-front` 的预警类型排名柱状图保留完整横轴标签配置，`link-warning` 不增加该配置。
- 公共包不得引用 `apps/**`、宿主 `@/`、Router、Store、`sessionStorage`、`localStorage` 或宿主业务实现。
- 不新增第三方依赖；继续复用现有 `@link/warning-feature`、`@link/shared-ui`、日期和 PDF 工厂。
- `pnpm run build:warning` 与 `pnpm run build:front` 必须独立执行，分别输出到 `dist/link-warning` 与 `dist/link-front`。

---

## File Structure

### 公共业务逻辑

- Create: `packages/warning-feature/src/report/createReportDataModel.js`
- Create: `packages/warning-feature/src/report/createReportDataModel.test.mjs`
- Modify: `packages/warning-feature/package.json`

### 公共 UI

- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportExportPage.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportForm.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportPreview.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportTable.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/StatGrid.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.js`
- Create: `packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.test.mjs`
- Modify: `packages/shared-ui/package.json`
- Modify: `package.json`

### 迁移契约与宿主适配

- Create: `scripts/migration/shared-warning-report-export.test.mjs`
- Create: `apps/link-warning/src/views/ForewarningManagement/reportExportHost.js`
- Create: `apps/link-front/src/views/ForewarningManagement/reportExportHost.js`
- Modify: `apps/link-warning/src/views/ForewarningManagement/reportExport.vue`
- Modify: `apps/link-front/src/views/ForewarningManagement/reportExport.vue`
- Modify: 两端 `components/ReportExport/ReportForm.vue`
- Modify: 两端 `components/ReportExport/ReportPreview.vue`
- Modify: 两端 `components/ReportExport/ReportTable.vue`
- Modify: 两端 `components/ReportExport/StatGrid.vue`
- Preserve: 两端 `components/ReportExport/SkillTable.vue`
- Modify: 两端 `test/reportChart.js`
- Modify: 两端 `test/reportData.js`

### 验收记录

- Modify: `docs/migration/shared-source-audit.json`
- Create: `docs/migration/shared-warning-report-export-verification.md`

---

### Task 1: 抽取报表数据模型并替换两端数据 shim

**Files:**

- Create: `packages/warning-feature/src/report/createReportDataModel.test.mjs`
- Create: `packages/warning-feature/src/report/createReportDataModel.js`
- Modify: `packages/warning-feature/package.json`
- Modify: `apps/link-warning/src/views/ForewarningManagement/test/reportData.js`
- Modify: `apps/link-front/src/views/ForewarningManagement/test/reportData.js`

**Interfaces:**

- Produces: `createReportDataModel({ dateLib, getWeekday })`。
- Returns: `generateActualList`、`generateStatsList`、`processTrendTableData`、`processAlarmTypeRank`、`processCameraAlarmRank`、`processAlarmLevelRank`、`generateReportText`。
- Preserves: 七个原函数的参数顺序和返回结构。

- [ ] **Step 1: 编写失败的模型测试**

创建 `packages/warning-feature/src/report/createReportDataModel.test.mjs`，至少包含以下测试：

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { createReportDataModel } from './createReportDataModel.js'

function createFixture() {
  const dateCalls = []
  const weekdayCalls = []
  const dateLib = value => {
    dateCalls.push(value)
    return {
      format(pattern) {
        assert.equal(pattern, 'MM-DD')
        return '07-15'
      },
    }
  }
  const getWeekday = value => {
    weekdayCalls.push(value)
    return `星期(${value})`
  }
  return {
    model: createReportDataModel({ dateLib, getWeekday }),
    dateCalls,
    weekdayCalls,
  }
}

test('缺少日期依赖时给出明确错误', () => {
  assert.throws(() => createReportDataModel(), /dateLib/)
  assert.throws(() => createReportDataModel({ dateLib() {} }), /getWeekday/)
})

test('导出原有七个函数且每次创建独立模型', () => {
  const first = createFixture().model
  const second = createFixture().model
  assert.notEqual(first, second)
  assert.deepEqual(Object.keys(first).sort(), [
    'generateActualList',
    'generateReportText',
    'generateStatsList',
    'processAlarmLevelRank',
    'processAlarmTypeRank',
    'processCameraAlarmRank',
    'processTrendTableData',
  ])
})

test('实况和统计数据保持原返回结构并容忍 alarmLive 缺失', () => {
  const { model } = createFixture()
  const actual = model.generateActualList({
    alarmTypeRank: [],
    cameraAlarmRank: {},
    alarmLevelLive: {},
    total: 0,
  }, 2)
  assert.equal(actual[0].value, '0 路')
  assert.equal(actual[0].label, '接入摄像头')
  assert.deepEqual(model.generateStatsList(2, 0, 0), [
    { name: '一体机数量2台' },
    { name: '接入摄像头数量0路' },
    { name: '摄像头配置技能0项' },
  ])
})

test('单日趋势继续调用注入的日期和星期能力', () => {
  const { model, dateCalls, weekdayCalls } = createFixture()
  assert.deepEqual(model.processTrendTableData({
    timeType: 0,
    alarmDateStart: '2026-07-15',
  }, { '07-15': 2, '07-16': 3 }), [{
    date: '07-15',
    week: '星期(07-15)',
    count: 5,
  }])
  assert.deepEqual(dateCalls, ['2026-07-15'])
  assert.deepEqual(weekdayCalls, ['07-15'])
})

test('排名、等级和报告文案保持原函数契约', () => {
  const { model } = createFixture()
  assert.deepEqual(model.processCameraAlarmRank({ A: 3, B: 1 }), [
    { rank: 1, deviceName: 'A', count: 3 },
    { rank: 2, deviceName: 'B', count: 1 },
  ])
  assert.match(model.generateReportText(3, 5), /3路摄像头/)
  assert.match(model.generateReportText(3, 5), /5项技能/)
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
node --test packages/warning-feature/src/report/createReportDataModel.test.mjs
```

Expected: FAIL，错误为找不到 `createReportDataModel.js`。

- [ ] **Step 3: 实现公共模型工厂**

使用 `apply_patch` 创建 `packages/warning-feature/src/report/createReportDataModel.js`，按以下无歧义机械转换生成：

1. 以当前 `apps/link-warning/src/views/ForewarningManagement/test/reportData.js` 为唯一源，复制除两条 import 之外的全部内容；
2. 把七处 `export function` 改为 `function`，函数参数、函数体、字段、排序、文案和默认值不做其他修改；
3. 把 `moment(` 精确替换为 `createDate(`，把 `getWeekday(` 精确替换为 `resolveWeekday(`；
4. 将转换后的七个函数放入下面工厂的两个依赖常量之后；
5. 在工厂末尾返回七个函数组成的对象。

文件前缀必须是：

```js
function requireFunction(value, name) {
  if (typeof value !== 'function') {
    throw new TypeError(`createReportDataModel requires ${name}`)
  }
  return value
}

export function createReportDataModel({ dateLib, getWeekday } = {}) {
  const createDate = requireFunction(dateLib, 'dateLib')
  const resolveWeekday = requireFunction(getWeekday, 'getWeekday')
```

文件后缀必须是：

```js
  return {
    generateActualList,
    generateStatsList,
    processTrendTableData,
    processAlarmTypeRank,
    processCameraAlarmRank,
    processAlarmLevelRank,
    generateReportText,
  }
}
```

完成后运行 `rg -n "moment|getWeekday|export function" packages/warning-feature/src/report/createReportDataModel.js`。Expected: 只允许工厂参数名 `getWeekday` 和 `requireFunction(getWeekday, ...)` 两处命中；不得存在 `moment` 或内部 `export function`。

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./report-data": "./src/report/createReportDataModel.js"
```

- [ ] **Step 4: 将两端原路径替换为相同 shim**

两个 `test/reportData.js` 都替换为：

```js
import moment from 'moment'
import { createReportDataModel } from '@link/warning-feature/report-data'
import { getWeekday } from './dateUtils.js'

export const {
  generateActualList,
  generateStatsList,
  processTrendTableData,
  processAlarmTypeRank,
  processCameraAlarmRank,
  processAlarmLevelRank,
  generateReportText,
} = createReportDataModel({
  dateLib: moment,
  getWeekday,
})
```

- [ ] **Step 5: 运行模型和功能测试并确认 GREEN**

Run:

```bash
node --test packages/warning-feature/src/report/createReportDataModel.test.mjs
pnpm test:warning-feature
cmp apps/link-warning/src/views/ForewarningManagement/test/reportData.js apps/link-front/src/views/ForewarningManagement/test/reportData.js
git diff --check
```

Expected: 新模型测试全部通过，预警功能测试全部通过，两个 shim 逐字一致，diff check 无输出。

- [ ] **Step 6: 提交数据模型切片**

```bash
git add packages/warning-feature/src/report/createReportDataModel.js
git add packages/warning-feature/src/report/createReportDataModel.test.mjs
git add packages/warning-feature/package.json
git add apps/link-warning/src/views/ForewarningManagement/test/reportData.js
git add apps/link-front/src/views/ForewarningManagement/test/reportData.js
git commit -m "refactor: share warning report data model"
```

---

### Task 2: 建立报表公共 UI 与适配器的失败契约

**Files:**

- Create: `scripts/migration/shared-warning-report-export.test.mjs`

**Interfaces:**

- Consumes: Task 1 的 `@link/warning-feature/report-data`。
- Produces: 公共导出、共享边界、原路径、宿主能力和行为差异的可执行契约。

- [ ] **Step 1: 编写失败的迁移契约**

创建测试并定义以下常量：

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const apps = ['link-warning', 'link-front']
const sharedRoot = path.join(
  root,
  'packages/shared-ui/src/forewarning-management/report-export',
)

const sharedFiles = [
  'ReportExportPage.vue',
  'ReportForm.vue',
  'ReportPreview.vue',
  'ReportTable.vue',
  'StatGrid.vue',
  'reportChartMixin.js',
]

const originalFiles = [
  'reportExport.vue',
  'components/ReportExport/ReportForm.vue',
  'components/ReportExport/ReportPreview.vue',
  'components/ReportExport/ReportTable.vue',
  'components/ReportExport/SkillTable.vue',
  'components/ReportExport/StatGrid.vue',
  'test/reportChart.js',
  'test/reportData.js',
]

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}
```

契约至少包含四组测试：

```js
test('shared-ui 显式导出报表页面、组件和图表 mixin', async () => {
  const manifest = JSON.parse(await source('packages/shared-ui/package.json'))
  const expected = {
    './forewarning-management/report-export': './src/forewarning-management/report-export/ReportExportPage.vue',
    './forewarning-management/report-export/form': './src/forewarning-management/report-export/ReportForm.vue',
    './forewarning-management/report-export/preview': './src/forewarning-management/report-export/ReportPreview.vue',
    './forewarning-management/report-export/table': './src/forewarning-management/report-export/ReportTable.vue',
    './forewarning-management/report-export/stat-grid': './src/forewarning-management/report-export/StatGrid.vue',
    './forewarning-management/report-export/chart-mixin': './src/forewarning-management/report-export/reportChartMixin.js',
  }
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(manifest.exports[key], value)
  }
})

test('公共报表源码只依赖公共包和注入能力', async () => {
  for (const file of sharedFiles) {
    const value = await readFile(path.join(sharedRoot, file), 'utf8')
    assert.doesNotMatch(value, /@\//)
    assert.doesNotMatch(value, /apps\//)
    assert.doesNotMatch(value, /\b(?:router|store|sessionStorage|localStorage)\b/i)
  }
})

test('两个应用保留全部原路径并只包含适配逻辑', async () => {
  for (const app of apps) {
    for (const file of originalFiles) {
      const value = await source(`apps/${app}/src/views/ForewarningManagement/${file}`)
      assert.ok(value.length > 0, `${app}/${file} 应继续存在`)
    }
    const host = await source(`apps/${app}/src/views/ForewarningManagement/reportExportHost.js`)
    assert.match(host, /getCurrentCompanyId/)
    assert.match(host, /getFilePrefix/)
    assert.match(host, /reportData/)
  }
})

test('两端能力明确保留标题和趋势图差异', async () => {
  const warning = await source('apps/link-warning/src/views/ForewarningManagement/reportExportHost.js')
  const front = await source('apps/link-front/src/views/ForewarningManagement/reportExportHost.js')
  assert.match(warning, /showAlarmTypeAxisLabels:\s*false/)
  assert.match(warning, /useFixedWeekTitle:\s*false/)
  assert.match(front, /showAlarmTypeAxisLabels:\s*true/)
  assert.match(front, /useFixedWeekTitle:\s*true/)
})
```

同时增加 Props/事件契约：

- `ReportForm` 必须保留 `formData` Prop 和 `update-field`、`search`、`reset`、`export-pdf` 事件；
- `ReportPreview` 必须保留规格列出的 21 个 Props；
- `ReportTable` 必须保留全部 12 个 Props；
- `StatGrid` 必须保留 `actualList`，公共实现额外接收 `timeTitle` 与 `useFixedWeekTitle`；
- 页面和组件包装层必须同时出现 `$attrs` 与 `$listeners`，且不得包含原数据转换或图表配置主体；
- 两端 `SkillTable.vue` 必须继续逐字一致并导向现有公共导出。

- [ ] **Step 2: 运行迁移契约并确认 RED**

Run:

```bash
node --test scripts/migration/shared-warning-report-export.test.mjs
```

Expected: FAIL，原因只应是公共报表文件、公共导出和 `reportExportHost.js` 尚不存在，或原路径仍包含业务主体。

- [ ] **Step 3: 确认没有生产实现被提前加入**

Run:

```bash
git status --short
git diff --check
```

Expected: 仅新增迁移契约测试，diff check 无输出。

- [ ] **Step 4: 提交 RED 契约**

```bash
git add scripts/migration/shared-warning-report-export.test.mjs
git commit -m "test: define shared warning report export contract"
```

---

### Task 3: 迁移报表展示原语和图表 mixin

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportTable.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/StatGrid.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.js`
- Create: `packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.test.mjs`
- Modify: `packages/shared-ui/package.json`
- Modify: `package.json`

**Interfaces:**

- Produces: 公共 `ReportTable`、`StatGrid`、`createReportChartMixin({ showAlarmTypeAxisLabels })`。
- Consumes later: Task 4 的 `ReportPreview`。

- [ ] **Step 1: 编写失败的图表差异测试**

创建 `reportChartMixin.test.mjs`，用假的 `$echarts.init().setOption()` 捕获配置：

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { createReportChartMixin } from './reportChartMixin.js'

function captureAlarmTypeOption(showAlarmTypeAxisLabels) {
  let option
  const mixin = createReportChartMixin({ showAlarmTypeAxisLabels })
  const originalDocument = globalThis.document
  globalThis.document = { getElementById: () => ({}) }
  const context = {
    showAlarmTypeAxisLabels,
    $echarts: {
      init() {
        return {
          clear() {},
          setOption(value) {
            option = value
          },
        }
      },
    },
  }
  try {
    mixin.methods.initAlarmTypeRank.call(context, [
      { alarmType: '烟火', alarmNumber: 2 },
    ])
  }
  finally {
    globalThis.document = originalDocument
  }
  return option
}

test('warning 模式不增加预警类型横轴标签配置', () => {
  const option = captureAlarmTypeOption(false)
  assert.equal(option.xAxis.axisLabel, undefined)
})

test('front 模式保留完整预警类型横轴标签', () => {
  const option = captureAlarmTypeOption(true)
  assert.deepEqual(option.xAxis.axisLabel.interval, 0)
  assert.equal(option.xAxis.axisLabel.showMinLabel, true)
  assert.equal(option.xAxis.axisLabel.showMaxLabel, true)
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.test.mjs`

Expected: FAIL，找不到 `reportChartMixin.js`。

- [ ] **Step 3: 迁移公共展示实现**

- `ReportTable.vue` 以 `link-front` 当前文件为规范化格式，完整保留 Props、模板和样式；
- `StatGrid.vue` 以 `link-warning` 当前文件为主体，新增：

```js
props: {
  actualList: {
    type: Array,
    required: true,
    default: () => [],
  },
  timeTitle: {
    type: String,
    default: '',
  },
  useFixedWeekTitle: {
    type: Boolean,
    default: false,
  },
},
computed: {
  actualTitle() {
    return this.useFixedWeekTitle ? '本周报告预警实况' : `${this.timeTitle}报告预警实况`
  },
},
```

模板标题替换为 `{{ actualTitle }}`，其余 DOM 与样式保持不变。

- `reportChartMixin.js` 以 `link-warning/test/reportChart.js` 为完整主体，执行以下机械转换：

  1. 将文件首行 `export default {` 改为工厂声明和 `return {`；
  2. 在原 `data()` 返回对象的 `chart: null` 后加入 `showAlarmTypeAxisLabels`；
  3. 在原 `initAlarmTypeRank` 的 `xAxis.axisTick` 后加入条件展开；
  4. 在原对象结尾之后关闭工厂并追加默认导出；
  5. 四个 methods 的其余代码逐字保持。

文件首部必须是：

```js
export function createReportChartMixin({ showAlarmTypeAxisLabels = false } = {}) {
  return {
    name: 'ReportChart',
    data() {
      return {
        chart: null,
        showAlarmTypeAxisLabels,
      }
    },
```

`initAlarmTypeRank` 的 `xAxis` 必须在 `axisTick` 后包含：

```js
...(this.showAlarmTypeAxisLabels
  ? {
      axisLabel: {
        interval: 0,
        showMinLabel: true,
        showMaxLabel: true,
        formatter(value) {
          return value
        },
      },
    }
  : {}),
```

文件末尾必须是：

```js
  }
}

export default createReportChartMixin()
```

- [ ] **Step 4: 添加公共导出和测试入口**

在 `packages/shared-ui/package.json` 增加：

```json
"./forewarning-management/report-export/table": "./src/forewarning-management/report-export/ReportTable.vue",
"./forewarning-management/report-export/stat-grid": "./src/forewarning-management/report-export/StatGrid.vue",
"./forewarning-management/report-export/chart-mixin": "./src/forewarning-management/report-export/reportChartMixin.js"
```

在根 `package.json` 增加：

```json
"test:shared-ui": "node --test packages/shared-ui/src/forewarning-management/report-export/*.test.mjs"
```

并把根 `test` 改为：

```json
"test": "pnpm test:migration && pnpm test:warning-feature && pnpm test:shared-ui"
```

- [ ] **Step 5: 运行测试并提交**

Run:

```bash
node --test packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.test.mjs
pnpm test:shared-ui
pnpm test
git diff --check
```

Expected: 图表差异测试和全量测试通过；迁移总契约仍因尚未迁移的页面和适配器保持 RED。

Commit:

```bash
git add package.json packages/shared-ui/package.json
git add packages/shared-ui/src/forewarning-management/report-export/ReportTable.vue
git add packages/shared-ui/src/forewarning-management/report-export/StatGrid.vue
git add packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.js
git add packages/shared-ui/src/forewarning-management/report-export/reportChartMixin.test.mjs
git commit -m "refactor: share warning report primitives"
```

---

### Task 4: 迁移公共报表表单和预览

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportForm.vue`
- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportPreview.vue`
- Modify: `packages/shared-ui/package.json`

**Interfaces:**

- Consumes: `host.ImageSelect`、`host.uploadImage`、`host.getStorage`、`host.setStorage`、`host.reportDate.getWeekRange`、`host.getFilePrefix` 和两项行为能力。
- Produces: 公共 `ReportForm`、`ReportPreview`，保留原 Props 和事件。

- [ ] **Step 1: 扩展迁移契约保护表单与预览接口**

在 Task 2 测试中加入对公共源文件的断言：

```js
assert.match(reportForm, /name:\s*['"]ReportForm['"]/)
assert.match(reportForm, /formData:\s*{/)
for (const event of ['update-field', 'search', 'reset', 'export-pdf']) {
  assert.match(reportForm, new RegExp(`\\$emit\\(['"]${event}['"]`))
}
for (const prop of [
  'reportTitle', 'defaultReportTitle', 'reportSummary', 'showTable',
  'currentYear', 'currentWeekNumber', 'weekDateStr', 'list', 'skillList',
  'actualList', 'trendTableData', 'alarmTypeRank', 'cameraAlarmRank',
  'alarmLevelRank', 'getText', 'showAdvert', 'headerLogo', 'headerText',
  'chartData', 'wechat', 'phone', 'timeTitle',
]) {
  assert.match(reportPreview, new RegExp(`${prop}:\\s*{`))
}
```

运行契约，确认仍因公共文件缺失而 RED。

- [ ] **Step 2: 创建公共 ReportForm**

以 `link-warning` 当前 `ReportForm.vue` 为基线，完整复制模板和样式；脚本执行以下确定替换：

- 删除 `ImageSelect`、`upLoadImg`、`commonMixin`、`getStorage`、`setStorage`、`getWeekRange` 的宿主导入；
- 删除 `mixins: [commonMixin]`；
- 增加必需 `host` Prop；
- `components.ImageSelect` 改为 `components: {}`，模板中的 `<ImageSelect>` 改为 `<component :is="host.ImageSelect">`；
- `getStorage`/`setStorage` 改为 `host.getStorage`/`host.setStorage`；
- `getWeekRange` 改为 `host.reportDate.getWeekRange`；
- `upLoadImg` 改为 `host.uploadImage`；
- `data()` 增加 `filePrefix: ''`；
- 原 `getPrefix()` 调用改为 `this.filePrefix = this.host.getFilePrefix()`；
- 其余 Props、watch、methods、事件、缓存键、缓存时长、文案、模板和样式保持不变。

公共 `host` Prop：

```js
host: {
  type: Object,
  required: true,
},
```

- [ ] **Step 3: 创建公共 ReportPreview**

以 `link-warning` 当前 `ReportPreview.vue` 为基线，完整复制模板和样式；执行以下替换：

- 导入公共 `reportChartMixin`、公共 `ReportTable`、公共 `StatGrid` 和现有 `@link/shared-ui/forewarning-management/skill-table`；
- 删除 `commonMixin` 依赖；
- 增加必需 `host` Prop；
- `mixins` 使用公共 `reportChartMixin`；
- `data()` 增加 `filePrefix: ''`；
- 原 `getPrefix()` 调用改为 `this.filePrefix = this.host.getFilePrefix()`；
- 向 `StatGrid` 传入 `:use-fixed-week-title="host.useFixedWeekTitle"`；
- 图表 mixin 的 `showAlarmTypeAxisLabels` 数据由 `host.showAlarmTypeAxisLabels` 初始化；
- 其余 21 个 Props、图表 ref、模板、样式和渲染时序保持不变。

- [ ] **Step 4: 添加公共导出**

在 `shared-ui` 增加：

```json
"./forewarning-management/report-export/form": "./src/forewarning-management/report-export/ReportForm.vue",
"./forewarning-management/report-export/preview": "./src/forewarning-management/report-export/ReportPreview.vue"
```

- [ ] **Step 5: 运行契约和全量测试**

Run:

```bash
node --test scripts/migration/shared-warning-report-export.test.mjs
pnpm test
git diff --check
```

Expected: 公共表单和预览接口断言通过；总契约因原路径尚未替换、页面入口和完整 host 尚未完成而继续 RED；全量测试通过。

- [ ] **Step 6: 提交表单与预览切片**

```bash
git add packages/shared-ui/package.json
git add packages/shared-ui/src/forewarning-management/report-export/ReportForm.vue
git add packages/shared-ui/src/forewarning-management/report-export/ReportPreview.vue
git commit -m "refactor: share warning report form and preview"
```

---

### Task 5: 迁移公共报表页面并完成宿主适配

**Files:**

- Create: `packages/shared-ui/src/forewarning-management/report-export/ReportExportPage.vue`
- Modify: `packages/shared-ui/package.json`
- Modify: 两端 `reportExportHost.js`
- Modify: 两端 `reportExport.vue`
- Modify: 两端 `components/ReportExport/ReportForm.vue`
- Modify: 两端 `components/ReportExport/ReportPreview.vue`
- Modify: 两端 `components/ReportExport/ReportTable.vue`
- Modify: 两端 `components/ReportExport/StatGrid.vue`
- Modify: 两端 `test/reportChart.js`
- Modify: `scripts/migration/shared-warning-report-export.test.mjs`（只允许增强，不得放宽）

**Interfaces:**

- Consumes: 完整 `reportExportHost`、公共 ReportForm/ReportPreview、Task 1 数据模型。
- Produces: 原菜单路径下的完整公共报表页面。

- [ ] **Step 1: 将 host 契约写成失败测试**

迁移契约必须要求完整能力集合：

```js
const requiredHostCapabilities = [
  'getSpecifiedModule',
  'getScreenData',
  'getWarningTypeList',
  'machineList',
  'exportToPDF',
  'ImageSelect',
  'uploadImage',
  'getStorage',
  'setStorage',
  'reportDate',
  'reportData',
  'getFilePrefix',
  'getCurrentCompanyId',
  'showAlarmTypeAxisLabels',
  'useFixedWeekTitle',
]

for (const capability of requiredHostCapabilities) {
  assert.match(host, new RegExp(`\\b${capability}\\b`))
}
```

运行测试，确认当前最小 host 因能力缺失而 RED。

- [ ] **Step 2: 完成两个宿主能力文件**

两个 `reportExportHost.js` 使用相同导入和对象结构，只有两个布尔值不同：

```js
import ImageSelect from '@/components/ImageSelect'
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api'
import { upLoadImg } from '@/http/manage-api'
import { getScreenData } from '@/http/videoStat/screenData'
import { getWarningTypeList, machineList } from '@/http/videoWarning/warning-api'
import { getStorage, setStorage } from '@/utils/index'
import * as reportDate from './test/dateUtils.js'
import { exportToPDF } from './test/pdfExport.js'
import * as reportData from './test/reportData.js'

export const reportCapabilities = Object.freeze({
  showAlarmTypeAxisLabels: false,
  useFixedWeekTitle: false,
})

export const reportExportHost = Object.freeze({
  getSpecifiedModule,
  getScreenData,
  getWarningTypeList,
  machineList,
  exportToPDF,
  ImageSelect,
  uploadImage: upLoadImg,
  getStorage,
  setStorage,
  reportDate,
  reportData,
  getFilePrefix() {
    const data = JSON.parse(localStorage.getItem('globalData'))
    return data?.minioFilePrefix || ''
  },
  getCurrentCompanyId() {
    return JSON.parse(sessionStorage.getItem('user')).companyId
  },
  ...reportCapabilities,
})
```

`link-front` 两个布尔值均为 `true`；`link-warning` 均为 `false`。不得在公共包读取 storage。

- [ ] **Step 3: 创建公共 ReportExportPage**

以 `link-warning/reportExport.vue` 为基线，完整复制模板和样式；执行以下替换：

- 删除所有宿主 API、日期、PDF、数据和本地子组件导入；
- 导入公共 `ReportForm.vue` 与 `ReportPreview.vue`；
- 增加必需 `host` Prop；
- `getSpecifiedModule` 改为 `this.host.getSpecifiedModule`；
- `getScreenData` 改为 `this.host.getScreenData`；
- `getWarningTypeList` 改为 `this.host.getWarningTypeList`；
- `machineList` 改为 `this.host.machineList`；
- 日期函数改为 `this.host.reportDate.<name>`；
- 七个数据函数改为 `this.host.reportData.<name>`；
- PDF 改为 `this.host.exportToPDF`；
- `JSON.parse(sessionStorage.getItem('user')).companyId` 改为 `this.host.getCurrentCompanyId()`；
- 给 ReportForm 和 ReportPreview 都传入 `:host="host"`；
- 其余 data、生命周期、方法顺序、请求时序、文案、错误处理、模板和样式保持不变。

公共页面 Prop：

```js
props: {
  host: {
    type: Object,
    required: true,
  },
},
```

- [ ] **Step 4: 导出页面并替换全部原路径包装层**

在 `shared-ui` 增加：

```json
"./forewarning-management/report-export": "./src/forewarning-management/report-export/ReportExportPage.vue"
```

两个 `reportExport.vue` 统一为：

```vue
<script>
import SharedReportExportPage from '@link/shared-ui/forewarning-management/report-export'
import { reportExportHost } from './reportExportHost.js'

export default {
  name: 'ReportExport',
  inheritAttrs: false,
  components: { SharedReportExportPage },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportExportPage
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
```

两个 `ReportForm.vue` 统一为：

```vue
<script>
import SharedReportForm from '@link/shared-ui/forewarning-management/report-export/form'
import { reportExportHost } from '../../reportExportHost.js'

export default {
  name: 'ReportForm',
  inheritAttrs: false,
  components: { SharedReportForm },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportForm
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
```

两个 `ReportPreview.vue` 统一为：

```vue
<script>
import SharedReportPreview from '@link/shared-ui/forewarning-management/report-export/preview'
import { reportExportHost } from '../../reportExportHost.js'

export default {
  name: 'ReportPreview',
  inheritAttrs: false,
  components: { SharedReportPreview },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportPreview
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
```

两个 `ReportTable.vue` 统一为：

```vue
<script>
export { default } from '@link/shared-ui/forewarning-management/report-export/table'
</script>
```

两个 `StatGrid.vue` 统一为：

```vue
<script>
import SharedStatGrid from '@link/shared-ui/forewarning-management/report-export/stat-grid'
import { reportCapabilities } from '../../reportExportHost.js'

export default {
  name: 'StatGrid',
  inheritAttrs: false,
  components: { SharedStatGrid },
  data: () => ({ reportCapabilities }),
}
</script>

<template>
  <SharedStatGrid
    v-bind="$attrs"
    :use-fixed-week-title="reportCapabilities.useFixedWeekTitle"
    v-on="$listeners"
  />
</template>
```

两个 `test/reportChart.js` 统一为：

```js
import { createReportChartMixin } from '@link/shared-ui/forewarning-management/report-export/chart-mixin'
import { reportCapabilities } from '../reportExportHost.js'

export default createReportChartMixin({
  showAlarmTypeAxisLabels: reportCapabilities.showAlarmTypeAxisLabels,
})
```

两个现有 `SkillTable.vue` 和 Task 1 已完成的 `reportData.js` 不再修改；迁移契约必须继续确认它们逐字一致。

- [ ] **Step 5: 运行完整迁移契约并确认 GREEN**

Run:

```bash
node --test scripts/migration/shared-warning-report-export.test.mjs
node --test scripts/migration/workspace-lockfile.test.mjs
pnpm test
cmp apps/link-warning/src/views/ForewarningManagement/reportExport.vue apps/link-front/src/views/ForewarningManagement/reportExport.vue
git diff --check
```

Expected: 报表迁移契约全部通过，workspace lock 契约通过，全量测试通过，两个页面适配器逐字一致。

- [ ] **Step 6: 运行冻结锁文件安装**

Run:

```bash
CI=true NPM_AUTH=verify pnpm install --frozen-lockfile
```

Expected: 输出 `Lockfile is up to date, resolution step is skipped` 并以 0 退出。若失败，先区分 importer 不一致和网络/缓存问题，不得手工删除无关 lock snapshot。

- [ ] **Step 7: 提交页面与宿主适配**

```bash
git add packages/shared-ui/package.json
git add packages/shared-ui/src/forewarning-management/report-export/ReportExportPage.vue
git add apps/link-warning/src/views/ForewarningManagement/reportExportHost.js
git add apps/link-front/src/views/ForewarningManagement/reportExportHost.js
git add apps/link-warning/src/views/ForewarningManagement/reportExport.vue
git add apps/link-front/src/views/ForewarningManagement/reportExport.vue
git add apps/link-warning/src/views/ForewarningManagement/components/ReportExport/ReportForm.vue
git add apps/link-front/src/views/ForewarningManagement/components/ReportExport/ReportForm.vue
git add apps/link-warning/src/views/ForewarningManagement/components/ReportExport/ReportPreview.vue
git add apps/link-front/src/views/ForewarningManagement/components/ReportExport/ReportPreview.vue
git add apps/link-warning/src/views/ForewarningManagement/components/ReportExport/ReportTable.vue
git add apps/link-front/src/views/ForewarningManagement/components/ReportExport/ReportTable.vue
git add apps/link-warning/src/views/ForewarningManagement/components/ReportExport/StatGrid.vue
git add apps/link-front/src/views/ForewarningManagement/components/ReportExport/StatGrid.vue
git add apps/link-warning/src/views/ForewarningManagement/test/reportChart.js
git add apps/link-front/src/views/ForewarningManagement/test/reportChart.js
git add scripts/migration/shared-warning-report-export.test.mjs
git commit -m "refactor: share warning report export page"
```

---

### Task 6: 完成双构建、来源审计和永久验证记录

**Files:**

- Modify: `docs/migration/shared-source-audit.json`
- Create: `docs/migration/shared-warning-report-export-verification.md`

**Interfaces:**

- Consumes: Task 1-5 的公共报表实现和宿主适配。
- Produces: 可重复的双构建、单一来源和来源基线证据。

- [ ] **Step 1: 分别执行两个生产构建**

Run:

```bash
NPM_AUTH=verify pnpm run build:warning
NPM_AUTH=verify pnpm run build:front
```

Expected: 两个命令分别以 0 退出；`dist/link-warning/index.html` 与 `dist/link-front/index.html` 都存在。

- [ ] **Step 2: 刷新并检查共享来源审计**

Run:

```bash
pnpm audit:shared
```

预期趋势（以实际 fresh audit 为准）：

- 新增的两端 `reportExportHost.js` 进入共同路径并保持不同；
- `reportExport.vue`、`ReportForm.vue`、`ReportPreview.vue`、`ReportTable.vue`、`StatGrid.vue`、`reportChart.js`、`reportData.js` 从 different 进入 identical；
- `SkillTable.vue` 继续位于 identical；
- 公共业务主体只命中 `packages/warning-feature/src/report` 与 `packages/shared-ui/src/forewarning-management/report-export`。

按当前基线推导的参考计数为：

```json
{
  "smaller": 478,
  "larger": 1867,
  "common": 471,
  "identical": 331,
  "different": 140,
  "smallerOnly": 7,
  "largerOnly": 1396
}
```

若 fresh audit 不同，必须解释具体文件变化，不得为了匹配参考值手改 JSON。

- [ ] **Step 3: 验证来源基线**

Run:

```bash
pnpm verify:sources
```

Expected: 输出 `来源目录未发生变化`。

- [ ] **Step 4: 创建永久验证文档**

`docs/migration/shared-warning-report-export-verification.md` 必须记录：

- 验证提交和日期；
- 公共业务模型、公共 UI 和宿主适配范围；
- 冻结安装结果；
- 模型、图表、迁移契约和全量测试数量；
- 两个生产构建的退出码、耗时、目录和文件数；
- fresh audit 的七项实际计数和八个目标原路径分类；
- `verify:sources` 输出；
- 现有非失败警告；
- 两处行为差异的验证结论。

- [ ] **Step 5: 最终验证并提交**

Run:

```bash
pnpm test
git diff --check
git status --short
```

Expected: 全量测试通过，diff check 无输出，状态只包含审计 JSON 和验证文档；`dist/` 不得进入提交。

Commit:

```bash
git add docs/migration/shared-source-audit.json
git add docs/migration/shared-warning-report-export-verification.md
git commit -m "docs: verify shared warning report export"
```

---

## Final Review Gate

所有任务完成后，对规格提交之后的完整 Git 范围执行一次独立整分支审查，必须检查：

- 七个报表数据函数是否真正只有公共工厂一份主体；
- 六个公共报表 UI/图表文件是否无宿主反向依赖；
- 所有原路径是否存在且只有 shim；
- Props、事件、标题差异、趋势图差异、请求时序和错误处理是否保持；
- `SkillTable` 是否继续复用现有公共组件；
- manifest、锁文件和冻结安装是否一致；
- 双构建和审计证据是否来自最终提交。

Critical 或 Important 问题必须修复并重新审查；Minor 记录到进度账本。最终再次执行 `pnpm test`、两个生产构建、`pnpm audit:shared`、`pnpm verify:sources` 和 `git diff --check` 后，才可进入分支合并选择。

## Follow-on Slice

本计划完成后，下一切片是 `ForewarningManagement` 的统计图表与静态分析页面，包括 `staticAnalyze.vue`、现有 ChartCard/ChartContainer 和各类 Warning 图表；不得在本计划中提前迁移。
