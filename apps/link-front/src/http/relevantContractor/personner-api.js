import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询
export function getPersonnelByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/staff/pageQuery`, params)
}
// 新增
export function contractorPersonSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/staff/addOrUpdate`, params)
}
// 删除
export function personnerDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `contractor/staff/delete/${id}`)
}
// id查询信息
export function getPersonnerById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/staff/get/${id}`)
}
// 根据部门id查人员
export function selectPersonByDepId(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/staff/list/${params}`)
}
