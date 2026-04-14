import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询所有一级公司
export function getTenantCompany() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompany/getTenantCompany`)
}
// 保存租户的菜单集
export function saveTenantMenu(tenantId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysTenantMenu/saveTenantMenu/${tenantId}`, params)
}
