const tableConfig = [
  {
    label: '所属片区',
    prop: 'wwww',
    type: 'text',
  },
  {
    label: '所属站点',
    prop: 'stationName',
    type: 'text',
  },
  // {
  //   label: "设备名称",
  //   prop: "meshName",
  //   slot: "name",
  //   type: "text",
  // },
  {
    label: '排放标准',
    prop: 'emissionStandard',
    type: 'text',
  },
  {
    label: '设计水量',
    prop: 'designWater',
    type: 'text',
  },
  {
    label: '运维负责人',
    prop: 'personInCharge',
    type: 'text',
  },
  {
    label: '设备价值（万元）',
    prop: 'equipmentValue',
    type: 'text',
  },
  {
    label: '操作',
    prop: '',
    slot: 'action',
    fixed: 'right',
    align: 'right',
    width: 200,
  },
]

const tableButtonConfig = [
  {
    type: 'primary',
    text: '添加',
    props: 'add',
    icon: 'add',
  },
  {
    type: 'success',
    text: 'Excel导入',
    props: 'excelImport',
    plain: true,
  },
  {
    type: 'success',
    text: 'Excel导出',
    props: 'excelExport',
    plain: true,
  },
]

const moreButtonConfig = [
  {
    type: 'text',
    text: '子系统配置',
    props: 'subSystemConfig',
  },
  {
    type: 'text',
    text: '生产安排',
    props: 'productionSchedule',
  },
  {
    type: 'text',
    text: '删除',
    props: 'delete',
  },
]

const tabsList = [
  {
    title: '站点信息',
    name: '1',
    component: 'BaseInfo',
  },
  // {
  //   title: "启动参数",
  //   name: "2",
  //   component: 'StartupParams',
  // },
  // {
  //   title: "站点看板",
  //   name: "2",
  //   component: 'StationBoard',
  // },
  {
    title: '预警配置',
    name: '3',
    component: 'WarningConfig',
  },
  {
    title: '容积标定',
    name: '4',
    component: 'VolumeCalibration',
  },
  // {
  //   title: "部位信息",
  //   name: "5",
  //   component: 'PartInfo',
  // },
  {
    title: '当日生产',
    name: '6',
    component: 'CurrentTreatment',
  },
  {
    title: '预测生产',
    name: '7',
    component: 'Forecast',
  },
]

const startupParamsList = [
  {
    label: '步序',
    prop: 'step',
    type: 'text',
  },
  {
    label: '设置',
    prop: 'setting',
    type: 'text',
    slot: 'setting',
  },
  {
    label: '单位',
    prop: 'unit',
    type: 'text',
  },
]

const v30MessageList = [
  {
    label: '序号',
    prop: 'step',
    type: 'text',
  },
  {
    label: '站点名称',
    prop: 'name',
    type: 'text',
  },
  {
    label: 'sv5图片',
    prop: 'sv5Img',
    type: 'text',
    slot: 'sv5Img',
  },
  {
    label: 'sv测量值',
    prop: 'sv5Value',
    type: 'text',
  },
  {
    label: 'sv5测量时间',
    prop: 'sv5Time',
    type: 'text',
  },
  {
    label: 'sv30图片',
    prop: 'sv30Img',
    type: 'text',
    slot: 'sv30Img',
  },
  {
    label: 'sv30测量值',
    prop: 'sv30Value',
    type: 'text',
  },
  {
    label: 'sv30测量时间',
    prop: 'sv30Time',
    type: 'text',
  },
  {
    label: '污泥性状指数',
    prop: 'sludgeNum',
    type: 'text',
  },
]

export {
  moreButtonConfig,
  startupParamsList,
  tableButtonConfig,
  tableConfig,
  tabsList,
  v30MessageList,
}
