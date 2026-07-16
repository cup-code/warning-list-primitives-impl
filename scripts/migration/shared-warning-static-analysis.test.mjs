import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const apps = ['link-warning', 'link-front']
const charts = [
  'OrgWarningTable',
  'PointWarningTable',
  'WarningLevelChart',
  'WarningProcessChart',
  'WarningTrendChart',
  'WarningTypeChart',
]

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}

test('公共包显式导出静态分析页面、搜索表单、六个图表和统计配置', async () => {
  const ui = JSON.parse(await source('packages/shared-ui/package.json'))
  assert.equal(
    ui.exports['./forewarning-management/static-analysis'],
    './src/forewarning-management/static-analysis/StaticAnalysisPage.vue',
  )
  assert.equal(
    ui.exports['./forewarning-management/static-analysis/search-form'],
    './src/forewarning-management/static-analysis/SearchForm.vue',
  )
  for (const chart of charts) {
    const key = chart.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    assert.equal(
      ui.exports[`./forewarning-management/static-analysis/charts/${key}`],
      `./src/forewarning-management/static-analysis/charts/${chart}.vue`,
    )
  }

  const feature = JSON.parse(await source('packages/warning-feature/package.json'))
  assert.equal(
    feature.exports['./static-analysis-config'],
    './src/static-analysis/config.js',
  )
})

test('公共静态分析源码不反向依赖应用源码', async () => {
  const files = [
    'StaticAnalysisPage.vue',
    'SearchForm.vue',
    'staticAnalysisHostCapabilities.js',
    ...charts.map(chart => `charts/${chart}.vue`),
  ]
  for (const file of files) {
    const value = await source(
      `packages/shared-ui/src/forewarning-management/static-analysis/${file}`,
    )
    assert.doesNotMatch(value, /@\//, file)
    assert.doesNotMatch(value, /apps\//, file)
  }
})

test('两端原路径全部保留且页面和组件只做公共组件适配', async () => {
  const wrappers = [
    ['staticAnalyze.vue', 'static-analysis'],
    ['components/SearchForm.vue', 'static-analysis/search-form'],
    ...charts.map(chart => [
      `components/charts/${chart}.vue`,
      `static-analysis/charts/${chart.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
    ]),
  ]

  for (const app of apps) {
    for (const [file, exportPath] of wrappers) {
      const value = await source(`apps/${app}/src/views/ForewarningManagement/${file}`)
      assert.match(value, new RegExp(`@link/shared-ui/forewarning-management/${exportPath}`))
      assert.match(value, /staticAnalysisHost/)
      assert.doesNotMatch(value, /html2canvas|getScreenData|exportWarning|exportOrg|exportPoint/)
    }
    const config = await source(
      `apps/${app}/src/views/ForewarningManagement/test/stasticAnalyzeTest.js`,
    )
    assert.match(config, /@link\/warning-feature\/static-analysis-config/)
  }
})

test('两端 host 结构一致且只保留三个已确认差异', async () => {
  const warning = await source(
    'apps/link-warning/src/views/ForewarningManagement/staticAnalysisHost.js',
  )
  const front = await source(
    'apps/link-front/src/views/ForewarningManagement/staticAnalysisHost.js',
  )
  for (const capability of [
    'getScreenData',
    'exportOrgWarning',
    'exportPointWarning',
    'exportWarningLevel',
    'exportWarningProcess',
    'exportWarningTrend',
    'exportWarningType',
  ]) {
    assert.match(warning, new RegExp(`\\b${capability}\\b`))
    assert.match(front, new RegExp(`\\b${capability}\\b`))
  }
  assert.equal(
    warning,
    front
      .replace('logSearchForm: false', 'logSearchForm: true')
      .replace('listenWarningTypeRefresh: false', 'listenWarningTypeRefresh: true')
      .replace('searchCardNoneBottom: true', 'searchCardNoneBottom: false'),
  )
})

test('统计配置 shim 逐字一致，公共页面显式消费三个差异能力', async () => {
  const warning = await source(
    'apps/link-warning/src/views/ForewarningManagement/test/stasticAnalyzeTest.js',
  )
  const front = await source(
    'apps/link-front/src/views/ForewarningManagement/test/stasticAnalyzeTest.js',
  )
  assert.equal(warning, front)

  const page = await source(
    'packages/shared-ui/src/forewarning-management/static-analysis/StaticAnalysisPage.vue',
  )
  assert.match(page, /host\.logSearchForm/)
  assert.match(page, /host\.listenWarningTypeRefresh/)
  assert.match(page, /host\.searchCardNoneBottom/)
})
