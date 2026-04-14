import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 检查内容库 */
// 获取检查内容类型树
export function getSafeCheckModuleTypeTree() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/SafeCheckContentLibrary/typeTree`)
}
// 删除内容类型树条目
export function safeCheckModuleTypeTreeDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/SafeCheckContentLibrary/deleteType/${id}`)
}

// 保存内容类型树条目
export function safeCheckModuleTypeTreeSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/SafeCheckContentLibrary/saveType`, params)
}
// 获取检查内容库分页
export function getSafeCheckModuleByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/SafeCheckContentLibrary/contentPage${reqStr}`)
}
// 删除检查内容库条目
export function safeCheckModuleDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/SafeCheckContentLibrary/deleteContent/${id}`)
}
// 保存检查内容
export function safeCheckModuleSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/SafeCheckContentLibrary/saveContent`, params)
}

/* 安全检查表 */
// 根据检查表id获取检查内容列表
export function getSafeCheckTableByTableId(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/safeCheckSchedule/checkContent/${id}`)
}
// 表-获取安全检查表分页
export function getSafeCheckTableByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/safeCheckSchedule/schedulePage${reqStr}`)
}
// 表-根据id获取安全检查内容详情
export function safeCheckTableById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/safeCheckSchedule/detail/${id}`)
}
// 表-删除安全检查表
export function safeCheckTableDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/safeCheckSchedule/deleteSchedule/${id}`)
}
// 表-保存安全检查表
export function safeCheckTableSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/safeCheckSchedule/saveSchedule`, params)
}
// 树-获取安全检查表类型树
export function getSafeCheckTableTypeTree() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/safeCheckSchedule/typeTree`)
}

// 树-删除安全检查表类型
export function safeCheckTableTypeDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/safeCheckSchedule/deleteType/${id}`)
}
// 树-保存安全检查表类型
export function safeCheckTableTypeSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/safeCheckSchedule/saveType`, params)
}

/* 安全检查计划 */
// 获取检查计划分页
export function getSafeCheckPlanByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/safeCheckPlan/planPage${reqStr}`)
}
// 禁用检查计划
export function safeCheckPlanDisable(id) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `dpm/safeCheckPlan/disable/${id}`)
}
// 启用检查计划
export function safeCheckPlanEnable(id) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `dpm/safeCheckPlan/enable/${id}`)
}
// 删除检查计划
export function safeCheckPlanDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/safeCheckPlan/deletePlan/${id}`)
}
// 根据id获取检查计划详情
export function safeCheckPlanInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/safeCheckPlan/detail/${id}`)
}
// 保存检查计划
export function safeCheckPlanSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/safeCheckPlan/savePlan`, params)
}

/* 安全检查任务 */
// 获取检查任务分页
export function getSafeCheckTaskByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/safeCheckTask/taskPage${reqStr}`)
}
// 获取检查任务子任务分页
export function getSafeCheckTaskSubTaskByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/safeCheckTask/subTaskPage${reqStr}`)
}

/* 安全检查台账 */
// 台账分页查询
export function getSafeCheckAccountByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenDanger/recordPage${reqStr}`)
}
// 获取查询任务子任务分页
export function safeCheckDetailsById(troubleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/hiddenDanger/getDetail/${troubleId}`)
}
// 获取设备异常隐患的详情
export function deviceCheckDetailsById(troubleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/hiddenTrouble/getDetail/${troubleId}`)
}
// 确认为重复隐患
export function isRepeatTroubleFn(troubleId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dpm/hiddenDanger/isRepeat/${troubleId}`)
}
// 删除台账
export function delBookById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/hiddenDanger/delete/${id}`)
}
// 获取隐患的流转日志
export function getTroubleLogFn(troubleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/hiddenDanger/history/${troubleId}`)
}
// 随手拍清单
export function getFastReportListByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenDanger/recordPageByTroubleSource${reqStr}`)
}
// 评价管理：安全员考评台账，设备设施未检查。分页查询隐患来源为安全检查的隐患
export function getEquipmentTroubleByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenDanger/safetyCheckecordHiddenTroublePage${reqStr}`)
}
