import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取模板列表
export function getTemplateListFn(params) {
  const axios = createAxiosFromStore()
  const pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  return axiosGet(axios, `gencode/genCodeTemplateGroup/list?${pr}`)
}
// 通过id获取模板内容
export function getTemplateContentFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genCodeTemplateGroup/queryById?id=${id}`)
}
// 提交模板表单
export function saveTemplateFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genCodeTemplateGroup/save`, paramsEncoded)
}
// 复制模板
export function copyTemplateFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genCodeTemplateGroup/copy?id=${id}`)
}
// 删除模板
export function delTemplateFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gencode/genCodeTemplateGroup/delete?id=${id}`)
}
