# Link Monorepo 基线迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在不修改 `link-front_new` 和 `link-warning` 的前提下，将两者的 Git 历史及当前工作目录快照迁入 `link-shared`，建立可以分别构建两个应用的 pnpm Monorepo 基线。

**架构：** 新仓库使用 `apps/link-front` 和 `apps/link-warning` 保存两个应用，根目录通过 pnpm workspace 统一安装依赖和执行任务。本计划只完成无业务行为变更的基线迁移，并生成共享代码依赖审计结果；`packages/warning-feature` 的业务提取在后续独立计划中完成。

**技术栈：** Node.js 22.20.0、pnpm 10.14.0、Git subtree、Vue 2.7.16、Rsbuild 1.3.x、Node.js 内置测试运行器。

## 全局约束

- 来源目录固定为 `/Users/jxz/project/new/front/project/link-front_new` 和 `/Users/jxz/project/new/front/project/link-warning`。
- 两个来源目录只读，禁止在其中执行写入、清理、重置、提交或依赖安装。
- 新项目必须包含来源项目当前未提交的工作目录内容。
- 复制时排除 `.git`、`node_modules`、`dist`、构建缓存、`.DS_Store` 和含凭据的 `.npmrc`。
- 不把来源 `.npmrc` 中的认证信息提交到新仓库；新仓库通过 `NPM_AUTH` 环境变量读取私有仓库认证。
- 保留 `link-warning` 的完整历史，并从上级仓库中提取 `link-front_new` 的目录历史。
- 首次迁移不引入 Nx 或 Turborepo。
- 每个任务结束时必须验证两个来源目录的清单摘要没有变化。
- 本计划不删除或归档旧项目，也不删除两应用中的重复业务代码。

---

## 文件结构

本计划创建或修改以下文件：

```text
link-shared/
|-- .gitignore                         # Monorepo 忽略规则
|-- .npmrc                             # 不含明文凭据的 pnpm/Nexus 配置
|-- package.json                       # 根工作区命令和 Node/pnpm 版本
|-- pnpm-workspace.yaml                # apps 和 packages 工作区声明
|-- apps/
|   |-- link-front/                    # 从 link-front_new 迁入
|   `-- link-warning/                  # 从 link-warning 迁入
|-- packages/
|   |-- warning-feature/package.json   # 后续共享业务包边界
|   |-- shared-core/package.json       # 后续公共逻辑包边界
|   `-- shared-ui/package.json         # 后续公共 UI 包边界
|-- scripts/
|   |-- migration/tree-manifest.mjs    # 生成稳定且可比较的目录摘要
|   |-- migration/tree-manifest.test.mjs
|   |-- migration/compare-manifests.mjs
|   |-- audit/shared-source-audit.mjs  # 统计同路径文件及内容差异
|   `-- audit/shared-source-audit.test.mjs
`-- docs/migration/
    |-- source-revisions.json          # 迁移时的来源提交
    |-- source-before.json             # 来源迁移前摘要
    |-- source-after.json              # 来源迁移后摘要
    `-- shared-source-audit.json       # 第二阶段计划的输入
```

迁入后还会定点修改：

- `apps/link-front/package.json`
- `apps/link-front/rsbuild.config.js`
- `apps/link-warning/package.json`
- `apps/link-warning/rsbuild.config.js`
- `apps/link-warning/aliasconfig.js`

---

### 任务 1：建立只读来源校验工具

**文件：**
- 创建：`scripts/migration/tree-manifest.mjs`
- 创建：`scripts/migration/tree-manifest.test.mjs`
- 创建：`scripts/migration/compare-manifests.mjs`

**接口：**
- 产出：`collectManifest(root): Promise<{ root, digest, files }>`
- 产出：`compareManifestSets(before, after): { equal, differences }`
- 排除项：`.git`、`node_modules`、`dist`、`.rsbuild-cache`、`.cache`、`.DS_Store`、`.npmrc`

- [ ] **步骤 1：为目录摘要编写失败测试**

创建 `scripts/migration/tree-manifest.test.mjs`：

```js
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { collectManifest } from './tree-manifest.mjs'

test('摘要忽略依赖、产物、凭据和系统文件', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-manifest-'))
  await mkdir(path.join(root, 'src'), { recursive: true })
  await mkdir(path.join(root, 'node_modules', 'pkg'), { recursive: true })
  await mkdir(path.join(root, 'dist'), { recursive: true })
  await writeFile(path.join(root, 'src', 'main.js'), 'export default 1\n')
  await writeFile(path.join(root, 'node_modules', 'pkg', 'index.js'), 'ignored\n')
  await writeFile(path.join(root, 'dist', 'index.js'), 'ignored\n')
  await writeFile(path.join(root, '.npmrc'), '_auth=secret\n')
  await writeFile(path.join(root, '.DS_Store'), 'ignored\n')

  const manifest = await collectManifest(root)

  assert.deepEqual(manifest.files.map(file => file.path), ['src/main.js'])
  assert.match(manifest.digest, /^[a-f0-9]{64}$/)
})

test('文件内容改变时摘要随之改变', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-manifest-'))
  await writeFile(path.join(root, 'main.js'), 'one\n')
  const before = await collectManifest(root)
  await writeFile(path.join(root, 'main.js'), 'two\n')
  const after = await collectManifest(root)
  assert.notEqual(before.digest, after.digest)
})
```

- [ ] **步骤 2：运行测试并确认失败**

执行：

```bash
node --test scripts/migration/tree-manifest.test.mjs
```

预期：失败，错误包含 `ERR_MODULE_NOT_FOUND` 和 `tree-manifest.mjs`。

- [ ] **步骤 3：实现目录摘要工具**

创建 `scripts/migration/tree-manifest.mjs`：

```js
import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, readlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const excludedDirectories = new Set([
  '.git',
  '.cache',
  '.rsbuild-cache',
  'dist',
  'node_modules',
])
const excludedFiles = new Set(['.DS_Store', '.npmrc'])

async function walk(root, relative = '') {
  const directory = path.join(root, relative)
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue
    if (!entry.isDirectory() && excludedFiles.has(entry.name)) continue

    const filePath = path.posix.join(relative.split(path.sep).join('/'), entry.name)
    const absolutePath = path.join(root, filePath)

    if (entry.isDirectory()) {
      files.push(...await walk(root, filePath))
      continue
    }

    const stat = await lstat(absolutePath)
    const content = stat.isSymbolicLink()
      ? Buffer.from(`symlink:${await readlink(absolutePath)}`)
      : await readFile(absolutePath)
    files.push({
      path: filePath,
      size: stat.size,
      sha256: createHash('sha256').update(content).digest('hex'),
    })
  }

  return files
}

export async function collectManifest(root) {
  const absoluteRoot = path.resolve(root)
  const files = await walk(absoluteRoot)
  const digest = createHash('sha256')
    .update(files.map(file => `${file.path}\0${file.size}\0${file.sha256}`).join('\n'))
    .digest('hex')
  return { root: absoluteRoot, digest, files }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = process.argv[2]
  if (!root) throw new Error('用法: node tree-manifest.mjs <目录>')
  process.stdout.write(`${JSON.stringify(await collectManifest(root), null, 2)}\n`)
}
```

创建 `scripts/migration/compare-manifests.mjs`：

```js
import { readFile } from 'node:fs/promises'

export function compareManifestSets(before, after) {
  const differences = []
  for (const key of Object.keys(before)) {
    if (!after[key]) differences.push(`${key}: 缺少迁移后摘要`)
    else if (before[key].digest !== after[key].digest) differences.push(`${key}: 内容摘要变化`)
  }
  return { equal: differences.length === 0, differences }
}

const [beforePath, afterPath] = process.argv.slice(2)
if (!beforePath || !afterPath) {
  throw new Error('用法: node compare-manifests.mjs <before.json> <after.json>')
}
const before = JSON.parse(await readFile(beforePath, 'utf8'))
const after = JSON.parse(await readFile(afterPath, 'utf8'))
const result = compareManifestSets(before, after)
if (!result.equal) {
  console.error(result.differences.join('\n'))
  process.exitCode = 1
} else {
  console.log('来源目录未发生变化')
}
```

- [ ] **步骤 4：运行测试并确认通过**

执行：

```bash
node --test scripts/migration/tree-manifest.test.mjs
```

预期：2 项测试通过，0 项失败。

- [ ] **步骤 5：提交校验工具**

```bash
git add scripts/migration
git commit -m "test: add source tree migration guards"
```

---

### 任务 2：记录来源基线并迁入 Git 历史

**文件：**
- 创建：`docs/migration/source-before.json`
- 创建：`docs/migration/source-revisions.json`
- 创建目录：`apps/link-front`
- 创建目录：`apps/link-warning`

**接口：**
- 使用：任务 1 的 `collectManifest`
- 产出：两个应用在新仓库中可追溯的 Git 历史

- [ ] **步骤 1：记录两个来源目录的迁移前摘要**

执行：

```bash
mkdir -p docs/migration
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\n') })" > docs/migration/source-before.json
```

预期：JSON 中同时存在 `front.digest` 和 `warning.digest`，两者都是 64 位十六进制字符串。

- [ ] **步骤 2：记录来源提交和分支**

执行：

```bash
node -e "const { execFileSync } = require('node:child_process'); const run = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); const data = { front: { root: run('/Users/jxz/project/new/front/project/link-front_new', ['rev-parse', '--show-toplevel']), branch: run('/Users/jxz/project/new/front/project/link-front_new', ['branch', '--show-current']), commit: run('/Users/jxz/project/new/front/project/link-front_new', ['rev-parse', 'HEAD']) }, warning: { root: run('/Users/jxz/project/new/front/project/link-warning', ['rev-parse', '--show-toplevel']), branch: run('/Users/jxz/project/new/front/project/link-warning', ['branch', '--show-current']), commit: run('/Users/jxz/project/new/front/project/link-warning', ['rev-parse', 'HEAD']) } }; process.stdout.write(JSON.stringify(data, null, 2) + '\n')" > docs/migration/source-revisions.json
```

预期：`front.root` 是 `/Users/jxz/project/new/front/project`，`warning.root` 是 `/Users/jxz/project/new/front/project/link-warning`。

- [ ] **步骤 3：在临时克隆中提取 link-front_new 历史**

执行：

```bash
MIGRATION_TMP="$(mktemp -d /tmp/link-monorepo-history.XXXXXX)"
git clone --no-local /Users/jxz/project/new/front/project "$MIGRATION_TMP/front-parent"
git -C "$MIGRATION_TMP/front-parent" subtree split --prefix=link-front_new -b link-front-history
git remote add front-history "$MIGRATION_TMP/front-parent"
git fetch front-history link-front-history
git subtree add --prefix=apps/link-front front-history link-front-history
```

预期：`apps/link-front/package.json` 存在，并且 `git log --all --oneline -- link-front_new` 不会把父仓库其他目录加入新工作树。

- [ ] **步骤 4：迁入 link-warning 完整历史**

执行：

```bash
git remote add warning-history /Users/jxz/project/new/front/project/link-warning
git fetch warning-history main
git subtree add --prefix=apps/link-warning warning-history main
```

预期：`apps/link-warning/package.json` 存在。

- [ ] **步骤 5：验证两个来源提交在新仓库历史中可达**

执行：

```bash
node -e "const fs = require('node:fs'); const cp = require('node:child_process'); const revisions = JSON.parse(fs.readFileSync('docs/migration/source-revisions.json')); cp.execFileSync('git', ['merge-base', '--is-ancestor', revisions.warning.commit, 'HEAD']); console.log('warning history reachable')"
git log --all --oneline -- apps/link-front/package.json | head -5
```

预期：输出 `warning history reachable`，并且完整版应用的 `package.json` 至少显示一条历史记录。

- [ ] **步骤 6：提交迁移元数据**

```bash
git add docs/migration/source-before.json docs/migration/source-revisions.json
git commit -m "chore: record monorepo source revisions"
```

---

### 任务 3：覆盖当前工作目录快照并证明来源未变化

**文件：**
- 修改：`apps/link-front/**`
- 修改：`apps/link-warning/**`
- 创建：`docs/migration/source-after.json`

**接口：**
- 使用：`docs/migration/source-before.json`
- 产出：与来源当前工作目录一致的两个应用快照

- [ ] **步骤 1：用当前工作目录覆盖历史导入结果**

执行：

```bash
rsync -a --delete --delete-excluded \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' \
  --exclude='.rsbuild-cache/' --exclude='.cache/' --exclude='.DS_Store' \
  --exclude='.npmrc' \
  /Users/jxz/project/new/front/project/link-front_new/ apps/link-front/

rsync -a --delete --delete-excluded \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' \
  --exclude='.rsbuild-cache/' --exclude='.cache/' --exclude='.DS_Store' \
  --exclude='.npmrc' \
  /Users/jxz/project/new/front/project/link-warning/ apps/link-warning/
```

预期：应用目录中不存在 `.git`、`node_modules`、`dist` 和 `.npmrc`。

- [ ] **步骤 2：确认新应用与来源快照一致**

执行：

```bash
node scripts/migration/tree-manifest.mjs apps/link-front > /tmp/link-front-target.json
node scripts/migration/tree-manifest.mjs apps/link-warning > /tmp/link-warning-target.json
node -e "const fs = require('node:fs'); const source = JSON.parse(fs.readFileSync('docs/migration/source-before.json')); const front = JSON.parse(fs.readFileSync('/tmp/link-front-target.json')); const warning = JSON.parse(fs.readFileSync('/tmp/link-warning-target.json')); if (source.front.digest !== front.digest || source.warning.digest !== warning.digest) process.exit(1); console.log('应用快照与来源一致')"
```

预期：输出 `应用快照与来源一致`。

- [ ] **步骤 3：重新计算来源摘要并比较**

执行：

```bash
node -e "Promise.all([import('./scripts/migration/tree-manifest.mjs')]).then(async ([m]) => { const front = await m.collectManifest('/Users/jxz/project/new/front/project/link-front_new'); const warning = await m.collectManifest('/Users/jxz/project/new/front/project/link-warning'); process.stdout.write(JSON.stringify({ front, warning }, null, 2) + '\n') })" > docs/migration/source-after.json
node scripts/migration/compare-manifests.mjs docs/migration/source-before.json docs/migration/source-after.json
```

预期：输出 `来源目录未发生变化`。

- [ ] **步骤 4：提交当前工作目录快照**

```bash
git add apps docs/migration/source-after.json
git commit -m "chore: import current application snapshots"
```

---

### 任务 4：建立 pnpm 工作区

**文件：**
- 创建：`.gitignore`
- 创建：`.npmrc`
- 创建：`package.json`
- 创建：`pnpm-workspace.yaml`
- 创建：`packages/warning-feature/package.json`
- 创建：`packages/shared-core/package.json`
- 创建：`packages/shared-ui/package.json`
- 修改：`apps/link-front/package.json`
- 修改：`apps/link-warning/package.json`

**接口：**
- 产出：工作区包名 `@link/link-front`、`@link/link-warning`、`@link/warning-feature`、`@link/shared-core`、`@link/shared-ui`

- [ ] **步骤 1：创建根工作区配置**

创建 `package.json`：

```json
{
  "name": "@link/monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.14.0",
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "dev:front": "pnpm --filter @link/link-front dev",
    "dev:warning": "pnpm --filter @link/link-warning dev",
    "build:front": "pnpm --filter @link/link-front build",
    "build:warning": "pnpm --filter @link/link-warning build",
    "build": "pnpm run build:front && pnpm run build:warning",
    "lint": "pnpm --filter './apps/*' lint",
    "test:migration": "node --test scripts/migration/*.test.mjs scripts/audit/*.test.mjs",
    "audit:shared": "node scripts/audit/shared-source-audit.mjs apps/link-warning/src apps/link-front/src docs/migration/shared-source-audit.json",
    "verify:sources": "node scripts/migration/compare-manifests.mjs docs/migration/source-before.json docs/migration/source-after.json"
  },
  "pnpm": {
    "overrides": {
      "axios": "^1.11.0"
    }
  }
}
```

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

创建 `.gitignore`：

```gitignore
.DS_Store
.cache/
.rsbuild-cache/
node_modules/
dist/
apps/*/dist/
packages/*/dist/
*.log
.env.local
```

创建 `.npmrc`：

```ini
registry=http://jk.e20.com.cn:18081/repository/npm-group/
always-auth=true
//jk.e20.com.cn:18081/repository/npm-group/:_auth=${NPM_AUTH}
audit=false
node-linker=hoisted
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
fetch-retries=5
fetch-timeout=60000
```

- [ ] **步骤 2：创建三个私有工作区包边界**

分别创建三个 `package.json`，除包名外内容一致：

```json
{
  "name": "@link/warning-feature",
  "version": "0.0.0",
  "private": true,
  "type": "module"
}
```

```json
{
  "name": "@link/shared-core",
  "version": "0.0.0",
  "private": true,
  "type": "module"
}
```

```json
{
  "name": "@link/shared-ui",
  "version": "0.0.0",
  "private": true,
  "type": "module"
}
```

- [ ] **步骤 3：修改两个应用包名并声明工作区依赖**

在 `apps/link-front/package.json` 中把：

```json
"name": "elink"
```

改为：

```json
"name": "@link/link-front"
```

并在 `dependencies` 中加入：

```json
"@link/shared-core": "workspace:*",
"@link/shared-ui": "workspace:*",
"@link/warning-feature": "workspace:*"
```

对 `apps/link-warning/package.json` 做相同修改，包名使用：

```json
"name": "@link/link-warning"
```

- [ ] **步骤 4：验证工作区声明**

执行：

```bash
NPM_AUTH=workspace-check pnpm list -r --depth -1
```

预期：列出根包、两个应用包和三个共享包，共 6 个工作区包。

- [ ] **步骤 5：提交工作区配置**

```bash
git add .gitignore .npmrc package.json pnpm-workspace.yaml apps/*/package.json packages
git commit -m "build: configure pnpm monorepo workspace"
```

---

### 任务 5：调整应用构建边界

**文件：**
- 修改：`apps/link-front/rsbuild.config.js`
- 修改：`apps/link-warning/rsbuild.config.js`
- 修改：`apps/link-warning/aliasconfig.js`

**接口：**
- 产出：完整版构建目录 `<repo>/dist/link-front`
- 产出：预警版构建目录 `<repo>/dist/link-warning`

- [ ] **步骤 1：修改完整版应用输出目录**

在 `apps/link-front/rsbuild.config.js` 的 `output.distPath` 中，把：

```js
root: 'dist',
```

改为：

```js
root: resolve('../../dist/link-front'),
```

- [ ] **步骤 2：修改预警应用输出目录**

在 `apps/link-warning/rsbuild.config.js` 中做同样修改，目标为：

```js
root: resolve('../../dist/link-warning'),
```

- [ ] **步骤 3：删除预警应用中指向旧空目录的临时别名**

在 `apps/link-warning/aliasconfig.js` 中删除：

```js
'link-shared': 'link-shared'
```

以及 `if (item === 'link-shared')` 的特殊处理分支。保留原有 `@edu`、
`@systemReview`、`@specialOperation`、`@groupReport` 和 `@linkEditor` 逻辑。

- [ ] **步骤 4：静态检查两个输出目录配置**

执行：

```bash
rg -n "root: resolve\('../../dist/link-front'\)" apps/link-front/rsbuild.config.js
rg -n "root: resolve\('../../dist/link-warning'\)" apps/link-warning/rsbuild.config.js
```

预期：两个命令各匹配一行。

- [ ] **步骤 5：验证来源目录仍未变化并提交**

重新生成 `docs/migration/source-after.json`，然后执行：

```bash
node scripts/migration/compare-manifests.mjs docs/migration/source-before.json docs/migration/source-after.json
git add apps/link-front/rsbuild.config.js apps/link-warning/rsbuild.config.js apps/link-warning/aliasconfig.js docs/migration/source-after.json
git commit -m "build: isolate application output directories"
```

预期：提交前输出 `来源目录未发生变化`。

---

### 任务 6：安装依赖并验证双应用构建

**文件：**
- 创建：`pnpm-lock.yaml`
- 生成但不提交：`node_modules/`
- 生成但不提交：`dist/link-front/`、`dist/link-warning/`

**接口：**
- 使用：根工作区命令
- 产出：两个独立生产构建

- [ ] **步骤 1：从本机现有配置临时读取认证并安装依赖**

执行下面的命令。认证值只进入当前命令的环境变量，不打印、不写入新仓库：

```bash
NPM_AUTH="$(node -e "const fs=require('node:fs'); const text=fs.readFileSync('/Users/jxz/project/new/front/project/link-warning/.npmrc','utf8'); const match=text.match(/:_auth=['\"]?([^'\"\n]+)['\"]?/); if(!match) process.exit(1); process.stdout.write(match[1])")" pnpm install
```

预期：生成一个根 `pnpm-lock.yaml`，安装过程不在 `apps` 中生成独立锁文件。

- [ ] **步骤 2：运行迁移工具测试**

执行：

```bash
pnpm test:migration
```

预期：全部测试通过，0 项失败。

- [ ] **步骤 3：验证 Rsbuild 配置可以加载**

执行：

```bash
pnpm --filter @link/link-front exec rsbuild inspect --mode=production > /tmp/link-front-rsbuild.json
pnpm --filter @link/link-warning exec rsbuild inspect --mode=production > /tmp/link-warning-rsbuild.json
rg -n 'dist/link-front' /tmp/link-front-rsbuild.json
rg -n 'dist/link-warning' /tmp/link-warning-rsbuild.json
```

预期：两个检查结果分别包含各自的目标输出路径。

- [ ] **步骤 4：构建完整版应用**

执行：

```bash
pnpm build:front
```

预期：命令退出码为 0，`dist/link-front/index.html` 存在。

- [ ] **步骤 5：构建预警应用**

执行：

```bash
pnpm build:warning
```

预期：命令退出码为 0，`dist/link-warning/index.html` 存在。

- [ ] **步骤 6：验证两个产物相互独立**

执行：

```bash
test -f dist/link-front/index.html
test -f dist/link-warning/index.html
test "$(realpath dist/link-front)" != "$(realpath dist/link-warning)"
```

预期：三个命令均退出 0。

- [ ] **步骤 7：提交锁文件**

```bash
git add pnpm-lock.yaml
git commit -m "build: lock monorepo dependencies"
```

---

### 任务 7：生成共享源码审计结果

**文件：**
- 创建：`scripts/audit/shared-source-audit.mjs`
- 创建：`scripts/audit/shared-source-audit.test.mjs`
- 创建：`docs/migration/shared-source-audit.json`

**接口：**
- 产出：`auditSharedSources(smallerRoot, largerRoot)`
- 产出字段：`counts`、`identicalFiles`、`differentFiles`、`smallerOnlyFiles`、`largerOnlyFiles`

- [ ] **步骤 1：编写审计工具失败测试**

创建 `scripts/audit/shared-source-audit.test.mjs`：

```js
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { auditSharedSources } from './shared-source-audit.mjs'

test('按相对路径和内容区分相同、差异及单边文件', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-audit-'))
  const warning = path.join(root, 'warning')
  const front = path.join(root, 'front')
  await mkdir(warning)
  await mkdir(front)
  await writeFile(path.join(warning, 'same.js'), 'same\n')
  await writeFile(path.join(front, 'same.js'), 'same\n')
  await writeFile(path.join(warning, 'different.js'), 'warning\n')
  await writeFile(path.join(front, 'different.js'), 'front\n')
  await writeFile(path.join(warning, 'warning-only.js'), 'warning\n')
  await writeFile(path.join(front, 'front-only.js'), 'front\n')

  const result = await auditSharedSources(warning, front)

  assert.deepEqual(result.identicalFiles, ['same.js'])
  assert.deepEqual(result.differentFiles, ['different.js'])
  assert.deepEqual(result.smallerOnlyFiles, ['warning-only.js'])
  assert.deepEqual(result.largerOnlyFiles, ['front-only.js'])
})
```

- [ ] **步骤 2：运行测试并确认失败**

执行：

```bash
node --test scripts/audit/shared-source-audit.test.mjs
```

预期：失败，错误包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **步骤 3：实现审计工具**

创建 `scripts/audit/shared-source-audit.mjs`：

```js
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

async function listFiles(root, relative = '') {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name === '.DS_Store') continue
    const filePath = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(root, filePath))
    else files.push(filePath)
  }
  return files
}

async function hashFile(root, filePath) {
  return createHash('sha256').update(await readFile(path.join(root, filePath))).digest('hex')
}

export async function auditSharedSources(smallerRoot, largerRoot) {
  const smallerFiles = await listFiles(smallerRoot)
  const largerFiles = await listFiles(largerRoot)
  const smallerSet = new Set(smallerFiles)
  const largerSet = new Set(largerFiles)
  const commonFiles = smallerFiles.filter(file => largerSet.has(file))
  const identicalFiles = []
  const differentFiles = []

  for (const file of commonFiles) {
    const identical = await hashFile(smallerRoot, file) === await hashFile(largerRoot, file)
    ;(identical ? identicalFiles : differentFiles).push(file)
  }

  const smallerOnlyFiles = smallerFiles.filter(file => !largerSet.has(file))
  const largerOnlyFiles = largerFiles.filter(file => !smallerSet.has(file))
  return {
    counts: {
      smaller: smallerFiles.length,
      larger: largerFiles.length,
      common: commonFiles.length,
      identical: identicalFiles.length,
      different: differentFiles.length,
      smallerOnly: smallerOnlyFiles.length,
      largerOnly: largerOnlyFiles.length,
    },
    identicalFiles,
    differentFiles,
    smallerOnlyFiles,
    largerOnlyFiles,
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [smallerRoot, largerRoot, outputPath] = process.argv.slice(2)
  if (!smallerRoot || !largerRoot || !outputPath) {
    throw new Error('用法: node shared-source-audit.mjs <较小源码目录> <较大源码目录> <输出文件>')
  }
  const result = await auditSharedSources(smallerRoot, largerRoot)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result.counts))
}
```

- [ ] **步骤 4：运行测试并生成真实审计结果**

执行：

```bash
node --test scripts/audit/shared-source-audit.test.mjs
pnpm audit:shared
```

预期：测试通过；审计结果的 `common` 大于 0，`different` 大于 0。

- [ ] **步骤 5：验证双应用构建和来源不变**

执行：

```bash
pnpm build
pnpm verify:sources
```

预期：两个应用构建成功，并输出 `来源目录未发生变化`。

- [ ] **步骤 6：提交审计工具和结果**

```bash
git add scripts/audit docs/migration/shared-source-audit.json
git commit -m "chore: audit shared application sources"
```

---

### 任务 8：基线验收和第二阶段交接

**文件：**
- 修改：`README.md`
- 创建：`docs/migration/foundation-verification.md`

**接口：**
- 使用：任务 1 至任务 7 的验证命令和审计结果
- 产出：可复核的基线验收记录，以及共享预警模块提取计划的固定输入

- [ ] **步骤 1：编写根 README**

README 必须包含以下可直接执行的内容：

````markdown
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
````

- [ ] **步骤 2：执行完整验收并记录结果**

执行：

```bash
pnpm test:migration
pnpm build
pnpm verify:sources
git status --short
```

在 `docs/migration/foundation-verification.md` 记录执行日期、Node/pnpm 版本、
两项构建的退出码、两个产物 `index.html` 的 SHA-256、来源摘要比较结果和
`git status --short` 输出。所有字段必须填写实际值，不写推测值。

预期：测试和构建退出码均为 0，来源摘要相同；提交验收记录前只有 README 和验收
记录处于未提交状态。

- [ ] **步骤 3：提交基线验收记录**

```bash
git add README.md docs/migration/foundation-verification.md
git commit -m "docs: record monorepo foundation verification"
```

- [ ] **步骤 4：确认工作区干净**

执行：

```bash
git status --short
```

预期：无输出。

- [ ] **步骤 5：创建第二阶段计划的输入清单**

第二阶段计划必须读取以下已提交文件，不再直接依赖旧项目：

```text
docs/migration/shared-source-audit.json
docs/migration/source-revisions.json
apps/link-front/src/
apps/link-warning/src/
```

第二阶段按 `ForewarningManagement`、`videoWarning`、共享基础依赖的顺序提取模块，
每个模块都必须在删除应用内副本前完成两个应用的构建和业务验证。
