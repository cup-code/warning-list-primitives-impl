import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPostFile,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from './common/utils'

// 编辑租户
export function editTenant(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysCompany/updateEnterpriseInfo`, params)
}

// 申请租户
export function applyTenant(params) {
  const axios = createFormDataAxios() // formData格式
  let pr = '?'
  // 租户英文简称
  if (params.token) {
    pr += `&token=${params.token}`
  }
  // 租户公司名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 公司代码
  if (params.socialCreditCode) {
    pr += `&socialCreditCode=${params.socialCreditCode}`
  }
  // 管理员账号
  if (params.admin) {
    pr += `&admin=${params.admin}`
  }
  // 管理员登录密码
  if (params.adminPassword) {
    pr += `&adminPassword=${params.adminPassword}`
  }
  // 联系人姓名
  if (params.contactName) {
    pr += `&contactName=${params.contactName}`
  }
  // 联系人手机号码
  if (params.contactPhone) {
    pr += `&contactPhone=${params.contactPhone}`
  }
  // 接收短信验证码手机号码
  if (params.verificationPhone) {
    pr += `&verificationPhone=${params.verificationPhone}`
  }
  // 接收到的短信验证码
  if (params.verificationCode) {
    pr += `&verificationCode=${params.verificationCode}`
  }
  pr = pr.replace('?&', '?')

  // 有 租户logo
  if (params.logo) {
    const form = new FormData()
    form.append('logo', params.logo)
    return axiosPost(axios, `tenants/applyTenant${pr}`, form)
  }
  // 没有 租户logo
  else {
    return axiosPost(axios, `tenants/applyTenant${pr}`)
  }
}
// 发送租户申请短信验证码
export function applySmSCode(phone) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `tenants/applySmSCode?verificationPhone=${phone}`)
}
// 条件查询租户申请信息
export function getTenantApplyList(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  // 申请状态
  if (params.applyState) {
    pr += `&applyState=${params.applyState}`
  }
  // 租户编码
  if (params.token) {
    pr += `&token=${params.token}`
  }

  pr = pr.replace('?&', '?')

  return axiosGet(axios, `tenants/applyList${pr}`)
}
// 处理租户申请
export function processTenantApply(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'tenants/processinApply', params)
}

// 获取所管理企业租户信息(租户管理员请求的接口)
export function getMyTenantInfo() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompany/getEnterpriseInfo`)
}

// 查询租户微信小程序配置
export function getWxAppInfo() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `config/wx_applet`)
}
// 保存租户微信小程序配置
export function editWxAppInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'config/wx_applet', params)
}

// 查询租户企业微信配置
export function getWxPubInfo() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `config/wx_qiye`)
}
// 保存租户企业微信配置
export function editWxPubInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'config/wx_qiye', params)
}

// 查询租户微租户邮箱配置
export function getEmailInfo() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `config/email`)
}
// 保存租户邮箱配置
export function editEmailInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'config/email', params)
}

// 查询租户短信配置
export function getSmsProperties() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'config/sms')
}

// 保存租户短信配置
export function saveSmsProperties(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'config/sms', params)
}

// 获取用户数据 多条件
// 编辑用户
export function editUser(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, '/users/update', params)
}
// 启用/禁用用户
export function changeUserState(id, state) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `users/changeState/${id}?state=${state}`)
}
// 用户修改密码
export function editUserPw(params) {
  const axios = createAxiosFromStore()
  const pr = `?oldPassword=${encodeURIComponent(params.oldPass)}&newPassword=${encodeURIComponent(
    params.newPass,
  )}`
  return axiosPost(axios, `sysUser/resetSelfPassword${pr}`)
}
// 用户修改手机号
export function editUserPhone(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  // 用户名
  if (params.username) {
    pr += `&username=${params.username}`
  }
  // 旧密码
  if (params.oldPass) {
    pr += `&oldPass=${params.oldPass}`
  }
  // 手机号
  if (params.mobile) {
    pr += `&mobile=${params.mobile}`
  }
  // 验证码
  if (params.verificationCode) {
    pr += `&verificationCode=${params.verificationCode}`
  }
  pr = pr.replace('?&', '?')

  return axiosPost(axios, `users/modifyMobile${pr}`)
}
// 修改手机号时发送验证码
export function editPhoneCode(mobile) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `users/updateMobile/sendSmSCode?mobile=${mobile}`)
}

// 查询日志类型
export function getLogType() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/logType`)
}
// 查询日志
export function getLog(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  if (params.period || params.period == 0) {
    pr += `&period=${params.period}`
  }
  else {
    if (params.startTm) {
      pr += `&startTm=${params.startTm}`
    }
    if (params.endTm) {
      pr += `&endTm=${params.endTm}`
    }
  }

  // 操作用户
  if (params.operationUser) {
    pr += `&operationUser=${params.operationUser}`
  }
  // 日志类型
  if (params.logType) {
    pr += `&logType=${params.logType}`
  }
  // 排序规则
  if (params.sortType) {
    pr += `&sortType=${params.sortType}`
  }
  // 功能模块名称
  if (params.moduleName) {
    pr += `&moduleName=${params.moduleName}`
  }
  // ip地址
  if (params.ip) {
    pr += `&ip=${params.ip}`
  }
  // 操作类型
  if (params.operationType) {
    pr += `&operationType=${params.operationType}`
  }
  return axiosGet(axios, `sys/log?${pr}`)
}
// 删除日志
export function deleteLog(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `sys/log?period=${id}`)
}

// 查询全局参数
export function getGlobalParameters() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'sys/globalParameters')
}

// 查询当前租户未处理的报警总数
export function getUnhandledAlert() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/record/unHandledAlert`)
}
// 统一的上传图片接口。接收file和type 保留源文件名
export function upLoadImg(file, type, isRetainFileName = true, fileInfo) {
  const axios = createFormDataAxios()
  const form = new FormData()
  form.append('file', file)
  return axiosPostFile(
    axios,
    `sys/uploadFile?fileType=${type}&isRetainFileName=${isRetainFileName}`,
    form,
    fileInfo,
  )
}

// 统一的上传图片接口。接收file和type 不保留源文件名
export function upLoadImgNoOriName(file, type, fileInfo) {
  const axios = createFormDataAxios()
  const form = new FormData()
  form.append('file', file)
  return axiosPostFile(axios, `sys/uploadFile?fileType=${type}`, form, fileInfo)
}

// 保存服务配置地址
export function setServiceConfiguration(type, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `config/${type}`, params)
}
// 获取服务配置地址
export function getServiceConfiguration(type) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `config/${type}`)
}
// 超级管理员保存系统基础参数
export function saveSystemInfoFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sys/saveBaseInfo`, params)
}
// 多文件上传
export function uploadFileList(data) {
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('file', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `commonFile/uploadMulti/V2`, formData)
}
// 根据id查询文件集
export function commonFileGetByEntityIdFn(entityId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `commonFile/getByEntityId?entityId=${entityId}`)
}

// 租户启停列表
export function tenantControlList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/sysTenant/getTenantList`)
}
// 修改租户状态
export function setTenantStatus(param) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/sysTenant/changeState/${param.tenantId}?enable=${param.enable}`)
}

// 租户分配产品
export function distributionProduct(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `/product/tenantAvailable/${params.tenantId}?productIdList=${params.productIdList}`,
  )
}

// 查看租户分配的产品
export function getTenantProduct(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/product/tenantAvailable/${params.tenantId}`)
}
