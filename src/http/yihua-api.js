import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from './common/utils'

// 根据公司和排放口类型 获取排放口设备列表
export function getDevList(params) {
  const axios = createAxiosFromStore()
  // 排放口类型
  if (params.deviceType) {
    const pr = `?deviceType=${params.deviceType}`
    return axiosGet(axios, `devices/h212Device/${params.companyId}${pr}`)
  }
  return axiosGet(axios, `devices/h212Device/${params.companyId}`)
}

// 获取排放口的 实时/历史数据
export function getDevData(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }
  // 数据类型（1实时数据|2历史数据）
  if (params.dataType) {
    pr += `&dataType=${params.dataType}`
  }
  // 查询时间
  if (params.queryTime && params.dataType == 2) {
    pr += `&queryTime=${params.queryTime}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `devices/h212DataOnline/${params.did}${pr}`)
}

// 实时/历史数据 导出excel
export function exportDevDataExcel(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }
  // 数据类型（1实时数据|2历史数据）
  if (params.dataType) {
    pr += `&dataType=${params.dataType}`
  }
  // 查询时间
  if (params.queryTime && params.dataType == 2) {
    pr += `&queryTime=${params.queryTime}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `devices/exportH212DataOnline/${params.did}${pr}`)
}

// 获取排放口的 统计数据
export function getDevStatData(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }
  // 数据类型（1日|2月|3季度|4年）
  if (params.dataType) {
    pr += `&dataType=${params.dataType}`
  }
  // 统计类型 (1监测数据|2超标记录)
  if (params.statType) {
    pr += `&statType=${params.statType}`
  }
  // 查询时间
  if (params.queryTime) {
    pr += `&queryTime=${params.queryTime}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `devices/h212DataStat/${params.did}${pr}`)
}

// 排放口的 统计数据 导出excel
export function exportStatDataExcel(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }
  // 数据类型（1日|2月|3季度|4年）
  if (params.dataType) {
    pr += `&dataType=${params.dataType}`
  }
  // 统计类型 (1监测数据|2超标记录)
  if (params.statType) {
    pr += `&statType=${params.statType}`
  }
  // 查询时间
  if (params.queryTime) {
    pr += `&queryTime=${params.queryTime}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `devices/exportH212DataStat/${params.did}${pr}`)
}

// 获取排放口的 报警记录
export function getDevAlarmRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `page=${params.page}&pageSize=${params.pageSize}`

  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }

  // 异常状态
  if (params.alarmState) {
    pr += `&alarmState=${params.alarmState}`
  }

  // 开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }

  // 结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }

  return axiosGet(axios, `alert/record/hj212list?${pr}`)
}

// 报警记录 导出excel
export function exportAlarmRecordExcel(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }

  // 异常状态
  if (params.alarmState) {
    pr += `&alarmState=${params.alarmState}`
  }

  // 开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }

  // 结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `alert/record/exportHj212list${pr}`)
}

// 报警记录 备注
export function descAlarmRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 异常状态
  if (params.alarmState) {
    pr += `&alarmState=${params.alarmState}`
  }

  // 备注
  if (params.memo) {
    pr += `&memo=${params.memo}`
  }

  pr = pr.replace('?&', '?')

  return axiosPost(axios, `alert/record/marker/${params.id}${pr}`)
}

// 获取首页地图数据
export function getMapData(params) {
  const axios = createAxiosFromStore()
  let pr = `?`

  // 排放口类型（1废水|2废气）
  if (params.deviceType) {
    pr += `&deviceType=${params.deviceType}`
  }
  // 时间类型（1: 24小时;  2: 一周内）
  if (params.dataType) {
    pr += `&dataType=${params.dataType}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `devices/h212HomePageData${pr}`)
}
