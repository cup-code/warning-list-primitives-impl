# 预警报表工具共享实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将两个应用重复的日期报表工具和 PDF 导出工具收敛到 `@link/warning-feature`，保持九个命名导出及全部现有调用路径不变。

**架构：** 日期工具由 `createReportDateUtils({ dateLib, weekOfYear })` 创建，应用 shim 负责现有 `moment -> dayjs` 别名和 locale import；PDF 工具由 `createReportPdfExporter({ html2canvas, html2pdf })` 创建，应用 shim 负责浏览器依赖。共享包只保存业务逻辑，不解析宿主别名。

**技术栈：** pnpm 10 Workspace、ESM、Day.js 1.11、html2canvas 1.4、html2pdf.js 0.10、Node.js `node:test`、Rsbuild。

## 全局约束

- 只修改 `/Users/jxz/project/new/front/project/link-shared`；原始 `link-front_new` 与 `link-warning` 保持只读。
- `dateUtils.js` 迁移前 SHA-256 为 `18421a4f7fd79c785ac833bb33fae93974d5e004dc88ab0effde9cf685fa41ce`。
- `pdfExport.js` 迁移前 SHA-256 为 `3512961fbbca8a30a123ddf38c13c8978c4ee34f267a1c911179045257056f6b`。
- 除依赖注入、函数工厂边界、移除函数 `export` 标记和应用 shim 外，两个文件的业务主体保持机械等价。
- 不修改 `reportExport.vue`、`ReportForm.vue`、`reportData.js` 或任何现有调用方。
- 不新增外部依赖，不迁移 `selectMachine.vue`、`realTimeWarning.js` 或 `stasticAnalyzeTest.js`。
- 最终必须通过全量测试、两个应用生产构建和来源摘要验证。

---

## 文件结构

- 创建 `packages/warning-feature/src/report/createReportDateUtils.js`：日期工具工厂。
- 创建 `packages/warning-feature/src/report/createReportDateUtils.test.mjs`：日期初始化、导出与结果契约。
- 创建 `packages/warning-feature/src/report/createReportPdfExporter.js`：PDF 工具工厂。
- 创建 `packages/warning-feature/src/report/createReportPdfExporter.test.mjs`：PDF 配置链与错误契约。
- 修改 `packages/warning-feature/package.json`：增加两个报表子路径导出。
- 修改根 `package.json`：将 report 测试加入 `test:warning-feature`。
- 修改两个应用的 `test/dateUtils.js`：注入日期依赖并重新导出八个函数。
- 修改两个应用的 `test/pdfExport.js`：注入 PDF 依赖并重新导出 `exportToPDF`。
- 创建 `scripts/migration/shared-warning-report-utils.test.mjs`：shim、包导出和宿主解耦测试。
- 创建 `docs/migration/shared-warning-report-utils-verification.md`：第五阶段验证记录。

### Task 1：共享日期报表工具

**文件：**
- 创建：`packages/warning-feature/src/report/createReportDateUtils.test.mjs`
- 创建：`packages/warning-feature/src/report/createReportDateUtils.js`
- 修改：`packages/warning-feature/package.json`
- 修改：`package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/test/dateUtils.js`
- 修改：`apps/link-warning/src/views/ForewarningManagement/test/dateUtils.js`

**接口：**
- 产出：`createReportDateUtils({ dateLib, weekOfYear })`；两个应用原文件继续提供八个命名导出。

- [ ] **Step 1：编写失败的日期工厂测试**

创建 `packages/warning-feature/src/report/createReportDateUtils.test.mjs`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import 'dayjs/locale/zh-cn.js'

import { createReportDateUtils } from './createReportDateUtils.js'

const exportNames = [
  'getCurrentWeekNumber', 'getCurrentYear', 'getWeekday',
  'getWeekDateStr', 'getCurrentWeekDates', 'getWeekRange',
  'getCurrentTitle', 'getDefaultReportTitle',
].sort()

test('日期工厂校验宿主依赖', () => {
  assert.throws(() => createReportDateUtils(), /dateLib/)
  assert.throws(() => createReportDateUtils({ dateLib: () => {} }), /dateLib\.locale/)
  const withoutExtend = Object.assign(() => {}, { locale() {} })
  assert.throws(() => createReportDateUtils({ dateLib: withoutExtend }), /dateLib\.extend/)
  assert.throws(() => createReportDateUtils({ dateLib: dayjs }), /weekOfYear/)
})

test('日期工厂注册中文 locale 和周插件并返回固定接口', () => {
  const calls = []
  const dateLib = Object.assign(() => {}, {
    locale: value => calls.push(['locale', value]),
    extend: value => calls.push(['extend', value]),
  })
  const plugin = () => {}
  const utils = createReportDateUtils({ dateLib, weekOfYear: plugin })
  assert.deepEqual(calls, [['locale', 'zh-cn'], ['extend', plugin]])
  assert.deepEqual(Object.keys(utils).sort(), exportNames)
})

test('日期工具保持自定义范围和标题契约', () => {
  const utils = createReportDateUtils({ dateLib: dayjs, weekOfYear })
  assert.deepEqual(utils.getWeekRange('custom', ['2026-01-02', '2026-01-08']), {
    alarmDateEnd: '2026-01-08',
    alarmDateStart: '2026-01-02',
  })
  assert.equal(utils.getWeekDateStr({
    alarmDateStart: '2026-01-05',
    alarmDateEnd: '2026-01-11',
  }), '2026年01月05日（星期一）00:00:00-01月11日 23:59:59（星期日）')
  assert.match(utils.getWeekday('01-05'), /^星期[一二三四五六日]$/)
  assert.equal(utils.getCurrentTitle(0), '今日')
  assert.equal(utils.getCurrentTitle('custom'), '本时段')
  assert.equal(utils.getDefaultReportTitle(1), '视频智能运营平台管理周报')
  assert.equal(utils.getDefaultReportTitle(), '视频智能运营平台管理运营报告')
})

test('当前时间相关函数保持返回形状', () => {
  const utils = createReportDateUtils({ dateLib: dayjs, weekOfYear })
  assert.equal(Number.isInteger(utils.getCurrentWeekNumber()), true)
  assert.equal(Number.isInteger(utils.getCurrentYear()), true)
  assert.match(utils.getWeekRange(1).alarmDateStart, /^\d{4}-\d{2}-\d{2} 00:00:00$/)
  assert.match(utils.getWeekRange(1).alarmDateEnd, /^\d{4}-\d{2}-\d{2} 23:59:59$/)
  assert.equal(utils.getCurrentWeekDates().length, 7)
})
```

- [ ] **Step 2：扩展共享功能测试脚本并验证红阶段**

将根 `package.json` 中脚本改为：

```json
"test:warning-feature": "node --test packages/warning-feature/src/video-warning/*.test.mjs packages/warning-feature/src/state/*.test.mjs packages/warning-feature/src/report/*.test.mjs"
```

运行：

```bash
NPM_AUTH=test pnpm test:warning-feature
```

预期：因 `createReportDateUtils.js` 不存在而失败；已有 13 个共享功能测试继续通过。

- [ ] **Step 3：机械创建日期工厂**

复制迁移前实现：

```bash
mkdir -p packages/warning-feature/src/report
cp apps/link-front/src/views/ForewarningManagement/test/dateUtils.js packages/warning-feature/src/report/createReportDateUtils.js
```

只执行以下结构变换：

1. 删除三个宿主 import。
2. 增加 `createReportDateUtils(dependencies = {})` 及依赖校验。
3. 用 `const moment = dateLib` 保持原业务主体变量名。
4. 保留原 `moment.locale('zh-cn')`、`moment.extend(weekOfYear)` 及全部函数体。
5. 删除八个函数声明前的 `export` 关键字。
6. 文件末尾返回八个函数并闭合工厂。

固定外壳：

```js
export function createReportDateUtils({ dateLib, weekOfYear } = {}) {
  if (typeof dateLib !== 'function') {
    throw new TypeError('createReportDateUtils requires dateLib to be a function')
  }
  if (typeof dateLib.locale !== 'function') {
    throw new TypeError('createReportDateUtils requires dateLib.locale to be a function')
  }
  if (typeof dateLib.extend !== 'function') {
    throw new TypeError('createReportDateUtils requires dateLib.extend to be a function')
  }
  if (typeof weekOfYear !== 'function') {
    throw new TypeError('createReportDateUtils requires weekOfYear to be a function')
  }
  const moment = dateLib
```

末尾固定返回：

```js
  return {
    getCurrentWeekNumber,
    getCurrentYear,
    getWeekday,
    getWeekDateStr,
    getCurrentWeekDates,
    getWeekRange,
    getCurrentTitle,
    getDefaultReportTitle,
  }
}
```

- [ ] **Step 4：增加包导出并替换日期 shim**

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./report-date-utils": "./src/report/createReportDateUtils.js"
```

两个应用的 `test/dateUtils.js` 必须逐字一致：

```js
import weekOfYear from 'dayjs/plugin/weekOfYear'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { createReportDateUtils } from '@link/warning-feature/report-date-utils'

const reportDateUtils = createReportDateUtils({ dateLib: moment, weekOfYear })

export const {
  getCurrentWeekNumber,
  getCurrentYear,
  getWeekday,
  getWeekDateStr,
  getCurrentWeekDates,
  getWeekRange,
  getCurrentTitle,
  getDefaultReportTitle,
} = reportDateUtils
```

- [ ] **Step 5：机械核对并运行测试**

通过 `git show <分支起点>:apps/link-front/src/views/ForewarningManagement/test/dateUtils.js` 读取基线。规范化时仅删除 import、工厂校验/返回外壳和函数声明的 `export` 关键字，然后逐字比较初始化语句、辅助函数及八个函数体。

```bash
NPM_AUTH=test pnpm test:warning-feature
NPM_AUTH=test pnpm test
```

预期：共享功能测试 17 项通过，全量测试 38 项通过；机械对照相等。

- [ ] **Step 6：提交 Task 1**

```bash
git add package.json packages/warning-feature apps/link-front/src/views/ForewarningManagement/test/dateUtils.js apps/link-warning/src/views/ForewarningManagement/test/dateUtils.js
git commit -m "refactor: share warning report date utilities"
```

### Task 2：共享 PDF 导出工具

**文件：**
- 创建：`packages/warning-feature/src/report/createReportPdfExporter.test.mjs`
- 创建：`packages/warning-feature/src/report/createReportPdfExporter.js`
- 修改：`packages/warning-feature/package.json`
- 修改：`apps/link-front/src/views/ForewarningManagement/test/pdfExport.js`
- 修改：`apps/link-warning/src/views/ForewarningManagement/test/pdfExport.js`
- 创建：`scripts/migration/shared-warning-report-utils.test.mjs`

**接口：**
- 产出：`createReportPdfExporter({ html2canvas, html2pdf }): { exportToPDF }`；两个应用原文件继续命名导出 `exportToPDF`。

- [ ] **Step 1：编写失败的 PDF 工厂测试**

创建 `packages/warning-feature/src/report/createReportPdfExporter.test.mjs`：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { createReportPdfExporter } from './createReportPdfExporter.js'

function createFixture({ canvasError, pdfError } = {}) {
  const calls = []
  const pdf = {
    internal: {
      getNumberOfPages: () => 2,
      pageSize: { getWidth: () => 210 },
    },
    setPage: page => calls.push(['setPage', page]),
    addImage: (...args) => calls.push(['addImage', ...args]),
    save: filename => calls.push(['save', filename]),
  }
  const canvas = {
    width: 100,
    height: 20,
    toDataURL: (...args) => { calls.push(['toDataURL', ...args]); return 'header-data' },
  }
  const html2canvas = async (...args) => {
    calls.push(['html2canvas', ...args])
    if (canvasError) throw canvasError
    return canvas
  }
  const chain = {
    set: (options) => { calls.push(['set', options]); return chain },
    from: (element) => { calls.push(['from', element]); return chain },
    toPdf: () => { calls.push(['toPdf']); return chain },
    get: async (name) => {
      calls.push(['get', name])
      if (pdfError) throw pdfError
      return pdf
    },
  }
  return { calls, html2canvas, html2pdf: () => chain }
}

test('PDF 工厂校验两个宿主依赖', () => {
  assert.throws(() => createReportPdfExporter(), /html2canvas/)
  assert.throws(() => createReportPdfExporter({ html2canvas() {} }), /html2pdf/)
})

test('带页眉导出保持配置、分页图片和保存契约', async () => {
  const fixture = createFixture()
  const { exportToPDF } = createReportPdfExporter(fixture)
  const element = { id: 'report' }
  const header = { id: 'header' }
  const result = await exportToPDF(element, header, 'report.pdf')
  assert.deepEqual(result, { success: true, message: 'PDF导出成功！' })
  const options = fixture.calls.find(call => call[0] === 'set')[1]
  assert.deepEqual(options.margin, [44, 20, 20, 20])
  assert.equal(options.filename, 'report.pdf')
  assert.deepEqual(fixture.calls.filter(call => call[0] === 'setPage'), [
    ['setPage', 1], ['setPage', 2],
  ])
  assert.equal(fixture.calls.filter(call => call[0] === 'addImage').length, 2)
  assert.deepEqual(fixture.calls.at(-1), ['save', 'report.pdf'])
})

test('无页眉和失败路径保持返回契约', async () => {
  const successFixture = createFixture()
  const success = createReportPdfExporter(successFixture)
  assert.deepEqual(await success.exportToPDF({}, null, 'plain.pdf'), {
    success: true, message: 'PDF导出成功！',
  })
  assert.equal(successFixture.calls.some(call => call[0] === 'html2canvas'), false)
  assert.equal(successFixture.calls.some(call => call[0] === 'addImage'), false)

  const error = new Error('pdf failed')
  const failure = createReportPdfExporter(createFixture({ pdfError: error }))
  const originalError = console.error
  console.error = () => {}
  try {
    assert.deepEqual(await failure.exportToPDF({}, null, 'failed.pdf'), {
      success: false, message: 'PDF导出失败，请重试！', error,
    })
  }
  finally {
    console.error = originalError
  }
})
```

- [ ] **Step 2：编写失败的迁移契约测试**

创建 `scripts/migration/shared-warning-report-utils.test.mjs`，精确断言：

- 两个日期 shim 逐字一致，静态 import 来源仅为 `dayjs/plugin/weekOfYear`、`moment`、`moment/locale/zh-cn`、`@link/warning-feature/report-date-utils`。
- 日期 shim 精确命名导出八个函数。
- 两个 PDF shim 逐字一致，静态 import 来源仅为 `html2canvas`、`html2pdf.js`、`@link/warning-feature/report-pdf-export`。
- PDF shim 命名导出 `exportToPDF`。
- `packages/warning-feature/package.json` 精确导出两个 report 子路径。
- 两个共享工厂不包含 `@/`、`apps/`、`moment` import、HTML/PDF 包 import、router 或 Store 引用。

运行：

```bash
NPM_AUTH=test pnpm test
```

预期：因 PDF 工厂、包导出和 PDF shim 尚未实现而失败；Task 1 测试继续通过。

- [ ] **Step 3：机械创建 PDF 工厂**

复制原文件：

```bash
cp apps/link-front/src/views/ForewarningManagement/test/pdfExport.js packages/warning-feature/src/report/createReportPdfExporter.js
```

只执行以下结构变换：删除两个 import；增加依赖校验与工厂；删除 `exportToPDF` 前的 `export`；保留函数体逐字不变；末尾返回 `{ exportToPDF }`。

固定外壳：

```js
export function createReportPdfExporter({ html2canvas, html2pdf } = {}) {
  if (typeof html2canvas !== 'function') {
    throw new TypeError('createReportPdfExporter requires html2canvas to be a function')
  }
  if (typeof html2pdf !== 'function') {
    throw new TypeError('createReportPdfExporter requires html2pdf to be a function')
  }

  // 原 exportToPDF 函数体位于此处

  return { exportToPDF }
}
```

- [ ] **Step 4：增加包导出并替换 PDF shim**

在 `packages/warning-feature/package.json` 的 `exports` 中增加：

```json
"./report-pdf-export": "./src/report/createReportPdfExporter.js"
```

两个应用的 `test/pdfExport.js` 必须逐字一致：

```js
import html2canvas from 'html2canvas'
import html2pdf from 'html2pdf.js'
import { createReportPdfExporter } from '@link/warning-feature/report-pdf-export'

const { exportToPDF } = createReportPdfExporter({ html2canvas, html2pdf })

export { exportToPDF }
```

- [ ] **Step 5：机械核对并运行全部测试**

通过 `git show <分支起点>:apps/link-front/src/views/ForewarningManagement/test/pdfExport.js` 读取基线。规范化时仅删除 import、工厂外壳和 `export` 标记，逐字比较 `exportToPDF` 的注释与函数体。

```bash
NPM_AUTH=test pnpm test:warning-feature
NPM_AUTH=test pnpm test:migration
NPM_AUTH=test pnpm test
```

预期：共享功能测试 20 项、迁移测试 23 项、全量测试 43 项全部通过；两个业务主体机械对照相等。

- [ ] **Step 6：提交 Task 2**

```bash
git add packages/warning-feature apps/link-front/src/views/ForewarningManagement/test/pdfExport.js apps/link-warning/src/views/ForewarningManagement/test/pdfExport.js scripts/migration/shared-warning-report-utils.test.mjs
git commit -m "refactor: share warning report PDF utilities"
```

### Task 3：双构建、审计与来源验证

**文件：**
- 更新（若内容变化）：`docs/migration/shared-source-audit.json`
- 更新：`docs/migration/source-after.json`
- 创建：`docs/migration/shared-warning-report-utils-verification.md`

**接口：**
- 消费：两个共享工厂与四个应用 shim。
- 产出：测试、构建、机械对照、审计和来源只读证据。

- [ ] **Step 1：运行生产构建与共享审计**

```bash
NPM_AUTH=verify pnpm build
pnpm audit:shared
```

预期：两个应用构建成功，证明应用侧 `moment -> dayjs` 别名、locale、Canvas 与 PDF 依赖可通过 shim 工作。两个目标路径仍位于 `identicalFiles`；审计无文本差异时准确说明比较器语义。

- [ ] **Step 2：重新生成并比较来源摘要**

```bash
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\\n') })" > docs/migration/source-after.json
pnpm verify:sources
```

预期输出：`来源目录未发生变化`。

- [ ] **Step 3：创建中文验证记录**

`docs/migration/shared-warning-report-utils-verification.md` 必须记录：

- 两个共享工厂、包导出及应用 shim 路径。
- 八个日期导出和一个 PDF 导出的兼容结果。
- 日期与 PDF 业务主体机械对照方法、字节数和摘要。
- 实际测试数量、失败数、两次双构建结果和耗时。
- 审计 JSON 是否变化及原因。
- 两个来源目录文件数和前后摘要。
- 未纳入范围。

- [ ] **Step 4：执行最终验证**

```bash
NPM_AUTH=verify pnpm test
NPM_AUTH=verify pnpm build
pnpm verify:sources
git diff --check
git status --short
```

预期：43 项测试无失败、两个生产构建成功、来源未变化、`git diff --check` 无输出，状态只包含预期验证材料。

- [ ] **Step 5：提交验证材料**

```bash
git add docs/migration/shared-source-audit.json docs/migration/source-after.json docs/migration/shared-warning-report-utils-verification.md
git commit -m "docs: verify shared warning report utilities"
```

## 计划自检

- 规格覆盖：两个工厂、四个 shim、九个导出、依赖校验、机械等价、双构建和来源只读均有步骤。
- 占位符检查：路径、接口、测试数据、命令与预期结果均已明确。
- 接口一致性：包导出、工厂名、依赖名和应用命名导出逐项对应。
- 范围检查：不修改任何报表调用方或下一阶段候选文件。
