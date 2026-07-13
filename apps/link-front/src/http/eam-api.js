import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from './common/utils'

// 保存资产
export function addAsset(params) {
  const axios = createFormDataAxios() // formData格式
  let pr = '?'
  // 资产编号
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 资产名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产类别id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  // 规格型号
  if (params.standard) {
    pr += `&standard=${params.standard}`
  }
  // 地点
  if (params.place) {
    pr += `&place=${params.place}`
  }
  // 厂商
  if (params.manufacturer) {
    pr += `&manufacturer=${params.manufacturer}`
  }
  // 厂商联系人
  if (params.manufacturerContacts) {
    pr += `&manufacturerContacts=${params.manufacturerContacts}`
  }
  // 厂商联系号码
  if (params.manufacturer) {
    pr += `&manufacturerPhone=${params.manufacturerPhone}`
  }
  // 启用日期
  if (params.startDateTime) {
    pr += `&startDateTime=${params.startDateTime}`
  }
  // 使用年限
  if (params.serviceLife) {
    pr += `&serviceLife=${params.serviceLife}`
  }
  // 备注
  if (params.remarks) {
    pr += `&remarks=${params.remarks}`
  }
  // 责任人部门id
  if (params.responsibleDepartId) {
    pr += `&responsibleDepartId=${params.responsibleDepartId}`
  }
  // 责任人用户id
  if (params.responsibleUsrId) {
    pr += `&responsibleUsrId=${params.responsibleUsrId}`
  }
  // 责任人用户名
  if (params.responsibleUserName) {
    pr += `&responsibleUserName=${params.responsibleUserName}`
  }

  pr = pr.replace('?&', '?')

  // 有 资产图片
  if (params.icons && params.icons.length != 0) {
    const form = new FormData()
    params.icons.forEach((item) => {
      form.append('icons', item.raw)
    })
    return axiosPost(axios, `assets${pr}`, form)
  }
  // 没有 资产图片
  else {
    return axiosPost(axios, `assets${pr}`)
  }
}
// 修改资产
export function editAsset(params) {
  const axios = createFormDataAxios() // formData格式
  let pr = '?'
  // 资产id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 资产编号
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 资产名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产类别id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  // 规格型号
  if (params.standard) {
    pr += `&standard=${params.standard}`
  }
  // 地点
  if (params.place) {
    pr += `&place=${params.place}`
  }
  // 厂商
  if (params.manufacturer) {
    pr += `&manufacturer=${params.manufacturer}`
  }
  // 厂商联系人
  if (params.manufacturerContacts) {
    pr += `&manufacturerContacts=${params.manufacturerContacts}`
  }
  // 厂商联系号码
  if (params.manufacturer) {
    pr += `&manufacturerPhone=${params.manufacturerPhone}`
  }
  // 启用日期
  if (params.startDateTime) {
    pr += `&startDateTime=${params.startDateTime}`
  }
  // 使用年限
  if (params.serviceLife) {
    pr += `&serviceLife=${params.serviceLife}`
  }
  // 备注
  if (params.remarks) {
    pr += `&remarks=${params.remarks}`
  }
  // 责任人部门id
  if (params.responsibleDepartId) {
    pr += `&responsibleDepartId=${params.responsibleDepartId}`
  }
  // 责任人用户id
  if (params.responsibleUsrId) {
    pr += `&responsibleUsrId=${params.responsibleUsrId}`
  }
  // 责任人用户名
  if (params.responsibleUserName) {
    pr += `&responsibleUserName=${params.responsibleUserName}`
  }
  // 图片列表
  if (params.icons) {
    pr += `&iconList=${params.icons}`
  }

  pr = pr.replace('?&', '?')

  return axiosPut(axios, `assets${pr}`)
}
// 删除资产
export function deleteAsset(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `assets/${id}`)
}
// 查询租户下所有资产
export function getAllAsset() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'assets/all')
}
// 根据条件分页获取资产
export function getAssetList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 资产名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 规格型号
  if (params.standard) {
    pr += `&standard=${params.standard}`
  }
  // 厂商
  if (params.manufacturer) {
    pr += `&manufacturer=${params.manufacturer}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }

  return axiosGet(axios, `assets/list?${pr}`)
}
// 统计 指定时间段 所有资产 报修/巡检/保养的数量
export function getAllAssetStatistics(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `assets/statistics/maintenanceType?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 保存资产类型的电子文档,每次最多5个
export function addAssetDoc(params) {
  const axios = createFormDataAxios() // formData格式

  const form = new FormData()
  params.files.forEach((item) => {
    form.append('files', item)
  })
  return axiosPost(axios, `assets/doc/${params.id}`, form)
}
// 查询资产类型的电子文档
export function getAssetDoc(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assets/doc/${id}`)
}
// 资产绑定设备
export function saveDeviceToAsset(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `assets/bindingDevices`, params)
}
// 查询资产绑定的设备
export function getDeviceByAsset(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assets/queryBoundDevices/${id}`)
}
// 修改资产时上传资产图片
export function editAssetUpPic(id, icons) {
  if (!icons || icons.length === 0)
    return

  const axios = createFormDataAxios() // formData格式
  if (icons && icons.length !== 0) {
    const form = new FormData()
    icons.forEach((item) => {
      form.append('file', item.raw)
    })
    return axiosPost(axios, `assets/pic/${id}`, form)
  }
}
// 导出资产
export function exportAssets(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 资产名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 规格型号
  if (params.standard) {
    pr += `&standard=${params.standard}`
  }
  // 厂商
  if (params.manufacturer) {
    pr += `&manufacturer=${params.manufacturer}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `assets/export?${pr}`)
}

// 保存资产类型
export function addAssetType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'assetDeviceType/save', params)
}
// 修改资产类型
export function editAssetType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'assetDeviceType/save', params)
}
// 删除资产类型
export function deleteAssetType(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `assetDeviceType/delete/${id}`)
}
// 查询租户下所有资产类型
export function getAllAssetType() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDeviceType/getAll`)
}
// 根据条件分页获取资产类型
export function getAssetTypeList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 资产类型名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产类型编码
  if (params.code) {
    pr += `&code=${params.code}`
  }

  return axiosGet(axios, `assetsType/list?${pr}`)
}
// 保存资产类型的电子文档,每次最多5个
export function addAssetTypeDoc(params) {
  const axios = createFormDataAxios() // formData格式

  const form = new FormData()
  params.files.forEach((item) => {
    form.append('files', item)
  })
  return axiosPost(axios, `assetsType/doc/${params.id}`, form)
}
// 查询资产类型的电子文档
export function getAssetTypeDoc(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetsType/doc/${id}`)
}

// 保存故障类型
export function addFaultType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'faultType', params)
}
// 修改故障类型
export function editFaultType(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `faultType?faultTypeId=${params.id}`, params)
}
// 删除故障类型
export function deleteFaultType(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `faultType/${id}`)
}
// 查询租户下所有故障类型
export function getAllFaultType() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'faultType/all')
}
// 根据条件分页获取故障类型
export function getFaultTypeList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 故障类型名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 故障类型编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }

  return axiosGet(axios, `faultType/list?${pr}`)
}

// 保存故障知识库信息
export function addFaultKnowledge(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'faultKnowledgBase', params)
}
// 修改故障知识库信息
export function editFaultKnowledge(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `faultKnowledgBase?knowledgeBaseId=${params.id}`, params)
}
// 删除故障知识库信息
export function deleteFaultKnowledge(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `faultKnowledgBase/${id}`)
}
// 根据条件分页获取故障知识库信息
export function getFaultKnowledgeList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 故障类型id
  if (params.faultTypeId) {
    pr += `&faultTypeId=${params.faultTypeId}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }

  return axiosGet(axios, `faultKnowledgBase/list?${pr}`)
}
// 根据条件导出故障知识库信息
export function exportFaultKnowledge(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 故障类型id
  if (params.faultTypeId) {
    pr += `&faultTypeId=${params.faultTypeId}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `faultKnowledgBase/export?${pr}`)
}

// 添加维修工单
export function addRepair(params) {
  const axios = createFormDataAxios() // formData格式
  let pr = '?'
  // 资产id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 资产名称
  if (params.assetsName) {
    pr += `&assetsName=${params.assetsName}`
  }
  // 优先级
  if (params.priorityLevel) {
    pr += `&priorityLevel=${params.priorityLevel}`
  }
  // 地点
  if (params.place) {
    pr += `&place=${params.place}`
  }
  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 维修内容
  if (params.repairContent) {
    pr += `&repairContent=${params.repairContent}`
  }
  // 问题原因
  if (params.reason) {
    pr += `&reason=${params.reason}`
  }

  // *** 老版本： 上传图片没有单独分离出去, 就在这个接口里面（由于uniApp无法实现上传多张图片， 所以把上传图片单独分离出去了。）
  // pr = pr.replace('?&', '?');
  // //有 维修图片
  // if(params.pictures && params.pictures.length != 0) {
  //     let form = new FormData();
  //     params.pictures.forEach(item => {
  //         form.append('pictures', item.raw);
  //     })
  //     return axiosPost(axios, `repair${pr}`, form)
  // }
  // // 没有 维修图片
  // else {
  //     return axiosPost(axios, `repair${pr}`)
  // }

  // *** 新版本：  上传图片接口分离出去了， 这里的pictures是上传图片接口返回的相对地址的集合
  // 图片
  if (params.pictures && params.pictures.length != 0) {
    pr += `&pictureList=${params.pictures}`
  }
  pr = pr.replace('?&', '?')
  return axiosPost(axios, `repair${pr}`)
}
// 修改维修工单
export function editRepair(params) {
  const axios = createFormDataAxios() // formData格式
  let pr = '?'

  // 资产id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 资产名称
  if (params.assetsName) {
    pr += `&assetsName=${params.assetsName}`
  }
  // 优先级
  if (params.priorityLevel) {
    pr += `&priorityLevel=${params.priorityLevel}`
  }
  // 地点
  if (params.place) {
    pr += `&place=${params.place}`
  }
  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 维修内容
  if (params.repairContent) {
    pr += `&repairContent=${params.repairContent}`
  }
  // 问题原因
  if (params.reason) {
    pr += `&reason=${params.reason}`
  }

  pr = pr.replace('?&', '?')

  return axiosPost(axios, `repair/${params.id}${pr}`)
}
// 删除维修工单
export function deleteRepair(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `repair/${id}`)
}
// 根据条件分页获取维修工单
export function getRepairList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 资产类型id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 优先级
  if (params.priorityLevel) {
    pr += `&priorityLevel=${params.priorityLevel}`
  }
  // 维修纪录状态
  if (params.state) {
    pr += `&state=${params.state}`
  }

  return axiosGet(axios, `repair/list?${pr}`)
}
// 修改维修工单状态: 确认 和 驳回
export function editRepairState(params) {
  const axios = createAxiosFromStore()

  // confirmed: true是确认工单、false是驳回工单
  let pr = `?confirmed=${params.confirmed}`

  // 驳回原因
  if (params.rejectReason) {
    pr += `&rejectReason=${params.rejectReason}`
  }

  return axiosPost(axios, `repair/confirmed/${params.id}${pr}`)
}
// 指派维修工单
export function assignRepair(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `repair/assign/${params.id}?isSendSms=${params.isSendSms}&headman=${params.headman}${params.teamStr}`,
  )
}
// 撤销维修工单
export function cancelRepair(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `repair/cancel/${id}`)
}
// 维修工单导出
export function exportRepairRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 问题描述
  if (params.trouble) {
    pr += `&trouble=${params.trouble}`
  }
  // 资产类型id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 优先级
  if (params.priorityLevel) {
    pr += `&priorityLevel=${params.priorityLevel}`
  }
  // 维修纪录状态
  if (params.state) {
    pr += `&state=${params.state}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `repair/exportRepairRecord?${pr}`)
}

// 统计 指定时间段按 资产的报修数量
export function getRepairByAssets(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `repair/statistics/repairByAssets?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 统计 指定时间段按 资产分类的报修数量
export function getRepairByAssetsType(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `repair/statistics/repairByAssetsType?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 维修工单完工率
export function getRepairCompletionRate(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `repair/statistics/repairCompletionRate?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 上传故障照片,返回图片地址集合,依次为相对路径,绝对路径
export function addRepairPhoto(file) {
  const axios = createFormDataAxios() // formData格式
  const form = new FormData()
  form.append('file', file)
  return axiosPost(axios, 'repair/photo', form)
}

// 保存维保项目
export function addMainItem(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'maintenance/item', params)
}
// 修改维保项目
export function editMainItem(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `maintenance/item?itemId=${params.id}`, params)
}
// 删除维保项目
export function deleteMainItem(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `maintenance/item/${id}`)
}
// 根据条件分页获取维保项目
export function getMainItemList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型(保养：MAINTENANCE，巡检：INSPECTION), 必填
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  // 项目要求内容
  if (params.itemContent) {
    pr += `&itemContent=${params.itemContent}`
  }

  return axiosGet(axios, `maintenance/item/list?${pr}`)
}
// 查询 指定资产类型的 维保项目
export function getMainItemsByType(type, assetTypeId) {
  const axios = createAxiosFromStore()
  // type:   保养：MAINTENANCE，巡检：INSPECTION
  return axiosGet(axios, `maintenance/getItemByType/${assetTypeId}?maintenanceType=${type}`)
}
// 导出维保项目
export function exportMainItems(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 项目要求内容
  if (params.itemContent) {
    pr += `&itemContent=${params.itemContent}`
  }
  // 资产类型id
  if (params.assetsTypeId) {
    pr += `&assetsTypeId=${params.assetsTypeId}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `maintenance/export?${pr}`)
}

// 查询维保计划执行纪录
export function getPlanExecuteRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型(保养：MAINTENANCE，巡检：INSPECTION), 必填
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 计划执行者用户id
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  // 计划名称
  if (params.name) {
    pr += `&name=${params.name}`
  }

  return axiosGet(axios, `maintenance/plan/getPlanExecuteRecord?${pr}`)
}
// 查询 指定的 执行记录下 的 所有执行项情况
export function getPlanItemExecuteRecord(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `maintenance/plan/getPlanItemExecuteRecord?recordId=${id}`)
}
// 查询 当前租户下 所有维保用户
export function getExecuteUsers(code) {
  const axios = createAxiosFromStore()
  // code:  ROLE_MAINTENANCE(保养角色)、 ROLE_INSPECTION(巡检角色)、 ROLE_REPAIR(维修角色)
  return axiosGet(axios, `maintenance/plan/getUsersByRole?roleCode=${code}`)
}
// 导出维保计划执行记录
export function exportPlanExecuteRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 计划名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 计划执行者用户id
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `maintenance/plan/exportPlanExcuteRecord?${pr}`)
}

// 保存 维保计划 基本信息
export function addMaintenancePlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'maintenance/plan', params)
}
// 修改 维保计划 基本信息
export function editMaintenancePlan(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `maintenance/plan?planId=${params.id}`, params)
}
// 删除 维保计划
export function deleteMaintenancePlan(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `maintenance/plan/${id}`)
}
// 根据条件分页获取 维保计划
export function getMaintenancePlanList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型(保养：MAINTENANCE，巡检：INSPECTION), 必填
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 资产id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  // 计划名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 计划状态
  if (params.state) {
    pr += `&state=${params.state}`
  }

  return axiosGet(axios, `maintenance/plan/list?${pr}`)
}
// 查询 指定计划下 所有资产和其选择的维保项目
export function getPlanAssetsAndItems(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `maintenance/plan/getAssetAndItemByPlanId/${id}`)
}
// 保存 计划下资产的 维保项目
export function addPlanAssetItems(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'maintenance/plan/item', params)
}
// 导出维保计划
export function exportMainPlan(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 维保类型
  if (params.maintenanceType) {
    pr += `&maintenanceType=${params.maintenanceType}`
  }
  // 计划名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 资产id
  if (params.assetsId) {
    pr += `&assetsId=${params.assetsId}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `maintenance/plan/export?${pr}`)
}
