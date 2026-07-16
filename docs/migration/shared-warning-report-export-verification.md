# 预警报表导出共享验证

## 验证环境、提交归属与范围

- 被验证的实现提交：`ef4f7252403d8915da81930c70a3c64098784942`；该提交在 Task 5 公共报表实现和两端宿主适配之上增加开发/测试 host 能力校验及边界测试，是本次安装、测试、构建和来源审计所针对的代码 head。
- 初始永久证据提交：`f4429e0412b5cd3e80bc6e256048d09d98b5ef8a`；该 docs-only 提交只刷新 `shared-source-audit.json` 并新增本文档，不包含生产代码或 `dist/`。
- 本次澄清是后续 docs-only 修订，只修改本文档；其提交哈希可从紧随 `f4429e0` 的 Git 历史追溯。文档不在提交前自引用未知哈希。
- 验证日期：2026-07-16（Asia/Shanghai）
- Node.js：v18.20.3
- pnpm：10.14.0
- 公共业务模型：`packages/warning-feature/src/report/createReportDataModel.js`，通过 `@link/warning-feature/report-data` 提供七个报表数据函数。
- 公共 UI：`packages/shared-ui/src/forewarning-management/report-export` 下的页面、表单、预览、表格、统计网格和图表 mixin；`SkillTable` 继续复用既有 `@link/shared-ui/forewarning-management/skill-table`。
- 宿主适配：两个应用保留八个原路径薄 wrapper/shim，并分别通过 `reportExportHost.js` 注入 API、存储、日期、PDF 和差异能力。

## 冻结安装与测试

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `CI=true NPM_AUTH=verify pnpm install --frozen-lockfile` | `Lockfile is up to date, resolution step is skipped`；`Packages: +1 -90`；完成用时 2 秒 | 0 |
| 报表数据模型测试 | 5/5 通过；排名测试增加类型排名空输入、前十截取/降序/映射及四等级顺序、缺失值、零/非零总数百分比断言 | 0 |
| 图表差异测试 | 2/2 通过 | 0 |
| host 能力纯逻辑测试 | 5/5 通过 | 0 |
| 报表导出迁移契约 | 12/12 通过 | 0 |
| `NPM_AUTH=verify pnpm test` | migration/audit 53/53、warning-feature 29/29、shared-ui 7/7；合计 89/89 通过，失败 0 | 0 |

主控最终 fresh 冻结安装使用本地缓存完成，锁文件未发生变化；仅出现两个应用在 workspace 非根 manifest 配置 `resolutions` 的既有警告。

## 独立生产构建与产物

| 应用 | 命令 | Rsbuild 耗时 | 墙钟耗时 | 产物目录 | 文件数 | `index.html` | 退出码 |
| --- | --- | ---: | ---: | --- | ---: | --- | ---: |
| link-warning | `NPM_AUTH=verify pnpm run build:warning` | 5.60 秒 | 未单独计时 | `dist/link-warning` | 199 | 存在 | 0 |
| link-front | `NPM_AUTH=verify pnpm run build:front` | 25.9 秒 | 未单独计时 | `dist/link-front` | 2400 | 存在 | 0 |

文件数是在两个构建成功后使用 `find <目录> -type f` 统计的当前目录总数。Rsbuild 明确提示不会自动清空仓库根下的产物目录，因此该数量不作为“无历史 hash 文件”的证明；本次只据此确认两个目标目录和 `index.html` 均已生成。`dist/` 仅作为本地验收产物，不纳入提交。

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
- 公共源码边界测试确认七个公共实现文件不引用 `@/`、`apps/`、router、store 或浏览器存储。`reportHostCapabilities.js` 提供无宿主依赖的纯 `assertHostCapabilities`，支持函数、布尔和存在值三类要求及嵌套点路径；错误文本包含 consumer、精确能力路径、期望类型和实际类型。5 项 Node 测试覆盖三个完整 host consumer、缺失嵌套路径、错误类型、组件存在值及 production 跳过。
- ReportExportPage、ReportForm、ReportPreview 均在各自 `data()` 返回和首次 host 消费前调用仅开发/测试执行的 validator。迁移契约以静态源码断言锁定这些真实调用，防止只新增未接入 helper；同时继续检查 Props、事件、菜单路径、组件注入、mounted 中四个调用的书写顺序、PDF 的 try/catch 源码以及缓存删除源码契约，其中 `removeStorage` 必须调用 `localStorage.removeItem`。
- 标题差异：warning 的 `useFixedWeekTitle=false` 使用动态 `${timeTitle}报告预警实况`；front 的 `useFixedWeekTitle=true` 保留固定“本周报告预警实况”。
- 趋势图差异：warning 的 `showAlarmTypeAxisLabels=false` 不增加预警类型横轴标签配置；front 的值为 `true`，保留 `interval: 0`、最小/最大标签显示。2/2 图表行为测试通过。
- 两端 host 的导入和对象结构除上述两个布尔值外逐字一致。host 能力校验由纯 Node 测试覆盖，组件接入由静态迁移契约覆盖；测试仍没有挂载 Vue 组件，也没有执行真实请求调度、请求拒绝路径、生命周期或浏览器存储交互。

公共主体扫描与迁移契约共同确认，公共业务主体只命中 `packages/warning-feature/src/report` 和 `packages/shared-ui/src/forewarning-management/report-export`；应用目录没有第二份报表数据、页面或图表主体。

两个生产构建只证明 `link-warning` 与 `link-front` 能够成功编译打包并生成上述产物，不证明页面在浏览器中的 mounted、请求时序、拒绝路径或交互行为已经运行。

## 来源基线与既有警告

`pnpm verify:sources` 退出码为 0，输出：`来源目录未发生变化`。

本次成功命令出现以下既有非失败警告：

- 两个应用的 `package.json` 把 `resolutions` 配置在 workspace 非根位置，pnpm 提示该字段不生效；
- Rsbuild 提示产物目录位于 app root 外，未自动清空，需要由 `output.cleanDistPath` 配置管理；
- Node.js 18 测试出现 `buffer.File` experimental warning；
- 未设置 `NPM_AUTH` 的 `audit:shared`、`verify:sources` 和版本查询会提示 `.npmrc` 中 `${NPM_AUTH}` 无法替换，但命令均正常退出，审计与来源比较结果有效。

## 结论

冻结安装、89 项全量测试、两个独立生产构建、fresh 共享审计和来源基线均通过。八个原路径收敛为一致 shim，公共业务主体只有一份；开发/测试 host 校验由 5 项纯逻辑测试和静态接入契约保护，两处宿主差异由显式能力配置和 2 项图表单元测试保护。浏览器 mounted/runtime 行为不在本次验证证据范围内。

针对实现提交 `ef4f725` 的主控 fresh 门禁执行了冻结安装、全量测试、两个独立生产构建、共享审计、来源比较和 `git diff --check`：89/89 测试通过，warning/front 构建以 0 退出（Rsbuild 分别为 5.60 秒和 25.9 秒），产物分别为 199 和 2400 个文件且 `index.html` 存在，审计七项计数保持不变且 audit JSON 无 diff，来源比较仍输出 `来源目录未发生变化`，diff check 无输出。
