/*
 * @Author: xiaorui
 * @Date: 2023-01-05 16:16:25 文档管理标签的接口
 * @Last Modified by: xiaorui
 * @Last Modified time: 2023-01-09 15:37:43
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 查询所有文档标签
export function getAllDocTagFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `document/tag/all`)
}
// 保存文档标签
export function saveDocTagFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/tag/save`, params)
}
// 根据主键删除文档标签
export function deleteDocTagFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `document/tag/delete/${id}`)
}
