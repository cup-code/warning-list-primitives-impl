import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取验证类型表格数据
export function getValidateTypeListFn(params) {
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
  return axiosGet(axios, `gencode/genValidateType/list?${pr}`)
}
// 查看验证类型详情
export function getValidateTypeDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genValidateType/queryById?id=${id}`)
}
// 删除验证类型
export function delValidateTypeFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gencode/genValidateType/delete?ids=${ids}`)
}
// 提交验证类型表单
export function saveValidateTypeFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genValidateType/save`, paramsEncoded)
}
