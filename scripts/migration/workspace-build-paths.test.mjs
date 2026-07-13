import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  resolveWorkspaceDependency,
  workspaceNodeModules,
} from '../../apps/build-paths.mjs'

test('构建依赖从工作区根 node_modules 解析', () => {
  const testDirectory = path.dirname(fileURLToPath(import.meta.url))
  const workspaceRoot = path.resolve(testDirectory, '../..')

  assert.equal(workspaceNodeModules, path.join(workspaceRoot, 'node_modules'))
  assert.equal(
    resolveWorkspaceDependency('dayjs'),
    path.join(workspaceRoot, 'node_modules/dayjs'),
  )
})

test('pnpm 执行构建所需的依赖安装脚本', async () => {
  const testDirectory = path.dirname(fileURLToPath(import.meta.url))
  const workspaceRoot = path.resolve(testDirectory, '../..')
  const packageJson = JSON.parse(
    await readFile(path.join(workspaceRoot, 'package.json'), 'utf8'),
  )

  assert.deepEqual(packageJson.pnpm.onlyBuiltDependencies, [
    'cwebp-bin',
    'vue-demi',
  ])
})

test('Vue 2 应用使用 VueUse 的 CommonJS 兼容入口', async () => {
  const expected = resolveWorkspaceDependency('@vueuse/core/index.cjs')
  const configs = await Promise.all([
    import('../../apps/link-front/rsbuild.config.js'),
    import('../../apps/link-warning/rsbuild.config.js'),
  ])

  for (const { default: createConfig } of configs) {
    assert.equal(
      createConfig('production').resolve.alias['@vueuse/core$'],
      expected,
    )
  }
})
