# Cesium 默认视角初始化竞态修复设计

## 背景

`apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue` 在 `created`
中异步请求视角配置，同时在 `mounted` 中独立加载地图。地图触发 `loadComplete`
后，现有实现固定等待 100ms 并调用 `setCurrView(this.view3d)`。

`view3d` 初始值为 `undefined`，只有视角接口返回且当前建筑存在
`isDefault === true` 的配置时才会赋值。接口慢于地图加载，或接口没有当前建筑的
默认 3D 视角时，`setCurrView` 会收到 `undefined`，随后读取
`option.center` 并抛出 `TypeError`。

该缺陷来自原始来源项目，并非一体机选择组件共享改造引入。

## 目标

- 在初始化地图前完成视角配置请求，消除地图加载与配置请求之间的竞态。
- 没有默认视角、接口失败或视角数据不完整时不抛异常，地图保持 SDK 当前视角。
- 有合法默认视角时继续执行现有 `flyToPosition` 行为，参数和动画保持不变。
- 用自动化回归测试固定初始化顺序和空值边界。

## 非目标

- 不修改视角配置接口、后端数据或默认视角选择规则。
- 不自动把非默认视角提升为默认视角。
- 不修改 Cesium/JSMap 图层、漫游、人员定位或其他地图行为。
- 不同步修改外部原始来源目录。
- 不新增 Vue 挂载测试框架或外部依赖。

## 方案

### 初始化顺序

移除 `created` 中对 `getViewerOptions()` 的即发即弃调用。

`mounted` 在加载 JSMap 和调用 `initMap()` 前先执行：

```js
await this.getViewerOptions()
```

`getViewerOptions()` 必须返回 `getViewPointList(...)` 的 Promise，使调用方能够等待
请求完成或失败。接口成功时沿用现有映射、建筑过滤、默认视角和 2D 视角选择规则。

视角配置请求失败时只记录明确的控制台错误，不阻止地图资源继续加载。视角缺失是
可降级状态，不应被误报为“地图资源加载失败”。

### 视角输入校验

`setCurrView(option)` 在调用 SDK 前验证以下条件：

- `mainMap` 已存在；
- `option.center.center` 已存在；
- `center.x`、`center.y`、`center.z`、`rotate`、`tilt`、`distance` 均为有限数值。

条件不满足时直接返回 `false`，不调用 `flyToPosition`；成功调用后返回 `true`。
返回值只用于测试和调用结果表达，不改变现有页面接口。

不在缺少默认配置时选择 `viewerOptions[0]`，因为这会改变后端
`isDefault` 的业务语义。

## 数据流

1. 组件进入 `mounted`。
2. 等待 `getViewerOptions()` 完成；失败时记录错误并继续。
3. 加载 JSMap，创建地图并注册 `loadComplete`。
4. `loadComplete` 使用已解析的 `view3d` 调用 `setCurrView`。
5. 有合法默认视角时按原参数飞行；没有合法视角时安全跳过。
6. 用户后续点击“恢复当前视角”时继续经过同一输入校验。

## 错误处理

- 视角接口网络失败：记录 `视角配置加载失败` 及原始错误，继续初始化地图。
- 接口返回非成功状态：保留空视角列表并继续初始化地图。
- `result.list` 缺失：按空数组处理，避免在 `.filter` 处产生第二个异常。
- 当前建筑无默认 3D 视角：`view3d` 保持 `undefined`，地图使用 SDK 当前视角。
- 默认视角结构不完整：`setCurrView` 返回 `false` 并跳过 SDK 调用。
- JSMap 加载或地图初始化失败：继续使用现有地图资源错误提示。

## 测试

新增 Node `node:test` 回归测试，不引入 Vue 挂载依赖：

- 验证 `getViewerOptions()` 返回 Promise，调用方可以等待接口结果。
- 验证 `mounted` 在 `loadJsmap()` 和 `initMap()` 之前等待视角配置。
- 验证配置请求失败不会阻止地图初始化，并具有独立错误日志。
- 验证没有默认视角时不会调用 `flyToPosition`。
- 验证缺少嵌套中心点时不会调用 `flyToPosition`。
- 验证合法默认视角仍以原坐标、旋转、倾斜、距离和 1500ms 动画调用
  `flyToPosition`。

由于现有组件与 JSMap SDK 强耦合，纯输入校验和视角转换提取到同目录的小型 JS
模块进行可执行测试；SFC 的等待顺序通过源码契约测试固定。生产构建继续验证 SFC 与
SDK 集成能够编译。

纯逻辑模块提供两个明确边界：`buildViewerOptions(list, buildId)` 负责安全地把接口列表
映射为当前建筑的视角；`flyToViewerOption(mainMap, option)` 负责校验参数、调用
`flyToPosition` 并返回布尔结果。组件的 `setCurrView` 只在后者返回 `true` 时更新
`currViewerId`。

## 文件边界

- 创建 `apps/link-front/src/views/cesium3d/coms-newMaterial/viewerOption.js`：视角列表
  映射和安全飞行的纯逻辑边界。
- 修改 `apps/link-front/src/views/cesium3d/coms-newMaterial/BaseMap.vue`：等待视角配置、
  独立处理配置错误并使用纯逻辑边界。
- 创建 `scripts/migration/cesium-viewer-initialization.test.mjs`：可执行逻辑和 SFC
  初始化顺序的回归契约。
- 创建验证记录，写明测试、双应用构建和运行时限制。

## 完成标准

- 用户报告的 `Cannot read properties of undefined (reading 'center')` 调用路径被
  自动化测试覆盖。
- 视角请求慢、无默认视角或数据不完整时不再进入不安全的 SDK 调用。
- 合法默认视角行为与现有实现一致。
- 新增回归测试、全量测试和两个应用生产构建全部通过。
- `link-front` 开发服务热更新编译成功，无新增编译错误。
- 外部原始来源目录保持不变。
