import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

function staticImportSources(source) {
  return [...source.matchAll(/^import(?:[\s\S]*?)\sfrom\s+['"]([^'"]+)['"]/gm)]
    .map(match => match[1])
    .sort()
}

test('两个应用的预警 Vuex shim 保持一致且宿主依赖明确', async () => {
  const [frontBatch, warningBatch, frontDetail, warningDetail, sharedFactory] = await Promise.all([
    readWorkspaceFile('apps/link-front/src/views/ForewarningManagement/store/batchInfo.js'),
    readWorkspaceFile('apps/link-warning/src/views/ForewarningManagement/store/batchInfo.js'),
    readWorkspaceFile('apps/link-front/src/views/ForewarningManagement/store/detailInfo.js'),
    readWorkspaceFile('apps/link-warning/src/views/ForewarningManagement/store/detailInfo.js'),
    readWorkspaceFile('packages/warning-feature/src/state/createDetailInfoModule.js'),
  ])

  assert.equal(frontBatch, warningBatch)
  assert.equal(frontBatch, "export { default } from '@link/warning-feature/batch-selection'\n")
  assert.equal(frontDetail, warningDetail)
  assert.match(frontDetail, /createDetailInfoModule/)
  assert.match(frontDetail, /@link\/warning-feature\/detail-info/)
  assert.match(frontDetail, /@\/http\/videoWarning\/warning-api/)
  assert.deepEqual(staticImportSources(frontDetail), [
    '@/http/videoWarning/warning-api',
    '@link/warning-feature/detail-info',
  ])
  for (const forbidden of ['@/', 'apps/', 'router', 'store/index']) {
    assert.equal(sharedFactory.includes(forbidden), false)
  }
})

test('预警功能包显式导出两个状态入口', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/warning-feature/package.json'))
  assert.equal(packageJson.exports['./batch-selection'], './src/state/batchSelection.js')
  assert.equal(packageJson.exports['./detail-info'], './src/state/createDetailInfoModule.js')
})
