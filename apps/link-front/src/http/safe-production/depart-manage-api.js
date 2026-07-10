import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询当前登录人或其角色的简单信息部门树
export function getDepartListSimple() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/getSimpleTree`)
}
// 查询当前登录人的完整信息部门树
export function getDepartListDetail(hasResponsible) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/getSelfDepartmentTree?hasResponsible=${hasResponsible}`)
}
// 查询指定租户下的所有部门
export function getDepartListByTenantIdFn(tenantId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/tenantDepartment/${tenantId}`)
}
// 添加或修改部门
export function addDepart(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysDepartment/save`, params)
}
// 查询指定租户下的所有用户,选择负责人时使用,需根据业务场景判断是使用租户id还是公司id
export function getAllUsersByTenant(tenantId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/extend/getByTenantId/${tenantId}`)
}
// 查询指定公司下的所有用户,选择负责人时使用,需根据业务场景判断是使用租户id还是公司id
export function getAllUsersByCompany(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/extend/getByCompanyId/${companyId}`)
}
// 删除部门
export function removeDepartFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysDepartment/delete/${id}`)
}
// 查询指定公司下的所有部门
export function getAllDepartByCompanyFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/companyDepartment/${companyId}`)
}
// 查询指定部门的所有子部门（穿透）
export function getAllDepartByDepartFn(departmentId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/getChildrenDepart/${departmentId}`)
}
// 使用oa公司id查公司下的所有oa部门
export function getDepListByOaCompanyId(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `oaData/getDepartmentByOaCompanyId/${companyId}`)
}
// 使用平台公司id查公司下的所有oa部门
export function getDepListByCompanyId(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `oaData/getDepartmentBySysCompanyId/${companyId}`)
}
// -系统全局模块扩展:保存部门人员配置
export function saveDepartStaffing(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysDepartment/extend/saveStaffing`, params)
}
// -系统全局模块扩展:获取部门人员配置
export function getDepartStaffing(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/extend/getStaffing/${deptId}`)
}
// -系统全局模块扩展:获取部门所有关键人员信息,返回map,
export function getDepartStaffingWithName(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/extend/getStaffingByDepartId/${deptId}`)
}

// 保存部门扩展信息
export function saveDepartmentExtensionInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysDepartment/extend/saveExt`, params)
}

// 获取部门扩展信息
export function getDepartmentExtensionInfo(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/extend/getExt/${deptId}`)
}

// 查询指定用户的扩展信息
export function getAssignUserInfo(userId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/extend/getById/${userId}`)
}
