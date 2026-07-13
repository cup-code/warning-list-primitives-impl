// import dayjs from 'dayjs'
// import advancedFormat from 'dayjs/plugin/advancedFormat'
// import customParseFormat from 'dayjs/plugin/customParseFormat'
// import isBetween from 'dayjs/plugin/isBetween'
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
// import localeData from 'dayjs/plugin/localeData'
// import localizedFormat from 'dayjs/plugin/localizedFormat'
// import relativeTime from 'dayjs/plugin/relativeTime'
// import timezone from 'dayjs/plugin/timezone'
// import utc from 'dayjs/plugin/utc'
// import weekOfYear from 'dayjs/plugin/weekOfYear'
// import weekday from 'dayjs/plugin/weekday'
// import weekYear from 'dayjs/plugin/weekYear'

// // 加载中文语言包
// import 'dayjs/locale/zh-cn'

// // 加载插件
// dayjs.extend(advancedFormat)
// dayjs.extend(customParseFormat)
// dayjs.extend(isBetween)
// dayjs.extend(isSameOrAfter)
// dayjs.extend(isSameOrBefore)
// dayjs.extend(localeData)
// dayjs.extend(localizedFormat)
// dayjs.extend(relativeTime)
// dayjs.extend(timezone)
// dayjs.extend(utc)
// dayjs.extend(weekOfYear)
// dayjs.extend(weekday)
// dayjs.extend(weekYear)

// // 设置默认语言为中文
// dayjs.locale('zh-cn')

// // 为了兼容moment的add方法
// const originalAdd = dayjs.prototype.add
// dayjs.prototype.add = function(value, unit) {
//   // 兼容moment的负值处理
//   if (typeof value === 'string' && value.startsWith('-')) {
//     return this.subtract(parseInt(value.substr(1)), unit)
//   }
//   return originalAdd.call(this, value, unit)
// }

// // 为了兼容moment的valueOf方法（虽然dayjs已经支持）
// dayjs.prototype.valueOf = function() {
//   return this.toDate().getTime()
// }

// // 为了兼容moment的stamp方法（用于获取时间戳）
// dayjs.prototype.stamp = function() {
//   return this.valueOf()
// }

// // 为了兼容moment的format方法（虽然dayjs已经支持）
// const originalFormat = dayjs.prototype.format
// dayjs.prototype.format = function(formatStr) {
//   return originalFormat.call(this, formatStr)
// }

// // 为了兼容moment的subtract方法（虽然dayjs已经支持）
// const originalSubtract = dayjs.prototype.subtract
// dayjs.prototype.subtract = function(value, unit) {
//   return originalSubtract.call(this, value, unit)
// }

// export default dayjs
