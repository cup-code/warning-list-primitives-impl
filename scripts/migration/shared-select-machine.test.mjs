import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  createMachineListQuery,
  extractMachineList,
  findMachine,
  findMachineName,
} from '../../packages/shared-ui/src/forewarning-management/selectMachineLogic.js'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

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

test('共享包和包装层暴露稳定的 SelectMachine 契约', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/shared-ui/package.json'))
  assert.equal(
    packageJson.exports['./forewarning-management/select-machine'],
    './src/forewarning-management/SelectMachine.vue',
  )
  assert.deepEqual(packageJson.peerDependencies, {
    '@tanstack/vue-query': '^4.33.0',
    vue: '2.7.16',
  })

  const sharedSource = await readWorkspaceFile(
    'packages/shared-ui/src/forewarning-management/SelectMachine.vue',
  )
  assert.doesNotMatch(sharedSource, /@\//)
  assert.doesNotMatch(sharedSource, /apps\//)
  assert.doesNotMatch(sharedSource, /\b(?:Store|Router)\b/)
  assert.match(sharedSource, /allMachineListApi:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(sharedSource, /machineListApi:\s*\{[\s\S]*?type:\s*Function[\s\S]*?required:\s*true/)
  assert.match(sharedSource, /placeholder="请选择所属一体机"/)
  assert.match(sharedSource, /:disabled="disabled"/)
  assert.match(sharedSource, /emit\('change', machine\)/)

  const wrappers = await Promise.all(appRoots.map(appRoot => (
    readWorkspaceFile(`${appRoot}/src/views/ForewarningManagement/components/selectMachine.vue`)
  )))
  assert.equal(wrappers[0], wrappers[1])
  assert.match(wrappers[0], /@link\/shared-ui\/forewarning-management\/select-machine/)
  assert.match(wrappers[0], /@\/http\/videoWarning\/warning-api/)
  assert.match(wrappers[0], /v-bind="\$attrs"/)
  assert.match(wrappers[0], /v-on="\$listeners"/)
  assert.match(wrappers[0], /:all-machine-list-api="allMachineListApi"/)
  assert.match(wrappers[0], /:machine-list-api="machineListApi"/)
})
