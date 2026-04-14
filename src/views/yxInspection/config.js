/**
 * 智能巡检V0.3 表格配置
 */

// 巡检项表格配置
export const InspectionItemTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '类别',
    prop: 'contentCategory',
    width: 100,
    align: 'center',
    slot: 'contentCategory',
  },
  {
    label: '巡检项',
    prop: 'itemName',
    minWidth: 150,
    align: 'left',
  },
  {
    label: '巡检标准',
    prop: 'standard',
    minWidth: 200,
    align: 'left',
  },
  {
    label: '排序',
    prop: 'sortOrder',
    width: 80,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

// 巡检点表格配置
export const InspectionPointTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '点编号',
    prop: 'pointCode',
    width: 120,
    align: 'center',
  },
  {
    label: '点名称',
    prop: 'pointName',
    minWidth: 150,
    align: 'center',
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 160,
    align: 'center',
  },
  {
    label: '创建人',
    prop: 'createdByName',
    width: 120,
    align: 'center',
  },
{
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'right',
  },
]

// 违规记录表格配置（与原型图一致）
export const ViolationRecordTableConfig = [
   {
    label: '巡检计划',
    prop: 'planName',
    minWidth: 120,
    align: 'center',
  },
  {
    label: '部门',
    prop: 'department',
    width: 100,
    align: 'center',
  },
  {
    label: '岗位',
    prop: 'post',
    width: 100,
    align: 'center',
  },
  {
    label: '人员',
    prop: 'violationUserName',
    width: 100,
    align: 'center',
  },
  {
    label: '违规时间',
    prop: 'violationTime',
    width: 160,
    align: 'center',
  },
  {
    label: '巡检班次',
    prop: 'inspectionShift',
    minWidth: 200,
    align: 'center',
  },
  {
    label: '原因',
    prop: 'reason',
    minWidth: 200,
    align: 'left',
  },
  {
    label: '类型',
    prop: 'violationType',
    width: 80,
    align: 'center',
    slot: 'violationType',
  },
  {
    label: '结果',
    prop: 'result',
    width: 90,
    align: 'center',
    slot: 'result',
  },
  {
    label: '处理意见',
    prop: 'handleOpinion',
    width: 120,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 100,
    align: 'center',
  },
]

// 安全记录表格配置
export const SafetyRecordTableConfig = [
  {
    label: '巡检计划',
    prop: 'planName',
    minWidth: 120,
    align: 'center',
  },
  {
    label: '部门',
    prop: 'department',
    width: 100,
    align: 'center',
  },
  {
    label: '岗位',
    prop: 'post',
    width: 100,
    align: 'center',
  },
  {
    label: '人员',
    prop: 'person',
    width: 100,
    align: 'center',
  },
  {
    label: '上报时间',
    prop: 'reportTime',
    width: 160,
    align: 'center',
  },
  {
    label: '巡检班次',
    prop: 'inspectionShift',
    align: 'center',
  },
  {
    label: '状态',
    prop: 'auditState',
    minWidth: 200,
    align: 'center',
    slot: 'auditState',
  },
  {
    label: '审核结果',
    prop: 'auditResult',
    width: 90,
    align: 'center',
    slot: 'auditResult',
  },
  {
    label: '处理意见',
    prop: 'auditOpinion',
    width: 120,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 100,
    align: 'center',
  },
]

// 巡检路线表格配置（与原型图一致：序号、路线名称、联系电话、创建时间、负责人、操作）
export const InspectionRouteTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '路线名称',
    prop: 'routeName',
    minWidth: 120,
    align: 'center',
  },
  {
    label: '联系电话',
    prop: 'contactPhone',
    width: 130,
    align: 'center',
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 160,
    align: 'center',
  },
  {
    label: '负责人',
    prop: 'personInCharge',
    width: 120,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

// 巡检计划表格配置（与原型图一致：计划编号、所属公司、计划名称、排班方式、排查人员、频次、周期类型、状态、操作）
export const InspectionPlanTableConfig = [
  {
    label: '计划编号',
    prop: 'planCode',
    width: 140,
    align: 'center',
  },
  {
    label: '所属部门',
    prop: 'companyName',
    width: 120,
    align: 'center',
  },
  {
    label: '计划名称',
    prop: 'planName',
    minWidth: 150,
    align: 'center',
  },
  {
    label: '排班方式',
    prop: 'scheduleMode',
    width: 100,
    align: 'center',
    slot: 'scheduleMode',
  },
  {
    label: '巡检人员',
    prop: 'executeUserList',
    width: 140,
    align: 'center',
    slot: 'executeUserList',
  },
  {
    label: '上次巡检人',
    prop: 'lastExecuteUserList',
    width: 120,
    align: 'center',
  },
  {
    label: '上次巡检时间',
    prop: 'lastExecuteTime',
    width: 160,
    align: 'center',
  },
  {
    label: '巡检周期',
    prop: 'frequency',
    width: 140,
    align: 'center',
    slot: 'frequency',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 220,
    align: 'center',
  },
]

// 巡检记录表格配置（与原型图一致：序号、任务名称、排班时间、所属部门、巡检岗位、巡检人、开始时间、结束时间、结果、操作）
export const InspectionRecordTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '任务名称',
    prop: 'taskName',
    minWidth: 120,
    align: 'center',
  },
  {
    label: '排班时间',
    prop: 'scheduledTime',
    width: 180,
    align: 'center',
    slot: 'scheduledTime',
  },
  {
    label: '所属部门',
    prop: 'department',
    width: 120,
    align: 'center',
  },
  {
    label: '巡检岗位',
    prop: 'inspectionPost',
    width: 100,
    align: 'center',
  },
  {
    label: '巡检人',
    prop: 'executeUsersName',
    width: 120,
    align: 'center',
    slot: 'executeUsersName',
  },
  {
    label: '开始时间',
    prop: 'executeStartTime',
    width: 160,
    align: 'center',
  },
  {
    label: '结束时间',
    prop: 'executeEndTime',
    width: 160,
    align: 'center',
  },
  {
    label: '结果',
    prop: 'abnormal',
    width: 100,
    align: 'center',
    slot: 'result',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

// 异常记录表格配置（与原型图一致：ID、巡检内容、巡检标准、计划名称、巡检班次、所属部门、巡检岗位、巡检人、异常时间、状态、审核结果、操作）
export const ExceptionRecordTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '巡检内容',
    prop: 'contentName',
    minWidth: 180,
    align: 'left',
  },
  {
    label: '巡检标准',
    prop: 'inspectionStandard',
    minWidth: 200,
    align: 'left',
  },
  {
    label: '计划名称',
    prop: 'planName',
    width: 120,
    align: 'center',
  },
  {
    label: '巡检班次',
    prop: 'inspectionShift',
    width: 200,
    align: 'center',
  },
  {
    label: '所属部门',
    prop: 'department',
    width: 100,
    align: 'center',
  },
  {
    label: '巡检岗位',
    prop: 'inspectionPost',
    width: 100,
    align: 'center',
  },
  {
    label: '巡检人',
    prop: 'inspector',
    width: 100,
    align: 'center',
  },
  {
    label: '异常时间',
    prop: 'exceptionTime',
    width: 160,
    align: 'center',
    slot: 'exceptionTime',
  },
  {
    label: '状态',
    prop: 'status',
    width: 90,
    align: 'center',
    slot: 'status',
  },
  {
    label: '审核结果',
    prop: 'reviewResult',
    width: 100,
    align: 'center',
    slot: 'reviewResult',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 140,
    align: 'center',
  },
]

// 知识库表格配置
export const KnowledgeBaseTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '资源名称',
    prop: 'resourceName',
    minWidth: 200,
    align: 'left',
  },
  {
    label: '资源类型',
    prop: 'resourceType',
    width: 120,
    align: 'center',
  },
  {
    label: '是否启用',
    prop: 'enable',
    width: 100,
    align: 'center',
    slot: 'enable',
  },
  {
    label: '描述',
    prop: 'description',
    width: 120,
    align: 'center',
  },
  {
    label: '最后编辑时间',
    prop: 'updatedTime',
    width: 160,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

// 终端发布表格配置
export const TerminalPublishTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '终端名称',
    prop: 'terminalName',
    minWidth: 150,
    align: 'center',
  },
  {
    label: '终端编号',
    prop: 'terminalCode',
    width: 120,
    align: 'center',
  },
  {
    label: '关联计划',
    prop: 'planName',
    width: 150,
    align: 'center',
  },
  {
    label: '状态',
    prop: 'status',
    width: 100,
    align: 'center',
    slot: 'status',
  },
  {
    label: '最后同步时间',
    prop: 'lastSyncTime',
    width: 160,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

// 巡检报告时间选项
export const InspectionReportTimeOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '自定义', value: 'custom' },
]

// 巡检报告默认筛选条件
export const InspectionReportDefaultForm = {
  reportTitle: '',
  reportSummary: '',
  timeType: 'week',
  dateRange: [],
  includeDetail: true,
  includeChart: false,
}

// 巡检报告统计卡配置（原型：首行 4 项、次行 5 项；key 对齐 queryDateRangeReport）
export const InspectionReportStatSummaryFirstRowCount = 4

export const InspectionReportStatConfig = [
  { key: 'planScheduleCount', label: '计划巡检总数', unit: '次' },
  { key: 'planCostTime', label: '计划耗时', unit: ' 分钟' },
  { key: 'averageCostTime', label: '平均耗时', unit: ' 分钟' },
  { key: 'maxCostTime', label: '最长耗时', unit: ' 分钟' },
  { key: 'placeCount', label: '巡检点数量', unit: '个' },
  { key: 'contentCount', label: '巡检项数量', unit: '个' },
  { key: 'abnormalCount', label: '异常数量', unit: '个' },
  { key: 'sosCount', label: '紧急报警', unit: '次' },
  { key: 'inspectorCount', label: '巡检人数', unit: '个' },
]

// 巡检结果颜色映射（tailwind class）
export const InspectionReportResultColorMap = {
  normal: 'text-green-600',
  abnormal: 'text-red-500',
}
