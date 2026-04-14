import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/* 文档编制 */
// 分页查询文档列表
export function docKnowledgeBaseGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `knowledgebase/docKnowledgebase/pageQuery`, params)
}
// 添加文档
export function docKnowledgeBaseAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  return axiosPost(axios, `knowledgebase/docKnowledgebase/add`, formData)
}
// 删除文档
export function docKnowledgeBaseDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `knowledgebase/docKnowledgebase/delete?id=${id}`)
}
// 更新文档
export function docKnowledgeBaseUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  return axiosPost(axios, `knowledgebase/docKnowledgebase/update`, formData)
}
// 按id查询文档
export function docKnowledgeBaseGetById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `knowledgebase/docKnowledgebase/getById?id=${id}`)
}
// 删除文档管理文件
export function docKnowledgeBaseFileDel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `knowledgebase/docKnowledgebase/delFile`, params)
}
// 查询评审人列表
export function docKnowledgeBaseGetReviewAll() {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `knowledgebase/docKnowledgebase/getReviewPerAll`)
}
