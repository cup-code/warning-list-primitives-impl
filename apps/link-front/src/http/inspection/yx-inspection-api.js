import {
  axiosParams,
  axiosPost,
  axiosDelete,
  axiosGet,
  createAxiosFromStore,
} from '../common/utils'

/**
 * 分页查询巡检内容
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.contentCode] - 内容编号
 * @param {string} [params.contentName] - 内容名称
 * @param {string} [params.inspectionBenchmark] - 巡检基准
 */
export function getPageContent(params) {
  return axiosParams('get', `/yx/inspectionContent/getPageContent`, params)
}

/**
 * 保存或修改巡检内容
 * @param {object} data - 巡检内容数据
 * @param {string} [data.id] - 主键（修改时必传）
 * @param {string} data.contentName - 内容名称
 * @param {string} data.contentCategory - 内容分类（数据字典）
 * @param {boolean} data.mustPhotograph - 强制拍照
 * @param {boolean} data.abnormalMustAudio - 异常强制录音
 * @param {boolean} data.abnormalMustVideo - 异常强制视频
 * @param {number} data.sortOrder - 排序号
 * @param {string} [data.dataType] - 数据类别：单选-RADIO；数值区间-NUMERICAL_INTERVAL
 * @param {string[]} [data.dataOptionList] - 数据选项集合
 * @param {string[]} [data.dataVlaueList] - 数据值集合
 * @param {string} [data.inspectionBenchmark] - 巡检基准
 */
export function saveYxInspectionContent(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionContent/save`, data)
}

/**
 * 删除巡检内容
 * @param {string} id - 巡检内容ID
 */
export function deleteYxInspectionContent(contentId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/yx/inspectionContent/delete/${contentId}`)
}

/**
 * 保存或修改巡检地点
 * @param {object} data - 巡检地点数据
 * @param {string} [data.id] - 主键（修改时必传）
 * @param {string} data.placeCode - 巡检地点编码（必填）
 * @param {string} data.placeName - 巡检地点名称（必填）
 * @param {string[]} data.contentIdList - 巡检内容集合（必填）
 * @param {string} [data.departmentId] - 组织机构id
 * @param {string} [data.placePosition] - 地点位置
 * @param {boolean} [data.needMark] - 是否打卡
 * @param {boolean} [data.needPhoto] - 现场拍照
 * @param {string} [data.attention] - 注意事项
 * @param {string} [data.remarks] - 备注
 * @param {number} [data.sortOrder] - 排序号
 * @param {object} [data.areaOnMapInfo] - 巡检点在地图上的标注面信息
 * @param {object} [data.areaOnMapInfo.geometry] - 区域信息
 * @param {array} [data.areaOnMapInfo.geometry.coordinates] - 区域顶点坐标信息
 * @param {string} [data.areaOnMapInfo.geometry.type] - 类型
 * @param {object} [data.areaOnMapInfo.properties] - 楼层信息
 * @param {string} [data.areaOnMapInfo.properties.floorId] - 楼层ID
 * @param {string} [data.areaOnMapInfo.properties.floorNo] - 楼层号
 * @param {string} [data.areaOnMapInfo.properties.id] - ID
 * @param {string} [data.areaOnMapInfo.properties.name] - 名称
 * @param {string} [data.areaOnMapInfo.properties.type] - 类型
 * @param {string} [data.areaOnMapInfo.type] - 类型
 * @param {array} [data.pointOnMapInfo] - 巡检点在地图上的标注点信息
 * @param {number} [data.pointOnMapInfo[].x] - x坐标
 * @param {number} [data.pointOnMapInfo[].y] - y坐标
 * @param {number} [data.pointOnMapInfo[].z] - z坐标
 */
export function saveInspectionPlace(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlace/save`, data)
}

/**
 * 分页查询巡检地点
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.fuzzyQuery] - 点位名称/编号模糊查询
 */
export function queryInspectionPlaceByPage(params) {
  return axiosParams('get', `/yx/inspectionPlace/queryByPage`, params)
}

/**
 * 根据id查询巡检地点详情
 * @param {string} placeId - 巡检地点ID
 */
export function getInspectionPlaceDetailById(placeId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlace/getDetailById/${placeId}`)
}

/**
 * 删除巡检地点
 * @param {string} placeId - 巡检地点ID
 */
export function deleteInspectionPlace(placeId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/yx/inspectionPlace/delete/${placeId}`)
}

/**
 * 保存或修改巡检计划
 * @param {object} data - 巡检计划数据
 * @param {string} [data.id] - 主键（修改时必传）
 * @param {string} data.planCode - 计划编号（必填）
 * @param {string} data.planName - 计划名称（必填）
 * @param {string} data.departmentId - 所属部门id（必填）
 * @param {string} data.lineId - 巡检路线id（必填）
 * @param {string} data.planState - 状态：待提交-1；发布-2；停用-3（必填）
 * @param {string} [data.cycleFiled] - 巡检周期：日-DAY；周-WEEK；月-MONTH；年-YEAR
 * @param {number} [data.frequency] - 周期内巡检班次
 * @param {string} [data.scheduleMode] - 排班方式：周期排班-CYCLE；滚动排班-ROLL
 * @param {string[]} [data.exceptionNotificationUserIdList] - 异常通知用户id
 * @param {string[]} [data.violationAuditUserIdList] - 违规审核用户id
 * @param {string} [data.remarks] - 备注
 */
export function saveInspectionPlan(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlan/save`, data)
}

/**
 * 分页查询部门下的巡检计划
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.planName] - 计划名称模糊查询
 * @param {string} [params.planState] - 状态：待提交-1；发布-2；停用-3
 * @param {string} [params.inspectionType] - 巡检类型
 */
export function queryInspectionPlanByPage(params) {
  return axiosParams('get', `/yx/inspectionPlan/queryByPage`, params)
}

/**
 * 查询指定计划id的信息
 * @param {string} planId - 巡检计划ID
 */
export function getInspectionPlanById(planId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlan/getById/${planId}`)
}

/**
 * 删除巡检计划
 * @param {string} planId - 巡检计划ID
 */
export function deleteInspectionPlan(planId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/yx/inspectionPlan/delete/${planId}`)
}

/**
 * 切换计划状态
 * @param {object} data - 状态切换数据
 * @param {string} data.planId - 计划id（必填）
 * @param {string} data.planState - 变更状态：待提交-1；发布-2；停用-3（必填）
 */
export function changeInspectionPlanState(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlan/changeState`, data)
}

/**
 * 保存或修改巡检路线
 * @param {object} data - 巡检路线数据
 * @param {string} [data.id] - 主键id（修改时必传）
 * @param {string} data.lineName - 巡检路线名称
 * @param {string} [data.directorId] - 负责人
 * @param {string} [data.contactPhone] - 联系电话
 * @param {string[]} [data.placeIdList] - 巡检点id集合
 * @param {string} [data.remarks] - 备注
 */
export function saveOrUpdateLine(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanLine/saveOrUpdateLine`, data)
}

/**
 * 分页查询巡检路线
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.lineName] - 路线名称
 * @returns {Promise<object>} 返回分页结果，包含巡检路线列表
 * @returns {string} result.list[].id - 主键
 * @returns {string} result.list[].lineName - 巡检路线名称
 * @returns {string} result.list[].directorId - 负责人id
 * @returns {string} result.list[].directorName - 负责人名称
 * @returns {string} result.list[].contactPhone - 联系电话
 * @returns {string} result.list[].remarks - 备注
 * @returns {string} result.list[].createdTime - 创建时间
 * @returns {array} result.list[].yxInspectionLinePlaces - 巡检路线关联的点
 * @returns {string} result.list[].yxInspectionLinePlaces[].id - 主键
 * @returns {string} result.list[].yxInspectionLinePlaces[].placeId - 巡检点id
 * @returns {string} result.list[].yxInspectionLinePlaces[].placeName - 巡检点名称
 * @returns {number} result.list[].yxInspectionLinePlaces[].sortOrder - 排序号
 */
export function queryLine(params) {
  return axiosParams('get', `/yx/inspectionPlanLine/queryLine`, params)
}

/**
 * 按路线ID查询巡检路线
 * @param {string} id - 巡检路线ID
 * @returns {Promise<object>} 返回巡检路线详情
 * @returns {string} result.id - 主键
 * @returns {string} result.lineName - 巡检路线名称
 * @returns {string} result.directorId - 负责人id
 * @returns {string} result.directorName - 负责人名称
 * @returns {string} result.contactPhone - 联系电话
 * @returns {string} result.remarks - 备注
 * @returns {string} result.createdTime - 创建时间
 * @returns {array} result.yxInspectionLinePlaces - 巡检路线关联的点
 * @returns {string} result.yxInspectionLinePlaces[].id - 主键
 * @returns {string} result.yxInspectionLinePlaces[].placeId - 巡检点id
 * @returns {string} result.yxInspectionLinePlaces[].placeName - 巡检点名称
 * @returns {number} result.yxInspectionLinePlaces[].sortOrder - 排序号
 */
export function getLineById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanLine/getLineById/${id}`)
}

/**
 * 删除巡检路线
 * @param {string} id - 巡检路线ID
 */
export function deleteLine(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/yx/inspectionPlanLine/deleteLine/${id}`)
}

/**
 * 分页查询巡检异常记录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.auditResult] - 审核结果.误报:0;问题:1;安全隐患:2
 * @param {string} [params.auditState] - 审核状态.待审核:0;处理中:1;已处理:2
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.endDate] - 巡检结束时间,字符串格式:yyyy-MM-dd HH:mm:ss
 * @param {string} [params.inspectionType] - 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
 * @param {string} [params.planName] - 计划名称
 * @param {string} [params.startDate] - 巡检开始时间,字符串格式:yyyy-MM-dd HH:mm:ss
 * @returns {Promise<object>} 返回分页结果，包含巡检异常列表
 * @returns {string} result.list[].abnormalLevel - 异常级别
 * @returns {string} result.list[].audio - 巡检录音
 * @returns {string} result.list[].auditResult - 审核结果.误报:0;问题:1
 * @returns {string} result.list[].auditState - 审核状态.待审核:0;处理中:1;已处理:2
 * @returns {string} result.list[].contentCategory - 内容分类,数据字典
 * @returns {string} result.list[].contentName - 内容名称
 * @returns {string} result.list[].departmentName - 所属部门名称
 * @returns {string} result.list[].executeDate - 异常时间
 * @returns {string} result.list[].executeRecordId - 执行纪录id
 * @returns {string} result.list[].executeResult - 巡检结果
 * @returns {string} result.list[].executeUsername - 巡检人员姓名
 * @returns {string} result.list[].inspectionBenchmark - 巡检基准
 * @returns {string} result.list[].inspectionMode - 巡检方法，逗号分隔，数据字典
 * @returns {string} result.list[].inspectionType - 巡检类型
 * @returns {string} result.list[].photo - 巡检照片
 * @returns {string} result.list[].planName - 计划名称
 * @returns {string} result.list[].postName - 岗位名称,班次岗位
 * @returns {string} result.list[].problemDesc - 问题描述
 * @returns {string} result.list[].taskName - 任务名称,即班次名
 * @returns {string} result.list[].video - 巡检视频
 */
export function queryInspectionAbnormalPage(params) {
  return axiosParams('get', `/yx/inspectionAbnormal/queryPage`, params)
}

/**
 * 查询我的异常纪录
 * @param {object} params - 查询参数
 * @param {string} params.clientChannel - 请求渠道（必填，通过header传递）
 * @returns {Promise<object>} 返回我的异常纪录列表
 * @returns {string} result[].abnormalLevel - 异常级别
 * @returns {string} result[].audio - 巡检录音
 * @returns {string} result[].auditResult - 审核结果.误报:0;问题:1
 * @returns {string} result[].auditState - 审核状态.待审核:0;处理中:1;已处理:2
 * @returns {string} result[].contentCategory - 内容分类,数据字典
 * @returns {string} result[].contentName - 内容名称
 * @returns {string} result[].departmentName - 所属部门名称
 * @returns {string} result[].executeDate - 异常时间
 * @returns {string} result[].executeRecordId - 执行纪录id
 * @returns {string} result[].executeResult - 巡检结果
 * @returns {string} result[].executeUsername - 巡检人员姓名
 * @returns {string} result[].inspectionBenchmark - 巡检基准
 * @returns {string} result[].inspectionMode - 巡检方法，逗号分隔，数据字典
 * @returns {string} result[].inspectionType - 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
 * @returns {string} result[].photo - 巡检照片
 * @returns {string} result[].planName - 计划名称
 * @returns {string} result[].postName - 岗位名称,班次岗位
 * @returns {string} result[].problemDesc - 问题描述
 * @returns {string} result[].taskName - 任务名称,即班次名
 * @returns {string} result[].video - 巡检视频
 */
export function queryMyAbnormal(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionAbnormal/queryMyAbnormal`, {
    headers: { clientChannel: params.clientChannel },
  })
}

/**
 * 审核异常的纪录
 * @param {object} data - 审核异常纪录数据
 * @param {string} data.executeRecordId - 执行纪录id（必填）
 * @param {string} data.auditResult - 审核结果.误报:0;问题:1（必填）
 * @param {string} [data.abnormalLevel] - 异常级别
 * @param {string} [data.problemDesc] - 问题描述
 * @param {string} [data.clientChannel] - 请求渠道（通过header传递）
 */
export function auditInspectionAbnormal(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionAbnormal/audit`, data)
}

/**
 * APP审核异常的纪录
 * @param {object} data - 审核异常纪录数据
 * @param {string} data.executeRecordId - 执行纪录id（必填）
 * @param {string} data.auditResult - 审核结果.误报:0;问题:1（必填）
 * @param {string} [data.abnormalLevel] - 异常级别
 * @param {string} [data.problemDesc] - 问题描述
 * @param {string} [data.clientChannel] - 请求渠道（通过header传递）
 * @returns {Promise<object>} 返回APP巡检审核结果
 * @returns {string} result.code - 结果状态.0:其他人正在处理;1:其他人已处理完毕;2:当前用户处理完成
 * @returns {string} result.auditUserName - 其他处理人岗位及用户名
 */
export function auditInspectionAbnormalOnApp(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionAbnormal/auditOnApp`, data, {
    headers: { clientChannel: data.clientChannel },
  })
}

/**
 * 分页查询安全记录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.auditResult] - 结果：0-安全；1-误操作
 * @param {string} [params.planName] - 计划名称
 * @param {string} [params.reportTimeStart] - 上报时间开始
 * @param {string} [params.reportTimeEnd] - 上报时间结束
 * @returns {Promise<object>} 返回分页结果
 */
export function querySafeRecord(params) {
  return axiosParams('get', `/yx/inspectionSafeRecord/querySafeRecord`, params)
}

/**
 * 审核安全记录
 * @param {object} data - 审核数据
 * @param {string} data.id - 记录id（必填）
 * @param {string} data.auditResult - 结果：0-安全；1-误操作（必填）
 * @param {string} [data.auditOpinion] - 审核意见
 */
export function auditSafeRecord(data) {
  return axiosParams('post', `/yx/inspectionSafeRecord/auditSafeRecord`, data)
}

/**
 * 删除安全记录
 * @param {string} id - 记录id（必填）
 */
export function deleteSafeRecord(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionSafeRecord/deleteSafeRecord/${id}`)
}

/**
 * 紧急报警SOS
 * @param {object} data - SOS报警数据
 * @param {string} [data.geoInfo] - 位置信息
 * @param {string} data.scheduleRecordId - 任务班次id（必填）
 */
export function triggerSos(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionSafeRecord/doneSos`, data)
}

/**
 * 生成任务班次
 * @param {object} params - 查询参数
 * @param {string} params.planId - 计划id（必填）
 * @param {number} params.year - 年份数（必填）
 */
export function generateTask(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleConfigure/generateTask`, params)
}

/**
 * 查询排班信息
 * @param {object} params - 查询参数
 * @param {string} params.planId - 计划id（必填）
 * @param {number} params.year - 年份数（必填）
 * @returns {Promise<Array>} 返回巡检计划排班配置详情VO列表
 */
export function getScheduleByPlanIdAndYear(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleConfigure/getByPlanIdAndYear`, params)
}

/**
 * 查询指定类型排班信息
 * @param {object} params - 查询参数
 * @param {string} params.planId - 计划id（必填）
 * @param {string} params.scheduleType - 排班类型（必填）：专人-SPECIFIC_PERSON；专岗-SPECIFIC_POST
 * @param {number} params.year - 年份数（必填）
 * @returns {Promise<object>} 返回巡检计划排班配置VO
 */
export function getScheduleByPlanIdAndYearAndType(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleConfigure/getByPlanIdAndYearAndType`, params)
}

/**
 * 保存排班配置
 * @param {object} data - 排班配置数据
 * @param {string} [data.id] - 主键id（修改时必传）
 * @param {string} data.planId - 计划id（必填）
 * @param {number} data.planYear - 计划年份（必填）
 * @param {string} data.scheduleType - 排班类型（必填）：专人-SPECIFIC_PERSON；专岗-SPECIFIC_POST
 * @param {string} [data.completionCondition] - 完成条件
 * @param {Array<object>} [data.scheduleDetails] - 排班详情列表
 * @param {number} data.scheduleDetails[].dayOfMonth - 日期（1-31）
 * @param {string} data.scheduleDetails[].dayOfWeek - 星期
 * @param {string[]} [data.scheduleDetails[].executeUserIdList] - 执行用户id列表（专人排班时填写）
 * @param {number} data.scheduleDetails[].month - 月份（1-12）
 * @param {string} [data.scheduleDetails[].postId] - 岗位id（专岗排班时填写）
 * @param {string} data.scheduleDetails[].scheduleTime - 班次时间，格式：HH:mm
 */
export function saveScheduleConfigure(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanScheduleConfigure/save`, data)
}

/**
 * 查看执行纪录详情
 * @param {string} executeRecordId - 执行纪录id（必填）
 * @returns {Promise<object>} 巡检异常VO
 */
export function getExecuteInfoById(executeRecordId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanScheduleRecord/getExecuteInfoById/${executeRecordId}`)
}

/**
 * 查看班次执行纪录详情
 * @param {string} scheduleRecordId - 班次纪录id（必填）
 * @returns {Promise<object>} 巡检计划班次执行纪录VO
 */
export function getScheduleRecordDetail(scheduleRecordId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanScheduleRecord/infoByScheduleRecorId/${scheduleRecordId}`)
}

/**
 * 巡检点打卡/现场拍照
 * @param {object} data - 打卡数据
 * @param {object} data.geoInfo - 位置信息
 * @param {string} data.markPhoto - 现场照片
 * @param {string} data.markUserId - 用户id
 * @param {string} data.placeCode - 巡检点code
 * @param {string} data.scheduleRecordId - 班次纪录id
 */
export function placeMark(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanScheduleRecord/placeMark`, data)
}

/**
 * 查询当前用户巡检概览
 * @returns {Promise<object>} 我的巡检计划排班纪录VO
 */
export function queryMyInspectionOverview() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanScheduleRecord/queryMyInspection`)
}

/**
 * 查询当前用户巡检任务
 * @param {object} params - 查询参数
 * @param {boolean} params.isCompleted - 是否已完成，true-查询已完成的；false-查询待执行的（必填）
 * @returns {Promise<Array>} 巡检任务信息VO列表
 */
export function queryMyTask(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryMyTask`, params)
}

/**
 * 分页查询执行纪录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {boolean} [params.abnormal] - 是否异常
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.endDate] - 结束时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.postId] - 岗位id
 * @param {string} [params.startDate] - 开始时间，格式：yyyy-MM-dd HH:mm:ss
 * @returns {Promise<object>} 巡检计划排班纪录VO分页
 */
export function queryExecuteRecordPage(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryPage`, params)
}

/**
 * 按部门日期查询执行纪录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.companyId] - 公司id
 * @param {string} [params.departmentId] - 部门id
 * @param {number} [params.month] - 月份（1-12）
 * @param {number} [params.year] - 年份
 */
export function queryExecuteRecordByDeptDate(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryPageByDepartmentAndDate`, params)
}

/**
 * 按计划查询排班或执行纪录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} params.planId - 计划id（必填）
 * @param {number} params.year - 年份（必填）
 * @param {boolean} params.isExecute - 是否已执行巡检（必填）
 */
export function queryExecuteRecordByPlan(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryPageByOnePlan`, params)
}

/**
 * 查询任务执行详情
 * @param {object} params - 查询参数
 * @param {string} params.scheduleRecordId - 任务班次id（必填）
 * @param {string} [params.userId] - 执行用户id，为空则查询当前登录用户
 * @returns {Promise<object>} 巡检任务执行详情VO
 */
export function queryTaskDetails(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryTaskDetails`, params)
}

/**
 * 保存巡检点巡检结果
 * @param {object} data - 巡检结果数据
 * @param {string} data.placeId - 巡检点id
 * @param {string} data.scheduleRecordId - 班次纪录id
 * @param {array} data.contentDTOList - 内容结果列表
 * @param {string} data.contentDTOList[].contentId - 内容id
 * @param {string} data.contentDTOList[].executeResult - 执行结果
 * @param {boolean} data.contentDTOList[].abnormal - 是否异常
 * @param {string} [data.contentDTOList[].photo] - 巡检照片
 * @param {string} [data.contentDTOList[].audio] - 巡检录音
 * @param {string} [data.contentDTOList[].video] - 巡检视频
 */
export function saveInspectionPlaceResult(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanScheduleRecord/saveInspectionPlace`, data)
}

/**
 * 添加临时班次
 * @param {object} data - 临时班次数据
 * @param {string} data.planId - 计划id
 * @param {string} data.taskName - 任务名称
 * @param {string} data.scheduleStartTime - 计划开始时间
 * @param {string} data.scheduleEndTime - 计划结束时间
 * @param {string[]} data.executeUserIdList - 执行用户id列表
 * @param {string} data.postId - 岗位id
 * @param {number} data.completionCondition - 完成条件（0-任意人完成，1-所有人完成）
 * @param {number} data.expireHours - 过期小时数
 * @param {string} [data.remarks] - 备注
 */
export function saveTemporaryScheduleRecord(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanScheduleRecord/saveTemporaryScheduleRecord`, data)
}

/**
 * 查询指定日期范围的报表数据
 * @param {object} params - 查询参数
 * @param {string} params.startDate - 开始时间（必填）
 * @param {string} params.endDate - 结束时间（必填）
 * @returns {Promise<object>} YxInspectionDateRangeReportVO
 * @returns {number} result.abnormalCount - 异常数量
 * @returns {number} result.averageCostTime - 平均耗时
 * @returns {number} result.contentCount - 巡检项数量
 * @returns {number} result.executeScheduleCount - 实际执行班次数量
 * @returns {Array<object>} result.executeScheduleList - 执行班次列表
 * @returns {string} result.executeScheduleList[].departmentName - 所属部门名称
 * @returns {string} result.executeScheduleList[].executeEndTime - 实际执行结束时间
 * @returns {string} result.executeScheduleList[].executeStartTime - 实际执行起始时间
 * @returns {string[]} result.executeScheduleList[].executeUsersName - 巡检人名称
 * @returns {string} result.executeScheduleList[].expireTime - 任务失效时间
 * @returns {string} result.executeScheduleList[].lineName - 巡检路线名称
 * @returns {string} result.executeScheduleList[].planId - 计划id
 * @returns {string} result.executeScheduleList[].postName - 岗位名称
 * @returns {string} result.executeScheduleList[].remarks - 备注
 * @returns {string} result.executeScheduleList[].scheduleEndTime - 排班执行截止时间
 * @returns {string} result.executeScheduleList[].scheduleRecordId - 班次id
 * @returns {string} result.executeScheduleList[].scheduleStartTime - 排班执行起始时间
 * @returns {string} result.executeScheduleList[].taskName - 任务名称
 * @returns {string} result.executeScheduleList[].type - 班次类型：计划班次-0；临时班次-1
 * @returns {Array<object>} result.executeScheduleList[].executePlaceInfoList - 巡检执行地点信息
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].placeId - 巡检点Id
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].placeName - 巡检地点名称
 * @returns {number} result.executeScheduleList[].executePlaceInfoList[].sortOrder - 巡检地点排序号
 * @returns {Array<object>} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList - 执行巡检内容信息
 * @returns {boolean} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].abnormal - 是否异常
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].audio - 巡检录音
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].audioText - 音频文字
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].contentName - 内容名称
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].executeResult - 巡检结果
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].executorName - 巡检人姓名
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].inspectionBenchmark - 巡检基准
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].photo - 巡检拍照
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].reportingTime - 上报时间
 * @returns {number} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].sortOrder - 内容排序号
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].executeContentInfoList[].video - 巡检视频
 * @returns {Array<object>} result.executeScheduleList[].executePlaceInfoList[].markInfoList - 打卡/现场照片信息
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].markInfoList[].markPhoto - 现场照片
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].markInfoList[].markTime - 打卡时间
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].markInfoList[].markUserId - 打卡用户id
 * @returns {string} result.executeScheduleList[].executePlaceInfoList[].markInfoList[].markUserName - 打卡用户名称
 * @returns {number} result.inspectorCount - 巡检人数
 * @returns {number} result.maxCostTime - 最长耗时
 * @returns {number} result.missedCount - 漏检数量
 * @returns {string} result.missedRate - 漏检率
 * @returns {number} result.overtimeCount - 超时数量
 * @returns {string} result.overtimeRate - 超时率
 * @returns {number} result.placeCount - 巡检点数量
 * @returns {number} result.planCostTime - 计划耗时
 * @returns {number} result.planScheduleCount - 计划班次数量
 * @returns {number} result.sosCount - 紧急报警数量
 * @returns {string} result.taskCompletionRate - 任务完成率
 */
export function queryDateRangeReport(params) {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/queryDateRangeReport`, params)
}

/**
 * 提交班次巡检任务
 * @param {string} scheduleRecordId - 班次纪录id（必填）
 * @description 对应app中的[巡检完毕]按钮
 */
export function submitInspectionTask(scheduleRecordId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanScheduleRecord/submit/${scheduleRecordId}`)
}

/**
 * 查询巡检总览信息
 * @returns {Promise<object>} 巡检总览信息
 * @returns {Array<object>} result.taskDetailsList - 巡检任务信息列表
 * @returns {string} result.taskDetailsList[].isOvertime - 是否超时
 * @returns {number} result.taskDetailsList[].overtimeMinutes - 超时时长（分钟）
 * @returns {Array<object>} result.taskDetailsList[].placeInfoList - 巡检点信息列表
 * @returns {object} result.taskStatus - 任务状态
 * @returns {number} result.taskStatus.completed - 已完成
 * @returns {number} result.taskStatus.ongoing - 进行中
 * @returns {number} result.taskStatus.toStart - 待开始
 * @returns {Array<object>} result.userInfoList - 人员信息列表
 */
export function queryInspectionSummary() {
  return axiosParams('get', `/yx/inspectionPlanScheduleRecord/querySummary`)
}

// ==================== 巡检异常模块 ====================

/**
 * 查询指定执行纪录的异常信息
 * @param {string} executeRecordId - 执行纪录ID（必填）
 * @returns {Promise<object>} 巡检异常VO
 */
export function getAbnormalByExecuteRecordId(executeRecordId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionAbnormal/getByExecuteRecordId/${executeRecordId}`)
}

/**
 * 按条件查询巡检异常审核状态数量
 * @param {object} params - 查询参数
 * @param {string} [params.auditResult] - 审核结果：误报-0；问题-1；安全隐患-2
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.endDate] - 结束日期，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.inspectionType] - 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
 * @param {string} [params.planName] - 计划名称
 * @param {string} [params.startDate] - 开始日期，格式：yyyy-MM-dd HH:mm:ss
 */
export function countAbnormalByState(params) {
  return axiosParams('get', `/yx/inspectionAbnormal/groupBystate`, params)
}

// ==================== 巡检计划模块 ====================

/**
 * 获取计划提醒设置
 * @param {string} planId - 巡检计划ID（必填）
 * @returns {Promise<object>} 巡检计划提醒设置VO
 */
export function getPlanRemindById(planId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlan/getRemindById/${planId}`)
}

/**
 * 查询巡检计划各状态数量
 * @param {object} params - 查询参数
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.inspectionType] - 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
 * @param {string} [params.planName] - 计划名称
 */
export function countPlanByState(params) {
  return axiosParams('get', `/yx/inspectionPlan/groupBystate`, params)
}

/**
 * 设置计划提醒
 * @param {string} planId - 巡检计划ID（必填）
 * @param {object} data - 提醒设置数据
 * @param {boolean} [data.remindBeforeStart] - 开始前提醒
 * @param {boolean} [data.remindAfterStart] - 开始后提醒
 * @param {boolean} [data.remindBeforeEnd] - 结束前提醒
 * @param {boolean} [data.remindAfterEnd] - 结束后提醒
 * @param {boolean} [data.sendPlatformMessage] - 发送平台消息
 * @param {boolean} [data.sendTextMessage] - 发送短信
 */
export function setPlanRemind(planId, data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlan/remindSet/${planId}`, data)
}

// ==================== 巡检违规模块 ====================

/**
 * 查询违规纪录详情
 * @param {string} violationId - 违规纪录ID（必填）
 */
export function getViolationById(violationId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanViolationRecord/getById/${violationId}`)
}

/**
 * 查询违规纪录各审核结果数量
 * @param {object} params - 查询参数
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.endDate] - 结束日期，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.planName] - 计划名称
 * @param {string} [params.postId] - 岗位id
 * @param {string} [params.startDate] - 开始日期，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.violationType] - 违规类型：未按时做-NOT_ON_TIME；未做-NOT_DONE
 */
export function countViolationByAuditResult(params) {
  return axiosParams('get', `/yx/inspectionPlanViolationRecord/groupByAuditResult`, params)
}

/**
 * 查询我的违规纪录
 * APP使用，无参数
 */
export function queryMyViolation() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/yx/inspectionPlanViolationRecord/queryMyViolation`)
}

/**
 * 分页查询违规纪录
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.auditResult] - 审核结果：待审核-1；误报-2；确认违规-3
 * @param {string} [params.departmentId] - 组织机构id
 * @param {string} [params.endDate] - 结束日期，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.planName] - 计划名称
 * @param {string} [params.postId] - 岗位id
 * @param {string} [params.startDate] - 开始日期，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.violationType] - 违规类型：未按时做-NOT_ON_TIME；未做-NOT_DONE
 */
export function queryViolationPage(params) {
  return axiosParams('get', `/yx/inspectionPlanViolationRecord/queryPage`, params)
}

/**
 * 审核违规纪录
 * @param {object} data - 审核数据
 * @param {string} data.violationId - 违规纪录id（必填）
 * @param {string} data.auditResult - 审核结果：待审核-1；误报-2；确认违规-3（必填）
 * @param {string} [data.handlingOpinions] - 处理意见
 */
export function auditViolation(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionPlanViolationRecord/audit`, data)
}

// ==================== 知识库模块 ====================

/**
 * 分页查询知识库
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.title] - 知识标题
 * @param {string} [params.category] - 知识分类
 * @param {boolean} [params.enabled] - 是否启用
 * @returns {Promise<object>} 返回分页结果
 */
export function getKnowledgeBasePage(params) {
  return axiosParams('get', `/yx/inspectionKnowledge/query`, {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    resourceName: params.title,
    resourceType: params.category,
    enable: params.enabled
  })
}

/**
 * 删除知识库
 * @param {string} id - 知识库ID（必填）
 */
export function deleteKnowledgeBase(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionKnowledge/delete/${id}`)
}

/**
 * 新增或修改知识库
 * @param {object} data - 知识库数据
 * @param {string} [data.id] - 主键（修改时必传）
 * @param {string} data.resourceName - 资源名称（必填）
 * @param {string} data.resourceType - 资源类型（必填）
 * @param {boolean} [data.enable] - 是否启用
 * @param {string} [data.type] - 类型
 * @param {string} [data.description] - 描述
 */
export function saveOrUpdateKnowledgeBase(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yx/inspectionKnowledge/saveOrUpdate`, data)
}
