const cameraListConfig = [
  {
    label: '摄像头名称',
    prop: 'cameraName',
    slot: 'name',
    width: 150,
  },
  {
    label: '状态',
    prop: 'cameraStatus',
    width: 150,
    slot: 'status',
  },
  {
    label: '所属一体机',
    prop: 'machineName',
  },
  {
    label: '责任部门',
    prop: 'departmentName',
  },
  {
    label: '责任人',
    prop: 'userName',
  },
  {
    label: 'AI技能',
    prop: 'aiSkills',
    align: 'left',
    width: 220,
  },
  {
    label: '操作',
    fixed: 'right',
    align: 'right',
    prop: 'operation',
    width: 220,
    slot: 'operation',
  },
]

const WarningListConfig = [
  {
    label: '摄像头名称',
    prop: 'cameraName',
  },
  {
    label: '预警名称',
    prop: 'warningName',
  },
  {
    label: '预警等级',
    prop: 'warningLevel',
  },
  {
    label: '预警开始时间',
    prop: 'warningStartTime',
  },
  {
    label: '处理状态',
    prop: 'warningStatus',
  },
  {
    label: '操作',
    prop: 'operation',
    width: 150,
    slot: 'operation',
  },
]

const machineListConfig = [
  {
    label: '一体机名称',
    prop: 'machineName',
    width: 150,
  },
  {
    label: '一体机code',
    prop: 'machineCode',
    width: 150,
  },
  {
    label: '一体机ip',
    prop: 'machineIp',
  },
  {
    label: '一体机登录地址',
    prop: 'loginUrl',
    width: 220,
  },
  {
    label: '接口版本',
    prop: 'apiVersion',
  },
  {
    label: '系统版本',
    prop: 'systemVersion',
  },
  {
    label: '所属部门',
    prop: 'departmentName',
  },
  {
    label: '所属公司',
    prop: 'companyName',
  },
  // {
  //   label: "状态",
  //   prop: "status",
  //   slot: 'status',
  // },
  {
    label: '操作',
    fixed: 'right',
    align: 'right',
    prop: 'operation',
    width: 210,
    slot: 'operation',
  },
]

const tableListConfig = [
  {
    label: '摄像头名称',
    prop: 'cameraName',
  },
  {
    label: '审核状态',
    prop: 'auditStatus',
    slot: 'status',
  },
  {
    label: '预警日期',
    prop: 'alarmDate',
  },
  {
    label: '预警类型',
    prop: 'alarmType',
  },
  {
    label: '预警等级',
    prop: 'alarmLevel',
    slot: 'level',
  },
  {
    label: '操作',
    prop: 'operation',
    width: 150,
    slot: 'operation',
  },
]

export {
  cameraListConfig,
  machineListConfig,
  tableListConfig,
  WarningListConfig,
}
