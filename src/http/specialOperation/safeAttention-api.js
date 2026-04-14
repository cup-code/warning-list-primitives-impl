import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 查询
export function getAttentionByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `sd/attention/page${reqStr}`)
}
// 删除
export function attentionDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `sd/attention/delete/${id}`)
}
//   修改新增
export function addAttention(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sd/attention/save`, params)
}
