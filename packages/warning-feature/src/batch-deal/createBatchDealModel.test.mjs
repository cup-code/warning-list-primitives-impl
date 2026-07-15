import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildBatchDealParams,
  getBatchDealCopy,
  getBatchDealOptions,
  selectBatchDealApi,
} from './createBatchDealModel.js'

test('客户处理与内部审核使用原有选项和文案', () => {
  assert.deepEqual(getBatchDealOptions('CustomerStatus'), [
    { label: '有效', value: '2' },
    { label: '误报', value: '3' },
  ])
  assert.deepEqual(getBatchDealOptions('InternalStatus'), [
    { label: '误报', value: '4' },
    { label: '有效', value: '2' },
    { label: '无效', value: '3' },
    { label: '不确定', value: '5' },
  ])
  assert.deepEqual(getBatchDealCopy('CustomerStatus'), {
    title: '批量处理预警',
    resultRequired: '请选择处理结果',
    success: '批量处理成功',
  })
  assert.deepEqual(getBatchDealCopy('InternalStatus'), {
    title: '批量审核预警',
    resultRequired: '请选择审核结果',
    success: '批量审核成功',
  })
})

test('客户提交参数不包含审核类型', () => {
  assert.deepEqual(buildBatchDealParams({
    selectedWarnings: [
      { id: 'alarm-1', tenantCode: 'tenant-a' },
      { id: 'alarm-2', tenantCode: 'tenant-b' },
    ],
    auditRes: '2',
    opinion: '已处理',
    userType: 'CustomerStatus',
    submitType: '1',
  }), {
    alarms: [
      { alarmId: 'alarm-1', tenantCode: 'tenant-a' },
      { alarmId: 'alarm-2', tenantCode: 'tenant-b' },
    ],
    status: '2',
    opinion: '已处理',
  })
})

test('内部审核提交参数保留普通和加急类型', () => {
  const input = {
    selectedWarnings: [{ id: 'alarm-1', tenantCode: 'tenant-a' }],
    auditRes: '2',
    opinion: '',
    userType: 'InternalStatus',
  }
  assert.equal(buildBatchDealParams({ ...input, submitType: '1' }).type, '1')
  assert.equal(buildBatchDealParams({ ...input, submitType: '2' }).type, '2')
})

test('根据用户类型选择原有宿主 API', () => {
  const customer = () => 'customer'
  const internal = () => 'internal'
  const dependencies = {
    batchAttentionAlarm: customer,
    batchAttentionAlarmInternal: internal,
  }

  assert.equal(selectBatchDealApi('CustomerStatus', dependencies), customer)
  assert.equal(selectBatchDealApi('InternalStatus', dependencies), internal)
  assert.equal(selectBatchDealApi('all', dependencies), internal)
})
