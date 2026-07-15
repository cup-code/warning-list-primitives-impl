import assert from 'node:assert/strict'
import test from 'node:test'
import { createReportDataModel } from './createReportDataModel.js'

function createFixture() {
  const dateCalls = []
  const weekdayCalls = []
  const dateLib = value => {
    dateCalls.push(value)
    return {
      format(pattern) {
        assert.equal(pattern, 'MM-DD')
        return '07-15'
      },
    }
  }
  const getWeekday = value => {
    weekdayCalls.push(value)
    return `星期(${value})`
  }
  return {
    model: createReportDataModel({ dateLib, getWeekday }),
    dateCalls,
    weekdayCalls,
  }
}

test('缺少日期依赖时给出明确错误', () => {
  assert.throws(() => createReportDataModel(), /dateLib/)
  assert.throws(() => createReportDataModel({ dateLib() {} }), /getWeekday/)
})

test('导出原有七个函数且每次创建独立模型', () => {
  const first = createFixture().model
  const second = createFixture().model
  assert.notEqual(first, second)
  assert.deepEqual(Object.keys(first).sort(), [
    'generateActualList',
    'generateReportText',
    'generateStatsList',
    'processAlarmLevelRank',
    'processAlarmTypeRank',
    'processCameraAlarmRank',
    'processTrendTableData',
  ])
})

test('实况和统计数据保持原返回结构并容忍 alarmLive 缺失', () => {
  const { model } = createFixture()
  const actual = model.generateActualList({
    alarmTypeRank: [],
    cameraAlarmRank: {},
    alarmLevelLive: {},
    total: 0,
  }, 2)
  assert.equal(actual[0].value, '0 路')
  assert.equal(actual[0].label, '接入摄像头')
  assert.deepEqual(model.generateStatsList(2, 0, 0), [
    { name: '一体机数量2台' },
    { name: '接入摄像头数量0路' },
    { name: '摄像头配置技能0项' },
  ])
})

test('单日趋势继续调用注入的日期和星期能力', () => {
  const { model, dateCalls, weekdayCalls } = createFixture()
  assert.deepEqual(model.processTrendTableData({
    timeType: 0,
    alarmDateStart: '2026-07-15',
  }, { '07-15': 2, '07-16': 3 }), [{
    date: '07-15',
    week: '星期(07-15)',
    count: 5,
  }])
  assert.deepEqual(dateCalls, ['2026-07-15'])
  assert.deepEqual(weekdayCalls, ['07-15'])
})

test('排名、等级和报告文案保持原函数契约', () => {
  const { model } = createFixture()
  assert.deepEqual(model.processCameraAlarmRank({ A: 3, B: 1 }), [
    { rank: 1, deviceName: 'A', count: 3 },
    { rank: 2, deviceName: 'B', count: 1 },
  ])
  assert.match(model.generateReportText(3, 5), /3路摄像头/)
  assert.match(model.generateReportText(3, 5), /5项技能/)
})
