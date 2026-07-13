# 预警报表工具共享设计

## 背景

`apps/link-front` 与 `apps/link-warning` 各自保存内容完全一致的 `ForewarningManagement/test/dateUtils.js` 和 `ForewarningManagement/test/pdfExport.js`。日期工具被报表页、报表表单及报表数据逻辑引用，PDF 工具被报表导出流程引用。继续维护两份实现会使日期格式、时间范围和 PDF 配置变更需要同步两个应用。

日期工具当前通过构建别名将 `moment` 解析为 Day.js，并注册 `weekOfYear` 与中文 locale；PDF 工具直接依赖浏览器侧 `html2canvas` 和 `html2pdf.js`。共享包不能依赖应用别名或隐式提升的宿主依赖，因此两个工具都使用依赖注入工厂。

所有改动仅发生在 `/Users/jxz/project/new/front/project/link-shared`。原始项目 `/Users/jxz/project/new/front/project/link-front_new` 与 `/Users/jxz/project/new/front/project/link-warning` 保持只读。

## 目标

- 让两个应用共用一份日期报表逻辑和一份 PDF 导出逻辑。
- 保持现有九个命名导出、函数参数、返回格式和 Promise 行为不变。
- 保持 `reportExport.vue`、`ReportForm.vue`、`reportData.js` 的原相对导入路径不变。
- 显式隔离日期库、插件、Canvas 与 PDF 运行时依赖。
- 保持两个应用可独立测试和生产构建。

## 非目标

- 不修改报表页面、表单、表格、数据结构或视觉样式。
- 不替换 Day.js、`html2canvas` 或 `html2pdf.js`。
- 不修正现有日期文案或 PDF 配置中的潜在产品问题。
- 不迁移 `selectMachine.vue`、`realTimeWarning.js` 或 `stasticAnalyzeTest.js`。
- 不新增外部依赖。

## 架构

### 日期工具工厂

共享实现放入 `packages/warning-feature/src/report/createReportDateUtils.js`，由 `@link/warning-feature/report-date-utils` 导出：

```js
createReportDateUtils({ dateLib, weekOfYear })
```

工厂校验 `dateLib` 是可调用对象，具有 `locale` 和 `extend` 方法，并校验 `weekOfYear` 存在。初始化时继续调用：

```js
dateLib.locale('zh-cn')
dateLib.extend(weekOfYear)
```

工厂返回当前八个命名函数：

- `getCurrentWeekNumber`
- `getCurrentYear`
- `getWeekday`
- `getWeekDateStr`
- `getCurrentWeekDates`
- `getWeekRange`
- `getCurrentTitle`
- `getDefaultReportTitle`

两个应用原 `test/dateUtils.js` 继续导入 `dayjs/plugin/weekOfYear`、`moment` 和 `moment/locale/zh-cn`，调用共享工厂后以原名称导出八个函数。应用构建别名仍负责把 `moment` 解析到当前日期实现，共享包不直接感知该别名。

### PDF 导出工厂

共享实现放入 `packages/warning-feature/src/report/createReportPdfExporter.js`，由 `@link/warning-feature/report-pdf-export` 导出：

```js
createReportPdfExporter({ html2canvas, html2pdf })
```

工厂校验两个依赖均为函数，并返回：

```js
{ exportToPDF }
```

`exportToPDF(element, headerElement, filename)` 保持当前行为：

- 使用当前 A4、纵向、图片质量、分页和默认边距配置。
- 页眉存在时通过 `html2canvas` 生成 JPEG，并按高度调整上边距。
- 通过现有 `html2pdf().set(...).from(...).toPdf().get('pdf').save()` 链生成文件。
- 为每页写入页眉图片。
- 保持默认文件名、成功返回值、错误日志和失败返回值不变。

两个应用原 `test/pdfExport.js` 导入本地 `html2canvas` 与 `html2pdf.js`，调用共享工厂并重新导出 `exportToPDF`。

## 兼容契约

- 两个应用的原工具文件路径继续存在。
- 两个应用对应 shim 逐字一致。
- 日期 shim 的八个命名导出与 PDF shim 的一个命名导出保持不变。
- 所有现有调用方无需修改。
- 日期工具的 locale、插件初始化时机保持为模块加载时执行一次。
- PDF 工具继续只在调用 `exportToPDF` 时访问 DOM 元素和浏览器依赖。
- 共享源码不得包含 `@/`、`apps/`、应用构建配置或宿主 Store/Router 引用。

## 数据流

应用加载日期 shim 时，宿主模块加载当前日期实现和 locale，随后创建共享日期工具集合并导出函数。调用方仍从原相对路径调用函数，实际计算发生在共享工厂闭包中。

用户触发 PDF 导出时，报表页仍调用原路径导出的 `exportToPDF`。共享函数使用宿主注入的 Canvas/PDF 实现渲染页眉、生成分页 PDF 并保存文件。

## 错误处理

- 工厂初始化时对缺失或类型错误的依赖抛出包含依赖名称的 `TypeError`。
- 日期函数保持当前参数处理和异常传播方式。
- PDF 导出保持当前 `try/catch`、控制台错误记录及返回契约，不吞掉新的错误类型或改变调用方判断。

## 测试与验证

### 日期工具

- 固定八个导出名称。
- 验证 `locale('zh-cn')` 和 `extend(weekOfYear)` 各执行一次。
- 使用可控日期替身覆盖当前周数、年份、星期文案、日/周/月范围、标题和默认标题。
- 固定缺少 `dateLib`、`locale`、`extend` 或插件时的错误信息。
- 对迁移前业务主体与工厂主体做机械等价检查。

### PDF 工具

- 固定 `exportToPDF` 导出。
- 使用 fake Canvas 与 fake `html2pdf` 链验证配置、调用顺序、页眉图片、动态上边距和保存动作。
- 覆盖无页眉、默认文件名、成功和失败返回路径。
- 固定缺少两个依赖时的错误信息。
- 对迁移前业务主体与工厂主体做机械等价检查。

### 迁移与集成

- 验证两个应用的日期 shim 和 PDF shim 分别逐字一致。
- 验证 shim 只导入允许的共享入口和宿主依赖，并重新导出全部九个函数。
- 验证共享源码不存在宿主耦合。
- 运行全量测试、两个应用生产构建、共享源审计与来源摘要比较。

## 风险与控制

- **日期别名在共享包失效：** 日期实现只由应用 shim 导入，共享包仅接收 `dateLib`，不解析 `moment`。
- **模块初始化副作用变化：** shim 在模块加载时立即调用工厂，保持 locale 与插件注册时机。
- **PDF 链式调用被改写：** 使用记录每一步的 fake chain 固定配置与顺序，并做迁移前后机械对照。
- **命名导出遗漏：** 迁移测试精确比较八个日期导出和一个 PDF 导出。
- **范围扩张：** 不改动任何现有调用页面或下一阶段候选文件。

## 完成标准

- 日期逻辑和 PDF 逻辑各自只有一份业务实现，位于 `packages/warning-feature`。
- 两个应用原路径与九个命名导出继续可用。
- 共享包不依赖宿主别名或应用源码。
- 契约测试与全量测试全部通过。
- 两个应用生产构建成功。
- 原始来源项目摘要不变。
- 中文验证文档准确记录机械对照、测试、构建、审计与来源校验结果。
