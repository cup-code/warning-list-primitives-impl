// 作业票状态
export const TicketStatusList = [
  {
    label: '作业逾期',
    value: -2,
  },
  {
    label: '作业终止',
    value: -1,
  },
  {
    label: '申请中',
    value: 0,
  },
  {
    label: '审批告知配置中',
    value: 1,
  },
  {
    label: '审批中',
    value: 2,
  },
  {
    label: '作业中',
    value: 3,
  },
  {
    label: '暂停作业',
    value: 4,
  },
  {
    label: '完成作业',
    value: 5,
  },
  {
    label: '已验收',
    value: 6,
  },
]
// 作业票类型
export const TicketTypeList = [
  { label: '动火作业', value: '1001' },
  { label: '有限空间作业', value: '1002' },
  { label: '高空作业', value: '1003' },
  { label: '临时用电作业', value: '1004' },
  { label: '断路作业', value: '1005' },
  { label: '动土作业', value: '1006' },
  { label: '吊装作业', value: '1007' },
  { label: '盲板抽堵作业', value: '1008' },
  { label: '通用作业', value: '1009' },
]
// 作业票类型及等级下拉列表
export const TicketTypeLvList = [
  { label: '特级动火安全作业', value: '1001-0' },
  { label: '一级动火安全作业', value: '1001-1' },
  { label: '二级动火安全作业', value: '1001-2' },
  { label: '特殊受限空间安全作业', value: '1002-0' },
  { label: '一级受限空间安全作业', value: '1002-1' },
  { label: '高空安全作业', value: '1003' },
  { label: '临时用电安全作业', value: '1004' },
  { label: '断路安全作业', value: '1005' },
  { label: '动土安全作业', value: '1006' },
  { label: '吊装安全作业', value: '1007' },
  { label: '盲板抽堵安全作业', value: '1008' },
]

// 动火作业等级
export const WorkLvList = [
  { label: '特级', value: '0' },
  { label: '一级', value: '1' },
  { label: '二级', value: '2' },
]
