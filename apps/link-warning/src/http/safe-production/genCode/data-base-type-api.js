import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取字段类型表格数据
export function getDataBaseListFn(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.type) {
    pr += `&type=${params.type}`
  }
  return axiosGet(axios, `gencode/genDataBaseType/list?${pr}`)
}
// 查看字段类型详情
export function getDataBaseDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genDataBaseType/queryById?id=${id}`)
}
// 删除字段类型
export function delDataBaseFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gencode/genDataBaseType/delete?ids=${ids}`)
}
// 提交数据库类型表单
export function saveDataBaseFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genDataBaseType/save`, paramsEncoded)
}
