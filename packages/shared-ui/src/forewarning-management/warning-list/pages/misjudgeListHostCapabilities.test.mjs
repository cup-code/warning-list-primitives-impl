import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertMisjudgeListHost,
  misjudgeListHostRequirements,
  validateMisjudgeListHost,
} from './misjudgeListHostCapabilities.js'

const functionCapabilities = [
  'tenantControlList',
  'getDepartListSimple',
  'getUserListByRoleFn',
  'allWarningList',
  'getStorageItem',
  'setStorageItem',
  'delStorageItem',
  'allMachineList',
  'machineList',
  'batchAttentionAlarm',
  'batchAttentionAlarmInternal',
]

function createHost(overrides = {}) {
  return {
    ...Object.fromEntries(functionCapabilities.map(capability => [capability, () => {}])),
    warningListHost: {},
    ...overrides,
  }
}

test('declares the exact frozen misjudge list host requirements', () => {
  assert.deepEqual(misjudgeListHostRequirements, {
    tenantControlList: 'function',
    getDepartListSimple: 'function',
    getUserListByRoleFn: 'function',
    allWarningList: 'function',
    getStorageItem: 'function',
    setStorageItem: 'function',
    delStorageItem: 'function',
    allMachineList: 'function',
    machineList: 'function',
    batchAttentionAlarm: 'function',
    batchAttentionAlarmInternal: 'function',
    warningListHost: 'object',
  })
  assert.equal(Object.isFrozen(misjudgeListHostRequirements), true)
})

test('returns a valid host unchanged', () => {
  const host = createHost()
  assert.equal(assertMisjudgeListHost(host, 'MisjudgeListPage'), host)
})

test('rejects missing, inherited, and invalid function capabilities with component scope', () => {
  const missing = createHost()
  delete missing.allWarningList
  assert.throws(
    () => assertMisjudgeListHost(missing, 'MisjudgeListPage'),
    /MisjudgeListPage.*allWarningList.*expected function.*received missing/i,
  )

  const inherited = Object.create(createHost())
  assert.throws(
    () => assertMisjudgeListHost(inherited, 'MisjudgeListPage'),
    /MisjudgeListPage.*tenantControlList.*expected function.*received missing/i,
  )

  assert.throws(
    () => assertMisjudgeListHost(
      createHost({ allMachineList: 'invalid' }),
      'MisjudgeListPage',
    ),
    /MisjudgeListPage.*allMachineList.*expected function.*received string/i,
  )
})

test('requires warningListHost to be a non-null object', () => {
  for (const value of [null, undefined, () => {}]) {
    const host = createHost()
    host.warningListHost = value
    assert.throws(
      () => assertMisjudgeListHost(host, 'MisjudgeListPage'),
      /MisjudgeListPage.*warningListHost.*expected non-null object/i,
    )
  }
})

test('production skips validation while test and development validate', () => {
  assert.equal(
    validateMisjudgeListHost(undefined, 'MisjudgeListPage', 'production'),
    undefined,
  )
  for (const environment of ['test', 'development']) {
    assert.throws(
      () => validateMisjudgeListHost({}, 'MisjudgeListPage', environment),
      /MisjudgeListPage.*tenantControlList.*received missing/i,
    )
  }
})

test('defaults validation behavior from process.env.NODE_ENV', () => {
  const originalEnvironment = process.env.NODE_ENV

  try {
    process.env.NODE_ENV = 'production'
    assert.equal(
      validateMisjudgeListHost(undefined, 'MisjudgeListPage'),
      undefined,
    )

    process.env.NODE_ENV = 'test'
    assert.throws(
      () => validateMisjudgeListHost({}, 'MisjudgeListPage'),
      /MisjudgeListPage.*tenantControlList.*received missing/i,
    )
  }
  finally {
    if (originalEnvironment === undefined) {
      delete process.env.NODE_ENV
    }
    else {
      process.env.NODE_ENV = originalEnvironment
    }
  }
})
