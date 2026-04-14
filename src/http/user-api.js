import {
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from './common/utils'

// 新的登录接口
export function login(name, pw) {
  // 添加自定义header和baseurl
  const axios = createAxiosFromStore()
  const loginTime = new Date().getTime()
  // 请求的接口
  return axiosGet(
    axios,
    `sys/login/platform?username=${encodeURIComponent(name)}&password=${encodeURIComponent(
      pw,
    )}&loginTime=${loginTime}`,
  )
}
// 从oa平台直接到登录页面，获取oa平台的信息直接登录
export function loginByOa(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `sys/login/externalPlatform/${params.tenantCode}?userToken=${params.userToken}`,
  )
}
// 登出接口
export function logout() {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `sys/login/platform/logout`)
}

// 查询菜单接口
export function getAllList() {
  // 添加自定义header和baseurl
  const axios = createAxiosFromStore()
  // 请求的接口
  return axiosGet(axios, '/permission/getAllList')
}

// 注册接口
export function register(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `users/registered?mobile=${params.mobile}&password=${params.password}&verificationCode=${params.verificationCode}`,
  )
}
// 发送注册短信验证码
export function registerCode(mobile, username) {
  const axios = createAxiosFromStore()
  if (!username) {
    return axiosPost(axios, `users/registeredSmSCode?mobile=${mobile}`)
  }
  else {
    return axiosPost(axios, `users/resetPassword/sendSmSCode?username=${username}&mobile=${mobile}`)
  }
}
// 重置密码接口
export function resetPassword(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `users/resetPassword?username=${params.username}&mobile=${params.mobile}&newPassword=${params.password}&verificationCode=${params.verificationCode}`,
  )
}

// 保存常用功能菜单
export function saveTenantCommonMenu(idList) {
  const axios = createAxiosFromStore()
  // ?commonMenuIdList=${commonList}`
  return axiosPost(axios, `sysTenantMenu/saveTenantCommonMenu`, {
    commonMenuIdList: idList,
  })
}

// 查询租户具有权限的常用功能菜单
export function getTenantUserPermissionMenu() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'sysTenantMenu/getTenantUserPermissionMenu')
}

// 查询首页消息通知列表
export function getHomeMessage() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'system/message/getHomeMessage')
}

// 修改消息状态 0:未读 1:已读 2:已删除
export function updateMessageState(params) {
  const axios = createAxiosFromStore()
  // 这里传id和state，state为想要修改成的目标状态
  return axiosPost(axios, `system/message/updateMessageState`, params)
}

// 查询当前登录用户的公司及其子公司
export function getSubordinateCompany() {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, 'sysCompany/getSubordinateCompany')
}

// 根据部门id获取用户列表 -- 冯祖杨
export function fzyGetUserByDepId(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `sysUser/getByDeptId/${id}`)
}

export function getUserByDeptIdAndStatus(params) {
  const axios = createFormUrlencodedAxios()
  const pr = `deptId=${
    params.deptId
  }&userStatusList=${params.userStatusList.toString()}&penetrate=true`
  return axiosGet(axios, `sysUser/getByDeptIdAndStatus?${pr}`)
}

// 删除文件 -- 冯祖杨 params = {id:'', entityId:''}
export function commonFileDel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `commonFile/delFile`, params)
}

// 查询文件集 -- 冯祖杨
export function commonFileGetByEntityId(entityId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `commonFile/getByEntityId?entityId=${entityId}`)
}

// 待办列表
export function getMyTask(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `myTask/todo${reqStr}`)
}

export function getUserQrCode(username) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getQrcodeByUserName/${username}`)
}
