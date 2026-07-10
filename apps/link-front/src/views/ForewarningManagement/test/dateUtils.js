import weekOfYear from 'dayjs/plugin/weekOfYear'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
moment.extend(weekOfYear)

/**
 * 获取当前周数
 * @returns {number} 当前周数
 */
export function getCurrentWeekNumber() {
  return moment().week()
}

/**
 * 获取当前年份
 * @returns {number} 当前年份
 */
export function getCurrentYear() {
  return moment().year()
}

/**
 * 获取某天是星期几
 * @param {string} dateStr - 日期字符串，格式：'MM-DD'
 * @returns {string} 星期几
 */
export function getWeekday(dateStr) {
  const year = moment().year()
  const date = moment(`${year}-${dateStr}`)
  return date.format('dddd')
}

/**
 * 获取本周日期范围字符串
 * @returns {string} 例：2025年07月14日（星期一）00:00:00-07月20日 23:59:59（星期日）
 */
export function getWeekDateStr(type) {
  const typeMap = { 0: 'date', 1: 'week', 2: 'month' }

  const today = moment()
  const startOfWeek = type.timeType == undefined ? moment(type.alarmDateStart) : today.clone().startOf(typeMap[type.timeType])
  const endOfWeek = type.timeType == undefined ? moment(type.alarmDateEnd) : today.clone().endOf(typeMap[type.timeType])

  const startStr = `${startOfWeek.format('YYYY年MM月DD日（dddd）')}00:00:00`
  const endStr = `${endOfWeek.format('MM月DD日')} 23:59:59（${endOfWeek.format('dddd')}）`

  return `${startStr}-${endStr}`
}

/**
 * 获取本周所有日期（格式：MM-DD），周一到周日
 * @returns {string[]} 例：['07-08','07-09',...,'07-14']
 */
export function getCurrentWeekDates() {
  const startOfWeek = moment().startOf('week')
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    weekDates.push(startOfWeek.clone().add(i, 'day').format('MM-DD'))
  }
  return weekDates
}

function formatDate(date) {
  if (date === 'week') {
    return moment().startOf('week').add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  }
  else {
    return moment().startOf(date).format('YYYY-MM-DD HH:mm:ss')
  }
}

/**
 * 获取本周开始和结束时间
 * @returns {object} { start: string, end: string }
 */
export function getWeekRange(type, val = []) {
  if (type === 'custom') {
    return {
      alarmDateEnd: val[1],
      alarmDateStart: val[0],
    }
  }

  const typeMap = { 0: 'date', 1: 'week', 2: 'month' }
  return {
    timeType: type,
    alarmDateEnd: moment().format('YYYY-MM-DD 23:59:59'),
    alarmDateStart: formatDate(typeMap[type]),
  }
}
