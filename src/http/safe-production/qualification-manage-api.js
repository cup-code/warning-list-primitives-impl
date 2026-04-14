import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 分页查询公司资质
export function getQualificationListFn(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  if (typeof params.isExpired === 'boolean') {
    pr += `&isExpired=${params.isExpired}`
  }
  return axiosGet(axios, `sysCompanyQualification/queryByPage?${pr}`)
}
// 保存或修改公司资质
export function addQualificationFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysCompanyQualification/save`, params)
}
// 删除公司资质
export function deleteQualificationFn(qualificationId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysCompanyQualification/delete/${qualificationId}`)
}
