# 预警报表页面单一来源设计

## 背景

`link-warning` 与 `link-front` 都包含 `views/ForewarningManagement/reportExport.vue`、`components/ReportExport/**` 以及对应的报表数据和图表辅助逻辑。当前两端分别维护这些文件，修改一端不会同步到另一端，不符合预警子集只保留一份共同业务源码的目标。

本设计是 `ForewarningManagement` 第一批迁移的第二个垂直切片。范围只覆盖两端共有的预警报表导出页面，不包含 `link-front` 独有的 `reportDesign`、事故报告、设备周报或其他业务报表。

## 已确认的现状

- `reportExport.vue` 的脚本和模板语义一致，差异主要是格式。
- `ReportForm.vue`、`ReportPreview.vue`、`ReportTable.vue` 的共同主体一致；两端 `ReportExport/SkillTable.vue` 已经是 `@link/shared-ui/forewarning-management/skill-table` 的相同 shim。
- 现有日期和 PDF 能力已经通过 `@link/warning-feature/report-date-utils` 与 `@link/warning-feature/report-pdf-export` 收敛为公共工厂，两个应用原路径只负责宿主依赖装配。
- 原页面路径被两个应用的菜单动态加载逻辑使用，必须继续存在。
- 两端有两处需要保留的行为差异：
  - `StatGrid` 标题在 `link-warning` 使用当前 `timeTitle`，在 `link-front` 固定显示“本周报告预警实况”；
  - `link-front` 的预警类型排名柱状图额外配置完整横轴标签，`link-warning` 不配置；
- `reportData.js` 中 `alarmLive.cameraNormal` 与 `alarmLive?.cameraNormal` 的写法不同，但两端都先执行 `screenData.alarmLive || {}`，因此该差异没有运行时效果，迁移时统一为公共实现。

## 目标

- 预警报表页面、表单、预览、表格、技能表和统计网格的共同实现只保留一份。
- 报表数据转换和图表配置逻辑只保留一份，并通过明确的能力参数保留两端差异。
- 两个应用继续保留所有原文件路径、组件名称、Props、事件、菜单路径和动态导入兼容性。
- 宿主 API、上传、存储、日期、PDF、图片组件和路径处理能力通过适配器注入。
- 共享包不得引用 `apps/**`、宿主 `@/`、Router、宿主 Store、`sessionStorage` 或未经注入的全局业务实现。
- `build:warning` 与 `build:front` 继续独立执行并输出到各自目录。

## 非目标

- 不迁移 `link-front` 独有的 `views/reportDesign/**`、事故报告、设备报表和其他名称包含 report 的模块。
- 不修改报表页面的视觉布局、业务文案、请求时序、缓存周期、PDF 内容或错误提示。
- 不借本切片统一两处已有行为差异。
- 不新增第三方依赖。
- 不删除两个应用中的原路径文件。

## 方案选择

### 采用：单一共享页面与宿主能力对象

公共 UI 接收一个结构明确的 `host` 能力对象。两个应用的原路径适配器只导入各自宿主依赖、组装能力对象并渲染公共组件。公共页面将所需能力继续传递给公共表单和预览组件。

该方案使宿主边界集中、适配器足够薄，并避免为十余个函数和组件分别增加零散 Props。

### 未采用：大量独立 Props

每个宿主函数和组件都可以作为单独 Prop 传入，但接口会分散在页面和多个子组件之间，新增能力时容易漏传。

### 未采用：每个应用创建组件工厂

组件工厂可以在模块加载时绑定宿主依赖，但会增加 Vue SFC 装配和调试复杂度，也不利于保持原路径适配器直观可读。

## 架构

### 公共业务逻辑

在 `packages/warning-feature/src/report/` 中新增报表数据模型工厂。它负责现有 `reportData.js` 中的统计列表、趋势表、类型排名、摄像头排名、等级排名和报告文案转换。

工厂接收日期能力，而不是应用名称或宿主模块：

- `dateLib`：兼容现有 `moment(value)` 调用的日期工厂；
- `getWeekday`：保持现有日期到星期文案的转换。

工厂返回与原 `reportData.js` 完全相同的七个命名函数。两个应用原 `reportData.js` 分别用自身的 `moment` 和公共日期 shim 实例化工厂，再重新导出这些函数；公共页面通过宿主能力对象消费该函数集合。

日期和 PDF 继续使用现有公共工厂，不重复实现。

### 公共 UI

在 `packages/shared-ui/src/forewarning-management/report-export/` 中维护：

- `ReportExportPage.vue`
- `ReportForm.vue`
- `ReportPreview.vue`
- `ReportTable.vue`
- `StatGrid.vue`
- `reportChartMixin.js`

`ReportPreview.vue` 继续复用现有 `@link/shared-ui/forewarning-management/skill-table`。`reportChartMixin.js` 读取宿主组件声明的 `showAlarmTypeAxisLabels` Prop，保留两端预警类型排名横轴配置差异。`StatGrid` 通过 `useFixedWeekTitle` Prop 选择固定“本周”或动态 `timeTitle`，不读取应用身份。

### 宿主能力对象

`ReportExportPage` 接收的 `host` 至少包含：

- 请求能力：`getSpecifiedModule`、`getScreenData`、`getWarningTypeList`、`machineList`；
- 导出能力：`exportToPDF`；
- 表单能力：`ImageSelect`、`uploadImage`、`getStorage`、`setStorage`、`getWeekRange`；
- 展示能力：`getFilePrefix`，直接返回当前 MinIO 文件前缀；
- 数据能力：`reportData`，包含原 `reportData.js` 的七个命名函数；
- 当前公司能力：`getCurrentCompanyId`，由适配器封装宿主 `sessionStorage` 读取；
- 行为能力：`showAlarmTypeAxisLabels`、`useFixedWeekTitle`。

公共组件在开发和测试环境中对必需能力进行明确校验，缺失时给出可定位的错误。能力对象不包含 Router 或 Store。

### 应用适配器

两个应用保留：

- `views/ForewarningManagement/reportExport.vue`
- `views/ForewarningManagement/components/ReportExport/ReportForm.vue`
- `ReportPreview.vue`
- `ReportTable.vue`
- `SkillTable.vue`
- `StatGrid.vue`
- `views/ForewarningManagement/test/reportChart.js`
- `views/ForewarningManagement/test/reportData.js`

原页面文件组装完整 `host` 并渲染 `ReportExportPage`。原子组件路径保留透明包装层，分别注入自身所需的宿主能力和行为默认值；已有 `SkillTable.vue` shim 保持不变。适配器把原 `commonMixin.getPrefix()` 的副作用封装为无状态 `getFilePrefix()`，公共组件自行保存返回值。`reportChart.js` 包装公共 mixin 并为应用提供原有 `showAlarmTypeAxisLabels` 默认值；`reportData.js` 从公共工厂创建并重新导出原函数集合。所有 shim 都不得继续保存第二份业务主体。

## 数据流

1. 菜单仍动态加载应用原路径 `views/ForewarningManagement/reportExport`。
2. 原路径适配器从宿主模块导入 API、上传、存储、日期、PDF 和图片组件，并构造 `host`。
3. 公共页面调用注入的 API 获取配置、技能、设备和屏幕统计数据。
4. 公共报表数据模型把响应转换为预览 Props、表格数据和报告文案。
5. 公共预览和图表逻辑根据两个能力开关重现对应应用的原有行为。
6. PDF 导出通过注入的 `exportToPDF` 执行，成功和失败提示保持原样。

## 兼容性

- `ReportExport` 组件名称保持不变。
- `ReportForm` 的 `update-field`、`search`、`reset`、`export-pdf` 事件保持不变。
- 所有原有 Props、默认值、必填规则和 `.sync` 数据流保持不变。
- 原路径适配器不增加额外可见 DOM。
- 两端现有两处行为差异由能力开关固定在适配器中，不由运行时应用名称判断。

## 测试与验收

### 纯逻辑测试

- 七个数据转换函数的结果与迁移前一致。
- `alarmLive` 缺失时保持两端原有的空对象回退结果。
- 日期工厂和星期转换能力按原调用顺序执行。
- 预警类型排名横轴标签和标题模式分别覆盖两套能力组合。

### 迁移契约

- 公共包导出所有报表组件和业务模型。
- 公共源码不包含 `@/`、`apps/`、Router、Store 或 `sessionStorage`。
- 两端原路径全部存在，并且只包含适配或转发逻辑。
- 两端适配器明确提供全部必需能力和各自行为开关。
- Props、事件和组件名称受到契约保护。
- `shared-ui` 的 manifest 与锁文件 importer 保持完整一致。

### 集成门禁

- 冻结锁文件安装成功。
- 全量测试通过。
- `build:warning` 和 `build:front` 分别成功，并检查各自产物目录。
- `audit:shared` 刷新后，目标原路径适配器进入相同文件集合；业务主体只存在于公共包。
- `verify:sources` 证明外部来源基线未变化。
- `git diff --check` 和独立代码审查通过。

## 风险与缓解

- **能力对象过大：** 只纳入当前页面实际使用的能力，并由迁移契约锁定键集合。
- **原组件路径被隐式引用：** 所有现有路径继续保留 shim，不只保留页面入口。
- **Vue 2 事件或 `.sync` 丢失：** 适配器使用无额外 DOM 的透明转发，并增加组件行为测试。
- **差异被错误统一：** 两个能力开关分别测试，并在两个适配器中显式取值。
- **锁文件再次不完整：** 使用现有 manifest 驱动的 importer 契约和冻结安装验证。
- **构建产物互相污染：** 两个生产构建独立执行并检查固定输出目录。

## 后续

本切片完成后，继续 `ForewarningManagement` 的统计图表与静态分析页面；之后迁移业务表单和列表页面。只有第一批全部完成并通过双构建后，才进入公共组件与工具、静态资源批次。
