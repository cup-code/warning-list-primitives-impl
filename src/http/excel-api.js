import {
  axiosFile,
  axiosGet,
  createAxiosFromStore,
} from './common/utils'
/* excel导入导出key */

// 隐患台账
export const HIDDEN_TROUBLE_BOOK = {
  key: 'HiddenTroubleLedger',
  name: '隐患台账',
}
// 随手拍清单
export const FAST_REPORT_BOOK = {
  key: 'HiddenTroubleBySourceLedger',
  name: '随手拍清单',
}
// 维保计划
export const MAINTENCE_PLAN = {
  key: 'maintenancePlan',
  name: '维保计划',
}

// 维保记录
export const MAINTBANCE_EXECUTE_RECORD = {
  key: 'maintenanceExecuteRecord',
  name: '维保记录',
}

// 巡检记录
export const INSPECTION_RECORD = {
  key: 'inspectionPlanTaskExecute',
  name: '巡检记录',
}

// 巡检异常记录
export const INSPECTION_EXCEPTION_RECORD = {
  key: 'inspectionAbnormal',
  name: '巡检异常记录',
}

// 巡检违规记录
export const INSPECTION_VIOLATTON = {
  key: 'inspectionViolation',
  name: '巡检违规记录',
}

// 润滑记录
export const LUBRICATE_RECORD = {
  key: 'lubricateRecord',
  name: '润滑记录',
}

// 职业健康 方案
export const HEALTH_PLAN = {
  key: 'HealthyPlan',
  name: '职业健康管理方案',
}
// 安全生产目标与责任 by 张小锐
// 目标责任制
export const FORMULATE_TARGET = {
  key: 'safetyProductionTarget',
  name: '目标责任制',
}
export const FORMULATE_SIGNED_LIST = {
  key: 'safetyProductionStanding',
  name: '目标责任书台账',
}
export const TARGET_CONFIG_LIST = {
  key: 'safetyProductionTargetConfig',
  name: '目标配置',
}
export const SAFETY_PRODUCTION_EXAM = {
  key: 'safetyProductionExam',
  name: '目标责任制考核',
}
export const SAFETY_PRODUCTION_EXAM_STANDING = {
  key: 'safetyProductionExamStanding',
  name: '目标责任制考核台账',
}
// 奖励考核板块 by 张小锐
// 三违考核台账
export const THREE_VIOLATION_LIST = {
  key: 'examineExport',
  name: '三违考核列表',
}
// 三违考核执行列表
export const THREE_VIOLATION_EXECUTE_LIST = {
  key: 'examineExecuteExport',
  name: '三违考核执行列表',
}
export const THREE_VIOLATION_COUNT_LIST = {
  key: 'examineCountExport',
  name: '三违考核台账',
}
export const SAFE_REWARD_LIST = {
  key: 'incentiveExport',
  name: '安全奖励列表',
}
export const SAFE_REWARD_EXECUTE_LIST = {
  key: 'incentiveExecuteExport',
  name: '安全奖励执行列表',
}
export const SAFE_REWARD_COUNT_LIST = {
  key: 'incentiveCountExport',
  name: '安全奖励台账',
}
// 评价管理板块
export const SAFETY_EVALUATE_LIST = {
  key: 'safetyEvaluateExport',
  name: '安全员考评台账',
}
export const DEPARTMENT_EVALUATE_LIST = {
  key: 'departHeaderEvaluateExport',
  name: '部门负责人考评台账',
}
export const SAFETYRISK_EVALUATE_LIST = {
  key: 'safetyRiskFundEvaluateExport',
  name: '安全风险金考评',
}
// 日志管理 by 张小锐
export const LOGIN_LOG_LIST = {
  key: 'LoginLog',
  name: '登录日志',
}
// 演练记录 by zbs
export const DRILL_RECORD = {
  key: 'DrillRecords',
  name: '演练记录',
}
/* excel导入导出 */
// 获取可导出字段集 通过传入不同的key区分业务
export function getExcelHeader(key) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `excel/getExportableFields/${key}`)
}
// excel导出 通过传入不同的key区分业务
export function excelExportApi(key, params) {
  const axios = createAxiosFromStore()
  return axiosFile(axios, `excel/exportData/${key}`, 'post', params)
}
