import assert from 'node:assert/strict'
import test from 'node:test'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import 'dayjs/locale/zh-cn.js'

import { createReportDateUtils } from './createReportDateUtils.js'

const exportNames = [
  'getCurrentWeekNumber', 'getCurrentYear', 'getWeekday',
  'getWeekDateStr', 'getCurrentWeekDates', 'getWeekRange',
  'getCurrentTitle', 'getDefaultReportTitle',
].sort()

test('日期工厂校验宿主依赖', () => {
  assert.throws(() => createReportDateUtils(), /dateLib/)
  assert.throws(() => createReportDateUtils({ dateLib: () => {} }), /dateLib\.locale/)
  const withoutExtend = Object.assign(() => {}, { locale() {} })
  assert.throws(() => createReportDateUtils({ dateLib: withoutExtend }), /dateLib\.extend/)
  assert.throws(() => createReportDateUtils({ dateLib: dayjs }), /weekOfYear/)
})

test('日期工厂注册中文 locale 和周插件并返回固定接口', () => {
  const calls = []
  const dateLib = Object.assign(() => {}, {
    locale: value => calls.push(['locale', value]),
    extend: value => calls.push(['extend', value]),
  })
  const plugin = () => {}
  const utils = createReportDateUtils({ dateLib, weekOfYear: plugin })
  assert.deepEqual(calls, [['locale', 'zh-cn'], ['extend', plugin]])
  assert.deepEqual(Object.keys(utils).sort(), exportNames)
})

test('日期工具保持自定义范围和标题契约', () => {
  const utils = createReportDateUtils({ dateLib: dayjs, weekOfYear })
  assert.deepEqual(utils.getWeekRange('custom', ['2026-01-02', '2026-01-08']), {
    alarmDateEnd: '2026-01-08',
    alarmDateStart: '2026-01-02',
  })
  assert.equal(utils.getWeekDateStr({
    alarmDateStart: '2026-01-05',
    alarmDateEnd: '2026-01-11',
  }), '2026年01月05日（星期一）00:00:00-01月11日 23:59:59（星期日）')
  assert.match(utils.getWeekday('01-05'), /^星期[一二三四五六日]$/)
  assert.equal(utils.getCurrentTitle(0), '今日')
  assert.equal(utils.getCurrentTitle('custom'), '本时段')
  assert.equal(utils.getDefaultReportTitle(1), '视频智能运营平台管理周报')
  assert.equal(utils.getDefaultReportTitle(), '视频智能运营平台管理运营报告')
})

test('当前时间相关函数保持返回形状', () => {
  const utils = createReportDateUtils({ dateLib: dayjs, weekOfYear })
  assert.equal(Number.isInteger(utils.getCurrentWeekNumber()), true)
  assert.equal(Number.isInteger(utils.getCurrentYear()), true)
  assert.match(utils.getWeekRange(1).alarmDateStart, /^\d{4}-\d{2}-\d{2} 00:00:00$/)
  assert.match(utils.getWeekRange(1).alarmDateEnd, /^\d{4}-\d{2}-\d{2} 23:59:59$/)
  assert.equal(utils.getCurrentWeekDates().length, 7)
})
