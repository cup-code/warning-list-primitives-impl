import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

test('工作区应用统一由根 pnpm 锁文件覆盖', async () => {
  const lockfilePath = path.join(workspaceRoot, 'pnpm-lock.yaml')
  await access(lockfilePath)

  const [lockfile, workspaceConfig, appEntries] = await Promise.all([
    readFile(lockfilePath, 'utf8'),
    readFile(path.join(workspaceRoot, 'pnpm-workspace.yaml'), 'utf8'),
    readdir(path.join(workspaceRoot, 'apps'), { withFileTypes: true }),
  ])
  const appDirectories = appEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  assert.match(workspaceConfig, /^\s*-\s*['"]?apps\/\*['"]?\s*$/m)
  assert.ok(appDirectories.length > 0, 'apps 下应至少包含一个工作区应用')

  for (const appDirectory of appDirectories) {
    const relativeAppPath = `apps/${appDirectory}`
    await access(path.join(workspaceRoot, relativeAppPath, 'package.json'))
    assert.match(
      lockfile,
      new RegExp(`^  ${relativeAppPath.replace('/', '\\/')}:$`, 'm'),
      `${relativeAppPath} 应在根 pnpm-lock.yaml 的 importers 中`,
    )
    await assert.rejects(
      access(path.join(workspaceRoot, relativeAppPath, 'package-lock.json')),
      `${relativeAppPath} 不应保留 package-lock.json`,
    )
  }
})

test('shared-ui 锁文件 importer 完整记录 manifest 依赖', async () => {
  const [lockfile, manifestSource] = await Promise.all([
    readFile(path.join(workspaceRoot, 'pnpm-lock.yaml'), 'utf8'),
    readFile(path.join(workspaceRoot, 'packages/shared-ui/package.json'), 'utf8'),
  ])
  const manifest = JSON.parse(manifestSource)
  const importer = lockfile.match(
    /^  packages\/shared-ui:\n(?<body>(?:(?: {4,}.*)?\n)*)/m,
  )

  assert.ok(importer, 'pnpm-lock.yaml 应包含 packages/shared-ui importer')

  const expectedDependencies = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  }
  const dependencies = importer.groups.body.match(
    /^    dependencies:\n(?<body>(?:(?: {6,}.*)?\n)*)/m,
  )

  assert.ok(dependencies, 'shared-ui importer 应包含 dependencies')

  for (const [name, specifier] of Object.entries(expectedDependencies)) {
    assert.match(
      dependencies.groups.body,
      new RegExp(
        `^      ['"]?${escapeRegExp(name)}['"]?:\\n        specifier: ${escapeRegExp(specifier)}$`,
        'm',
      ),
      `shared-ui importer dependencies 应记录 ${name}=${specifier}`,
    )
  }
})
