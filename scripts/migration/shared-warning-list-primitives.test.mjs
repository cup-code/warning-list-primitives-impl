import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const apps = ['link-warning', 'link-front']
const sharedRoot = 'packages/shared-ui/src/forewarning-management/warning-list'

const sharedExports = {
  './forewarning-management/warning-list/check-group':
    './src/forewarning-management/warning-list/CheckGroup.vue',
  './forewarning-management/warning-list/list':
    './src/forewarning-management/warning-list/ForewarningList.vue',
  './forewarning-management/warning-list/warning-info':
    './src/forewarning-management/warning-list/WarningInfo.vue',
  './forewarning-management/warning-list/table-config':
    './src/forewarning-management/warning-list/tableListConfig.js',
}

const wrappers = [
  ['checkGroup.vue', 'check-group'],
  ['list.vue', 'list'],
  ['warningInfo.vue', 'warning-info'],
]

const consumingPages = [
  'warningList.vue',
  'misjudgeList.vue',
  'customMisjudgeList.vue',
  'clientWarningList.vue',
  'attentionList.vue',
  'allTenantWaringList.vue',
]

const source = relativePath => readFile(path.join(root, relativePath), 'utf8')

const appViewPath = (app, relativePath) => (
  `apps/${app}/src/views/ForewarningManagement/${relativePath}`
)

test('共享 UI 包显式导出全部预警列表公共内核', async () => {
  const manifest = JSON.parse(await source('packages/shared-ui/package.json'))

  for (const [exportPath, implementationPath] of Object.entries(sharedExports)) {
    assert.equal(manifest.exports[exportPath], implementationPath, exportPath)
  }
})

test('公共预警列表源码不反向依赖应用源码', async () => {
  const sharedFiles = [
    'CheckGroup.vue',
    'ForewarningList.vue',
    'WarningInfo.vue',
    'warningListHostCapabilities.js',
  ]

  for (const file of sharedFiles) {
    const value = await source(`${sharedRoot}/${file}`)
    assert.doesNotMatch(value, /@\//, file)
    assert.doesNotMatch(value, /apps\//, file)
  }
})

test('两个应用保留三个原路径包装并注入本端 host', async () => {
  for (const app of apps) {
    for (const [file, exportName] of wrappers) {
      const value = await source(appViewPath(app, `components/${file}`))
      assert.match(
        value,
        new RegExp(`@link/shared-ui/forewarning-management/warning-list/${exportName}`),
        `${app}/${file}`,
      )
      assert.match(value, /import\s+warningListHost\s+from\s+['"]\.\.\/warningListHost['"]/, `${app}/${file}`)
    }
  }
})

test('两个列表包装保留 setSelections 命令式代理', async () => {
  for (const app of apps) {
    const value = await source(appViewPath(app, 'components/list.vue'))
    assert.match(value, /setSelections\(ids\)\s*{/)
    assert.match(value, /this\.\$refs\.sharedList\.setSelections\(ids\)/)
  }
})

test('两端配置只共享 tableListConfig 并保留本地符号', async () => {
  for (const app of apps) {
    const value = await source(appViewPath(app, 'config.js'))
    const exportBlock = value.match(/export\s*{(?<symbols>[^}]*)}/s)
    assert.ok(exportBlock, `${app}/config.js 应保留命名导出`)
    const exportedSymbols = exportBlock.groups.symbols
      .split(',')
      .map(symbol => symbol.trim())
      .filter(Boolean)

    assert.match(
      value,
      /import\s+{\s*tableListConfig\s*}\s+from\s+['"]@link\/shared-ui\/forewarning-management\/warning-list\/table-config['"]/,
      app,
    )
    assert.doesNotMatch(value, /const\s+tableListConfig\s*=/, app)
    assert.ok(exportedSymbols.includes('tableListConfig'), `${app}/tableListConfig`)

    for (const localSymbol of ['cameraListConfig', 'machineListConfig', 'WarningListConfig']) {
      assert.match(value, new RegExp(`const\\s+${localSymbol}\\s*=`), `${app}/${localSymbol}`)
      assert.ok(exportedSymbols.includes(localSymbol), `${app}/${localSymbol}`)
    }

    if (app === 'link-front') {
      assert.match(value, /const\s+cardSirenColumns\s*=/)
      assert.ok(exportedSymbols.includes('cardSirenColumns'))
    }
    else {
      assert.doesNotMatch(value, /\bcardSirenColumns\b/)
      assert.equal(exportedSymbols.includes('cardSirenColumns'), false)
    }
  }
})

test('两端 warningListHost 只在详情参数模式上不同', async () => {
  const [warning, front] = await Promise.all(apps.map(app => (
    source(appViewPath(app, 'warningListHost.js'))
  )))
  const hostKeys = value => [...value.matchAll(/^  (\w+)(?:\([^)]*\))?\s*(?::|{)/gm)]
    .map(match => match[1])

  assert.deepEqual(hostKeys(warning), [
    'detailPayloadMode',
    'getDictList',
    'getFilePrefix',
    'pushWarningDetail',
  ])
  assert.deepEqual(hostKeys(front), hostKeys(warning))
  assert.match(warning, /detailPayloadMode:\s*['"]id['"]/)
  assert.match(front, /detailPayloadMode:\s*['"]form['"]/)
  assert.equal(
    warning,
    front.replace(/detailPayloadMode:\s*['"]form['"]/, "detailPayloadMode: 'id'"),
  )
})

test('六个消费页面继续通过应用原路径引用组件', async () => {
  for (const page of consumingPages) {
    for (const app of apps) {
      const value = await source(appViewPath(app, page))
      assert.doesNotMatch(value, /@link\/shared-ui/, `${app}/${page}`)
      for (const component of ['list', 'checkGroup', 'warningInfo']) {
        assert.match(value, new RegExp(`['"]\\./components/${component}\\.vue['"]`), `${app}/${page}`)
      }
    }
  }
})
