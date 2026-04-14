import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/** 值班小组 */
// 分页查询
export function getTeamByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dutyTeam/queryByPage${reqStr}`)
}
// 删除
export function dutyTeamDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `dutyTeam/delete/${id}`)
}
// 新增
export function addDutyTeam(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `dutyTeam/save`, params)
}
// 查询所有小组
export function getAllTeam() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dutyPlan/getAll`)
}
