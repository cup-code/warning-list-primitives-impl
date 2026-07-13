import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询所有字典
export function getDictList(tenantCode) {
  const axios = createAxiosFromStore()
  const url = tenantCode === 'super' ? 'sysDict/all' : 'tenantDict/all'
  return axiosGet(axios, url)
}
// 保存编辑字典项
export function saveDict(params, tenantCode) {
  const axios = createAxiosFromStore()
  const url = tenantCode === 'super' ? 'sysDict/saveDict' : 'tenantDict/saveDict'
  return axiosPost(axios, url, params)
}
// 删除字典
export function deleteDict(dictId, tenantCode) {
  const axios = createAxiosFromStore()
  const url = tenantCode === 'super' ? `sysDict/delete/${dictId}` : `tenantDict/delete/${dictId}`
  return axiosDelete(axios, url)
}
// 查询数据字典key-value格式，这个获取的是系统级运营数据字典map
export function getDictListMap() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDict/getDictMap`)
}
// 查询数据字典key-value格式，这个获取的是用户自己的数据字典map
export function getTenantDictListMap() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `tenantDict/getDictMap`)
}
// 同步运营字典到租户字典表
export function syncDictFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `tenantDict/syncSysDict`)
}
