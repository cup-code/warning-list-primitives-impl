import moment from 'moment'
import { createReportDataModel } from '@link/warning-feature/report-data'
import { getWeekday } from './dateUtils.js'

export const {
  generateActualList,
  generateStatsList,
  processTrendTableData,
  processAlarmTypeRank,
  processCameraAlarmRank,
  processAlarmLevelRank,
  generateReportText,
} = createReportDataModel({
  dateLib: moment,
  getWeekday,
})
