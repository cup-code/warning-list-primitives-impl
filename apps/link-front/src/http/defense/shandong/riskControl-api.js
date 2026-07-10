import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 风险区域 */
// 分页查询风险区域
export function getRiskAreaByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskRegion/page${reqStr}`)
}
// 删除风险区域
export function riskAreaDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/riskRegion/delete/${id}`)
}
// 保存风险区域
export function riskAreaSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/riskRegion/save`, params)
}
// 获取所有风险区域
export function getRiskAreaAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskRegion/allList`)
}
// 分页查询管控清单
export function getRiskCtrlMeasureByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskEvent/controlMeasures${reqStr}`)
}

/* 风险分析单元 */
// 分页查询风险分析单元
export function getAnalyseUnitByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskAnalysisUnit/page${reqStr}`)
}
// 删除风险分析单元
export function analyseUnitDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/riskAnalysisUnit/delete/${id}`)
}
// 保存风险分析单元
export function analyseUnitSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/riskAnalysisUnit/save`, params)
}
// 获取所有分析单元-下拉列表用
export function getAnalyseUnitAll(unitType) {
  const axios = createAxiosFromStore()
  let pr = ''
  if (unitType) {
    pr = `?unitType=${unitType}`
  }
  return axiosGet(axios, `dpm/riskAnalysisUnit/allList${pr}`)
}
// 获取风险区域地域列表
export function getAnalyseById(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `joySuchRiskZoning/getAllRisk/${params.busId}/${params.busIdType}`)
}
/* 风险事件 */
// 分页查询风险事件
export function getRiskEventByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskEvent/page${reqStr}`)
}
// 事件管理页面查询分析单元类型的数量
export function getEventCountByUnitTypeFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (
      params[key] != undefined
      && key !== 'pageNum'
      && key !== 'pageSize'
      && key !== 'analysisUnitType'
    ) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskEvent/countGroupByUnitType${reqStr}`)
}
// 删除风险事件
export function riskEventDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/riskEvent/delete/${id}`)
}
// 保存风险事件
export function riskEventSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/riskEvent/save`, params)
}
// 按id获取风险事件详情
export function getRiskEventById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskEvent/detail/${id}`)
}

/* 风险分级管控 */
// 分页查询管控列表
export function getLevelCtrlByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskControl/page${reqStr}`)
}
// 风险分级管控页面查询单元类型的数量
export function getLevelCtrlCountByUnitTypeFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (
      params[key] != undefined
      && key !== 'pageNum'
      && key !== 'pageSize'
      && key !== 'analysisUnitType'
    ) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskControl/countGroupByUnitType${reqStr}`)
}
// 获取分页列表的展开行信息
export function getLevelCtrlExpand(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskControl/taskList/${id}`)
}
// 获取管控详情
export function getLevelCtrlById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskControl/detail/${id}`)
}
// 保存管控信息
export function levelCtrlSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/riskControl/save`, params)
}
