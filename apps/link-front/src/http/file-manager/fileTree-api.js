import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 文档知识库类别 */
// 删除文档类别
export function docKnowledgeTypeTreeDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosPost(axios, `knowledgebase/docKnowledgeBaseType/delete?id=${id}`)
}

// 添加/修改文档类别
export function docKnowledgeTypeTreeSaveOrUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `knowledgebase/docKnowledgeBaseType/saveOrUpdate`, params)
}

// 获取文档类别指定数据结构
export function docKnowledgeTypeTreeGetByType(type) {
  const axios = createFormUrlencodedAxios()
  const sendType = type || 'tree'
  return axiosGet(axios, `knowledgebase/docKnowledgeBaseType/getAllByType?type=${sendType}`)
}
