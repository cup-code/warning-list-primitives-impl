import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/** 值班安排 */
// 分页查询
export function getArrangeByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dutyPlan/queryByPage${reqStr}`)
}
// 查询所有小组
export function getAllDutyPlayByPage() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dutyTeam/getAll`)
}
// 保存
export function addDutyPlay(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dutyPlan/save`, params)
}
// 删除
export function delDutyPlay(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `dutyPlan/delete/${id}`)
}
