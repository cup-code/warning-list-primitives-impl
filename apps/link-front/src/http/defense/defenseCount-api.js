import { axiosGet, createAxiosFromStore } from '@/http/common/utils'
// 双预防运行统计
export function getDefenseCount() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/statistics/ehs`)
}
// 双预防部门运行情况统计
export function getDepartmentDefenseCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `dpm/statistics/depart?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
