import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 分页查询公司岗位
export function getPostByCompanyFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.remarks) {
    pr += `&remarks=${params.remarks}`
  }
  return axiosGet(axios, `sysPost/extend/queryByPage${pr}`)
}
// 保存或修改公司岗位
export function savePostFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'sysCompanyPost/save', params)
}
// 保存或修改公司岗位及扩展信息
export function saveExtendFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'sysPost/extend/save', params)
}
// 删除岗位
// export function deletePostFn(companyPostId) {
//   const axios = createAxiosFromStore()
//   return axiosDelete(axios, `sysCompanyPost/delete/${companyPostId}`)
// }
export function deletePostFn(postId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysPost/extend/delete/${postId}`)
}
// 查询指定公司下所有岗位
export function getAllPostByCompanyFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompanyPost/getAll/${companyId}`)
}
// 查询指定部门所属公司下所有岗位
export function getAllPostByDepartFn(departmentId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompanyPost/getAllByDepartmentId/${departmentId}`)
}
// 查询指定部门下的岗位
export function getPostByDepartmentId(departmentId, penetration = false) {
  const axios = createAxiosFromStore()
  // 是否穿透查询
  let pr = ''
  if (penetration) {
    pr = `?penetration=${penetration}`
  }
  return axiosGet(axios, `sysPost/extend/getPostByDepartmentId/${departmentId}${pr}`)
}

// 查询指定岗位id的用户
export function getUsersByPostFn(postId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getUsersByPostId/${postId}`)
}

// 查询指定岗位的扩展信息
export function getExtendJobInfo(postId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysPost/extend/getById/${postId}`)
}
