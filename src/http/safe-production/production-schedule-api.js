import {
  axiosDownload,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 水量未来预测数据
export function forecastWater(param) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `fc/v2/futureWater?station=${param.station}`)
}

// 站点某日水量
export function specificDayWater(param) {
  const axios = createAxiosFromStore()
  let pr = ''
  if (param.station) {
    pr = `?station=${param.station}`
  }
  if (param.dateStr) {
    pr += `&dateStr=${param.dateStr}`
  }
  return axiosGet(axios, `fc/v2/specificDayWater${pr}`)
}

// 容积标定数据查询
export function getStationList(params) {
  const axios = createAxiosFromStore()
  let pr = ''
  if (params.station) {
    pr = `?station=${params.station}`
  }
  if (params.pageNum) {
    pr += `&pageNum=${params.pageNum}`
  }
  if (params.pageSize) {
    pr += `&pageSize=${params.pageSize}`
  }
  pr += `&isPage=${params.isPage}`
  if (params.category) {
    pr += `&category=${params.category}`
  }
  return axiosGet(axios, `fc/vc/query${pr}`)
}

// 容积标定数据导出
export function exportStationData(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fc/vc/export`, params)
}

// 容积标定导入模板
export function importStationTemplate() {
  const axios = createAxiosFromStore()
  return axiosDownload(axios, `fc/vc/getTemplate`)
}

// 容积标定数据导入
export function importStationData(params) {
  const axios = createAxiosFromStore()
  let pr = ''
  if (params.station) {
    pr = `?station=${params.station}`
  }
  if (params.category) {
    pr += `&category=${params.category}`
  }
  const formData = new FormData()
  if (params.file) {
    formData.append('file', params.file)
  }
  return axiosPost(axios, `fc/vc/import${pr}`, formData)
}
