import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createMachineListQuery,
  extractMachineList,
  findMachine,
  findMachineName,
} from '../../packages/shared-ui/src/forewarning-management/selectMachineLogic.js'

test('普通模式只调用分页列表 API', async () => {
  const calls = []
  const allMachineListApi = async (params) => {
    calls.push(['all', params])
  }
  const machineListApi = async (params) => {
    calls.push(['normal', params])
    return { data: { success: true, result: { list: [] } } }
  }

  const query = createMachineListQuery('', allMachineListApi, machineListApi)
  await query()

  assert.deepEqual(calls, [['normal', { isPage: false }]])
})

test('all 模式只调用全量列表 API', async () => {
  const calls = []
  const allMachineListApi = async (params) => {
    calls.push(['all', params])
    return { data: { success: true, result: [] } }
  }
  const machineListApi = async (params) => {
    calls.push(['normal', params])
  }

  const query = createMachineListQuery('all', allMachineListApi, machineListApi)
  await query()

  assert.deepEqual(calls, [['all', { isPage: false }]])
})

test('响应解析保持普通、all 和失败响应的原行为', () => {
  const machines = [{ id: 'm1', machineName: '一体机 1' }]
  assert.deepEqual(
    extractMachineList({ data: { success: true, result: { list: machines } } }, false),
    machines,
  )
  assert.deepEqual(
    extractMachineList({ data: { success: true, result: machines } }, true),
    machines,
  )
  assert.equal(
    extractMachineList({ data: { success: false, result: machines } }, true),
    undefined,
  )
})

test('名称恢复和 change 参数保持完整对象或 undefined', () => {
  const machine = { id: 'm1', machineName: '一体机 1', tenantId: 't1' }
  const machines = [machine]

  assert.equal(findMachineName(machines, 'm1'), '一体机 1')
  assert.equal(findMachineName(machines, 'missing'), undefined)
  assert.equal(findMachine(machines, 'm1'), machine)
  assert.equal(findMachine(machines, ''), undefined)
  assert.equal(findMachine(machines, 'missing'), undefined)
})
