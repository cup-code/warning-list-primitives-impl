import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取控件类型表格数据
export function getShowTypeListFn(params) {
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
  return axiosGet(axios, `gencode/genShowType/list?${pr}`)
}
// 查看控件类型详情
export function getShowTypeDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genShowType/queryById?id=${id}`)
}
// 删除控件类型
export function delShowTypeFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gencode/genShowType/delete?ids=${ids}`)
}
// 提交控件类型表单
export function saveShowTypeFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genShowType/save`, paramsEncoded)
}
