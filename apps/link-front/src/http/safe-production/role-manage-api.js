import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  get,
} from '@/http/common/utils'

// 获取平台内部角色
export function getInnerRole() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/getInternalRole`)
}
// 分页查询租户下角色
export function getAllRoles(params) {
  return get(`sysRole/list`, params)
}
// 查询拥有指定角色的所有人员
export function getUserWithRole(roleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/userWithRole/${roleId}`)
}
// 新增或修改角色
export function addRole(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysRole/save`, params)
}
// 删除角色
export function deleteRole(roleId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysRole/delete/${roleId}`)
}
// 更改默认角色
export function getChangeRole(roleId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysRole/setDefault/${roleId}`)
}
// 查询指定角色的菜单权限
export function getRoleMenuList(roleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/menusForRole/${roleId}`)
}
// 查询指定角色的部门数据权限
export function getRoleDepartList(roleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/dataForRole/${roleId}`)
}
// 查询指定租户id或公司id的集团公司的菜单集
export function getCompanyMenuList(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysTenantMenu/getTenantMenu?companyId=${id}`)
}
// 移除指定角色的指定用户
export function removeRoleForUser(roleId, userId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/removeRoleForUser?roleId=${roleId}&userId=${userId}`)
}
// 将指定角色分配给多个用户
export function assignRole(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysRole/assignRole`, params)
}
