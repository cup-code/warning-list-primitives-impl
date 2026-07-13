import weekOfYear from 'dayjs/plugin/weekOfYear'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { createReportDateUtils } from '@link/warning-feature/report-date-utils'

const reportDateUtils = createReportDateUtils({ dateLib: moment, weekOfYear })

export const {
  getCurrentWeekNumber,
  getCurrentYear,
  getWeekday,
  getWeekDateStr,
  getCurrentWeekDates,
  getWeekRange,
  getCurrentTitle,
  getDefaultReportTitle,
} = reportDateUtils
