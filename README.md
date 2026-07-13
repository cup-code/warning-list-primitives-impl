# Link Monorepo

## 环境

- Node.js >= 18.17.0
- pnpm 10.14.0
- 私有仓库认证环境变量 `NPM_AUTH`

## 开发

```bash
pnpm dev:front
pnpm dev:warning
```

## 构建

```bash
pnpm build:front
pnpm build:warning
```

构建产物分别位于 `dist/link-front` 和 `dist/link-warning`。

## 来源项目

本仓库由 `link-front_new` 和 `link-warning` 迁移而来。旧项目保持独立，
不得使用本仓库脚本反向写入旧项目。
