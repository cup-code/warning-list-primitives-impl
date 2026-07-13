import { axiosParams } from '../common/utils'

// 获取大屏数据
export function getScreenData(params) {
  return axiosParams('post', `videoStat/screen/getScreenData`, params)
}

// 预警记录-今日预警信息
export function getAlarmRecord(params) {
  return axiosParams('get', `videoAlarm/todayAlarm`, params)
}

// 预警记录-最近10条
export function getAlarmRecordTop10(params) {
  return axiosParams('get', `videoAlarm/topAlarm`, params)
}
