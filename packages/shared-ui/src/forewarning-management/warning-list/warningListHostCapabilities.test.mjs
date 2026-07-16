import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertWarningListHost,
  createWarningDetailData,
  validateWarningListHost,
  warningListHostRequirements,
} from './warningListHostCapabilities.js'

const row = { id: 'warning-1', cameraName: 'Camera A' }
const context = {
  type: 'AuditStatus',
  allType: false,
  form: { pageNum: 2 },
}

const createHost = (detailPayloadMode = 'id') => ({
  detailPayloadMode,
  getDictList() {},
  getFilePrefix() {},
  pushWarningDetail() {},
})

test('declares the exact warning list host requirements', () => {
  assert.deepEqual(warningListHostRequirements, {
    detailPayloadMode: 'string',
    getDictList: 'function',
    getFilePrefix: 'function',
    pushWarningDetail: 'function',
  })
})

test('creates an id-based warning detail payload', () => {
  assert.deepEqual(createWarningDetailData(row, context, 'id'), {
    detailId: 'warning-1',
    type: 'AuditStatus',
    form: { pageNum: 2 },
  })
})

test('creates a form-based warning detail payload', () => {
  assert.deepEqual(createWarningDetailData(row, context, 'form'), {
    detailForm: row,
    type: 'AuditStatus',
    form: { pageNum: 2 },
  })
})

test('uses all as the payload type when allType is true', () => {
  assert.equal(
    createWarningDetailData(row, { ...context, allType: true }, 'id').type,
    'all',
  )
})

test('rejects an unsupported detail payload mode', () => {
  assert.throws(
    () => createWarningDetailData(row, context, 'legacy'),
    /Unsupported warning detail payload mode "legacy"/,
  )
})

test('rejects a missing host with the component name', () => {
  assert.throws(
    () => assertWarningListHost(undefined, 'WarningList'),
    /WarningList.*host.*required/i,
  )
})

test('rejects a missing host function with the component and capability names', () => {
  const host = createHost()
  delete host.getFilePrefix

  assert.throws(
    () => assertWarningListHost(host, 'WarningList'),
    /WarningList.*getFilePrefix.*function/i,
  )
})

test('rejects an invalid host mode with the component and mode names', () => {
  assert.throws(
    () => assertWarningListHost(createHost('legacy'), 'WarningList'),
    /WarningList.*detailPayloadMode.*legacy.*id.*form/i,
  )
})

test('accepts hosts using either supported detail payload mode', () => {
  assert.doesNotThrow(() => assertWarningListHost(createHost('id'), 'WarningList'))
  assert.doesNotThrow(() =>
    assertWarningListHost(createHost('form'), 'WarningList'),
  )
})

test('skips host validation in production', () => {
  assert.equal(
    validateWarningListHost(undefined, 'WarningList', 'production'),
    undefined,
  )
})

test('validates the host in test and development', () => {
  assert.throws(
    () => validateWarningListHost(undefined, 'WarningList', 'test'),
    /WarningList.*host.*required/i,
  )
  assert.throws(
    () => validateWarningListHost(undefined, 'WarningList', 'development'),
    /WarningList.*host.*required/i,
  )
})
