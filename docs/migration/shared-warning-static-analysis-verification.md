# ForewarningManagement 静态分析单源迁移验证

## 迁移结果

- 公共页面、搜索表单与六个统计图表位于 `packages/shared-ui/src/forewarning-management/static-analysis/`。
- 统计配置位于 `packages/warning-feature/src/static-analysis/config.js`。
- 两个应用保留 `staticAnalyze.vue`、`components/SearchForm.vue`、`components/charts/**` 和 `test/stasticAnalyzeTest.js` 原路径，路径内容仅负责转发公共实现或注入宿主能力。
- 两端各自保留 `staticAnalysisHost.js`，API 结构一致，仅三个已确认能力值不同：
  - warning：记录搜索参数、监听预警类型刷新、不启用搜索卡片 `noneBottom`。
  - front：不记录搜索参数、不监听预警类型刷新、启用搜索卡片 `noneBottom`。
- 菜单仍使用 `views/ForewarningManagement/staticAnalyze`，独立构建目录未改变。

## 验证证据

- 两端六个原图表在迁移前经 Prettier `--no-config` 规范化后逐字一致；公共图表以 front 端规范化语义为基线，仅将请求 API 改为 host 注入并将公共依赖改为公共包路径。
- 定向迁移测试：5/5 通过。
- 完整根测试：97/97 通过，其中迁移/审计 58、warning-feature 29、shared-ui 10。
- `link-warning` 生产构建：通过，Rsbuild 6.71 秒，输出 199 个文件且存在 `dist/link-warning/index.html`。
- `link-front` 生产构建：通过，Rsbuild 47.4 秒，输出 2400 个文件且存在 `dist/link-front/index.html`。
- 共享审计：通过，结果为 `{"smaller":479,"larger":1868,"common":472,"identical":339,"different":133,"smallerOnly":7,"largerOnly":1396}`。
- 来源校验：通过，输出 `来源目录未发生变化`。
- `git diff --check`：通过。

## 依赖说明

`@link/shared-ui` 显式声明现有实现已使用的 `html2canvas@^1.4.1` 与 `moment@^2.30.1`，锁文件 importer 已同步。内部 npm 仓库在锁文件刷新时对元数据请求返回 401，但 pnpm 使用已有解析结果完成锁文件更新并以退出码 0 结束；随后两个生产构建均从现有安装依赖成功完成。
