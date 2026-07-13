import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')

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
