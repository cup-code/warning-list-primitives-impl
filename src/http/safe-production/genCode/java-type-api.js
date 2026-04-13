import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取java类型表格数据
export function getJavaTypeListFn(params) {
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
  return axiosGet(axios, `gen/genCustomObj/list?${pr}`)
}
// 查看java类型详情
export function getJavaTypeDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genCustomObj/queryById?id=${id}`)
}
// 删除java类型
export function delJavaTypeFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gen/genCustomObj/deleteAll?ids=${ids}`)
}
// 提交java类型表单
export function saveJavaTypeFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genCustomObj/save`, paramsEncoded)
}
