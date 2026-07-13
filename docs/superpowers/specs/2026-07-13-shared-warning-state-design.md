# 预警状态逻辑共享设计

## 背景

`apps/link-front` 与 `apps/link-warning` 的预警模块仍各自保存相同的批量选择 mixin `store/batchInfo.js` 和 Vuex 模块 `store/detailInfo.js`。前者被两个应用共 12 个预警页面引用，后者由两个应用的根 Store 注册。继续保留两份实现会让状态字段、mutation 和 action 的修改需要同步两处。

`batchInfo.js` 不依赖应用内部模块，可以直接共享。`detailInfo.js` 依赖 7 个 `@/http/videoWarning/warning-api` 导出，不能把该应用别名带入共享包，因此需要以依赖注入工厂隔离宿主应用。

所有改动仅发生在新 Monorepo `/Users/jxz/project/new/front/project/link-shared`。原始项目 `/Users/jxz/project/new/front/project/link-front_new` 与 `/Users/jxz/project/new/front/project/link-warning` 保持只读。

## 目标

- 将批量选择 mixin 收敛为一份共享实现。
- 将预警详情 Vuex 模块收敛为一个可注入 API 的共享工厂。
- 保持两个应用现有页面、根 Store 和导入路径不变。
- 保持现有 state 字段、mutations、actions、API 调用参数和返回处理行为不变。
- 确保两个应用仍可独立测试和生产构建。

## 非目标

- 不迁移 `selectMachine.vue`、报表工具、实时预警工具或其他页面组件。
- 不统一 `ForewarningManagement` 中已有差异的页面。
- 不修改两个应用的根 Store 注册方式、命名空间或调用方。
- 不改变预警 API 的实现或导出名称。
- 不新增外部依赖。

## 架构

### 批量选择 mixin

`batchInfo.js` 的唯一实现迁入 `packages/warning-feature/src/state/batchSelection.js`，并通过 `@link/warning-feature/batch-selection` 导出默认对象。两个应用原 `store/batchInfo.js` 改为默认导出转发，使 12 个现有相对路径导入无需修改。

共享实现逐字保留当前 `data()` 返回字段和四个 methods：

- `handleCheckAllChange`
- `cancelBatch`
- `handleChecked`
- `onSelected`

每次执行 `data()` 必须返回独立数组，避免不同组件实例共享选择状态。

### 预警详情 Vuex 模块

`detailInfo.js` 的业务实现迁入 `packages/warning-feature/src/state/createDetailInfoModule.js`，通过 `@link/warning-feature/detail-info` 导出命名工厂：

```js
createDetailInfoModule(api)
```

`api` 必须提供当前模块使用的 7 个函数：

- `allWarningAudit`
- `allWarningList`
- `attentionAlarm`
- `clientWarningAudit`
- `clientWarningList`
- `maintenanceWarningAudit`
- `maintenanceWarningList`

工厂在创建模块时校验依赖，缺少或类型错误时抛出包含依赖名称的明确错误。每次调用工厂都创建新的 state 对象及其数组/对象字段，避免多个 Store 实例共享可变状态。

两个应用原 `store/detailInfo.js` 只负责从本地预警 API shim 导入 7 个函数、调用共享工厂并默认导出结果。共享包不得出现 `@/`、应用目录、Vuex Store 实例或路由依赖。

## 兼容契约

- `batchInfo.js` 和 `detailInfo.js` 的应用内原路径保持存在。
- 两个应用的转发文件逐字一致。
- Vuex 模块继续使用当前 `namespaced` 值。
- state 字段名称与初始值保持一致。
- mutation 名称、参数和状态更新方式保持一致。
- action 名称、分支条件、commit 顺序、API 参数和 Promise 行为保持一致。
- 当前常量列表及状态映射保持一致。
- 不要求修改任何页面、`src/store/index.js` 或 API 调用方。

## 数据流

应用启动时，根 Store 仍从 `@/views/ForewarningManagement/store/detailInfo` 导入默认模块。该宿主文件从本地预警 API shim 获取具体函数，并传给共享工厂。页面 dispatch action 后，共享模块调用注入的 API，再以现有 mutation 更新模块 state。

页面使用批量选择功能时，仍从 `./store/batchInfo` 导入 mixin。宿主转发文件返回共享 mixin，每个组件实例通过 `data()` 获得独立选择状态。

## 错误处理

- Vuex 工厂在初始化阶段校验全部 API，避免 action 执行到运行时才暴露缺失依赖。
- API 请求的成功、失败和 Promise 传播保持当前实现，不增加吞错或全局错误处理。
- 迁移不改变现有后端响应结构判断。

## 测试与验证

### 批量选择契约

- 固定共享 mixin 导出的 data 初始值和方法集合。
- 验证两次 `data()` 返回的数组互不共享。
- 覆盖全选、取消、按 ID 勾选和表格选择四种状态转换。
- 验证两个应用只从共享子路径转发。

### Vuex 模块契约

- 固定工厂要求的 7 个 API 名称。
- 验证缺少 API 时的错误信息。
- 验证两次工厂调用得到独立 state。
- 固定模块的 `namespaced`、state、mutations 和 actions 名称。
- 使用 spy API 与 commit 记录覆盖 action 的请求参数、分支选择和 mutation 提交。
- 以迁移前文件摘要或机械结构对照证明业务主体未发生意外改写。
- 验证两个应用转发文件只包含允许的共享工厂和本地 API 导入。

### 集成验证

- 运行 `pnpm test`。
- 分别完成 `link-front` 与 `link-warning` 的生产构建。
- 重新执行共享源审计。
- 重新生成并比较原始来源目录摘要，必须输出“来源目录未发生变化”。

## 风险与控制

- **工厂化时遗漏闭包变量：** 用 mutation/action 名称、state 结构和代表性 action 测试固定契约，并对迁移前后业务主体做机械对照。
- **应用 shim 导入错误：** 测试两个 shim 逐字一致并限制允许的导入来源。
- **状态引用被意外共享：** 明确测试多次 `data()` 和多次工厂调用的引用隔离。
- **共享包反向耦合应用：** 扫描共享源码，禁止 `@/`、`apps/`、router 和宿主 Store 引用。
- **范围扩张：** 本阶段严格限制为两个状态文件及其测试、导出和验证材料。

## 完成标准

- `batchInfo` 和 `detailInfo` 各自只有一份业务实现，位于 `packages/warning-feature`。
- 两个应用原路径和所有现有调用方保持可用，无需修改页面或根 Store。
- 契约测试、全量测试全部通过。
- 两个应用生产构建成功。
- 原始来源项目摘要不变。
- 共享源审计和中文验证文档反映本阶段结果。
