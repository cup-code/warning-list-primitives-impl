import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 获取视角列表
export function getViewList(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  if (params.name) {
    pr += `&name=${params.name}`
  }
  return axiosGet(axios, `/mapBeacon/getViewList${pr}`)
}

// 保存视角
export function saveView(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/mapBeacon/saveView`, params)
}

// 编辑视角
export function editView(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/mapBeacon/updateView`, params)
}

// 删除视角
export function deleteView(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/mapBeacon/deleteView/${id}`)
}

// 获取标记点列表
export function getMarkerList(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.markerName) {
    pr += `&markerName=${params.markerName}`
  }
  return axiosGet(axios, `/mapBeacon/getMarkerList${pr}`)
}

// 保存标记点
export function saveMarker(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/mapBeacon/saveMarker`, params)
}

// 编辑标记点
export function editMarker(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/mapBeacon/updateMarker`, params)
}

// 删除标记点
export function deleteMarker(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/mapBeacon/deleteMarker/${id}`)
}
