import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
  get,
  post,
} from '@/http/common/utils'

// 条件分页查询用户
export function getUserList(params) {
  const param = JSON.parse(JSON.stringify(params))
  if (!param.withoutChildrenDepartment) {
    param.withoutChildrenDepartment = false
  }
  if (param.userStatusList) {
    param.userStatusList = param.userStatusList.toString()
  }
  return get(`sysUser/list`, param)
}
// 条件分页查询用户(多用户)
export function getUserLists(params) {
  console.log('*** params: ', params)
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentIdList) {
    pr += `&departmentIdList=${params.departmentIdList}`
  }
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  if (params.userType) {
    pr += `&userType=${params.userType}`
  }
  if (params.userStatusList) {
    pr += `&userStatusList=${params.userStatusList.toString()}`
  }
  return axiosGet(axios, `sysUser/extend/pageQueryByDepartIds?${pr}`)
}
// 新增或修改用户
export function addUser(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysUser/saveUser`, params)
}

// 保存指定用户的扩展信息
export function saveExtendUserInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysUser/extend/save`, params)
}

// 查询指定用户的扩展信息
export function getExtendUserInfo(userId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/extend/getById/${userId}`)
}

// 删除用户
export function deleteUser(userId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sysUser/extend/delete/${userId}`)
}
// 查询当前登录用户公司下的角色
export function getAllRolesFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysRole/getByCompany?companyId=${companyId}`)
}
// 查询用户所拥有的角色
export function getRolesByUserFn(userId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getRolesByUserId/${userId}`)
}
// 重置用户密码
export function resetPasswordFn(password, username) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `sysUser/resetPassword?newPassword=${encodeURIComponent(
      password,
    )}&username=${encodeURIComponent(username)}`,
  )
}
// 查询指定部门所在公司下的所有用户,仅返回id/username/fullname
export function getUsersByDepartIdFn(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/underCompanyByDeptId/${deptId}`)
}
// 按当前登录用户的角色查询其部门权限下用户,按[父部门]-[子部门]-[用户]层级返回
export function getUsersByRoleFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getUsersByCurrentRole`)
}
// 查询所有的企业微信用户
export function getAllQywxUserFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/allQywxUser`)
}
// 获取所有的开屏页list
export function getScreenListFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysTenantMenu/getTenantMenu?companyId=${companyId}`)
}
// 修改用户状态
export function getChangeAccount(userId, state) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysUser/changeState/${userId}/${state}`)
}

// 查询指定公司/部门/岗位下的oa用户
export function getOaUserList(params) {
  const axios = createFormUrlencodedAxios()
  let pr = ``
  if (params.companyId) {
    pr += `companyId=${params.companyId}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.postId) {
    pr += `&postId=${params.postId}`
  }
  return axiosGet(axios, `oaData/getUser?${pr}`)
}
// 按当前登录用户所属部门和其角色部门数据权限查询部门下的用户
export function getUserListByRoleFn(params) {
  const param = JSON.parse(JSON.stringify(params))
  if (param.userStatusList) {
    param.userStatusList = param.userStatusList.toString()
  }
  return get(`sysUser/getUsersByMyDepartAndRole`, param)
}
// 分页查询指定公司下的所有用户,默认查询当前登录人公司且不穿透
export function getCompanyUserListByPageFn(params) {
  const param = JSON.parse(JSON.stringify(params))
  if (param.userStatusList) {
    param.userStatusList = param.userStatusList.toString()
  }
  return get(`sysUser/extend/pageQueryByCompanyId`, param)
}
// 查询当前登录用户的单位类型，1：集团级，2：分子公司安环部，3：分子公司非安环部
export function getUserTypeFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/extend/myUnitType`)
}
// 根据承包商Id查询其主管部门信息
export function getContractorInfoFn(id) {
  return get(`contractor/getCompetentDepartmentInfo/${id}`)
}
// 使用平台公司id,查询指定公司下的部门
export function getOaDepListByCompanyFn(companyId) {
  return get(`oaData/getDepartmentBySysCompanyId/${companyId}`)
}
// 查询指定公司/部门的用户
export function getOaUserListByDepFn(param) {
  return get(`oaData/getUser`, param)
}
// 查询所有可见的企业微信部门
export function getQywxDepListFn() {
  return get(`qywx/extend/getDepartmentList`)
}
// 查询指定企业微信部门下的企业微信用户
export function getQywxUserListDepFn(param) {
  return get(`sysUser/getQywxUsersByDepartId`, param)
}
// 一人一档：保存用户详细信息
export function saveUserDetailFn(param) {
  return post(`sysUser/extend/save/detail`, param)
}
// 一人一档：查询用户详细信息
export function getUserDetailFn(userId) {
  return get(`sysUser/extend/detailById/${userId}`)
}
// 一人一档：查询用户培训记录
export function getUserTrainRecordFn(param) {
  return get(`aqEduStuCenter/queryOnlineTrainExam`, param)
}
// 分页查询公司下的oa用户信息变更的记录
export function getUserUpdateListFn(param) {
  return get(`syncUser/queryByPage`, param)
}
// 同步用户信息
export function updateUserInfoFn(id) {
  return post(`syncUser/update/${id}`)
}
// 批量同步指定部门下用户信息
export function updateAllUserInfoFn(departmentId) {
  return post(`syncUser/batchUpdate/${departmentId}`)
}
