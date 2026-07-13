import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 超级管理员获取菜单列表
export function getMenuList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysMenu/get`)
}
//  超级管理员保存菜单
export function saveMenu(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysMenu/saveMenu`, params)
}
//  超级管理员删除菜单
export function deleteMenu(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysMenu/delete/${id}`)
}
// 租户管理员获取菜单列表
export function getTenantMenuList(tenantId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysTenantMenu/getTenantMenu?tenantId=${tenantId}`)
}
//  租户管理员保存菜单
export function saveTenantMenu(tenantId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysTenantMenu/saveCustomTenantMenu/${tenantId}`, params)
}
//  租户管理员删除菜单
export function deleteTenantMenu(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysTenantMenu/delete/${id}`)
}
