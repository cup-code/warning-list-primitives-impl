import { axiosGet, createAxiosFromStore } from '../common/utils'

// 应急资源统计分析
export function getEmergencyStatistics(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `emergency/statistics/getStatistics${reqStr}`)
}
