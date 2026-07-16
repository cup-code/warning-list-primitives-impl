# `misjudgeList` 页面单一来源设计

## 背景与目标

`link-warning` 是 `link-front` 的功能子集，两端的 `ForewarningManagement/misjudgeList.vue` 在 Prettier 规范化后逐字一致，但目前仍各自保存约 750 行页面实现。修改一端不会同步到另一端，不符合公共子集只维护一份源码的目标。

本次把 `misjudgeList` 页面迁移到 `@link/shared-ui`，两端只保留原路径薄包装和应用能力适配。迁移后必须保持原路由、查询、缓存、筛选、批量处理、卡片/表格布局与独立构建行为不变。

## 方案选择

### 方案 A：只迁移 `misjudgeList`，使用显式 host（采用）

先迁移两端语义完全一致的页面，通过 host 注入 HTTP、缓存和子组件所需 API。它能建立页面级共享模式，同时把风险限制在一个页面。

### 方案 B：一次迁移六个预警列表页面

六个页面结构相似，但仍存在缓存时长、`ref/reactive`、路由离开策略和调试逻辑差异。一次迁移会把多个行为决策混入同一批改造，回归定位困难，因此不采用。

### 方案 C：创建配置驱动的通用列表页面引擎

把六个页面抽象成一个高度可配置页面可以进一步减少重复，但当前差异尚未稳定，容易形成大量布尔开关和隐式协议，属于过早抽象，因此不采用。

## 范围

### 本次包含

- 公共 `MisjudgeListPage.vue`。
- 公共 host 能力校验和纯函数测试。
- 两端 `misjudgeListHost.js` 应用适配器。
- 两端原路径 `misjudgeList.vue` 薄包装。
- 将六个列表页面共同使用、两端内容相同的 `WarningListConfig` 提取到公共配置；两端 `config.js` 继续按原名称导入和导出。
- 迁移契约测试、完整测试、共享审计、来源校验和双端独立生产构建。

### 本次不包含

- `warningList.vue`、`customMisjudgeList.vue`、`clientWarningList.vue`、`attentionList.vue`、`allTenantWaringList.vue` 的页面迁移。
- 通用列表页面引擎或跨页面配置 DSL。
- 修改路由路径、路由名称、动态导入位置或页面菜单。
- 修改 HTTP 接口、缓存 key、缓存清理时机、默认筛选条件或批量选择模型。
- 清理现有日志、重复的 `delStorageItem('misjudgeListFilter')` 调用或其他历史代码风格问题。
- 新增浏览器端 E2E 框架。

## 文件结构

```text
packages/shared-ui/src/forewarning-management/warning-list/pages/
  MisjudgeListPage.vue
  misjudgeListHostCapabilities.js
  misjudgeListHostCapabilities.test.mjs
  warningListTableConfig.js
  warningListTableConfig.test.mjs

apps/link-warning/src/views/ForewarningManagement/
  misjudgeList.vue
  misjudgeListHost.js

apps/link-front/src/views/ForewarningManagement/
  misjudgeList.vue
  misjudgeListHost.js
```

公共包新增导出：

```text
@link/shared-ui/forewarning-management/warning-list/pages/misjudge
@link/shared-ui/forewarning-management/warning-list/warning-table-config
```

## 公共页面设计

`MisjudgeListPage.vue` 以现有两端规范化后的共同实现为唯一基准，保留：

- `misjudgeList` 组件名称。
- Vue Query 的租户、部门、人员和预警查询行为。
- `misjudgeListFilter`、`misjudgeListChecked`、`misjudgeListStatus` 缓存 key。
- 默认 `customerStatus: ['3']`、分页参数和所有筛选交互。
- 卡片/表格布局、无限滚动、定时刷新、选择恢复与重置逻辑。
- `@link/warning-feature/batch-selection` 批量选择 mixin。
- `WarningInfo`、`CheckGroup`、`ForewarningList`、`SelectMachine`、`BatchDeal` 的现有 Props、事件和 ref 调用链。
- 当前模板和 scoped 样式。

共享页面直接使用公共组件源码，不再经过应用包装器：

```text
WarningInfo.vue
CheckGroup.vue
ForewarningList.vue
../SelectMachine.vue
../BatchDeal.vue
```

应用 API 由 `host` 传入公共组件所需 Props：机器列表 API 传给 `SelectMachine`，批量处理 API 传给 `BatchDeal`，预警列表 host 继续传给三个预警列表原语。

## Host 能力

两端 `misjudgeListHost.js` 提供完全相同的能力结构：

```js
{
  tenantControlList,
  getDepartListSimple,
  getUserListByRoleFn,
  allWarningList,
  getStorageItem,
  setStorageItem,
  delStorageItem,
  allMachineList,
  machineList,
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
  warningListHost,
}
```

说明：

- 前四项保持现有查询函数和响应结构。
- 三项 storage 能力保持当前序列化、读取和删除语义，不改变过期策略。
- 两项机器 API 原样传给公共 `SelectMachine`。
- 两项批量处理 API 原样传给公共 `BatchDeal`。
- `warningListHost` 是上一阶段已经验证的本端详情、字典和文件前缀能力；warning/front 的 `detailPayloadMode` 差异继续只存在于该对象中。

共享校验器在 development/test 下检查所有函数和 `warningListHost` 对象；production 下通过直接读取 `process.env.NODE_ENV` 跳过校验。共享源码不得导入 `@/`、`apps/`、应用 router 或应用全局对象。

## 路由离开守卫兼容

`beforeRouteLeave` 只会自动作用于路由记录对应的组件。原路径文件改成包装器后，公共子组件中的同名守卫不会自动成为路由守卫。

因此两端包装器必须保留路由守卫入口：

```js
beforeRouteLeave(to, from, next) {
  return this.$refs.page.handleRouteLeave(to, from, next)
}
```

公共页面公开 `handleRouteLeave(to, from, next)`，内部保持现有逻辑：

- 目标不是详情页且不是 `misjudgeList` 时清理缓存和定时器。
- 其他情况保留筛选条件。
- 最终调用一次 `next()`。

包装器使用 `ref="page"`、`inheritAttrs: false`、`v-bind="$attrs"` 和 `v-on="$listeners"`。两端包装器除导入本端 host 外逐字一致；两个 host 文件应逐字一致，因为本端预警差异已封装在各自的 `warningListHost` 中。

## `WarningListConfig` 提取

`WarningListConfig` 被两端六个列表页面共同使用且内容一致。它不是应用能力，不应通过 host 注入。

本次将该数组移到 `warningListTableConfig.js`，两端 `config.js` 删除本地定义后导入并按原名称重新导出。其他配置继续留在应用内：

- `cameraListConfig`
- `machineListConfig`
- 已共享的 `tableListConfig`
- front 独有的 `cardSirenColumns`

现有其他五个列表页面仍通过 `./config` 使用 `WarningListConfig`，不需要修改页面源码。

## 数据流

```text
router 动态导入原路径 misjudgeList.vue
  └─ 应用 wrapper（路由守卫入口）
      └─ 公共 MisjudgeListPage
          ├─ 公共列表组件与批量选择 mixin
          ├─ 公共 WarningListConfig
          └─ misjudgeListHost
              ├─ 查询 API
              ├─ storage API
              ├─ machine / batch API
              └─ 本端 warningListHost
```

## 错误和兼容策略

- host 缺失或能力类型错误时，development/test 抛出包含 `MisjudgeListPage` 和能力名的错误。
- 不捕获或改写现有 HTTP 错误，继续交由 Vue Query 和现有 UI 行为处理。
- 不吞掉 storage JSON 解析错误，保持当前工具函数语义。
- `handleRouteLeave` 必须保证 `next()` 只调用一次。
- `to.path` 缺失或不是字符串时保持现有 `String.prototype.includes` 调用的失败语义：直接抛错，不清理缓存，也不调用 `next()`。
- 包装器找不到公共页面 ref 时，在 development/test 抛出明确错误；production 中仍调用 `next()`，避免导航被永久阻塞。
- 不改变任何查询 key、响应字段读取或计时器周期。

## 测试与验收

实施采用测试先行：

1. 迁移契约测试先失败，覆盖公共导出、原路径、包装器、host 结构、路由守卫委托和页面未越界修改。
2. host 校验单元测试覆盖缺失能力、非法类型和 production 跳过。
3. 路由离开纯逻辑测试覆盖详情页、本页面、其他页面和 `next()` 单次调用。
4. 配置测试对 `WarningListConfig` 做深度相等断言。
5. 结构测试覆盖公共页面的查询、缓存 key、默认条件、组件接线、批量 mixin和 ref API。
6. 两端包装器逐字一致，两个 `misjudgeListHost.js` 除应用导入解析结果外源码逐字一致。
7. 运行完整根测试、`git diff --check`、共享审计和来源校验。
8. 清理各自输出目录后分别构建 `link-warning` 与 `link-front`；后构建不得改变先构建产物哈希。
9. 独立代码审查必须为 Critical 0、Important 0 后才允许本地合并。

由于当前仓库没有 Vue mounted 测试基础设施，本次以纯逻辑、源码契约和双生产构建覆盖迁移；这一限制必须写入验证文档，不得声称已覆盖浏览器交互运行时。

## 完成标准

- `misjudgeList` 页面业务实现只有一份公共源码。
- 两端原路径、路由动态导入和页面名称不变。
- 缓存、筛选、查询、批量处理和布局行为保持不变。
- 路由离开缓存清理通过 wrapper 委托继续生效。
- `WarningListConfig` 只有一份实现，其他应用配置不受影响。
- 公共源码不反向依赖应用源码。
- 所有测试、审计、来源校验和双端构建通过。
- 验证文档准确记录测试数量、构建结果、审计变化和运行时测试限制。
