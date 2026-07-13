import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询所有画面分组
export function getAllHmiGroup() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiGroup/allGroup`)
}

// 根据条件分页获取画面分组信息
export function getHmiGroup(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 分组名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  return axiosGet(axios, `hmiGroup/list?${pr}`)
}

// 新增画面分组
export function addHmiGroup(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmiGroup`, params)
}

// 修改画面分组
export function editHmiGroup(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `hmiGroup?groupId=${params.id}`, params)
}

// 删除画面分组
export function deleteHmiGroup(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `hmiGroup/${id}`)
}
