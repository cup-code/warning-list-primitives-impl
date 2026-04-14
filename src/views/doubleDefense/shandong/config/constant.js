// 风险等级
export const RiskLevel = [
  {
    label: '低风险',
    value: 0,
    color: '#2DAFF9',
  },
  {
    label: '一般风险',
    value: 1,
    color: '#FFFF02',
  },
  {
    label: '较大风险',
    value: 2,
    color: '#FFBF01',
  },
  {
    label: '重大风险',
    value: 3,
    color: '#FE0001',
  },
]
// 风险评价方法
export const EvaMethod = [
  // {
  //   label: '风险矩阵法(LS)',
  //   value: 2,
  //   showType: 'primary',
  //   nick: 'LS'
  // },
  {
    label: '作业条件危险性评价分析法(LEC)',
    value: 3,
    showType: 'success',
    nick: 'LEC',
  },
  {
    label: '直接判定法',
    value: 1,
    showType: 'info',
    nick: '直接判定',
  },
]
// 管控周期 -- 方艺明
export const CtrlCycleArr = [
  {
    label: '小时',
    value: 0,
  },
  {
    label: '天',
    value: 1,
  },
  {
    label: '周',
    value: 2,
  },
  {
    label: '月',
    value: 3,
  },
  {
    label: '年',
    value: 4,
  },
]
// 管控方式
export const CtrlMethod = [
  {
    label: '自动化监控',
    value: 1,
  },
  {
    label: '隐患排查',
    value: 2,
  },
]

// 隐患排查类型
export const HiddenCheckType = [
  {
    label: '计划排查',
    value: 1,
  },
  {
    label: '扫码排查',
    value: 2,
  },
]

// 检查计划状态
export const SafePlanStatus = [
  {
    label: '停用',
    value: false,
    tag: 'danger',
  },
  {
    label: '启用',
    value: true,
    tag: 'success',
  },
]

// 检查任务状态
export const SafeTaskStatus = [
  {
    label: '待执行',
    value: -1,
  },
  {
    label: '检查中',
    value: 0,
  },
  {
    label: '已完成',
    value: 1,
  },
]

// 风险排查结果
export const TroubleResult = [
  {
    label: '正常',
    value: 0,
    tag: 'success',
  },
  {
    label: '存在隐患',
    value: 1,
    tag: 'danger',
  },
  {
    label: '暂未排查',
    value: -1,
    tag: 'warning',
  },
]
// 风险排查状态
export const CheckStatusList = [
  {
    label: '未排查',
    value: 0,
    tag: 'danger',
  },
  {
    label: '已排查',
    value: 1,
    tag: 'success',
  },
]
