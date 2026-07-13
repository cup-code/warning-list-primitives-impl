// 设备列表表格配置
const deviceListConfig = [
  {
    label: '设备名称',
    prop: 'deviceName',
  },
  {
    label: '设备完整路径',
    prop: 'deviceFullName',
  },
  {
    label: '设备编码',
    prop: 'deviceCode',
  },
  // {
  //   label: '第一条报警时间',
  //   prop: 'firstAlarmTime',
  //   width: 200,
  // },
  // {
  //   label: '最后一次报警时间',
  //   prop: 'lastAlarmTime',
  //   width: 200,
  // },
  {
    label: "声光报警器id",
    prop: "sirenIds",
    align: "left",
  },
  {
    label: "所属公司",
    prop: "companyId",
    align: "center",
  },
  {
    label: "所属部门",
    prop: "departmentId",
    align: "center",
  },
  {
    label: '操作',
    fixed: 'right',
    align: 'right',
    prop: 'operation',
    width: 200,
    slot: 'operation',
  },
]

// 报警信息列表表格配置
const alarmInfoListConfig = [
  {
    label: '设备名称',
    prop: 'deviceName',
  },
  {
    label: '设备编码',
    prop: 'deviceCode',
  },
  {
    label: '完整路径',
    prop: 'deviceFullName',
    align: 'left',
    width: 220,
    slot: '',
  },
  {
    label: '测点名称',
    prop: 'pointName',
    slot: '',
  },
  {
    label: '测点编码',
    prop: 'pointCode',
  },
  {
    label: '报警时间',
    prop: 'alarmTime',
    width: 180,
  },
  {
    label: '报警等级',
    prop: 'level',
    width: 200,
  },
  {
    label: '报警值',
    prop: 'value',
  },
  {
    label: '报警状态名称',
    prop: 'statusStr',
    width: 200,
  },
  {
    label: '报警摘要',
    prop: 'summary',
    width: 200,
  },
  {
    label: '单位',
    prop: 'unit',
  },
  {
    label: '操作',
    fixed: 'right',
    align: 'right',
    prop: 'operation',
    width: 120,
    slot: 'operation',
  },
]

// 机器人设备列表表格配置
const robotDeviceListConfig = [
  {
    label: '机器人名称',
    prop: 'robotName',
    width: 150,
  },
  {
    label: '机器人编号',
    prop: 'robotCode',
    width: 150,
  },
  {
    label: '机器人ID',
    prop: 'robotId',
    width: 150,
  },
  {
    label: '备注',
    prop: 'remarks',
    minWidth: 200,
    showOverflowTooltip: true,
  },
  {
    label: '操作',
    fixed: 'right',
    align: 'right',
    prop: 'operation',
    width: 200,
    slot: 'operation',
  },
]

// 机器人报警列表表格配置
const robotAlarmListConfig = [
  {
    label: '机器人编号',
    prop: 'robotCode',
    width: 150,
  },
  {
    label: '告警项名称',
    prop: 'alarmCategory',
    width: 150,
  },
  {
    label: '告警类型',
    prop: 'alarmTypeName',
    width: 120,
  },
  {
    label: '告警等级',
    prop: 'alarmLevel',
    width: 120,
    slot: 'alarmLevel',
  },
  {
    label: '告警原因',
    prop: 'alarmContent',
    minWidth: 200,
    showOverflowTooltip: true,
  },
  {
    label: '告警时间',
    prop: 'alarmTime',
    width: 180,
  },
  {
    label: '告警结束时间',
    prop: 'endTime',
    width: 180,
  },
]

export { alarmInfoListConfig, deviceListConfig, robotDeviceListConfig, robotAlarmListConfig }
