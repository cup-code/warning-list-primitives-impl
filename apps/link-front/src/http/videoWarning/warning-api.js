import qs from 'qs'
import {
  axiosParams,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '../common/utils'

function getFilenameFromContentDisposition(contentDisposition) {
  if (!contentDisposition)
    return ''

  // filename*=UTF-8''xxx.xlsx 或 filename=xxx.xlsx
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i)
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1].trim().replace(/^"|"$/g, ''))
    }
    catch (e) {
      return match[1].trim().replace(/^"|"$/g, '')
    }
  }

  return ''
}

// 让导出接口能 await 到“触发下载”之后（解决 link-sdk downloadFile 不返回 Promise 的时序问题）
async function downloadFileAsPromise({
  url,
  method = 'get',
  data,
  name,
}) {
  const axios = createAxiosFromStore()
  const response = await axios.request({
    url,
    method,
    data,
    responseType: 'blob',
  })

  let filename = name
  if (!filename) {
    const disposition = response?.headers?.['content-disposition']
      || response?.headers?.['Content-Disposition']
    filename = getFilenameFromContentDisposition(disposition)
  }

  if (!filename)
    filename = '导出.xlsx'
  if (!filename.includes('.'))
    filename = `${filename}.xlsx`

  const fileDownload = require('js-file-download')
  fileDownload(response.data, filename)

  return filename
}
// 预警识别类型
export function getWarningTypeList() {
  return axiosParams('get', `/videoCamera/getAiSkills`)
}

// 所有租户预警类型
export function getWarningTypeListAllTenant() {
  return axiosParams('get', `/videoCamera/queryAllTenantAiSkills`)
}

// 添加摄像头
export function addCamera(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoCamera/saveOrUpdateCamera`, params)
}

// 删除摄像头
export function deleteCamera(params) {
  return axiosParams('post', `videoCamera/deleteCamera`, params)
}

// 批量删除摄像头
export function batchDeleteCamera(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoCamera/deleteCameraBatch`, params)
}

// 摄像头列表
export function cameraList(params) {
  return axiosParams('get', `videoCamera/pageQueryCamera`, params)
}

// 摄像头列表导出
export function exportCameraList(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoCamera/exportCamera?${paramsStr}`
  return downloadFileAsPromise({ url: connectUrl, method: 'get', name: '摄像头列表.xlsx' })
}

// 摄像头-模板下载
export function downloadCameraTemplate() {
  return downloadFileAsPromise({
    url: 'videoCamera/getCameraTemplate',
    method: 'post',
    name: '摄像头导入模板.xlsx',
  })
}

// 摄像头-excel导入
export function importCameraList(file) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  formData.append('file', file)
  return axiosPost(axios, `videoCamera/importCamera`, formData)
}

// 客户视频报警信息列表
export function clientWarningList(params) {
  return axiosParams('get', `videoAlarm/pageQueryAlarmCustomer`, params)
}

// 客户视频预警审核
export function clientWarningAudit(params) {
  return axiosParams('post', `videoAlarm/auditAlarmCustomer`, params)
}

// 运维视频预警审核
export function maintenanceWarningAudit(params) {
  return axiosParams('post', `videoAlarm/auditAlarmInternal`, params)
}

// 运维预警信息列表
export function maintenanceWarningList(params) {
  return axiosParams('get', `videoAlarm/pageQueryAlarmInternal`, params)
}

// 一体机列表
export function machineList(params) {
  return axiosParams('get', `videoMachine/query`, params)
}

// 新增/修改一体机
export function addMachine(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoMachine/saveOrUpdate`, params)
}

// 删除一体机
export function deleteMachine(params) {
  return axiosParams('post', `videoMachine/delete`, params)
}

// 所有租户一体机列表
export function allMachineList(params) {
  return axiosParams('get', `videoMachine/queryAllTenant`, params)
}

// 所有租户报警信息列表
export function allWarningList(params) {
  return axiosParams('get', `videoAlarm/pageQueryAlarmAllTenant`, params)
}

// 所有租户审核报警信息
export function allWarningAudit(params) {
  return axiosParams('post', `videoAlarm/auditAlarmInternalTenant`, params)
}

// ## 视频运营驾驶舱统计接口
// 不同行业一体机数量
export function machineIndustryList() {
  return axiosParams('get', `videoStat/machine/industryStat`)
}

// 一体机厂商统计
export function machineCompanyList() {
  return axiosParams('get', `videoStat/machine/manufacturerStat`)
}

// 区域分布
export function machineRegionList() {
  return axiosParams('get', `videoStat/machine/regionStat`)
}

// 一体机省份统计
export function machineProvinceList() {
  return axiosParams('get', `videoStat/machine/provinceStat`)
}

// 预警状态统计
/*
@param
{
alarmDateStart,
alarmDateEnd,
internalDisposeUserId,
machineId,
TCode
}
*/
export function warningStatusList(params) {
  return axiosParams('get', `videoStat/statusStat`, params)
}

// 预警类型年度统计
export function machineTypeYear() {
  return axiosParams('get', 'videoStat/alarmTypeYear')
}

// 一体机预警Top10
export function machineRank() {
  return axiosParams('get', 'videoStat/machine/alarmTop10')
}

/**
 * @param {object} params - 技能配置参数
 * @param {string} params.id - 配置ID
 * @param {string} params.companyId - 公司ID
 * @param {string} params.departmentId - 部门ID
 * @param {string} params.machineId - 机器ID
 * @param {string} params.skills - 技能列表
 */
// 添加/修改技能配置
export function saveOrUpdateAiSkill(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoAiSkills/saveOrUpdate`, params)
}
/**
 * @param {object} params - 删除技能配置参数
 * @param {string} params.id - 配置ID
 */
// 删除技能配置
export function deleteAiAuditSkill(params) {
  return axiosParams('post', `videoAiSkills/delete`, params)
}

// 技能配置列表
export function aiAuditSkillList(params) {
  return axiosParams('get', `videoAiSkills/query`, params)
}

/**
 * @param {object} params - 模型复判技能配置（全局）查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.skillName] - 技能名称（可选）
 * @param {string} [params.skillPrompt] - 技能提示词（可选）
 * @param {string} [params.skillWords] - 技能关键词（可选）
 */
// 查询模型复判技能配置（全局）
export function videoModelSkillGlobalQuery(params) {
  return axiosParams('get', `videoModelSkillGlobal/query`, params)
}

/**
 * @param {object} params - 删除模型复判技能配置（全局）参数
 * @param {string} params.id - 配置ID
 */
// 删除模型复判技能配置（全局）
export function deleteVideoModelSkillGlobal(params) {
  return axiosParams('post', `videoModelSkillGlobal/delete`, params)
}

/**
 * @param {object} params - 模型复判技能配置（全局）DTO
 */
// 添加/修改模型复判技能配置（全局）
export function saveOrUpdateVideoModelSkillGlobal(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoModelSkillGlobal/saveOrUpdate`, params)
}

/**
 * @param {object} params - 模型复判技能配置（租户）查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.skillName] - 技能名称（可选）
 * @param {string} [params.skillPrompt] - 技能提示词（可选）
 * @param {string} [params.skillWords] - 技能关键词（可选）
 */
// 查询模型复判技能配置（租户）
export function videoModelSkillTenantQuery(params) {
  return axiosParams('get', `videoModelSkillTenant/query`, params)
}

/**
 * @param {object} params - 删除模型复判技能配置（租户）参数
 * @param {string} params.id - 配置ID
 */
// 删除模型复判技能配置（租户）
export function deleteVideoModelSkillTenant(params) {
  return axiosParams('post', `videoModelSkillTenant/delete`, params)
}

/**
 * @param {object} params - 模型复判技能配置（租户）DTO
 */
// 添加/修改模型复判技能配置（租户）
export function saveOrUpdateVideoModelSkillTenant(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoModelSkillTenant/saveOrUpdate`, params)
}

/**
 * @param {object} params - 关注预警参数
 * @param {string} params.alarmId - 预警ID
 * @param {number} params.isAttention - 是否关注 1:关注 0:取消关注
 */
// 关注/取消关注预警
export function attentionAlarm(params) {
  return axiosParams('post', `videoAlarm/attentionAlarm`, params)
}

// 客户人员批量审核视频报警信息
/**
 * @param {object} params - 批量审核参数
 * @param {Array} params.alarms - 预警ID列表
 * @param {Array<object>} params.alarms - 预警对象数组
 * @param {string} params.alarms[].alarmId - 预警ID
 * @param {string} params.alarms[].tenantCode - 租户编码
 * @param {string} params.status - 审核状态
 * @param {string} params.opinion - 审核意见
 */
// 批量关注/取消关注预警
export function batchAttentionAlarm(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoAlarm/auditAlarmCustomerBatch`, params)
}

// 运维人员批量审核视频报警信息
/**
 * @param {object} params - 批量审核参数
 * @param {Array} params.alarms - 预警ID列表
 * @param {Array<object>} params.alarms - 预警对象数组
 * @param {string} params.alarms[].alarmId - 预警ID
 * @param {string} params.alarms[].tenantCode - 租户编码
 * @param {string} params.status - 审核状态
 * @param {string} params.type - 操作(1:提交审核 2:加急处理)
 */
// 批量关注/取消关注预警
export function batchAttentionAlarmInternal(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoAlarm/auditAlarmInternalBatch`, params)
}

// 预警数据导出
export function exportWarningData(params) {
  const paramsStr = qs.stringify(params)
  console.log(paramsStr)
  const connectUrl = `videoAlarm/exportAlarm?${paramsStr}`
  return downloadFileAsPromise({ url: connectUrl, method: 'get', name: '预警数据.xlsx' })
}

// 统计分析导出接口

// 预警趋势导出
export function exportWarningTrend(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmTrend?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '预警趋势导出.xlsx',
  })
}

// 预警处理状态导出
export function exportWarningProcess(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmStatus?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '预警处理状态导出.xlsx',
  })
}

// 组织预警TOP10导出
export function exportOrgWarning(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmDepartRank?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '组织预警排名TOP10.xlsx',
  })
}

// 预警设备导出
export function exportPointWarning(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmDeviceRank?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '设备预警排名TOP10.xlsx',
  })
}

// 预警类型TOP5导出
export function exportWarningType(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmTypeRank?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '预警类型排名TOP10.xlsx',
  })
}

// 预警等级类型导出
export function exportWarningLevel(params) {
  const paramsStr = qs.stringify(params)
  const connectUrl = `videoStat/exportAlarmLevel?${paramsStr}`
  return downloadFileAsPromise({
    url: connectUrl,
    method: 'post',
    name: '预警等级占比.xlsx',
  })
}

/**
 * @param {object} params - 声光报警器参数
 * @param {string} params.id - ID，新增时不传
 * @param {string} params.companyId - 所属公司ID
 * @param {string} params.departmentId - 所属部门ID
 * @param {string} params.deviceName - 声光报警器名称
 * @param {string} params.deviceModel - 设备型号
 * @param {string} params.deviceNum - 设备序列号
 * @param {string} params.enableState - 启用状态(0:禁用 1:启用)
 * @param {string} params.ipAddr - ip地址
 * @param {string} params.portNum - 端口号
 * @param {string} params.cloudUrl - 云端推送地址
 * @param {string} params.remark - 备注
 */
// 新增或更新声光报警器
export function saveOrUpdateVideoSiren(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoSiren/saveOrUpdate`, params)
}

/**
 * @param {object} params - 删除声光报警器参数
 * @param {string} params.id - 声光报警器ID
 */
// 删除声光报警器
export function deleteVideoSiren(params) {
  return axiosParams('post', `videoSiren/delete`, params)
}

/**
 * @param {object} params - 查询声光报警器参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.departmentId - 部门ID（可选）
 * @param {string} params.deviceName - 声光报警器名称（可选）
 * @param {string} params.deviceNum - 设备序列号（可选）
 */
// 声光报警器列表查询
export function queryVideoSiren(params) {
  return axiosParams('get', `videoSiren/query`, params)
}

// 批量删除预警处理信息
/**
 * @param {object} params - 批量删除参数
 * @param {Array} params.ids - 预警ID列表
 * @param {Array<object>} params.ids[] - 预警对象数组
 */
export function batchDeleteWarningProcess(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `videoAlarm/deleteAlarmBatchCustomer?ids=${params.ids}`)
}

// 预警标注图片上传
/**
 * @param {object} params - 预警标注图片上传参数
 * @param {string} params.alarmId - 预警ID
 * @param {string} params.annotationPic - 标注图片URL
 * @param {string} params.tCode - 租户编码
 */
export function uploadWarningImage(params) {
  return axiosParams('post', `videoAlarm/updateAlarmAnnotationPic`, params)
}

// 根据id查询详情信息
/**
 * @param {string} id - 预警ID
 */
export function queryWarningDetailById(id) {
  return axiosParams('get', `videoAlarm/getAlarmById?id=${id}`)
}

// 定位卡报警器关联
// 添加修改定位卡报警器关联
/**
 * @param {object} params - 添加修改定位卡报警器关联参数
 * @param {string} params.buildId - 建筑id
 * @param {string} params.id - 主键id
 * @param {string} params.sirenIds - 声光报警器id(多个用英文逗号分隔)
 * @param {string} params.sn - 定位卡号
 */
export function saveOrUpdateCardSiren(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `cardSiren/saveOrUpdate`, params)
}

// 查询定位卡报警器关联
/**
 * @param {object} params - 查询定位卡报警器关联参数
 * @param {string} params.isPage - 是否分页 1:分页 0:不分页
 * @param {number} params.pageNum - 页码 必填
 * @param {number} params.pageSize - 每页条数 必填
 * @param {string} params.sn - 定位卡号
 */
export function queryCardSiren(params) {
  return axiosParams('get', `cardSiren/getPageList`, params)
}

// 删除定位卡警报器关联
/**
 * @param {object} params - 删除定位卡警报器关联参数
 * @param {string} params.id - 主键id
 */
export function deleteCardSiren(params) {
  return axiosParams('post', `cardSiren/deleteById`, params)
}
