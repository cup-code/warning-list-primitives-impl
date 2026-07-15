import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const apps = ['link-warning', 'link-front']
const sharedRoot = path.join(
  root,
  'packages/shared-ui/src/forewarning-management/report-export',
)

const sharedFiles = [
  'ReportExportPage.vue',
  'ReportForm.vue',
  'ReportPreview.vue',
  'ReportTable.vue',
  'StatGrid.vue',
  'reportChartMixin.js',
]

const originalFiles = [
  'reportExport.vue',
  'components/ReportExport/ReportForm.vue',
  'components/ReportExport/ReportPreview.vue',
  'components/ReportExport/ReportTable.vue',
  'components/ReportExport/SkillTable.vue',
  'components/ReportExport/StatGrid.vue',
  'test/reportChart.js',
  'test/reportData.js',
]

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}

function assertProps(value, props) {
  for (const prop of props) {
    assert.match(value, new RegExp(`props:\\s*\\{[\\s\\S]*?\\b${prop}\\s*:`))
  }
}

test('shared-ui 显式导出报表页面、组件和图表 mixin', async () => {
  const manifest = JSON.parse(await source('packages/shared-ui/package.json'))
  const expected = {
    './forewarning-management/report-export': './src/forewarning-management/report-export/ReportExportPage.vue',
    './forewarning-management/report-export/form': './src/forewarning-management/report-export/ReportForm.vue',
    './forewarning-management/report-export/preview': './src/forewarning-management/report-export/ReportPreview.vue',
    './forewarning-management/report-export/table': './src/forewarning-management/report-export/ReportTable.vue',
    './forewarning-management/report-export/stat-grid': './src/forewarning-management/report-export/StatGrid.vue',
    './forewarning-management/report-export/chart-mixin': './src/forewarning-management/report-export/reportChartMixin.js',
  }
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(manifest.exports[key], value)
  }
})

test('公共报表源码只依赖公共包和注入能力', async () => {
  for (const file of sharedFiles) {
    const value = await readFile(path.join(sharedRoot, file), 'utf8')
    assert.doesNotMatch(value, /@\//)
    assert.doesNotMatch(value, /apps\//)
    assert.doesNotMatch(value, /\b(?:router|store|sessionStorage|localStorage)\b/i)
  }
})

test('两个应用保留全部原路径并只包含适配逻辑', async () => {
  for (const app of apps) {
    for (const file of originalFiles) {
      const value = await source(`apps/${app}/src/views/ForewarningManagement/${file}`)
      assert.ok(value.length > 0, `${app}/${file} 应继续存在`)
    }
    const host = await source(`apps/${app}/src/views/ForewarningManagement/reportExportHost.js`)
    assert.match(host, /getCurrentCompanyId/)
    assert.match(host, /getFilePrefix/)
    assert.match(host, /reportData/)
  }
})

test('两端能力明确保留标题和趋势图差异', async () => {
  const warning = await source('apps/link-warning/src/views/ForewarningManagement/reportExportHost.js')
  const front = await source('apps/link-front/src/views/ForewarningManagement/reportExportHost.js')
  assert.match(warning, /showAlarmTypeAxisLabels:\s*false/)
  assert.match(warning, /useFixedWeekTitle:\s*false/)
  assert.match(front, /showAlarmTypeAxisLabels:\s*true/)
  assert.match(front, /useFixedWeekTitle:\s*true/)
})

test('公共组件保留原有 Props 和事件契约', async () => {
  const form = await readFile(path.join(sharedRoot, 'ReportForm.vue'), 'utf8')
  assertProps(form, ['formData'])
  for (const event of ['update-field', 'search', 'reset', 'export-pdf']) {
    assert.match(form, new RegExp(`\\$emit\\(\\s*['"]${event}['"]`))
  }

  const preview = await readFile(path.join(sharedRoot, 'ReportPreview.vue'), 'utf8')
  assertProps(preview, [
    'reportTitle',
    'defaultReportTitle',
    'reportSummary',
    'showTable',
    'currentYear',
    'currentWeekNumber',
    'weekDateStr',
    'list',
    'skillList',
    'actualList',
    'trendTableData',
    'alarmTypeRank',
    'cameraAlarmRank',
    'alarmLevelRank',
    'getText',
    'showAdvert',
    'headerLogo',
    'headerText',
    'chartData',
    'wechat',
    'phone',
    'timeTitle',
  ])

  const table = await readFile(path.join(sharedRoot, 'ReportTable.vue'), 'utf8')
  assertProps(table, [
    'title',
    'subtitle',
    'columns',
    'tableData',
    'showTable',
    'width',
    'headerBgColor',
    'headerTextColor',
    'subtitleBgColor',
    'subtitleTextColor',
    'columnHeaderBgColor',
    'columnHeaderTextColor',
  ])

  const statGrid = await readFile(path.join(sharedRoot, 'StatGrid.vue'), 'utf8')
  assertProps(statGrid, ['actualList', 'timeTitle', 'useFixedWeekTitle'])
})

test('页面和组件原路径仅作为透传包装层', async () => {
  const wrappers = [
    'reportExport.vue',
    'components/ReportExport/ReportForm.vue',
    'components/ReportExport/ReportPreview.vue',
    'components/ReportExport/ReportTable.vue',
    'components/ReportExport/StatGrid.vue',
  ]
  const businessBody = /generate(?:ActualList|ReportText|StatsList)|process(?:AlarmLevelRank|AlarmTypeRank|CameraAlarmRank|TrendTableData)|init(?:AlarmTrend|AlarmTypeRank|CameraAlarmRank|AlarmLevelRank)|\b(?:trendColumns|typeRankColumns|deviceRankColumns|levelRankColumns)\s*\(/

  for (const app of apps) {
    for (const file of wrappers) {
      const value = await source(`apps/${app}/src/views/ForewarningManagement/${file}`)
      assert.match(value, /\$attrs/)
      assert.match(value, /\$listeners/)
      assert.doesNotMatch(value, businessBody)
    }
  }
})

test('两端 SkillTable 保持逐字一致并导向现有公共导出', async () => {
  const warning = await source(
    'apps/link-warning/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue',
  )
  const front = await source(
    'apps/link-front/src/views/ForewarningManagement/components/ReportExport/SkillTable.vue',
  )
  assert.equal(warning, front)
  assert.match(warning, /@link\/shared-ui\/forewarning-management\/skill-table/)
})
