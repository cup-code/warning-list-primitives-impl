/**
 * 特种设备周报接口
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/**
 * 分页查询特种设备周报模板
 * @param params 查询参数
 */
export function getWeeklyReportTemplatePaging(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/specialEquipment/weeklyReport/template/pageQuery`, params)
}

/**
 * 查询当前登录用户可用的特种设备周报模板
 */
export function getAvailableWeeklyReportTemplateList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/specialEquipment/weeklyReport/template/list/available`)
}

/**
 * 删除特种设备周报模板
 * @param id 主键编号
 * @returns {*}
 */
export function deleteWeeklyReportTemplate(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/specialEquipment/weeklyReport/template/delete/${id}`)
}

/**
 * 更新特种设备周报模板状态
 * @param id 模板唯一编号
 * @param status 状态
 */
export function updateWeeklyReportTemplateStatus(id, status) {
  const axios = createFormUrlencodedAxios()
  return axiosPost(axios, `/specialEquipment/weeklyReport/template/updateStatus/${id}/${status}`)
}

/**
 * 保存特种设备周报模板
 * @param params 表单参数
 */
export function saveWeeklyReportTemplate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/specialEquipment/weeklyReport/template/save`, params)
}

/**
 * 分页查询特种设备周报台账
 * @param params 查询参数
 */
export function getWeeklyReportRecordPaging(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/specialEquipment/weeklyReport/records/pageQuery`, params)
}

/**
 * 保存特种设备周报台账
 * @param params 表单参数
 */
export function saveWeeklyReportRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/specialEquipment/weeklyReport/records/save`, params)
}

/**
 * 删除特种设备周报台账
 * @param id 主键编号
 * @returns {*}
 */
export function deleteWeeklyReportRecord(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/specialEquipment/weeklyReport/records/delete/${id}`)
}

/**
 * 查询本周特种设备周报台账
 */
export function getThisWeekWeeklyReportRecordList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/specialEquipment/weeklyReport/records/list/thisWeek`)
}

/**
 * 导入周报记录
 * @param params 参数
 */
export function importWeeklyReportRecord(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/specialEquipment/weeklyReport/records/import', params)
}
// 分页查询查询周报填写情况
export function getWeekReportListByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `specialEquipment/weeklyReport/records/list/weeklyReportCondition${reqStr}`,
  )
}
