import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取查询类型表格数据
export function getQueryTypeListFn(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.label) {
    pr += `&label=${params.label}`
  }
  if (params.value) {
    pr += `&value=${params.value}`
  }
  return axiosGet(axios, `gencode/genQueryType/list?${pr}`)
}
// 查看查询类型详情
export function getQueryTypeDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genQueryType/queryById?id=${id}`)
}
// 删除查询类型
export function delQueryTypeFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gencode/genQueryType/delete?ids=${ids}`)
}
// 提交查询类型表单
export function saveQueryTypeFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genQueryType/save`, paramsEncoded)
}
