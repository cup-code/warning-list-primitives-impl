// 报警中心的接口
import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询
export function getAbnormalTable(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.alarmInfo) {
    pr += `&alarmInfo=${encodeURIComponent(params.alarmInfo)}`
  }
  if (params.alarmType || params.alarmType == 0) {
    pr += `&alarmType=${params.alarmType}`
  }
  if (params.state || params.state == 0) {
    pr += `&state=${params.state}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alarmCenter/queryByPage${pr}`)
}
