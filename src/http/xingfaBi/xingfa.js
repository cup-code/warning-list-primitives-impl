import { axiosGet, createAxiosFromStore } from '@/http/common/utils'

export function getSafetyDays() {}

export function getWeather() {}

export function getGroupByUser() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/groupByUserType`)
}

export function getequipment() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDevice/countTypeGroupByState`)
}

export function getrisk() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/statisticalAnalysis/groupByEventRiskLevel`)
}
export function getChartProblemTotle() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/statisticalAnalysis/groupByTroubleMonth`)
}
export function getChartwork() {
  // 作业票
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/homePageCount`)
}
