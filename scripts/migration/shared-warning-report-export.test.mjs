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
  'reportHostCapabilities.js',
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

const requiredHostCapabilities = [
  'getSpecifiedModule',
  'getScreenData',
  'getWarningTypeList',
  'machineList',
  'exportToPDF',
  'ImageSelect',
  'uploadImage',
  'getStorage',
  'setStorage',
  'removeStorage',
  'reportDate',
  'reportData',
  'getFilePrefix',
  'getCurrentCompanyId',
  'showAlarmTypeAxisLabels',
  'useFixedWeekTitle',
]

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}

function extractObject(value, marker, label) {
  const match = marker.exec(value)
  assert.ok(match, `${label} 应存在`)
  const start = value.indexOf('{', match.index + match[0].length)
  assert.notEqual(start, -1, `${label} 应是对象`)

  let depth = 0
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === '{') depth += 1
    if (value[index] === '}') depth -= 1
    if (depth === 0) return value.slice(start, index + 1)
  }

  assert.fail(`${label} 对象未闭合`)
}

function topLevelScalarProperty(objectBlock, name) {
  const propertyLines = objectBlock
    .split('\n')
    .map((line) => line.match(/^(\s*)([A-Za-z_$][\w$]*)\s*:\s*([^,]+),?\s*$/))
    .filter(Boolean)
  const topLevelIndent = Math.min(...propertyLines.map((match) => match[1].length))
  const property = propertyLines.find(
    (match) => match[1].length === topLevelIndent && match[2] === name,
  )
  return property?.[3].trim()
}

function assertFormDataDefault(defaultObject) {
  assert.equal(
    (defaultObject.match(/[{}]/g) || []).length,
    2,
    'formData 默认对象不得嵌套其他对象',
  )
  const bodyLines = defaultObject
    .slice(1, -1)
    .split('\n')
    .filter((line) => line.trim())
  assert.equal(bodyLines.length, 6, 'formData 默认对象应恰好包含六个字段')
  const entries = bodyLines
    .map((line) => line.match(/^\s*([A-Za-z_$][\w$]*)\s*:\s*(false|['"]['"]),?\s*$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2] === 'false' ? false : ''])
  assert.equal(entries.length, 6, 'formData 默认对象应恰好包含六个标量字段')
  assert.deepEqual(Object.fromEntries(entries), {
    reportTitle: '',
    reportSummary: '',
    showTable: false,
    wechat: '',
    phone: '',
    machineCount: '',
  })
}

function assertProp(propsBlock, name, contract) {
  const prop = extractObject(
    propsBlock,
    new RegExp(`\\b${name}\\s*:`),
    `Prop ${name}`,
  )
  assert.match(prop, new RegExp(`\\btype\\s*:\\s*${contract.type}\\b`), `${name} type`)
  assert.equal(
    typeof contract.required,
    'boolean',
    `${name} 契约必须显式声明 required`,
  )
  assert.equal(
    topLevelScalarProperty(prop, 'required') === 'true',
    contract.required,
    `${name} required 应为 ${contract.required}`,
  )
  if (contract.default) {
    assert.match(prop, contract.default, `${name} default`)
  }

  return prop
}

function assertComponentContract(value, componentName, contracts) {
  assert.match(
    value,
    new RegExp(`\\bname\\s*:\\s*['"]${componentName}['"]`),
    `${componentName} name`,
  )
  const propsBlock = extractObject(value, /\bprops\s*:/, `${componentName} props`)
  assert.equal(
    (propsBlock.match(/\btype\s*:/g) || []).length,
    Object.keys(contracts).length,
    `${componentName} Props 数量`,
  )
  for (const [name, contract] of Object.entries(contracts)) {
    assertProp(propsBlock, name, contract)
  }

  return propsBlock
}

function componentOpeningTag(value, componentName, label) {
  const match = value.match(new RegExp(`<${componentName}\\b[\\s\\S]*?>`))
  assert.ok(match, `${label} 应渲染 ${componentName}`)
  return match[0]
}

test('契约 helper 只接受顶层 required 和精确 formData 默认对象', () => {
  const misleadingProp = `{
    type: Object,
    required: false,
    default: () => ({ required: true }),
  }`
  assert.throws(
    () => assertProp(`{ formData: ${misleadingProp} }`, 'formData', {
      type: 'Object',
      required: true,
    }),
    /formData required 应为 true/,
  )
  assert.doesNotThrow(() => assertFormDataDefault(`{
    reportTitle: '',
    reportSummary: '',
    showTable: false,
    wechat: '',
    phone: '',
    machineCount: '',
  }`))
  assert.throws(
    () => assertFormDataDefault(`{
      reportTitle: '',
      reportSummary: '',
      showTable: false,
      wechat: '',
      phone: '',
      extra: '',
    }`),
  )
  assert.throws(
    () => assertFormDataDefault(`{
      defaults: {
        reportTitle: '',
        reportSummary: '',
        showTable: false,
        wechat: '',
        phone: '',
        machineCount: '',
      },
    }`),
    /不得嵌套/,
  )
})

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
    assert.match(host, /\bexport\s+const\s+reportCapabilities\b/)
    assert.match(host, /\bexport\s+const\s+reportExportHost\b/)
    for (const capability of requiredHostCapabilities) {
      assert.match(host, new RegExp(`\\b${capability}\\b`), `${app} host ${capability} 能力`)
    }
  }
})

test('两端能力明确保留标题和趋势图差异', async () => {
  const warning = await source('apps/link-warning/src/views/ForewarningManagement/reportExportHost.js')
  const front = await source('apps/link-front/src/views/ForewarningManagement/reportExportHost.js')
  assert.match(warning, /showAlarmTypeAxisLabels:\s*false/)
  assert.match(warning, /useFixedWeekTitle:\s*false/)
  assert.match(front, /showAlarmTypeAxisLabels:\s*true/)
  assert.match(front, /useFixedWeekTitle:\s*true/)
  assert.equal(
    warning,
    front
      .replace('showAlarmTypeAxisLabels: true', 'showAlarmTypeAxisLabels: false')
      .replace('useFixedWeekTitle: true', 'useFixedWeekTitle: false'),
    '两个 host 的导入和对象结构只能有两个能力布尔值不同',
  )
  assert.match(warning, /removeStorage\s*\(key\)\s*\{\s*localStorage\.removeItem\(key\)/)

  const statGrid = await readFile(path.join(sharedRoot, 'StatGrid.vue'), 'utf8')
  assert.match(statGrid, /['"]本周报告预警实况['"]/, 'StatGrid 应保留固定周标题')
  assert.match(
    statGrid,
    /(?:this\.)?useFixedWeekTitle\s*\?\s*['"]本周报告预警实况['"]\s*:\s*`\$\{(?:this\.)?timeTitle\}报告预警实况`/,
    'StatGrid 应由 useFixedWeekTitle 在固定标题和动态 timeTitle 之间选择',
  )

  const chartMixin = await readFile(path.join(sharedRoot, 'reportChartMixin.js'), 'utf8')
  const alarmTypeStart = chartMixin.search(/\binitAlarmTypeRank\s*\(/)
  const nextMethod = chartMixin.search(/\binitCameraAlarmRank\s*\(/)
  assert.ok(alarmTypeStart >= 0, 'chart mixin 应实现 initAlarmTypeRank')
  assert.ok(nextMethod > alarmTypeStart, 'alarm type 图表方法边界应明确')
  const alarmTypeMethod = chartMixin.slice(alarmTypeStart, nextMethod)
  assert.match(alarmTypeMethod, /\bshowAlarmTypeAxisLabels\b/)
  assert.match(
    alarmTypeMethod,
    /(?:if\s*\(\s*(?:this\.)?showAlarmTypeAxisLabels\s*\)[\s\S]{0,400}\baxisLabel\b|(?:this\.)?showAlarmTypeAxisLabels[\s\S]{0,120}(?:\?|&&)[\s\S]{0,300}\baxisLabel\b|\baxisLabel\s*:\s*(?:this\.)?showAlarmTypeAxisLabels\s*\?)/,
    'alarm type 轴标签只能由 showAlarmTypeAxisLabels 开启',
  )
})

test('公共组件保留原有 Props 和事件契约', async () => {
  const form = await readFile(path.join(sharedRoot, 'ReportForm.vue'), 'utf8')
  const formProps = assertComponentContract(form, 'ReportForm', {
    host: { type: 'Object', required: true },
    formData: {
      type: 'Object',
      required: true,
      default: /\bdefault\s*:\s*\(\)\s*=>\s*\(\s*\{/,
    },
  })
  const formDataProp = extractObject(formProps, /\bformData\s*:/, 'Prop formData')
  const formDataDefault = extractObject(
    formDataProp,
    /\bdefault\s*:\s*\(\)\s*=>\s*\(/,
    'formData default',
  )
  assertFormDataDefault(formDataDefault)
  for (const event of ['update-field', 'search', 'reset', 'export-pdf']) {
    assert.match(form, new RegExp(`\\$emit\\(\\s*['"]${event}['"]`))
  }
  const clearFormCache = form.match(/\bclearFormCache\s*\(\)\s*\{[\s\S]*?\n\s*\},/)?.[0]
  assert.ok(clearFormCache, 'ReportForm 应保留 clearFormCache')
  assert.match(
    clearFormCache,
    /this\.host\.removeStorage\(\s*CACHE_KEY\s*\)/,
    'ReportForm 清缓存应调用 host.removeStorage',
  )
  assert.doesNotMatch(
    clearFormCache,
    /(?:this\.host\.)?setStorage\(\s*CACHE_KEY\s*,\s*null\s*,\s*-1\s*\)/,
    'ReportForm 不得用过期占位记录代替真实删除',
  )

  const preview = await readFile(path.join(sharedRoot, 'ReportPreview.vue'), 'utf8')
  assertComponentContract(preview, 'ReportPreview', {
    host: { type: 'Object', required: true },
    reportTitle: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    defaultReportTitle: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]视频智能运营平台管理周报['"]/,
    },
    reportSummary: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    showTable: {
      type: 'Boolean',
      required: false,
      default: /\bdefault\s*:\s*false\b/,
    },
    currentYear: { type: 'Number', required: true },
    currentWeekNumber: { type: 'Number', required: true },
    weekDateStr: { type: 'String', required: true },
    list: { type: 'Array', required: true },
    skillList: { type: 'Array', required: true },
    actualList: { type: 'Array', required: true },
    trendTableData: { type: 'Array', required: true },
    alarmTypeRank: { type: 'Array', required: true },
    cameraAlarmRank: { type: 'Array', required: true },
    alarmLevelRank: { type: 'Array', required: true },
    getText: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    showAdvert: {
      type: 'Boolean',
      required: false,
      default: /\bdefault\s*:\s*true\b/,
    },
    headerLogo: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    headerText: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    chartData: { type: 'Object', required: true },
    wechat: { type: 'String', required: true },
    phone: { type: 'String', required: true },
    timeTitle: { type: 'String', required: true },
  })

  const table = await readFile(path.join(sharedRoot, 'ReportTable.vue'), 'utf8')
  assertComponentContract(table, 'ReportTable', {
    title: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    subtitle: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]['"]/,
    },
    columns: {
      type: 'Array',
      required: true,
      default: /\bdefault\s*:\s*\(\)\s*=>\s*\[\s*\]/,
    },
    tableData: {
      type: 'Array',
      required: true,
      default: /\bdefault\s*:\s*\(\)\s*=>\s*\[\s*\]/,
    },
    showTable: {
      type: 'Boolean',
      required: false,
      default: /\bdefault\s*:\s*true\b/,
    },
    width: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]100%['"]/,
    },
    headerBgColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#2986c7['"]/,
    },
    headerTextColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#fff['"]/,
    },
    subtitleBgColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#f5f6fa['"]/,
    },
    subtitleTextColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#333['"]/,
    },
    columnHeaderBgColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#e5e6eb['"]/,
    },
    columnHeaderTextColor: {
      type: 'String',
      required: false,
      default: /\bdefault\s*:\s*['"]#333['"]/,
    },
  })

  const statGrid = await readFile(path.join(sharedRoot, 'StatGrid.vue'), 'utf8')
  assertComponentContract(statGrid, 'StatGrid', {
    actualList: {
      type: 'Array',
      required: true,
      default: /\bdefault\s*:\s*\(\)\s*=>\s*\[\s*\]/,
    },
    timeTitle: { type: 'String', required: true },
    useFixedWeekTitle: {
      type: 'Boolean',
      required: false,
      default: /\bdefault\s*:\s*false\b/,
    },
  })
})

test('页面实际注入 host 且各组件原路径只透传到对应公共导出', async () => {
  const wrappers = [
    {
      file: 'components/ReportExport/ReportForm.vue',
      component: 'SharedReportForm',
      exportPath: '@link/shared-ui/forewarning-management/report-export/form',
    },
    {
      file: 'components/ReportExport/ReportPreview.vue',
      component: 'SharedReportPreview',
      exportPath: '@link/shared-ui/forewarning-management/report-export/preview',
    },
    {
      file: 'components/ReportExport/ReportTable.vue',
      exportPath: '@link/shared-ui/forewarning-management/report-export/table',
      reexport: true,
    },
    {
      file: 'components/ReportExport/StatGrid.vue',
      component: 'SharedStatGrid',
      exportPath: '@link/shared-ui/forewarning-management/report-export/stat-grid',
    },
  ]
  const businessBody = /generate(?:ActualList|ReportText|StatsList)|process(?:AlarmLevelRank|AlarmTypeRank|CameraAlarmRank|TrendTableData)|init(?:AlarmTrend|AlarmTypeRank|CameraAlarmRank|AlarmLevelRank)|\b(?:trendColumns|typeRankColumns|deviceRankColumns|levelRankColumns|getScreenData)\s*\(|\b(?:screenData|axisLabel|setOption)\b/

  for (const app of apps) {
    const page = await source(`apps/${app}/src/views/ForewarningManagement/reportExport.vue`)
    assert.ok(
      /^\s*import\s+SharedReportExportPage\s+from\s+['"]@link\/shared-ui\/forewarning-management\/report-export['"]/m.test(page),
      `${app} 页面应导入公共页面`,
    )
    assert.ok(
      /^\s*import\s+\{\s*reportExportHost\s*\}\s+from\s+['"]\.\/reportExportHost\.js['"]/m.test(page),
      `${app} 页面应导入 host`,
    )
    assert.match(page, /\bcomponents\s*:\s*\{[\s\S]*?\bSharedReportExportPage\b/)
    const pageTag = componentOpeningTag(page, 'SharedReportExportPage', `${app} 页面`)
    assert.match(pageTag, /v-bind\s*=\s*['"]\$attrs['"]/)
    assert.match(pageTag, /v-on\s*=\s*['"]\$listeners['"]/)
    assert.match(pageTag, /:host\s*=\s*['"]reportExportHost['"]/, `${app} 页面应传入 host`)
    assert.doesNotMatch(page, businessBody, `${app} 页面不得保留业务主体`)

    for (const wrapper of wrappers) {
      const value = await source(
        `apps/${app}/src/views/ForewarningManagement/${wrapper.file}`,
      )
      if (wrapper.reexport) {
        assert.match(
          value,
          new RegExp(`export\\s+\\{\\s*default\\s*\\}\\s+from\\s+['"]${wrapper.exportPath}['"]`),
          `${app}/${wrapper.file} 应直接重导出公共组件`,
        )
        assert.doesNotMatch(value, businessBody, `${app}/${wrapper.file} 不得保留业务主体`)
        continue
      }
      assert.ok(
        new RegExp(`^\\s*import\\s+${wrapper.component}\\s+from\\s+['"]${wrapper.exportPath}['"]`, 'm').test(value),
        `${app}/${wrapper.file} 应导入对应公共组件`,
      )
      assert.match(
        value,
        new RegExp(`\\bcomponents\\s*:\\s*\\{[\\s\\S]*?\\b${wrapper.component}\\b`),
        `${app}/${wrapper.file} 应注册对应公共组件`,
      )
      const tag = componentOpeningTag(value, wrapper.component, `${app}/${wrapper.file}`)
      assert.match(tag, /v-bind\s*=\s*['"]\$attrs['"]/)
      assert.match(tag, /v-on\s*=\s*['"]\$listeners['"]/)
      if (wrapper.component === 'SharedStatGrid') {
        assert.match(tag, /:use-fixed-week-title\s*=\s*['"]reportCapabilities\.useFixedWeekTitle['"]/)
      } else {
        assert.match(tag, /:host\s*=\s*['"]reportExportHost['"]/)
      }
      assert.doesNotMatch(value, businessBody, `${app}/${wrapper.file} 不得保留业务主体`)
    }
  }
})

test('公共页面通过完整 host 保留基线调用顺序和组件注入', async () => {
  const page = await readFile(path.join(sharedRoot, 'ReportExportPage.vue'), 'utf8')
  assertComponentContract(page, 'ReportExport', {
    host: { type: 'Object', required: true },
  })
  assert.match(page, /this\.host\.getSpecifiedModule\(/)
  assert.match(page, /this\.host\.getScreenData\(/)
  assert.match(page, /this\.host\.getWarningTypeList\(/)
  assert.match(page, /this\.host\.machineList\(/)
  assert.match(page, /this\.host\.exportToPDF\(/)
  assert.match(page, /this\.host\.getCurrentCompanyId\(\)/)
  for (const name of [
    'getWeekRange',
    'getCurrentWeekNumber',
    'getCurrentYear',
    'getWeekDateStr',
    'getCurrentTitle',
    'getDefaultReportTitle',
  ]) {
    assert.match(page, new RegExp(`this\\.host\\.reportDate\\.${name}\\(`))
  }
  for (const name of [
    'generateActualList',
    'generateReportText',
    'generateStatsList',
    'processAlarmLevelRank',
    'processAlarmTypeRank',
    'processCameraAlarmRank',
    'processTrendTableData',
  ]) {
    assert.match(page, new RegExp(`this\\.host\\.reportData\\.${name}\\(`))
  }
  assert.match(componentOpeningTag(page, 'ReportForm', '公共页面'), /:host="host"/)
  assert.match(componentOpeningTag(page, 'ReportPreview', '公共页面'), /:host="host"/)
  assert.ok(page.indexOf('this.getReportConfig();') < page.indexOf('this.getCameraNumber();'))
  assert.ok(page.indexOf('this.getCameraNumber();') < page.indexOf('this.getSkillList();'))
  assert.ok(page.indexOf('this.getSkillList();') < page.indexOf('this.getScreenData();'))
})

test('三个公共 consumer 在 data host 调用前真实执行开发测试能力校验', async () => {
  for (const [file, consumer, requirements] of [
    ['ReportExportPage.vue', 'ReportExportPage', 'reportExportPageHostRequirements'],
    ['ReportForm.vue', 'ReportForm', 'reportFormHostRequirements'],
    ['ReportPreview.vue', 'ReportPreview', 'reportPreviewHostRequirements'],
  ]) {
    const value = await readFile(path.join(sharedRoot, file), 'utf8')
    assert.match(value, /import\s*\{[\s\S]*?validateHostCapabilities[\s\S]*?\}\s*from\s*["']\.\/reportHostCapabilities\.js["']/)
    const call = `validateHostCapabilities(this.host, "${consumer}", ${requirements});`
    assert.match(value, new RegExp(call.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.ok(
      value.indexOf(call) < value.indexOf('return {', value.indexOf('data()')),
      `${consumer} 必须在 data 初始化 host 消费前校验`,
    )
  }
})

test('两端菜单继续指向原报表页面路径', async () => {
  for (const app of apps) {
    const menu = await source(`apps/${app}/src/utils/menuData.js`)
    assert.match(
      menu,
      /\bvalue\s*:\s*['"]views\/ForewarningManagement\/reportExport['"]/,
      `${app} 菜单应保留 reportExport 路径`,
    )
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

test('两端所有薄 wrapper、chart shim 和 Task 1 reportData 逐字一致', async () => {
  for (const file of [
    'reportExport.vue',
    'components/ReportExport/ReportForm.vue',
    'components/ReportExport/ReportPreview.vue',
    'components/ReportExport/ReportTable.vue',
    'components/ReportExport/StatGrid.vue',
    'test/reportChart.js',
    'test/reportData.js',
  ]) {
    assert.equal(
      await source(`apps/link-warning/src/views/ForewarningManagement/${file}`),
      await source(`apps/link-front/src/views/ForewarningManagement/${file}`),
      `${file} 两端应逐字一致`,
    )
  }
  const chartShim = await source(
    'apps/link-warning/src/views/ForewarningManagement/test/reportChart.js',
  )
  assert.match(
    chartShim,
    /createReportChartMixin\(\{\s*showAlarmTypeAxisLabels:\s*reportCapabilities\.showAlarmTypeAxisLabels,?\s*\}\)/,
  )
})
