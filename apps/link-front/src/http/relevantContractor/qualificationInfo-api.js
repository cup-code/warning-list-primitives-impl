import {
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询承包商人员资质列表
export function getQualificationByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/qualificationAuditing/pageQuery`, params)
}
// 审查承包商人员资质数据
export function qualificationReview(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/qualificationAuditing/addOrUpdate`, params)
}
// 上传人员资质
export function qualificationUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/staff/uploadStaffQualification`, params)
}
// 查询指定公司下的承包商
export function getAppointedContractor(companyId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/getAllByCompanyId/${companyId}`)
}
