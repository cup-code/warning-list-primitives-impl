import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 分页查询
export function getContractorByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/pageQuery`, params)
}
// 新增修改
export function addContractor(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/addOrUpdate`, params)
}
// 删除
export function ContractorDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `contractor/delete/${id}`)
}
// id查询信息
export function getContractorById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/get/${id}`)
}
