import assert from 'node:assert/strict'
import test from 'node:test'

import { createDetailInfoModule } from './createDetailInfoModule.js'

const apiNames = [
  'allWarningAudit', 'allWarningList', 'attentionAlarm',
  'clientWarningAudit', 'clientWarningList',
  'maintenanceWarningAudit', 'maintenanceWarningList',
]

function createFixture(overrides = {}) {
  const calls = []
  const api = Object.fromEntries(apiNames.map(name => [name, async (params) => {
    calls.push([name, params])
    return { data: { code: 200, result: { list: [] } } }
  }]))
  Object.assign(api, overrides)
  return { module: createDetailInfoModule(api), calls }
}

test('工厂校验全部宿主 API', () => {
  for (const name of apiNames) {
    const api = Object.fromEntries(apiNames.map(item => [item, () => {}]))
    delete api[name]
    assert.throws(() => createDetailInfoModule(api), new RegExp(name))
  }
})

test('模块保持固定结构且每次创建独立 state', () => {
  const first = createFixture().module
  const second = createFixture().module
  assert.equal(first.namespaced, true)
  assert.deepEqual(first.state, {
    detailForms: {}, userType: '', queryForm: {}, lists: [],
    currentIndex: 0, currentId: '', isLoading: false, hasOperations: false,
  })
  assert.notEqual(first.state, second.state)
  assert.notEqual(first.state.detailForms, second.state.detailForms)
  assert.notEqual(first.state.queryForm, second.state.queryForm)
  assert.notEqual(first.state.lists, second.state.lists)
  assert.deepEqual(Object.keys(first.mutations).sort(), [
    'REMOVE_LIST_ITEM', 'SET_CURRENT_ID', 'SET_CURRENT_INDEX',
    'SET_DETAIL_FORMS', 'SET_HAS_OPERATIONS', 'SET_LISTS',
    'SET_LOADING', 'SET_QUERY_FORM', 'SET_USER_TYPE', 'UPDATE_LIST_ITEM',
  ])
  assert.deepEqual(Object.keys(first.actions).sort(), [
    'getDetailInfo', 'nextDetail', 'prevDetail', 'resetState',
    'setCurrentDetail', 'submitAudit', 'toggleAttention',
  ])
})

test('列表 action 选择对应 API 并保持格式化与 commit 顺序', async () => {
  const rows = [{ id: '2', alarmLevel: '2', customerStatus: 3,
    customerDisposeUserName: '', customerDisposeTime: '' }]
  const { module, calls } = createFixture({
    clientWarningList: async (params) => {
      calls.push(['clientWarningList', params])
      return { data: { result: { list: rows } } }
    },
  })
  const commits = []
  await module.actions.getDetailInfo({
    state: module.state,
    commit: (...args) => commits.push(args),
  }, { userType: 'CustomerStatus', queryForm: { page: 1 } })
  assert.deepEqual(calls, [['clientWarningList', { page: 1 }]])
  assert.equal(commits[0][0], 'SET_LOADING')
  assert.deepEqual(commits[1], ['SET_LISTS', [{
    ...rows[0], auditStatus: 3, alarmLevel: '二级',
    auditUser: '--', auditTime: '--',
  }]])
  assert.deepEqual(commits.at(-1), ['SET_LOADING', false])
})

test('审核和关注 action 保持 API 参数与返回契约', async () => {
  const auditCalls = []
  const attentionCalls = []
  const { module } = createFixture({
    clientWarningAudit: async (params) => {
      auditCalls.push(params); return { data: { code: 200 } }
    },
    attentionAlarm: async (params) => {
      attentionCalls.push(params); return { data: { code: 200 } }
    },
  })
  module.state.userType = 'CustomerStatus'
  module.state.detailForms = { id: 'alarm-1' }
  module.state.lists = [{ id: 'alarm-1' }]
  const commits = []
  const context = { state: module.state, commit: (...args) => commits.push(args), dispatch: () => {} }
  const audit = await module.actions.submitAudit(context, {
    status: 2, type: 9, opinion: 'ok',
  })
  assert.deepEqual(auditCalls, [{ alarmId: 'alarm-1', status: 2, opinion: 'ok' }])
  assert.equal(audit.success, true)
  assert.equal(audit.shouldReturn, true)
  const attention = await module.actions.toggleAttention(context, 1)
  assert.deepEqual(attentionCalls, [{ alarmId: 'alarm-1', isAttention: 1 }])
  assert.deepEqual(attention, { success: true, message: '关注成功' })
})
