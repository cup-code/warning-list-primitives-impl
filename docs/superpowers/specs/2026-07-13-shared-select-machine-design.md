# 一体机选择组件共享设计

## 背景

`apps/link-front` 与 `apps/link-warning` 各自保存一份内容一致的
`ForewarningManagement/components/selectMachine.vue`。该组件被预警列表、误判列表、
全租户预警列表和摄像头表单使用。继续维护两份实现会使查询逻辑、选项展示和交互行为
的修改需要在两个应用中同步进行。

组件当前依赖 Vue 2.7、`@tanstack/vue-query`、Element UI 全局组件，以及宿主应用的
`allMachineList`、`machineList` API。共享实现必须隔离宿主别名和 HTTP 模块，同时保持
调用方现有属性、事件和导入路径不变。

所有改动仅发生在 `/Users/jxz/project/new/front/project/link-shared`。原始项目
`/Users/jxz/project/new/front/project/link-front_new` 与
`/Users/jxz/project/new/front/project/link-warning` 保持只读。

## 目标

- 让两个应用共用一份 `SelectMachine` 模板、查询状态和交互逻辑。
- 保持 `value`、`type`、`disabled` 属性及 `change` 事件契约不变。
- 保持两个应用原 `components/selectMachine.vue` 路径和现有调用方不变。
- 由宿主包装层注入本应用 API，避免共享包引用 `@/` 别名或宿主 HTTP 模块。
- 保持两个应用可独立测试和生产构建。

## 非目标

- 不修改一体机接口、请求参数、响应结构或错误提示策略。
- 不修改 Element UI 样式、标签、占位文案或 DOM 结构。
- 不重构使用该组件的页面。
- 不迁移其他预警组件、静态资源或测试数据。
- 不修改两个原始来源项目。

## 架构

### 共享组件

唯一业务实现放入
`packages/shared-ui/src/forewarning-management/SelectMachine.vue`，并通过
`@link/shared-ui/forewarning-management/select-machine` 导出。

共享组件直接依赖 Vue 2.7 和 `@tanstack/vue-query`，继续使用宿主全局注册的
`el-select`、`el-option`。`packages/shared-ui` 将 `vue` 和
`@tanstack/vue-query` 声明为 peer dependencies，确保两个应用使用自己的运行时实例。

公共属性保持为：

- `value: String`，默认空字符串。
- `type: String`，默认空字符串。
- `disabled: Boolean`，默认 `false`。

共享组件增加两个仅供包装层使用的必需函数属性：

- `allMachineListApi`
- `machineListApi`

这两个属性只建立共享组件与宿主 HTTP 层之间的边界，不暴露给现有页面调用方。

### 应用包装层

两个应用原 `components/selectMachine.vue` 改为内容一致的薄包装组件。包装层：

- 从共享包导入 `SelectMachine`。
- 从本应用 `@/http/videoWarning/warning-api` 导入两个 API。
- 保持原组件名与三个公共属性。
- 将公共属性和两个 API 函数传给共享组件。
- 透传 `$attrs` 与 `$listeners`，使现有事件和非属性特性继续到达共享组件。
- 不增加额外 DOM 包装。

## 数据流

1. 页面继续从原相对路径加载应用包装组件。
2. 包装组件将页面属性和宿主 API 传给共享组件。
3. `type === 'all'` 时，共享组件调用
   `allMachineListApi({ isPage: false })`；否则调用
   `machineListApi({ isPage: false })`。
4. 请求成功且 `data.success` 为真时，`all` 模式读取 `data.result`，普通模式读取
   `data.result.list`。
5. `value` 变化时同步内部选择值；选项加载完成后，根据 `id` 恢复对应的一体机名称。
6. 用户选择时，根据 `id` 查找完整一体机对象，并继续触发 `change` 事件。

## 兼容契约

- 现有页面无需修改导入、模板或事件处理代码。
- `type="all"` 与普通模式的 API 选择、请求参数和响应取值保持不变。
- `value`、`type`、`disabled` 的类型与默认值保持不变。
- `change` 事件参数继续是选中的完整一体机对象；清空或找不到时保持当前
  `undefined` 行为。
- 组件根节点继续是单个 `div`，内部 Element UI 结构和中文文案保持不变。
- 共享源码不得包含 `@/`、`apps/`、宿主 Store、Router 或具体 HTTP 模块引用。

## 错误处理

- 网络错误继续由 `vue-query` 和宿主现有全局机制处理，本阶段不新增提示或重试策略。
- `data.success` 为假时不更新选项，保持当前行为。
- API 属性缺失属于集成错误，由 Vue 必需属性校验提示，不引入静默降级。
- 不改变空列表、未知 `value` 或清空选择时的现有结果。

## 测试与验证

### 共享组件契约

- 验证三个公共属性、两个注入属性及默认值。
- 验证普通模式调用 `machineListApi({ isPage: false })` 并读取 `result.list`。
- 验证 `all` 模式调用 `allMachineListApi({ isPage: false })` 并读取 `result`。
- 验证 `success=false` 时不更新列表。
- 验证 `value` 同步、选项加载后的名称恢复和 `disabled` 传递。
- 验证选择、清空和未知标识时的 `change` 事件参数。

### 包装层契约

- 验证两个应用包装层内容一致。
- 验证包装层只负责导入共享组件、宿主 API 及属性和事件透传。
- 验证原组件路径和公共接口未改变。

### 集成验证

- 运行全量迁移测试。
- 分别执行 `link-front` 与 `link-warning` 生产构建。
- 审计共享源码不存在宿主耦合。
- 比较原始来源项目摘要，确认原项目未被修改。

## 风险与控制

- **Vue 运行时重复：** 使用 peer dependencies，确保共享组件解析到应用现有 Vue 和
  `vue-query` 实例。
- **包装层事件丢失：** 显式透传 `$listeners`，并用契约测试固定 `change` 参数。
- **API 边界泄漏：** 共享组件只接收函数，不导入宿主别名或 HTTP 文件。
- **响应结构混用：** 分别测试普通模式的 `result.list` 和 `all` 模式的 `result`。
- **组件结构变化：** 保留原根节点、Element UI 模板和文案，并对迁移前后主体做机械对照。
- **范围扩张：** 不修改任何现有调用页面或其他候选共享文件。

## 完成标准

- `SelectMachine` 的模板、查询状态和交互逻辑只有一份业务实现。
- 两个应用原路径和现有属性、事件契约继续可用。
- 共享包不依赖宿主别名或应用源码。
- 契约测试和全量测试全部通过。
- 两个应用生产构建成功。
- 原始来源项目摘要不变。
- 中文验证文档记录机械对照、测试、构建、审计与来源校验结果。
