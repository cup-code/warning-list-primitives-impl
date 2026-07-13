import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']
const warningApiPath = 'src/http/videoWarning/warning-api.js'

async function readWorkspaceFile(relativePath) {
  return readFile(path.join(workspaceRoot, relativePath), 'utf8')
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nestedFiles = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? listSourceFiles(entryPath) : [entryPath]
  }))
  return nestedFiles.flat()
}

test('两个应用使用逐字一致的预警 API shim', async () => {
  const sources = await Promise.all(appRoots.map(appRoot => (
    readWorkspaceFile(path.join(appRoot, warningApiPath))
  )))

  assert.equal(sources[0], sources[1])
})

test('预警 API shim 只导入共享工厂和允许的宿主依赖', async () => {
  const source = await readWorkspaceFile(path.join(appRoots[0], warningApiPath))
  const imports = [...source.matchAll(/^import[\s\S]*?from\s+['"]([^'"]+)['"]\s*$/gm)]
    .map(match => match[1])
    .sort()

  assert.deepEqual(imports, [
    '../common/utils',
    '@link/warning-feature/video-warning',
    'js-file-download',
    'qs',
  ].sort())
  assert.match(
    source,
    /import\s+\{\s*createVideoWarningApi\s*\}\s+from\s+['"]@link\/warning-feature\/video-warning['"]/,
  )
})

test('共享预警 API 工厂不依赖宿主应用', async () => {
  const source = await readWorkspaceFile(
    'packages/warning-feature/src/video-warning/createVideoWarningApi.js',
  )

  for (const forbidden of ['@/', 'apps/', '../common/utils', 'vuex', 'router']) {
    assert.equal(source.includes(forbidden), false, `共享工厂包含宿主耦合: ${forbidden}`)
  }
})

test('应用源码树中不存在第二份预警 API 工厂实现', async () => {
  for (const appRoot of appRoots) {
    const sourceRoot = path.join(workspaceRoot, appRoot, 'src')
    const warningApi = path.join(sourceRoot, 'http/videoWarning/warning-api.js')
    const sourceFiles = (await listSourceFiles(sourceRoot))
      .filter(file => /\.[cm]?[jt]sx?$/.test(file) && file !== warningApi)

    for (const file of sourceFiles) {
      const source = await readFile(file, 'utf8')
      assert.doesNotMatch(
        source,
        /(?:function\s+createVideoWarningApi\b|(?:const|let|var)\s+createVideoWarningApi\s*=)/,
        `${path.relative(workspaceRoot, file)} 包含额外的 createVideoWarningApi 实现`,
      )
    }
  }
})
