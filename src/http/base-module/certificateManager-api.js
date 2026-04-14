import {
  axiosDelete,
  axiosFile,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/* 安全证照 */
// 新增证照
export function certSafeManageSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/saveCertificate`, params)
}
// 删除证照
export function certSafeManageDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `aqlicense/manage/removeById?id=${id}`)
}
// 更新证照
export function certSafeManageUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/updateCertificate`, params)
}
// 分页查询证照
export function certSafeManageByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/queryPageInfo`, params)
}
// 按id查询证照
export function certSafeManageById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `aqlicense/manage/selectCertificateById?id=${id}`)
}
// 上传图片
export function certSafeManageUpload(file) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  formData.append('file', file)
  return axiosPost(
    axios,
    `sys/uploadFile?fileType=COMPANY_BUSINESS_LICENSE_PATH&isRetainFileName=true`,
    formData,
  )
}

// 导出错误数据并形成excel
export function certSafeManageExcelError(params) {
  const axios = createAxiosFromStore()
  return axiosFile(axios, `aqlicense/manage/downloadError`, 'post', params)
}
// 导出列表数据并形成excel
export function certSafeManageExcelExport(params) {
  const axios = createAxiosFromStore()
  return axiosFile(axios, `aqlicense/manage/export`, 'post', params)
}
// 获取导出表头列表字段
export function certSafeManageExcelHeaderData() {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/exportField`)
}
// 解析excel
export function certSafeManageExcelAnalysis(file) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  formData.append('file', file)
  return axiosPost(axios, `aqlicense/manage/parseFile`, formData)
}
// 保存导入的excel数据
export function certSafeManageExcelSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/saveCorrectData`, params)
}
// 获取excel模板
export function certSafeManageExcelTemplate() {
  const axios = createAxiosFromStore()
  return axiosFile(axios, `aqlicense/manage/template`)
}

// 工伤获取excel模板
export function injuryOnTheJob() {
  const axios = createAxiosFromStore()
  return axiosFile(axios, `injuryOnTheJob/template`)
}
// 工伤费用导出excel模板
export function importExcel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `injuryOnTheJob/importExcel`, params)
}

/* 复审证照 */
// 新增复审记录
export function certRecheckRecordAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/review/saveApprove`, params)
}
// 分页查询复审列表
export function certRecheckRecordByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `aqlicense/manage/selectCertificateByState`, params)
}
// 查看单条失效证件
export function certRecheckRecordInfoById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `aqlicense/manage/selectCertificateByidAndState?id=${id}`)
}
