# 预警基础 UI 组件共享设计

## 背景

`apps/link-front` 与 `apps/link-warning` 的 `ForewarningManagement` 目录共有 49 个同名文件，其中 15 个内容完全一致，34 个已经存在业务差异。直接共享整个模块会把两个应用的差异耦合到同一实现中，因此第三阶段只迁移无应用内依赖、内容完全一致的基础 UI 组件。

本阶段涉及以下三个组件：

- `components/ChartCard.vue`
- `components/ChartContainer.vue`
- `components/ReportExport/SkillTable.vue`

原始项目 `/Users/jxz/project/new/front/project/link-front_new` 与 `/Users/jxz/project/new/front/project/link-warning` 保持只读；所有改动仅发生在新 Monorepo `link-shared` 中。

## 目标

让两个应用从 `@link/shared-ui` 使用同一份组件实现，同时保持现有应用内导入路径、组件接口、样式和运行行为不变，并确保两个应用仍可独立构建。

## 非目标

- 不统一 `ForewarningManagement` 中已有差异的 34 个文件。
- 不迁移依赖应用内 API、路由、Store 或 `@/` 别名的组件。
- 不改变三个组件的 Props、Slots、事件、模板结构或样式。
- 不引入新的 UI 框架、构建工具或运行时依赖。
- 不修改原始来源项目。

## 架构

三个组件的唯一实现放入 `packages/shared-ui/src/forewarning-management`。`@link/shared-ui` 通过 `package.json` 的显式子路径分别导出组件：

- `@link/shared-ui/forewarning-management/chart-card`
- `@link/shared-ui/forewarning-management/chart-container`
- `@link/shared-ui/forewarning-management/skill-table`

两个应用保留原来的三个文件路径，但文件内容改为薄转发组件。转发层只导入并渲染对应共享组件，透传 `$attrs` 和全部 Slots，使现有业务文件无需修改导入语句。共享实现不会反向依赖任何应用目录。

## 组件契约

迁移时以当前两个应用中完全一致的实现为基准，逐字保留共享实现中的模板、脚本和样式。转发层必须满足：

- 接收并透传调用方提供的 Attributes 与事件监听器。
- 透传默认 Slot 和所有具名 Slot。
- 不增加 DOM 包装层。
- 不重命名组件对外可见的 Props、Slots 或事件。
- 不复制共享实现中的业务模板或样式。

## 数据流

现有页面仍从原相对路径导入组件。应用内转发组件解析 `@link/shared-ui` 子路径并渲染共享实现；调用方输入经转发层原样传入，共享组件的输出事件与 Slot 内容原样返回调用方。

该结构把实现收敛到一个位置，同时把本次迁移对现有页面的影响限制在三个原文件中。

## 构建与依赖

`packages/shared-ui/package.json` 继续作为私有 ESM Workspace 包，并增加三个 Vue 单文件组件子路径导出。两个应用已通过 Workspace 依赖使用该包，不新增外部依赖。

构建必须由两个应用各自的 Rsbuild/Vue 编译链处理共享 `.vue` 文件。若当前构建配置不能编译 Workspace 包中的 Vue 文件，只做让现有编译链覆盖共享源码所需的最小配置调整。

## 测试与验证

新增迁移契约测试，验证：

1. 三个共享实现文件存在并可由 `@link/shared-ui` 的显式子路径导出。
2. 两个应用对应文件只承担转发职责，不包含旧实现副本。
3. 两个应用的三个转发文件分别指向正确的共享子路径。
4. 共享实现与迁移前基线在模板、脚本和样式上保持一致。
5. 原始来源目录清单与内容摘要保持不变。

完成后运行 Monorepo 全量测试和两个应用的生产构建。只有测试全部通过、两个构建成功且来源目录未变化，才视为本阶段完成。

## 风险与控制

- **Vue 组件转发语义变化：** 使用无 DOM 包装的组件转发，并用契约测试覆盖 Attributes、事件和 Slots 的透传结构。
- **Workspace `.vue` 编译失败：** 在实现前先用失败测试固定包导出，再通过双应用生产构建验证真实编译链。
- **共享范围扩张：** 本阶段严格限制为三个无导入依赖的完全相同组件；发现额外依赖时停止扩张并记录到后续阶段。
- **来源项目被误改：** 实施前后比较已记录的来源目录清单与内容摘要。

## 完成标准

- 三个组件各自只有一份实现，位于 `packages/shared-ui`。
- 两个应用原路径继续可用，现有业务导入无需改动。
- `pnpm test` 全部通过。
- `pnpm build` 可分别完成 `link-front` 与 `link-warning` 的生产构建。
- 来源项目内容摘要不变。
- 共享源审计与本阶段验证文档反映最新状态。
