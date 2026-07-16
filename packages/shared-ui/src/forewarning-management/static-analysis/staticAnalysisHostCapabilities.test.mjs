import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertStaticAnalysisHost,
  validateStaticAnalysisHost,
} from './staticAnalysisHostCapabilities.js'

function createHost(overrides = {}) {
  const noop = () => {}
  return {
    getScreenData: noop,
    exportOrgWarning: noop,
    exportPointWarning: noop,
    exportWarningLevel: noop,
    exportWarningProcess: noop,
    exportWarningTrend: noop,
    exportWarningType: noop,
    logSearchForm: false,
    listenWarningTypeRefresh: false,
    searchCardNoneBottom: true,
    ...overrides,
  }
}

test('完整静态分析 host 通过能力校验', () => {
  const host = createHost()
  assert.equal(assertStaticAnalysisHost(host), host)
})

test('缺失或类型错误的能力给出精确错误', () => {
  const missing = createHost()
  delete missing.exportWarningTrend
  assert.throws(
    () => assertStaticAnalysisHost(missing),
    /exportWarningTrend.*expected function, received missing/,
  )
  assert.throws(
    () => assertStaticAnalysisHost(createHost({ logSearchForm: 'false' })),
    /logSearchForm.*expected boolean, received string/,
  )
})

test('production 跳过开发校验，test 环境执行校验', () => {
  assert.equal(validateStaticAnalysisHost({}, 'production'), undefined)
  assert.throws(
    () => validateStaticAnalysisHost({}, 'test'),
    /getScreenData.*received missing/,
  )
})
