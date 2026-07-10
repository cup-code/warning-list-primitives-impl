import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询所有公司list
export function getCompanyList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompany/getAll`)
}
// 超级管理员保存修改集团公司
// 新增修改一级公司
export function saveFirstCompany(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysCompany/saveGroupCompany`, params)
}
// 租户架构管理员保存修改分子公司
export function saveChildCompany(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysCompany/saveChildrenCompany`, params)
}
// 获取所有省级地址
export function getProvinces() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDistrict/getTop`)
}
// 根据地区id查询下级地区
export function getChildCity(districtCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDistrict/queryChild/${districtCode}`)
}
// 删除公司
export function deleteCompany(companyId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysCompany/delete/${companyId}`)
}
// 获取绑定oa的外部公司列表信息
export function getExternalPlatform(tenantCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `oaData/getAllCompany/${tenantCode}`)
}
