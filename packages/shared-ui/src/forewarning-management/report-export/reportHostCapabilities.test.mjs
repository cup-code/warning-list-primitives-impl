import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertHostCapabilities,
  reportExportPageHostRequirements,
  reportFormHostRequirements,
  reportPreviewHostRequirements,
  validateHostCapabilities,
} from './reportHostCapabilities.js'

function completeHost() {
  const callable = () => {}
  return {
    getSpecifiedModule: callable,
    getScreenData: callable,
    getWarningTypeList: callable,
    machineList: callable,
    exportToPDF: callable,
    getCurrentCompanyId: callable,
    ImageSelect: {},
    uploadImage: callable,
    getStorage: callable,
    setStorage: callable,
    removeStorage: callable,
    getFilePrefix: callable,
    showAlarmTypeAxisLabels: false,
    useFixedWeekTitle: true,
    reportDate: {
      getWeekRange: callable,
      getCurrentWeekNumber: callable,
      getCurrentYear: callable,
      getWeekDateStr: callable,
      getCurrentTitle: callable,
      getDefaultReportTitle: callable,
    },
    reportData: {
      generateActualList: callable,
      generateReportText: callable,
      generateStatsList: callable,
      processAlarmLevelRank: callable,
      processAlarmTypeRank: callable,
      processCameraAlarmRank: callable,
      processTrendTableData: callable,
    },
  }
}

test('完整 host 通过三个 consumer 的纯能力校验', () => {
  const host = completeHost()
  assert.equal(assertHostCapabilities(host, 'ReportExportPage', reportExportPageHostRequirements), host)
  assert.equal(assertHostCapabilities(host, 'ReportForm', reportFormHostRequirements), host)
  assert.equal(assertHostCapabilities(host, 'ReportPreview', reportPreviewHostRequirements), host)
})

test('缺失嵌套能力报告 consumer 和精确路径', () => {
  const host = completeHost()
  delete host.reportDate.getWeekRange
  assert.throws(
    () => assertHostCapabilities(host, 'ReportForm', reportFormHostRequirements),
    error => error instanceof TypeError
      && error.message === 'ReportForm host capability "reportDate.getWeekRange" expected function, received missing',
  )
})

test('类型错误报告 consumer、精确路径和期望类型', () => {
  const host = completeHost()
  host.showAlarmTypeAxisLabels = 'false'
  assert.throws(
    () => assertHostCapabilities(host, 'ReportPreview', reportPreviewHostRequirements),
    error => error instanceof TypeError
      && error.message === 'ReportPreview host capability "showAlarmTypeAxisLabels" expected boolean, received string',
  )
})

test('存在值能力拒绝 null 并标明组件路径', () => {
  const host = completeHost()
  host.ImageSelect = null
  assert.throws(
    () => assertHostCapabilities(host, 'ReportForm', reportFormHostRequirements),
    error => error instanceof TypeError
      && error.message === 'ReportForm host capability "ImageSelect" expected present, received null',
  )
})

test('默认环境路径在 production 跳过而 test 执行校验', () => {
  const originalEnvironment = process.env.NODE_ENV
  try {
    process.env.NODE_ENV = 'production'
    assert.equal(validateHostCapabilities({}, 'ReportForm', reportFormHostRequirements), undefined)

    process.env.NODE_ENV = 'test'
    assert.throws(
      () => validateHostCapabilities({}, 'ReportForm', reportFormHostRequirements),
      /ReportForm.*ImageSelect/,
    )
  }
  finally {
    if (originalEnvironment === undefined)
      delete process.env.NODE_ENV
    else
      process.env.NODE_ENV = originalEnvironment
  }
})
