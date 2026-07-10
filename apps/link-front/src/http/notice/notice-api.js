import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 根据条件分页获取报警纪录
export function getAlertRecordList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 设备编码
  if (params.deviceCode) {
    pr += `&deviceCode=${params.deviceCode}`
  }
  // 设备名称
  if (params.deviceName) {
    pr += `&deviceName=${params.deviceName}`
  }
  // 测点编码
  if (params.ioCode) {
    pr += `&ioCode=${params.ioCode}`
  }
  // 测点名称
  if (params.ioName) {
    pr += `&ioName=${params.ioName}`
  }
  // 报警来源
  if (params.source) {
    pr += `&source=${params.source}`
  }
  // 报警触发后动作已处理
  if (params.actionExecuted || (!params.actionExecuted && params.actionExecuted === 0)) {
    pr += `&actionExecuted=${!!params.actionExecuted}`
  }
  // 开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  // 结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  // 报警规则名称
  if (params.ruleName) {
    pr += `&ruleName=${params.ruleName}`
  }
  // 监测分类
  if (params.monitorCategory) {
    pr += `&monitorCategory=${params.monitorCategory}`
  }
  // 审核状态
  if (params.isClear || params.isClear === 0) {
    pr += `&isClear=${params.isClear}`
  }
  // 审核结果
  if (params.realAlarm || params.realAlarm === false) {
    pr += `&realAlarm=${params.realAlarm}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 所属部门
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  return axiosGet(axios, `alert/record/list?${pr}`)
}
// 解除报警
export function clearAlert(params) {
  // id: 是报警记录id
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/record/clear/${params.id}?clearReason=${params.clearReason}`)
}
// 报警数量统计,首页使用
export function getAlertStatistics() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/record/statistics`)
}

// 根据条件分页获取联系人信息
export function getAlertContactList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 联系人名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  return axiosGet(axios, `alert/contacts/list?${pr}`)
}
// 新增联系人
export function addAlertContact(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/contacts`, params)
}
// 修改联系人
export function editAlertContact(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/contacts?contactsId=${params.id}`, params)
}
// 删除联系人
export function deleteAlertContact(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `alert/contacts/${id}`)
}
// 设置默认联系人
export function setDefaultContact(id) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/contacts/setDefault?contactsId=${id}`)
}
// 查询指定联系方式的联系人
export function findUsersByContact(type) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/contacts/getContactsByType?contactType=${type}`)
}
// 获取本次要绑定微信公众号的二维码url
export function getQrcodeUrl() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/contacts/mpBindUrl`)
}
// 查询二维码扫码信息
export function getQrcodeBindInfo(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/contacts/mpQrcodeBindInfo?qrcodeId=${id}`)
}

// 分页条件查询定时任务
export function getScheduleList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 任务名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 任务类型
  if (params.jobType) {
    pr += `&jobType=${params.jobType}`
  }
  // 任务开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  // 任务结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }

  return axiosGet(axios, `schedule/list?${pr}`)
}
// 新增定时任务
export function addSchedule(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `schedule`, params)
}
// 修改定时任务
export function editSchedule(params) {
  const axios = createAxiosFromStore()
  return axiosPut(
    axios,
    `schedule?scheduleId=${params.scheduledId}&scheduleConfigurationId=${params.scheduleConfigurationId}`,
    params,
  )
}
// 删除定时任务
export function deleteSchedule(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `schedule/${id}`)
}
// 停用/启用定时任务
export function changeScheduleState(id, state) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `schedule/changeState?scheduleId=${id}&state=${state}`)
}
// 分页条件查询定时任务执行结果
export function getScheduleResList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 任务名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 任务类型
  if (params.jobType) {
    pr += `&jobType=${params.jobType}`
  }
  // 任务开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  // 任务结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  // 是否执行成功
  if (params.state || params.state === 0) {
    pr += `&state=${params.state}`
  }

  return axiosGet(axios, `schedule/executionRecords?${pr}`)
}
// 报警记录审核
export function alertRecordExamine(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/record/examine`, params)
}
