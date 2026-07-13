# 预警报表工具共享验证

## 验收环境

- 执行日期：2026-07-13
- Node.js：v18.20.3
- pnpm：10.14.0
- 迁移前基点：`77b8f32`
- 共享实现：`packages/warning-feature/src/report`
- 应用接入：两个应用保留原报表工具路径作为兼容 shim

## 共享路径、包导出与应用 shim

日期工具工厂位于
`packages/warning-feature/src/report/createReportDateUtils.js`，由
`@link/warning-feature/report-date-utils` 导出。PDF 导出工厂位于
`packages/warning-feature/src/report/createReportPdfExporter.js`，由
`@link/warning-feature/report-pdf-export` 导出。

两个应用均保留原路径以兼容现有引用，共四个 shim：

- `apps/link-front/src/views/ForewarningManagement/test/dateUtils.js`
- `apps/link-warning/src/views/ForewarningManagement/test/dateUtils.js`
- `apps/link-front/src/views/ForewarningManagement/test/pdfExport.js`
- `apps/link-warning/src/views/ForewarningManagement/test/pdfExport.js`

两个日期 shim 逐字一致，继续注入 `moment`、中文 locale 和
`dayjs/plugin/weekOfYear`；两个 PDF shim 也逐字一致，继续注入
`html2canvas` 与 `html2pdf.js`。共享工厂不直接引用应用别名或宿主实现，应用现有
调用路径和依赖边界均保持不变。

## 导出兼容结果

日期 shim 保留原有八个命名导出：

| 导出 | 兼容验证结果 |
| --- | --- |
| `getCurrentWeekNumber` | 返回整数周数 |
| `getCurrentYear` | 返回整数年份 |
| `getWeekday` | 返回中文星期文本 |
| `getWeekDateStr` | 自定义起止日期保持原中文日期范围格式 |
| `getCurrentWeekDates` | 返回本周 7 个日期 |
| `getWeekRange` | 自定义范围、周起止时间和字段结构保持不变 |
| `getCurrentTitle` | 今日及自定义时段标题保持不变 |
| `getDefaultReportTitle` | 日报、周报、月报及兜底标题保持不变 |

PDF shim 保留一个命名导出 `exportToPDF`。测试覆盖依赖校验、
`set -> from -> toPdf -> get` 调用顺序、页眉 Canvas 渲染、两页页眉图片插入、
文件保存、无页眉路径和失败返回契约，结果均通过。

## 测试与双构建

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `NPM_AUTH=verify pnpm test` | 迁移/审计测试 23 项、共享预警功能测试 20 项，共 43 项通过，失败 0 项 | 0 |
| 首次 `NPM_AUTH=verify pnpm build` | `link-front` 32.1 秒、`link-warning` 7.58 秒，整体实际耗时 50.17 秒 | 0 |
| 最终 `NPM_AUTH=verify pnpm build` | `link-front` 20.0 秒、`link-warning` 4.82 秒，整体实际耗时 32.04 秒 | 0 |

两次构建均顺序完成两个应用的生产构建，证明应用侧 `moment -> dayjs` 别名、
中文 locale、Canvas 与 PDF 依赖能够通过 shim 编译。构建产物分别位于
`dist/link-front` 和 `dist/link-warning`。输出包含仓库既有的 `resolutions` 配置
位置和 `cleanDistPath` 警告，测试还包含 Node 18 既有的 `buffer.File` 实验性
警告；这些警告均未导致失败。

## 日期业务主体机械对照

机械对照从分支基点 `77b8f32` 读取
`apps/link-front/src/views/ForewarningManagement/test/dateUtils.js`。基线侧删除三个
宿主 import，并仅移除八个函数的 `export` 标记；共享侧删除依赖校验、
`const moment = dateLib`、工厂声明和返回接口外壳。两侧都从
`moment.locale('zh-cn')` 开始，覆盖 locale/插件初始化、内部 helper、注释和八个
函数主体；比较前仅统一移除文件末尾空白。

- 结果：逐字一致
- 两侧大小：2,903 字节
- 两侧 SHA-256：
  `ef1a955e815440752e482bd643630be009977168bfe7191da9cc6bc9fc23e948`

## PDF 业务主体机械对照

机械对照从分支基点 `77b8f32` 读取
`apps/link-front/src/views/ForewarningManagement/test/pdfExport.js`。基线侧删除两个
宿主 import，并仅移除 `exportToPDF` 的 `export` 标记；共享侧删除依赖校验、工厂
声明和返回接口外壳。两侧比较范围均从函数 JSDoc 开始，覆盖完整注释和
`exportToPDF` 函数主体；比较前仅统一移除文件末尾空白。

- 结果：逐字一致
- 两侧大小：1,898 字节
- 两侧 SHA-256：
  `3ae02a07ff2e691e05483e8245e46d3fa3f7a49e9002377a17a37f95649f1f03`

## 共享来源审计

执行 `pnpm audit:shared` 成功，审计计数为 `identical` 323、`different` 147、
`common` 470。两个应用的
`views/ForewarningManagement/test/dateUtils.js` 和
`views/ForewarningManagement/test/pdfExport.js` 均位于 `identicalFiles`。

本次重生成前后，`docs/migration/shared-source-audit.json` 的 SHA-256 均为
`871139ec1cb5d9874058c9683a519d755077cd90d839b04450347bf75552ed99`，逐字比较
也相同，因此 Git 中没有该文件的文本差异。这不表示审计提前记录了共享工厂：
比较器只按两个应用的同名文件内容是否相同来分类。迁移前两份业务实现相同，
迁移后两份 shim 仍相同，所以目标路径继续位于 `identicalFiles`；分类、计数和
稳定排序后的 JSON 均未变化。

## 外部来源只读校验

本次重新读取两个外部来源目录生成 `docs/migration/source-after.json`，再执行
`pnpm verify:sources` 与 `docs/migration/source-before.json` 比较。

| 来源 | 文件数 | 基线摘要 | 迁移后摘要 | 结果 |
| --- | ---: | --- | --- | --- |
| `front` | 2426 | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | 一致 |
| `warning` | 576 | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | 一致 |

比较命令退出码为 0，输出：`来源目录未发生变化`。重生成前后的
`source-after.json` 也逐字一致，文件 SHA-256 均为
`b331c49662500dfda6a197b96b2a37e3cb6b3d1bc318880e1543b761fcfa040c`。
来源项目仅被摘要工具读取，未被本次迁移修改。

## 结论

两个共享工厂已通过包子路径导出，四个应用 shim 保留九个命名导出和宿主依赖
边界。43 项测试、两次双应用生产构建、机械对照、共享审计和外部来源只读校验
均通过。

## 未纳入范围

报表调用页面、报表界面行为、其他 ForewarningManagement 文件及下一阶段候选
文件均未修改；本次只生成验证材料，不改动两个外部来源项目。
