import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 安全培训库 */
// 分页查询安全培训库
export function getSafeEducationByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialJob/safetyTrain/queryPageInfo`, params)
}
// 删除安全培训库
export function safeEducationDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialJob/safetyTrain/delete?id=${id}`)
}
// 新增更新安全培训库
export function safeEducationSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialJob/safetyTrain/saveOrUpdate`, params)
}

// 查询安全培训库
export function getSafeEducationAll(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `specialJob/safetyTrain/getById?id=${id}`)
}

/* 安全措施库 */
// 分页查询安全措施库
export function getSafeMeasureByPage(params) {
  const axios = createAxiosFromStore()

  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.applySite) {
    pr += `&applySite=${params.applySite}`
  }
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.jobTypeCode) {
    pr += `&jobTypeCode=${params.jobTypeCode}`
  }
  if (params.measureContent) {
    pr += `&measureContent=${params.measureContent}`
  }
  return axiosGet(axios, `specialJob/safetyMeasures/queryPageInfo/${pr}`)
}
// 删除安全措施库
export function safeMeasureDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialJob/safetyMeasures/delete?id=${id}`)
}
// 新增更新安全措施库
export function safeMeasureSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialJob/safetyMeasures/saveOrUpdate`, params)
}

// 查询安全措施库
export function getSafeMeasureAll(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `specialJob/safetyMeasures/getById?id=${id}`)
}
