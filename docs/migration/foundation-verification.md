# Monorepo 基线验收记录

## 验收环境

- 执行日期：2026-07-13
- Node.js：v18.20.3
- pnpm：10.14.0
- 私有仓库认证：本次环境未设置 `NPM_AUTH`；现有依赖足以完成离线验收

## 验收结果

| 验收项 | 结果 | 退出码 |
| --- | --- | --- |
| `pnpm test:migration` | 11 项测试全部通过 | 0 |
| `pnpm build:front`（由 `pnpm build` 执行） | 构建完成，产物位于 `dist/link-front` | 0 |
| `pnpm build:warning`（由 `pnpm build` 执行） | 构建完成，产物位于 `dist/link-warning` | 0 |
| `pnpm verify:sources` | 来源目录未发生变化 | 0 |

`pnpm build` 的整体退出码为 0。

## 构建产物摘要

```text
1d59720c68bdc641a18c99dd8b90cba89b1ec8b2ddcd57b50c62b00e4b83cb76  dist/link-front/index.html
f2ffd2091a1fdaf93eca9360d96f55aefd6613b5fef814a1cd8d5b7f32d97c6b  dist/link-warning/index.html
```

以上 SHA-256 均在 2026-07-13 本次构建完成后重新计算。

## 来源摘要比较

执行 `pnpm verify:sources` 比较 `docs/migration/source-before.json` 与
`docs/migration/source-after.json`，命令输出如下：

```text
来源目录未发生变化
```

## 提交前工作区状态

README 和验收记录已创建。本次验收命令执行完成后，`git status --short`
实际只显示这两个未跟踪文件：

```text
?? README.md
?? docs/migration/foundation-verification.md
```

## 第二阶段交接输入

第二阶段计划必须读取以下已提交内容，不再直接依赖旧项目：

```text
docs/migration/shared-source-audit.json
docs/migration/source-revisions.json
apps/link-front/src/
apps/link-warning/src/
```

共享预警模块按以下顺序提取：

1. `ForewarningManagement`
2. `videoWarning`
3. 共享基础依赖

每个模块都必须先完成两个应用的构建和业务验证，再删除应用内副本。
