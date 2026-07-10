import {
  axiosDelete,
  axiosGet,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 查询指定公司下或部门下的所有用户
export function selectCompany(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `joySuchUser/getAll/${params.busId}/${params.busIdType}`)
}
// 查询指定公司下的所有用户
export function getByCompanyId(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getByCompanyId/${id}`)
}
// 查询指定公司下的所有部门
export function getCompanyById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/companyDepartment/${id}`)
}
// 查询指定部门下的所有用户
export function getCompanyPeopleById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getByDeptId/${id}`)
}
// 查询人员资质证书
export function selectEmployeeCertificate(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `aqlicense/manage/list/${params}`)
}
// 删除人员资质证书
export function qualificationDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `aqlicense/manage/removeById?id=${id}`)
}
// 保存公司资质证书
export function getQualification(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `sysCompanyQualification/list/${id}`)
}
// 删除公司资质证书
export function qualificaDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `sysCompanyQualification/delete/${id}`)
}
