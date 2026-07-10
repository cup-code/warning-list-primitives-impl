import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 获取设备分组集合
export function getDeviceGroup() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/group/list`)
}

// 新增设备分组
export function addDeviceGroup(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/group`, params)
}

// 修改设备分组
export function editDeviceGroup(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `device/group?deviceGroupId=${params.id}`, params)
}

// 删除设备分组
export function deleteDeviceGroup(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `device/group/${id}`)
}

// 根据设备分组id获取设备分组信息
export function getDeviceByGroup(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/group/info/${id}`)
}

// 保存分组下的设备
export function saveDeviceToGroup(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/group/saveGroupWithDevices`, params)
}
