// 菜单
const menuList = [
  {
    id: 'risk-area',
    componentName: 'RiskArea',
    name: '风险区域',
    incudeLayer: [
      { id: 'risk-area-box1', name: '风险区域', enable: true },
      { id: 'risk-trouble', name: '重要隐患', enable: true },

      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '显示楼层', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  {
    id: 'important-danger',
    componentName: 'ImportantDangerOrigin',
    name: '重要危险源',
    incudeLayer: [
      { id: 'important-danger-origin', name: '重要危险源', enable: true },
      { id: 'camera-icon-01', name: '摄像头' },
      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '显示楼层', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  {
    id: 'person-location',
    name: '人员定位',
    componentName: 'PersonCar',
    incudeLayer: [
      { id: 'location-per01', name: '人员', enable: true },
      { id: 'camera-icon-01', name: '摄像头', enable: true },
      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '显示楼层', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  {
    id: 'fire-protect',
    componentName: 'FireProtection',
    name: '消防管理', // FireProtection
    incudeLayer: [
      { id: 'fire-device', name: '消防设备', enable: true },
      /* {id:'02-点型感温',name:'温感探测',enable:true},
            {id:'05-复合火焰',name:'复合火焰',enable:true},
            {id:'fire-door',name:'防火卷帘门',enable:true}, */

      { id: 'camera-icon-01', name: '摄像头', enable: true },
      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '显示楼层', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  {
    id: 'safe-operation',
    componentName: 'SafeOperation',
    name: '作业安全', // SafeOperation
    incudeLayer: [
      { id: 'location-per01', name: '人员', enable: true },
      // {id:'special-opetion',name:'特殊作业',enable:true},
      { id: 'electronic-fence', name: '电子围栏', enable: true },
      { id: 'camera-icon-01', name: '摄像头', enable: true },
      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '显示楼层', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  {
    id: 'flyManager',
    componentName: 'FlyManager',
    name: '智能巡检',
    incudeLayer: [
      { id: 'risk-area-box1', name: '风险区域', enable: false },
      { id: 'risk-trouble', name: '重要隐患', enable: false },
      { id: 'text-name-0001', name: '设备名称', enable: false },
      { id: 'build-level-01', name: '显示楼层', enable: false },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
  // 重要危险源 弃用
  /*   {
    id: 'hard-danger-origin',
    componentName:'DangerOrigin',
    name: '重大危险源',
    incudeLayer:[
        {id:'hard-danger-origin',name:'重大危险源',enable:true},
        {id:'camera-icon-01',name:'摄像头',enable:true},
        {id:'text-name-0001',name:'设备名称',enable:true},
        {id:'build-level-01',name:'显示楼层',enable:true},
        {id:'map-bottom-001',name:'显示地图',enable:true},
    ]
  }, */
  {
    id: 'occupation-disease',
    componentName: 'OccupationDisease',
    name: '职业病因素分布图',
    incudeLayer: [
      { id: 'location-per01', name: '人员', enable: true },
      { id: 'occupation-disease', name: '职业病因素区域', enable: true },
      { id: 'text-name-0001', name: '设备名称', enable: true },
      { id: 'build-level-01', name: '楼层图标', enable: true },
      { id: 'map-bottom-001', name: '显示地图', enable: true },
    ],
  },
]

// 组件名称数组
const componentNames = []
menuList.forEach((item) => {
  componentNames.push(item.componentName)
})

export { componentNames, menuList }
