/* 双预防湖北 */
// 风险等级
export const RiskLevelList = [
  {
    label: '低风险',
    value: 0,
    bgColor: '#2DAFF9',
  },
  {
    label: '一般风险',
    value: 1,
    bgColor: '#FFFF02',
  },
  {
    label: '较大风险',
    value: 2,
    bgColor: '#FFBF01',
  },
  {
    label: '重大风险',
    value: 3,
    bgColor: '#FE0001',
  },
]
// 管控周期 -- 方艺明
export const CtrlCycleArrList = [
  { label: '小时', value: 0 },
  { label: '日', value: 1 },
  { label: '周', value: 2 },
  { label: '月', value: 3 },
  { label: '季度', value: 4 },
  { label: '年', value: 5 },
]

// // 管控方式
// export const CtrlMethodList = [
//   { label: '自动', value: 1 },
//   { label: '隐患排查', value: 2 },
// ]

// 风险评价方法
export const EvaMethodList = [
  { label: '直接判定法', value: 1 },
  { label: '风险矩阵法(LS)', value: 2 },
  // { label: '作业条件危险性评价分析法(LEC)', value: 3 }
]

// 隐患结果
export const TroubleResultList = [
  { label: '正常', value: 0, tag: 'success' },
  { label: '存在隐患', value: 1, tag: 'danger' },
]
// 隐患排查状态
export const CheckStatusList = [
  { label: '未排查', value: 0, tag: 'info' },
  { label: '已排查', value: 1, tag: 'danger' },
]
// 隐患排查类型
export const HiddenCheckTypeList = [
  { label: '计划排查', value: 1 },
  { label: '扫码排查', value: 2 },
]

// 检查计划状态
export const SafePlanStatus = [
  { label: '停用', value: false, tag: 'danger' },
  { label: '启用', value: true, tag: 'success' },
]
// 检查任务状态
export const SafeTaskStatus = [
  { label: '待执行', value: -1 },
  { label: '检查中', value: 0 },
  { label: '已完成', value: 1 },
]

// 风险辨识-管控类型
export const CtrlTypeList = [
  { label: '自动化控制', value: 1 },
  { label: '隐患排查', value: 2 },
  { label: '自动化监控', value: 3 },
]
