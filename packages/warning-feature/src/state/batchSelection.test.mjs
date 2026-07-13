import assert from 'node:assert/strict'
import test from 'node:test'

import batchSelection from './batchSelection.js'

function createContext() {
  return { ...batchSelection.data() }
}

test('批量选择 mixin 保持固定接口和独立初始状态', () => {
  assert.deepEqual(Object.keys(batchSelection.methods).sort(), [
    'cancelBatch',
    'handleCheckAllChange',
    'handleChecked',
    'onSelected',
  ])
  const first = batchSelection.data()
  const second = batchSelection.data()
  assert.deepEqual(first, {
    isBatch: false,
    selected: [],
    checkboxGroup: [],
    checkAll: false,
    isIndeterminate: true,
  })
  assert.notEqual(first.selected, second.selected)
  assert.notEqual(first.checkboxGroup, second.checkboxGroup)
})

test('全选和取消恢复现有状态转换', () => {
  const rows = [{ id: 'a' }, { id: 'b' }]
  const context = createContext()
  batchSelection.methods.handleCheckAllChange.call(context, true, rows)
  assert.deepEqual(context, {
    isBatch: false,
    selected: rows,
    checkboxGroup: ['a', 'b'],
    checkAll: true,
    isIndeterminate: false,
  })
  batchSelection.methods.cancelBatch.call(context)
  assert.deepEqual(context, {
    isBatch: false,
    selected: [],
    checkboxGroup: [],
    checkAll: false,
    isIndeterminate: true,
  })
})

test('ID 勾选和表格选择保持现有状态转换', () => {
  const rows = [{ id: 'a' }, { id: 'b' }]
  const checked = createContext()
  batchSelection.methods.handleChecked.call(checked, ['b'], rows)
  assert.deepEqual(checked.selected, [rows[1]])
  assert.equal(checked.checkAll, false)
  assert.equal(checked.isIndeterminate, true)

  const selected = createContext()
  batchSelection.methods.onSelected.call(selected, rows, rows)
  assert.deepEqual(selected.checkboxGroup, ['a', 'b'])
  assert.equal(selected.checkAll, true)
  assert.equal(selected.isIndeterminate, false)
})
