import assert from 'node:assert/strict'
import test from 'node:test'
import { createReportChartMixin } from './reportChartMixin.js'

function captureAlarmTypeOption(showAlarmTypeAxisLabels) {
  let option
  const mixin = createReportChartMixin({ showAlarmTypeAxisLabels })
  const originalDocument = globalThis.document
  globalThis.document = { getElementById: () => ({}) }
  const context = {
    showAlarmTypeAxisLabels,
    $echarts: {
      init() {
        return {
          clear() {},
          setOption(value) {
            option = value
          },
        }
      },
    },
  }
  try {
    mixin.methods.initAlarmTypeRank.call(context, [
      { alarmType: '烟火', alarmNumber: 2 },
    ])
  }
  finally {
    globalThis.document = originalDocument
  }
  return option
}

test('warning 模式不增加预警类型横轴标签配置', () => {
  const option = captureAlarmTypeOption(false)
  assert.equal(option.xAxis.axisLabel, undefined)
})

test('front 模式保留完整预警类型横轴标签', () => {
  const option = captureAlarmTypeOption(true)
  assert.deepEqual(option.xAxis.axisLabel.interval, 0)
  assert.equal(option.xAxis.axisLabel.showMinLabel, true)
  assert.equal(option.xAxis.axisLabel.showMaxLabel, true)
})
