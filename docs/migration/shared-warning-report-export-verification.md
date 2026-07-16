# 预警报表导出共享验证

## 验证环境与范围

- 验证提交：`623bd291ab49aca50b1a37933256c39add917c1c`
- 验证日期：2026-07-16（Asia/Shanghai）
- Node.js：v18.20.3
- pnpm：10.14.0
- 公共业务模型：`packages/warning-feature/src/report/createReportDataModel.js`，通过 `@link/warning-feature/report-data` 提供七个报表数据函数。
- 公共 UI：`packages/shared-ui/src/forewarning-management/report-export` 下的页面、表单、预览、表格、统计网格和图表 mixin；`SkillTable` 继续复用既有 `@link/shared-ui/forewarning-management/skill-table`。
- 宿主适配：两个应用保留八个原路径薄 wrapper/shim，并分别通过 `reportExportHost.js` 注入 API、存储、日期、PDF 和差异能力。

## 冻结安装与测试

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `CI=true NPM_AUTH=verify pnpm install --frozen-lockfile` | `Lockfile is up to date, resolution step is skipped`；1803 个包安装完成；墙钟 24.09 秒 | 0 |
| 报表数据模型测试 | 5/5 通过 | 0 |
| 图表差异测试 | 2/2 通过 | 0 |
| 报表导出迁移契约 | 11/11 通过 | 0 |
| `NPM_AUTH=verify pnpm test` | migration/audit 52/52、warning-feature 29/29、shared-ui 2/2；合计 83/83 通过，失败 0 | 0 |

冻结安装首次在受限网络内重建 `node_modules` 时，项目私有 npm 镜像域名解析为 `ENOTFOUND`；该次重试被中止，不作为成功证据。随后在获准的网络环境中按同一命令重新执行并成功，锁文件未发生变化。

## 独立生产构建与产物

| 应用 | 命令 | Rsbuild 耗时 | 墙钟耗时 | 产物目录 | 文件数 | `index.html` | 退出码 |
| --- | --- | ---: | ---: | --- | ---: | --- | ---: |
| link-warning | `NPM_AUTH=verify pnpm run build:warning` | 16.6 秒 | 20.99 秒 | `dist/link-warning` | 199 | 存在 | 0 |
| link-front | `NPM_AUTH=verify pnpm run build:front` | 61.3 秒 | 84.95 秒 | `dist/link-front` | 2400 | 存在 | 0 |

文件数使用 `find <目录> -type f` 在两个构建均完成后统计。`dist/` 仅作为本地验收产物，不纳入提交。

## fresh 共享来源审计

`pnpm audit:shared` 退出码为 0，并按实际结果刷新 `docs/migration/shared-source-audit.json`：

| 分类 | 实际数量 |
| --- | ---: |
| smaller | 478 |
| larger | 1867 |
| common | 471 |
| identical | 331 |
| different | 140 |
| smallerOnly | 7 |
| largerOnly | 1396 |

相对上一版审计，两个应用各新增 `reportExportHost.js`，因此 `smaller`、`larger` 和 `common` 各增加 1；该宿主适配仅两个能力布尔值不同，进入 `differentFiles`。原先位于 `differentFiles` 的七个报表原路径迁移为逐字一致 shim，令 `identical` 增加 7、`different` 减少 6（新增 host 抵消 1）。`smallerOnly` 和 `largerOnly` 不变。该结果与 Task 6 参考趋势一致，未手工调整计数。

八个目标原路径全部位于 `identicalFiles`：

- `views/ForewarningManagement/reportExport.vue`
- `views/ForewarningManagement/components/ReportExport/ReportForm.vue`
- `views/ForewarningManagement/components/ReportExport/ReportPreview.vue`
- `views/ForewarningManagement/components/ReportExport/ReportTable.vue`
- `views/ForewarningManagement/components/ReportExport/StatGrid.vue`
- `views/ForewarningManagement/components/ReportExport/SkillTable.vue`
- `views/ForewarningManagement/test/reportChart.js`
- `views/ForewarningManagement/test/reportData.js`

`views/ForewarningManagement/reportExportHost.js` 位于 `differentFiles`，符合宿主能力差异预期。

## 单一来源与行为兼容

- 七个报表数据函数的业务主体只存在于 `packages/warning-feature/src/report/createReportDataModel.js`；应用 `reportData.js` 只注入 `moment` 和 `getWeekday`。
- 页面、ReportForm、ReportPreview、ReportTable、StatGrid 和图表主体只存在于 `packages/shared-ui/src/forewarning-management/report-export`；应用原路径只做公共导出、attrs/listeners 透传或宿主能力注入。
- 公共源码边界测试确认六个公共文件不引用 `@/`、`apps/`、router、store 或浏览器存储；Props、事件、缓存真实删除、菜单路径、组件注入、请求启动顺序和 PDF 错误处理契约均通过。
- 标题差异：warning 的 `useFixedWeekTitle=false` 使用动态 `${timeTitle}报告预警实况`；front 的 `useFixedWeekTitle=true` 保留固定“本周报告预警实况”。
- 趋势图差异：warning 的 `showAlarmTypeAxisLabels=false` 不增加预警类型横轴标签配置；front 的值为 `true`，保留 `interval: 0`、最小/最大标签显示。2/2 图表行为测试通过。
- 两端 host 的导入和对象结构除上述两个布尔值外逐字一致；迁移契约验证 mounted 请求启动顺序仍为配置、设备、技能、报表数据，并保留原 async/error 处理。

公共主体扫描与迁移契约共同确认，公共业务主体只命中 `packages/warning-feature/src/report` 和 `packages/shared-ui/src/forewarning-management/report-export`；应用目录没有第二份报表数据、页面或图表主体。

## 来源基线与既有警告

`pnpm verify:sources` 退出码为 0，输出：`来源目录未发生变化`。

本次成功命令出现以下既有非失败警告：

- 两个应用的 `package.json` 把 `resolutions` 配置在 workspace 非根位置，pnpm 提示该字段不生效；
- Rsbuild 提示产物目录位于 app root 外，未自动清空，需要由 `output.cleanDistPath` 配置管理；
- Node.js 18 测试出现 `buffer.File` experimental warning；
- 未设置 `NPM_AUTH` 的 `audit:shared`、`verify:sources` 和版本查询会提示 `.npmrc` 中 `${NPM_AUTH}` 无法替换，但命令均正常退出，审计与来源比较结果有效。

## 结论

冻结安装、83 项全量测试、两个独立生产构建、fresh 共享审计和来源基线均通过。八个原路径保持兼容且收敛为一致 shim，公共业务主体只有一份；两处宿主行为差异得到显式能力和行为测试保护。

文档完成后的最终门禁再次执行了全量测试、两个独立生产构建、共享审计、来源比较和 `git diff --check`：83/83 测试再次通过，warning/front 构建再次以 0 退出（Rsbuild 分别为 6.51 秒和 37.6 秒），审计七项计数保持不变，来源比较仍输出 `来源目录未发生变化`，diff check 无输出。
