// 巡检部分的接口
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 查询当前登录用户的部门权限及部门下的设备list
export function getDeviceWithDepartFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDevice/getWithDepartment`)
}
// 分页查询巡检标准
export function getInspectionStandardListByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceId) {
    pr += `&deviceId=${params.deviceId}`
  }
  if (params.deviceName) {
    pr += `&deviceName=${encodeURIComponent(params.deviceName)}`
  }
  if (params.positionName) {
    pr += `&positionName=${encodeURIComponent(params.positionName)}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `inspectionPosition/queryByPage${pr}`)
}
// 查询指定设备的巡检部位
export function getInspectionContentByIdFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPosition/getByAssetId/${params.deviceId}`)
}
// 保存或修改巡检部位
export function addInspectionPartFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPosition/save`, params)
}
// 删除巡检部位
export function deleteInspectionPartFn(positionId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `inspectionPosition/delete/${positionId}`)
}
// 保存或修改巡检内容
export function addInspectionContentFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionContent/save`, params)
}
// 删除巡检内容
export function deleteInspectionContentFn(contentId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `inspectionContent/delete/${contentId}`)
}
// 分页查询巡检地点
export function getInspectionPositionByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${encodeURIComponent(params.fuzzyQuery)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `inspectionPlace/queryByPage${pr}`)
}
// 查询指定部门的巡检地点
export function getInspectionPositionByDepartFn(departmentId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlace/getByDepartmentId/${departmentId}`)
}
// 保存或修改巡检地点
export function addInspectionPositionFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlace/save`, params)
}
// 查询指定巡检点的设备
export function getDeviceListByPositionFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlace/getDeviceByPlaceId/${id}`)
}
// 删除巡检地点
export function deleteInspectionPositionFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `inspectionPlace/delete/${id}`)
}
// 分页查询巡检计划
export function getInspectionPlanByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.planState === '0') {
    delete params.planState
  }
  if (params.planState) {
    pr += `&planState=${params.planState}`
  }
  if (params.inspectionType) {
    pr += `&inspectionType=${params.inspectionType}`
  }
  if (params.planName) {
    pr += `&planName=${encodeURIComponent(params.planName)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `inspectionPlan/queryByPage${pr}`)
}
// 按条件查询巡检计划各个状态的数量
export function getStateCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionPlan/groupBystate?inspectionType=${
      params.inspectionType
    }&planName=${encodeURIComponent(params.planName)}&departmentId=${
      params.departmentId
    }&startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 保存或修改巡检计划基础信息
export function addInspectionPlanFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlan/save`, params)
}
// 查询指定巡检计划id的信息
export function getPlanInfoByIdFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlan/getById/${id}`)
}
// 删除巡检计划
export function deleteInspectionPlanFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `inspectionPlan/delete/${id}`)
}
// 查询指定计划/年份的排班信息
export function getScheduleInfoFn(id, year) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionPlanScheduleConfigure/getByPlanIdAndYear?planId=${id}&year=${year}`,
  )
}
// 查询指定计划/年份/类型的排班信息
export function getScheduleInfoByTypeFn(id, year, type) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionPlanScheduleConfigure/getByPlanIdAndYearAndType?planId=${id}&year=${year}&scheduleType=${type}`,
  )
}
// 保存或修改巡检计划排班配置
export function addScheduleFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlanScheduleConfigure/save`, params)
}
// 生成指定计划/年份的任务班次
export function generateScheduleFn(id, year) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlanScheduleConfigure/generateTask?planId=${id}&year=${year}`)
}
// 切换巡检计划状态
export function changeStateFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlan/changeState`, params)
}
// 分页查询指定计划和年份的排班或执行纪录
// isExecute为true返回执行纪录,为false返回排班记录
export function getTaskScheduleFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionPlanScheduleRecord/queryPageByOnePlan?pageNum=${params.pageNum}&pageSize=${params.pageSize}&planId=${params.planId}&year=${params.year}&isExecute=${params.isExecute}`,
  )
}
// 查看指定班次的巡检执行纪录详情
export function getInspectionRecordDetailFn(recordId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlanScheduleRecord/infoByScheduleRecorId/${recordId}`)
}
// 添加临时班次
export function addTemporaryScheduleFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlanScheduleRecord/saveTemporaryScheduleRecord`, params)
}
// 按计划id查询巡检路线
export function getPlanLineFn(planId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlanLine/getLinebyPlanId/${planId}`)
}
// 保存或修改巡检计划路线
export function savePlanLineFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlanLine/save`, params)
}
// 获取指定计划的提醒设置信息
export function getPlanMessageSetFn(planId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlan/getRemindById/${planId}`)
}
// 保存巡检计划消息提醒
export function saveMessageSetFn(planId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlan/remindSet/${planId}`, params)
}
// 分页查询巡检纪录
export function getInspectionRecordFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.taskName) {
    pr += `&taskName=${encodeURIComponent(params.taskName)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.postId) {
    pr += `&postId=${params.postId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (typeof params.abnormal === 'boolean') {
    pr += `&abnormal=${params.abnormal}`
  }
  return axiosGet(axios, `inspectionPlanScheduleRecord/queryPage${pr}`)
}
// 分页查询巡检的异常纪录
export function getExceptionRecordFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.auditState === 'all') {
    delete params.auditState
  }
  if (params.auditState) {
    pr += `&auditState=${params.auditState}`
  }
  if (params.planName) {
    pr += `&planName=${encodeURIComponent(params.planName)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.inspectionType) {
    pr += `&inspectionType=${params.inspectionType}`
  }
  if (params.auditResult) {
    pr += `&auditResult=${params.auditResult}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `inspectionAbnormal/queryPage${pr}`)
}
// 按条件查询巡检异常的纪录审核状态数量
export function getAuditStateCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionAbnormal/groupBystate?inspectionType=${
      params.inspectionType
    }&planName=${encodeURIComponent(params.planName)}&departmentId=${
      params.departmentId
    }&auditResult=${params.auditResult}&startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 提交异常记录审核结果
export function submitAuditFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionAbnormal/audit`, params)
}
// 分页查询巡检执行中的违规纪录
export function getViolationRecordFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.auditResult === 'all') {
    delete params.auditResult
  }
  if (params.auditResult) {
    pr += `&auditResult=${params.auditResult}`
  }
  if (params.planName) {
    pr += `&planName=${encodeURIComponent(params.planName)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.postId) {
    pr += `&postId=${params.postId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (params.violationType) {
    pr += `&violationType=${params.violationType}`
  }
  return axiosGet(axios, `inspectionPlanViolationRecord/queryPage${pr}`)
}
// 按条件查询巡检违规的纪录审核状态数量
export function getViolationAuditStateCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `inspectionPlanViolationRecord/groupByAuditResult?planName=${encodeURIComponent(
      params.planName,
    )}&departmentId=${params.departmentId}&postId=${params.postId}&startDate=${
      params.startDate
    }&endDate=${params.endDate}&violationType=${params.violationType}`,
  )
}
// 提交违规记录审核结果
export function submitViolationAuditFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `inspectionPlanViolationRecord/audit`, params)
}
// 查询指定月份或年度,当前登录人可见范围内设备巡检率
export function getInspectionRateFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?year=${params.year}`
  if (params.month) {
    pr += `&month=${params.month}`
  }
  return axiosGet(axios, `inspectionPlan/getInspectionRate${pr}`)
}
