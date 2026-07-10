import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 两清单 */
// 危害因素辨识排查清单
export function riskEvaCheckDetailByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskInventory/identificationPage${reqStr}`)
}
// 安全风险分级管控清单
export function riskLevelCtrlDetailByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskInventory/controlPage${reqStr}`)
}
// 获取两个清单页面的页签数据
export function getCountByUnitTypeFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (
      (params[key] || params[key] === 0)
      && key !== 'pageNum'
      && key !== 'pageSize'
      && key !== 'riskUnitType'
    ) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskInventory/countGroupByUnitType${reqStr}`)
}

/* 四知卡 */
// 岗位职责卡分页
export function workDutyCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/jobResponsibilitiesCard/page/v2${reqStr}`)
}
// 岗位职责卡保存
export function workDutyCardSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/jobResponsibilitiesCard/save`, params)
}
// 岗位职责卡获取富文本
export function getWorkDutyCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/jobResponsibilitiesCard/richText/${id}`)
}
// 删除岗位职责卡
export function workDutyCardDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/jobResponsibilitiesCard/delete/${id}`)
}

// 风险辨识卡分页
export function riskEvaCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskIdentificationCard/page${reqStr}`)
}
// 风险辨识卡保存
export function riskEvaCardSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/riskIdentificationCard/save`, params)
}
// 风险辨识卡获取富文本
export function getRiskEvaCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskIdentificationCard/richText/${id}`)
}
// 删除风险辨识卡
export function riskEvaCardDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/riskIdentificationCard/delete/${id}`)
}

// 操作规程卡分页
export function handleRuleCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/operatingProcedureCard/page/v2${reqStr}`)
}
//  操作规程卡保存
export function handleRuleCardSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/operatingProcedureCard/save`, params)
}
//  操作规程卡获取富文本
export function getHandleRuleCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/operatingProcedureCard/richText/${id}`)
}
// 删除操作规程卡
export function handleRuleCardDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/operatingProcedureCard/delete/${id}`)
}

// 应急处置卡分页
export function emCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/emergencyTreatmentCard/page/v2${reqStr}`)
}
//  应急处置卡保存
export function emCardSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/emergencyTreatmentCard/save`, params)
}
//  应急处置卡获取富文本
export function getEmCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/emergencyTreatmentCard/richText/${id}`)
}
// 删除应急处置卡
export function emCardDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/emergencyTreatmentCard/delete/${id}`)
}
