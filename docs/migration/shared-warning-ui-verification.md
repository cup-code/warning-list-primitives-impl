# 预警基础 UI 组件共享验证

## 验收环境

- 执行日期：2026-07-13
- Node.js：v18.20.3
- pnpm：10.14.0
- 共享实现：`packages/shared-ui/src/forewarning-management`
- 应用接入：两个应用保留原路径并默认导出共享组件

## 范围

- `ChartCard.vue`
- `ChartContainer.vue`
- `SkillTable.vue`

## 测试与构建

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `NPM_AUTH=verify pnpm test` | 迁移/审计测试 19 项、共享预警功能测试 6 项，共 25 项全部通过 | 0 |
| `pnpm run build:front`（由 `NPM_AUTH=verify pnpm build` 执行） | `link-front` 生产构建完成，首次构建用时 35.5 秒 | 0 |
| `pnpm run build:warning`（由 `NPM_AUTH=verify pnpm build` 执行） | `link-warning` 生产构建完成，首次构建用时 7.47 秒 | 0 |
| `NPM_AUTH=verify pnpm build` | 两个应用顺序构建完成，产物位于 `dist/link-front` 和 `dist/link-warning` | 0 |

首次构建已直接编译工作区共享组件，无需修改两个应用的
`rsbuild.config.js`。首次构建入口产物 SHA-256：

- `dist/link-front/index.html`：`90f349ff22b51fe107a16912cadb5bcc2f4b1e1dfa2a8f01d90446b1cf988f24`
- `dist/link-warning/index.html`：`152d582e781adb26b8bdeadb631fc0d7c61f142a1a321a0b9aa4b34ff1275136`

## 共享来源审计

执行 `pnpm audit:shared` 成功，以下三个应用路径均位于
`identicalFiles`，且内容为逐字一致的共享组件转发文件：

1. `views/ForewarningManagement/components/ChartCard.vue`
2. `views/ForewarningManagement/components/ChartContainer.vue`
3. `views/ForewarningManagement/components/ReportExport/SkillTable.vue`

共享实现仅保留在 `packages/shared-ui/src/forewarning-management`。审计计数为
`identical` 323、`different` 147、`common` 470。该审计只比较两个应用的同名
文件；迁移前的相同实现和迁移后的相同转发都会归入 `identicalFiles`，所以重新
生成的 `docs/migration/shared-source-audit.json` 与当前提交版本一致，没有文本差异。

## 外部来源只读校验

本次重新读取两个外部来源目录并生成
`docs/migration/source-after.json`，再通过 `pnpm verify:sources` 与
`docs/migration/source-before.json` 比较。

| 来源 | 文件数 | 基线摘要 | 迁移后摘要 | 结果 |
| --- | ---: | --- | --- | --- |
| `front` | 2426 | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | 一致 |
| `warning` | 576 | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | 一致 |

比较命令退出码为 0，输出：`来源目录未发生变化`。

## 结论

三个组件的共享实现、应用原路径兼容、25 项测试、两个应用生产构建和来源
只读校验均已通过。

## 未纳入范围

`ForewarningManagement` 中其余相同文件和 34 个差异文件继续保留在应用内，
后续按依赖边界逐批迁移。
