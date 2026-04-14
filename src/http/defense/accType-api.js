import {
  axiosDelete,
  axiosGet,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 获取事故类型分页
export function getAccTypeList(data) {
  const axios = createAxiosFromStore()
  let reqStr = `fuzzyQuery=${data.fuzzyQuery}`
  reqStr += `&pageNum=${data.pageNum}`
  reqStr += `&pageSize=${data.pageSize}`
  return axiosGet(axios, `dpm/accident/page?${reqStr}`)
}

// 删除事故类型
export function delAccType(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/accident/delete/${id}`)
}

// 事故类型保存
export function saveAccType(data) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `dpm/accident/save`, data)
}

// 事故类型列表，全部
export function getAccTypeListAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/accident/allList`)
}
