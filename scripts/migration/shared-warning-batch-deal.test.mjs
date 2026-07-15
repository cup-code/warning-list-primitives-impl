import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']
const components = [
  {
    appFile: 'src/views/ForewarningManagement/components/batchDeal.vue',
    sharedFile: 'packages/shared-ui/src/forewarning-management/BatchDeal.vue',
    exportPath: './forewarning-management/batch-deal',
    exportFile: './src/forewarning-management/BatchDeal.vue',
    importPath: '@link/shared-ui/forewarning-management/batch-deal',
  },
  {
    appFile: 'src/views/ForewarningManagement/components/dealDialog.vue',
    sharedFile: 'packages/shared-ui/src/forewarning-management/DealDialog.vue',
    exportPath: './forewarning-management/deal-dialog',
    exportFile: './src/forewarning-management/DealDialog.vue',
    importPath: '@link/shared-ui/forewarning-management/deal-dialog',
  },
]

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

test('共享 UI 包显式导出批量处理组件并依赖业务模型', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  for (const component of components) {
    assert.equal(packageJson.exports[component.exportPath], component.exportFile)
  }
  assert.equal(packageJson.dependencies['@link/warning-feature'], 'workspace:*')
  assert.equal(packageJson.dependencies['vue-router'], undefined)
  assert.equal(packageJson.dependencies.vuex, undefined)
})

test('共享 UI 只依赖公共包和注入能力', async () => {
  for (const component of components) {
    const source = await readWorkspaceFile(component.sharedFile)
    assert.doesNotMatch(source, /@\//)
    assert.doesNotMatch(source, /apps\//)
    assert.doesNotMatch(source, /\b(?:router|store)\b/i)
  }

  const batchDeal = await readWorkspaceFile(components[0].sharedFile)
  const dealDialog = await readWorkspaceFile(components[1].sharedFile)

  for (const prop of ['layout', 'userType', 'checkAll', 'batchType', 'isIndeterminate', 'selected']) {
    assert.match(batchDeal, new RegExp(`props:\\s*\\{[\\s\\S]*?\\b${prop}\\s*:`))
  }
  for (const event of ['checkAllChange', 'delete', 'success']) {
    assert.match(batchDeal, new RegExp(`\\$emit\\(\\s*['"]${event}['"]`))
  }

  for (const prop of ['visible', 'userType', 'selectedWarnings']) {
    assert.match(dealDialog, new RegExp(`props:\\s*\\{[\\s\\S]*?\\b${prop}\\s*:`))
  }
  for (const event of ['update:visible', 'close', 'success']) {
    assert.match(dealDialog, new RegExp(`(?:^|[^\\w$])emit\\(\\s*['"]${event}['"]`))
  }

  assert.match(dealDialog, /@link\/warning-feature\/batch-deal/)
  assert.match(dealDialog, /batchAttentionAlarm:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(dealDialog, /batchAttentionAlarmInternal:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
})

test('两个应用保留原路径并只注入宿主预警 API', async () => {
  for (const appRoot of appRoots) {
    for (const component of components) {
      const source = await readWorkspaceFile(path.join(appRoot, component.appFile))
      assert.match(source, new RegExp(component.importPath.replaceAll('/', '\\/')))
      assert.match(source, /@\/http\/videoWarning\/warning-api/)
      assert.match(source, /batchAttentionAlarm/)
      assert.match(source, /batchAttentionAlarmInternal/)
      assert.match(source, /v-bind\s*=\s*['"]\$attrs['"]/)
      assert.match(source, /v-on\s*=\s*['"]\$listeners['"]/)
      assert.doesNotMatch(source, /<div[\s>]/)
    }
  }
})
