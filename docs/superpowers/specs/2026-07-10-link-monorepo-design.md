# Link Monorepo 设计方案

## 1. 建设目标

在 `link-shared` 中创建一个新的独立 Monorepo，现有的 `link-front_new` 和
`link-warning` 项目保持不变。

新项目需要满足以下要求：

- 分别构建、部署完整版应用和预警应用。
- 两个应用共用一份预警业务源码。
- 保留两个来源项目中与本次迁移有关的 Git 历史。
- 新项目以两个来源项目当前工作目录为准，包含尚未提交的修改。
- 本地修改共享源码后立即生效，不需要先发布 npm 包。

## 2. 来源项目

| 来源 | Git 结构 | 新项目中的位置 |
| --- | --- | --- |
| `link-front_new` | `/Users/jxz/project/new/front/project` 仓库中的子目录 | `apps/link-front` |
| `link-warning` | 独立 Git 仓库 | `apps/link-warning` |

迁移期间，两个来源目录只用于读取。迁移脚本不得在其中修改、移动、删除、清理、
重置或提交文件。

## 3. 目录结构

```text
link-shared/
|-- apps/
|   |-- link-front/
|   `-- link-warning/
|-- packages/
|   |-- warning-feature/
|   |-- shared-core/
|   `-- shared-ui/
|-- docs/
|-- package.json
|-- pnpm-workspace.yaml
`-- pnpm-lock.yaml
```

各目录职责如下：

- `apps/link-front`：完整版应用入口、路由、运行时配置、公共资源和专属功能。
- `apps/link-warning`：预警应用入口、路由、运行时配置、公共资源和专属功能。
- `packages/warning-feature`：两个应用共用的预警页面、组件、接口和业务逻辑，
  是预警业务源码的唯一维护位置。
- `packages/shared-core`：请求、存储、权限和工具函数等通用基础代码。
- `packages/shared-ui`：可复用的 Vue 2 组件、样式和展示逻辑。

依赖方向固定为：

```text
apps/link-front   --\
                    +--> warning-feature --> shared-core/shared-ui
apps/link-warning --/
```

`packages` 不能反向引用 `apps`，该约束通过 ESLint 检查。

## 4. 工作区和包管理

新项目使用 pnpm workspace。首次迁移不引入 Nx、Turborepo 或其他任务编排工具。

根目录提供以下命令：

```text
pnpm dev:front
pnpm dev:warning
pnpm build:front
pnpm build:warning
pnpm build
pnpm lint
pnpm test
```

两个应用各自保留 Rsbuild 配置，分别输出部署产物：

```text
dist/link-front/
dist/link-warning/
```

工作区包直接向 Rsbuild 提供源码，不增加单独的预构建或发布步骤。因此，开发时
修改 `warning-feature` 后，两个应用都可以正常热更新。

## 5. Git 历史迁移

历史迁移不能改变来源仓库，具体步骤如下：

1. 把包含 `link-front_new` 的上级仓库克隆到临时目录。
2. 在临时仓库中执行 `git subtree split --prefix=link-front_new`，提取该目录的历史。
3. 把提取后的历史导入新仓库的 `apps/link-front`。
4. 把 `link-warning` 的完整历史导入新仓库的 `apps/link-warning`。
5. 将两个来源项目当前工作目录的内容覆盖到对应应用目录。
6. 复制时排除 `.git`、`node_modules`、`dist`、构建缓存和 `.DS_Store`。
7. 在新仓库提交工作目录快照和 Monorepo 配置。

这样既能保留来源历史，也能把尚未提交的最新代码带入新项目。开始提取共享代码
之前，需要对比来源目录和复制结果的文件清单，确认没有遗漏或多复制文件。

## 6. 共享代码迁移

现有代码不能按文件路径直接批量去重。`link-warning` 有 477 个源码文件，其中 470
个文件在 `link-front_new` 中存在相同路径，但这 470 个文件中已有 148 个内容不同。

迁移分为以下阶段：

1. 先把两个应用放入工作区，不改变原有行为。
2. 确认两个应用都能在新目录中安装依赖并完成构建。
3. 对 148 个差异文件分类，判断是无意产生的代码漂移、产品差异，还是可以通过
   参数解决的公共逻辑。
4. 将边界明确的预警业务迁入 `warning-feature`，优先处理
   `ForewarningManagement`、`videoWarning` 及其直接依赖。
5. 只有当两个应用使用相同契约时，才把基础代码和 UI 组件迁入 `shared-core` 或
   `shared-ui`。
6. 两个应用都接入并验证工作区版本后，再删除应用内的重复副本。

如果一段代码包含大量产品分支，应继续保留在对应应用中，不为了减少文件数量而
强行共享。

## 7. 宿主应用接入方式

共享预警代码不能默认使用某个应用的 router、Vuex store、请求客户端、权限实现或
运行时配置。两个应用通过明确的接口传入这些依赖，例如：

```js
createWarningFeature({
  request,
  store,
  router,
  permissions,
  runtimeConfig,
})
```

Vue 2 中可以使用插件安装函数、provider 或工厂函数实现，但对外契约必须明确且
能够独立测试。

`@/` 等应用别名只允许指向使用方应用自身。工作区包使用包内相对路径或声明过的
工作区包名，不能依赖某个应用的目录结构。

## 8. 验证方式

验证分为三个层次：

- `packages` 测试覆盖共享工具、接入契约和预警业务逻辑。
- `apps` 测试覆盖应用入口、路由、权限和运行时配置。
- CI 对每次共享代码修改执行 lint、测试、`build:front` 和 `build:warning`。

旧项目停更之前，需要对比新旧应用的以下功能：

- 路由可用性和访问控制。
- 预警列表、详情、导出和视频预警流程。
- 运行时环境及公共配置加载。
- 静态资源路径和部署基础路径。
- 生产构建结果及产物目录结构。

## 9. 失败处理和回退

迁移期间，旧项目始终保持可用。历史导入、构建或模块提取失败时，只回退新仓库
中的修改。

共享代码按模块边界拆成小提交。如果某次提取引起回归，回退对应提交，继续使用
应用内副本，等接入契约修正后再迁移。

只有两个新产物都通过约定的验证后，才考虑停止旧项目的日常开发。删除或归档旧
项目不在本方案范围内。

## 10. 完成标准

满足以下条件后，迁移才算完成：

- 新仓库能够访问两个来源项目的相关提交历史。
- 两个新应用包含来源工作目录中的当前内容。
- 迁移过程没有改变两个来源目录的文件内容。
- `pnpm build:front` 和 `pnpm build:warning` 均构建成功。
- 约定的预警模块在两个应用中引用同一份 `warning-feature` 源码。
- 共享包发生修改时，CI 会验证两个应用。
