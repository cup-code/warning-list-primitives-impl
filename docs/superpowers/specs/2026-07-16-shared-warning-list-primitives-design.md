# ForewarningManagement 列表公共内核单源设计

## 背景与目标

`link-warning` 是 `link-front` 的功能子集。两个应用中的预警列表族目前共同使用：

- `components/list.vue`
- `components/checkGroup.vue`
- `components/warningInfo.vue`
- `config.js` 中的 `tableListConfig`

其中 `checkGroup.vue`、`warningInfo.vue` 经统一格式化后语义完全一致；`list.vue` 只有详情参数形状不同；`tableListConfig` 完全一致。六个列表页面同时依赖这些组件，因此该组文件应作为一个完整公共内核迁移，而不是分别维护两份实现。

本切片目标是只保留一份公共业务/UI 实现，同时保持两个应用原路径、外部组件契约、详情行为和独立构建能力不变。

## 范围

### 本次包含

- 公共 `WarningInfo` 卡片组件。
- 公共 `CheckGroup` 批量勾选组件。
- 公共 `ForewarningList` 表格组件。
- 公共 `tableListConfig`。
- 两个应用各自的列表 host 和原路径薄包装。
- 覆盖公共依赖边界、Props/事件、详情参数和命令式方法的迁移契约测试。

### 本次不包含

- `warningList.vue`、`misjudgeList.vue`、`customMisjudgeList.vue`、`clientWarningList.vue`、`attentionList.vue`、`allTenantWaringList.vue` 页面本体。
- `cameraListConfig`、`machineListConfig`、`WarningListConfig`。
- front 独有的 `cardSirenColumns` 和 `cardSiren` 页面。
- 对全局 `CTable`、Element UI 或公共 mixin 的额外重构。

页面本体留到下一切片，在公共内核稳定后继续提取。

## 已确认差异

两端 `list.vue` 的唯一规范化语义差异是详情数据：

- warning：`detailId: row.id`
- front：`detailForm: row`

其他路由路径、字典状态、等级显示、表格列、选择事件和 `setSelections(ids)` 行为一致。

`config.js` 不能整体搬入公共包，因为：

- warning 的其他表格配置仍有独立宽度差异。
- front 额外导出 `cardSirenColumns`。

因此只提取逐字一致的 `tableListConfig`，两端 `config.js` 继续保留并从公共包导入、再按原名称导出。

## 架构设计

### 公共 UI

新增目录：

```text
packages/shared-ui/src/forewarning-management/warning-list/
├── CheckGroup.vue
├── ForewarningList.vue
├── WarningInfo.vue
├── tableListConfig.js
└── warningListHostCapabilities.js
```

`@link/shared-ui` 显式导出：

- `./forewarning-management/warning-list/check-group`
- `./forewarning-management/warning-list/list`
- `./forewarning-management/warning-list/warning-info`
- `./forewarning-management/warning-list/table-config`

公共源码不得导入 `apps/**`、`@/**`、任一应用路由或应用配置。

### 宿主能力

两个应用分别保留结构相同的 `warningListHost.js`，向公共组件提供：

- `getDictList(type)`：读取当前应用已注册的字典能力。
- `getFilePrefix()`：保持从 `globalData.minioFilePrefix` 读取图片前缀的行为。
- `pushWarningDetail(data)`：使用当前应用 router 跳转 `/detail/warningDetail`，并保持 JSON query 格式。
- `detailPayloadMode`：仅允许 `id` 或 `form`。

能力值：

| 应用 | `detailPayloadMode` | 详情字段 |
|---|---|---|
| link-warning | `id` | `detailId: row.id` |
| link-front | `form` | `detailForm: row` |

开发与测试环境校验 host 能力；生产构建通过直接的 `process.env.NODE_ENV` 默认参数跳过校验，保持与报表、静态分析迁移相同的生产兼容策略。

### 原路径薄包装

两个应用继续保留：

- `components/list.vue`
- `components/checkGroup.vue`
- `components/warningInfo.vue`

每个包装层只负责：

- 导入对应公共组件。
- 注入本端 `warningListHost`。
- 通过 `$attrs` 和 `$listeners` 透传 Props、属性和事件。

`components/list.vue` 还必须保留命令式接口：

```js
setSelections(ids) {
  return this.$refs.sharedList.setSelections(ids)
}
```

六个现有列表页面均通过 `$refs.tableRef.setSelections(...)` 调用该方法，因此普通模板透传不足以保持契约。

## 组件契约

### ForewarningList

保持原 Props：

- `tableData: Array`
- `type: String`
- `height: String`
- `allType: Boolean`
- `loading: Boolean`
- `form: Object`
- `selection: Boolean`

保持：

- `selection` 事件及原参数。
- `setSelections(ids)` 方法。
- `CTable` 的 `status`、`level`、`operation` 插槽行为。
- `/detail/warningDetail?data=<JSON>` 路由格式。

公共组件根据 `detailPayloadMode` 构造详情对象，其他字段始终为：

```js
{
  type: allType ? 'all' : type,
  form,
}
```

### CheckGroup

保持原 Props、watcher、三列布局、`check` 事件和 `WarningInfo` 组合关系。host 继续向内部 `WarningInfo` 透传。

### WarningInfo

保持原 Props、`itemTap` 事件、状态/等级文案和图片展示。图片前缀由 host 提供，不再隐式依赖应用公共 mixin 的 `filePrefix/getPrefix`。

## 数据流

```text
列表页面
  └─ 原路径 wrapper
      └─ 公共 ForewarningList / CheckGroup / WarningInfo
          ├─ 公共 tableListConfig
          └─ warningListHost
              ├─ 字典读取
              ├─ 图片前缀
              └─ 本端详情路由 + 参数模式
```

公共组件只处理展示和公共交互；应用差异集中在 host，页面调用方式不变。

## 错误与兼容策略

- 非生产环境缺少 host 函数或 `detailPayloadMode` 非法时抛出包含精确能力名的 `TypeError`。
- 字典中找不到状态时继续保持现有可选链与回退结果，不额外改变业务文案。
- `globalData` 缺失时图片前缀返回空字符串，与现有 mixin 行为一致。
- wrapper 必须显式代理 `setSelections`；测试防止后续误删。
- 不修改菜单、路由表和六个页面文件的 import 路径。

## 测试与验收

实施采用测试先行：

1. 迁移契约测试先失败，覆盖公共导出、依赖边界和原路径存在性。
2. 纯函数/host 测试覆盖 `id`、`form` 两种详情参数和非法模式。
3. 结构测试覆盖全部 Props、事件、`setSelections` 代理和 `tableListConfig` 精确内容。
4. 两端 wrapper 除 host 文件外保持逐字一致。
5. 运行完整根测试。
6. 分别生产构建 `link-warning` 和 `link-front`，确认输出目录互不影响。
7. 运行共享审计、来源校验和 `git diff --check`。
8. 独立代码审查无 Critical/Important 问题后才本地合并。

## 完成标准

- 三个组件和 `tableListConfig` 的业务实现各只存在一份。
- 修改公共实现后两个应用构建均消费该实现，无复制同步步骤。
- warning 与 front 的详情参数差异保持不变。
- 所有现有页面无需修改 import 路径或调用方式。
- `setSelections`、Props、事件和独立构建均有可重复验证证据。
