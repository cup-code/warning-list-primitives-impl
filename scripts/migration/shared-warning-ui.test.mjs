import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']
const components = [
  {
    appPath: 'src/views/ForewarningManagement/components/ChartCard.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/ChartCard.vue',
    exportPath: './forewarning-management/chart-card',
    importPath: '@link/shared-ui/forewarning-management/chart-card',
    digest: '198babab10cf461e2a8ad8c1d5f181279a900813b187ac2d3bd23698498b0d40',
  },
  {
    appPath: 'src/views/ForewarningManagement/components/ChartContainer.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/ChartContainer.vue',
    exportPath: './forewarning-management/chart-container',
    importPath: '@link/shared-ui/forewarning-management/chart-container',
    digest: '40395fe2542c027f9b2889be3f288f230db7dbf21bf0dd091b961a284b0090f0',
  },
  {
    appPath: 'src/views/ForewarningManagement/components/ReportExport/SkillTable.vue',
    sharedPath: 'packages/shared-ui/src/forewarning-management/SkillTable.vue',
    exportPath: './forewarning-management/skill-table',
    importPath: '@link/shared-ui/forewarning-management/skill-table',
    digest: '92d6d134bb53cdd283bcc91cf64684d4d48a9ec21b912ec6853f10232f3a2a0f',
  },
]

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

test('共享 UI 包显式导出三个预警组件', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  for (const component of components) {
    assert.equal(packageJson.exports[component.exportPath], `./src/forewarning-management/${path.basename(component.sharedPath)}`)
  }
})

test('共享组件实现与迁移前基线逐字一致', async () => {
  for (const component of components) {
    const source = await readWorkspaceFile(component.sharedPath)
    const digest = createHash('sha256').update(source).digest('hex')
    assert.equal(digest, component.digest, component.sharedPath)
  }
})

test('两个应用只从共享 UI 包转发组件', async () => {
  for (const appRoot of appRoots) {
    for (const component of components) {
      const source = await readWorkspaceFile(path.join(appRoot, component.appPath))
      assert.equal(source, `<script>\nexport { default } from '${component.importPath}'\n</script>\n`)
    }
  }
})
