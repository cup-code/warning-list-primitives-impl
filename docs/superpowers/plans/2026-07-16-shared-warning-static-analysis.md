# ForewarningManagement 静态分析单源迁移计划

## 目标

将 `link-warning` 与 `link-front` 共有的静态分析页面、搜索表单、六个统计图表和统计配置迁为单一公共实现，同时保留原菜单值、原文件路径、原 Props/事件、两端行为差异和独立构建。

## 已确认差异

- 两端六个图表经 Prettier 规范化后逐字一致，差异仅为格式。
- `staticAnalyze.vue` 只有 warning 端记录搜索参数并监听预警类型图表的 `refresh` 事件。
- `SearchForm.vue` 只有 front 端向 `ECard` 传递 `noneBottom`。
- 两端 `test/stasticAnalyzeTest.js` 逐字一致。

## 实现顺序

1. 添加迁移契约测试，约束公共包导出、公共源码依赖边界、原路径薄包装和三项宿主差异。
2. 将 `stasticAnalyzeTest.js` 提取到 `@link/warning-feature/static-analysis-config`，两端原路径只做命名转发。
3. 在 `@link/shared-ui/forewarning-management/static-analysis/**` 放置公共搜索表单、页面和六个图表；公共图表直接依赖公共 UI 与 `html2canvas`，业务请求由 `host` 注入。
4. 两端各保留一个 `staticAnalysisHost.js`，注入 `getScreenData`、六个导出 API 及三个差异开关。
5. 两端 `staticAnalyze.vue`、`SearchForm.vue` 和 `components/charts/**` 保留原路径，改为仅向公共组件注入本端 host 的薄包装；`components/index.js` 保持外部接口不变。
6. 运行新增测试、完整根测试、冻结安装、两个应用独立构建、共享审计、来源校验与 `git diff --check`；通过复审后快进合并到 `buddy/warning-single-source`。

## 验收标准

- 公共业务/UI 实现只存在一份，公共包不得反向导入 `apps/**` 或 `@/**`。
- 原菜单值 `views/ForewarningManagement/staticAnalyze` 和所有原文件路径不变。
- warning 保留搜索日志和 refresh 监听，front 保留 `noneBottom`；其他行为以规范化后相同的现有实现为基线。
- `link-warning` 与 `link-front` 继续分别输出到各自构建目录，任一构建互不依赖另一端源码。
