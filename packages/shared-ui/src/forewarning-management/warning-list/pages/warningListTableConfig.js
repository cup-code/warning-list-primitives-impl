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

export { WarningListConfig }
