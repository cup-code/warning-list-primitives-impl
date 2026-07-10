/*
 * @Author: xiaorui 文档管理台账的接口
 * @Date: 2023-01-09 15:31:51
 * @Last Modified by: xiaorui
 * @Last Modified time: 2023-03-21 16:07:15
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页条件查询文档信息
export function getDocListByPageFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  return axiosGet(axios, `document/info/page${reqStr}`)
}
// 检验文件编号是否已存在
export function docCodeIsExistFn(docCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `document/info/isExist?docCode=${docCode}`)
}
// 保存文档
export function saveDocInfoFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/info/save`, params)
}
// 修改文档信息
export function editDocInfoFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/info/modify`, params)
}
// 修订文档信息
export function reviseDocInfoFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/revise/byId`, params)
}
// 作废文档
export function invalidDocFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/invalid/byId`, params)
}
// 根据主键删除文档标签
export function deleteDocTagFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `document/tag/delete/${id}`)
}
// 分页查询指定文档的评审会签纪录
export function getReviewListByDocIdFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `document/review/pageByDoc/${params.docId}${reqStr}`)
}
// 查询指定文档最新的评审会签纪录
export function getNewReviewListByDocIdFn(docId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `document/review/processingByDoc/${docId}`)
}
// 分页查询指定文档的告知纪录
export function getInformListByDocIdFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `document/inform/pageByDoc//${params.docId}${reqStr}`)
}
// 分页查询指定文档的修订纪录
export function getReviseListByDocIdFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `document/revise/pageByDoc/${params.docId}${reqStr}`)
}
// 分页条件查询当前登录人的评审纪录
export function getReviewListByPageFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  return axiosGet(axios, `document/review/page${reqStr}`)
}
// 提交评审结果
export function saveDocReviewFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `document/review/byId`, params)
}
// 分页条件查询作废文档列表
export function getInvalidListByPageFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  return axiosGet(axios, `document/invalid/page${reqStr}`)
}
// 分页条件查询历史版本列表
export function getHistoryVerListByPageFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  return axiosGet(axios, `document/version/page${reqStr}`)
}
// 条件查询已归档的文档
export function getFiledDocListFn(params = {}) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  return axiosGet(axios, `document/info/query${reqStr}`)
}
