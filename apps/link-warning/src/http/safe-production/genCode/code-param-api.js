import qs from 'qs'
import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 获取生成参数数据
export function getCodeParamFn(params) {
  const axios = createAxiosFromStore()
  const pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  return axiosGet(axios, `gencode/genCodeParam/list?${pr}`)
}
// 查看生成参数详情
export function getCodeParamDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gencode/genCodeParam/queryById?id=${id}`)
}
// 提交生成参数表单
export function saveCodeParamFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gencode/genCodeParam/save`, paramsEncoded)
}
