// 所有图层  默认人员定位图层控制
// ebable:true  是否显示标记
const allLayer = [
  { id: 'location-per01', array: undefined, enable: false, name: '人员', belong: 'person-location' },
  // {id:'location-car01',array:undefined,enable:false,name:'车辆'},
  { id: 'camera-icon-01', array: undefined, enable: false, name: '摄像头', belong: 'always' },
  { id: 'risk-area-box1', array: undefined, enable: false, name: '风险区域', belong: 'risk-area' },
  { id: 'risk-trouble', array: undefined, enable: false, name: '重要隐患', belong: 'important-danger' },
  // {id:'hard-danger-origin',array:undefined,enable:false,name:'重大危险源'},
  {
    id: 'important-danger-origin',
    array: undefined,
    enable: false,
    name: '重要危险源',
    belong: 'important-danger',
  },
  { id: 'electronic-fence', array: undefined, enable: false, name: '电子围栏', belong: 'always' },
  // {id:'gas-harmful-01',array:undefined,enable:false,name:'有毒气体'},
  { id: 'fire-device', array: undefined, enable: false, name: '消防设备', belong: 'fire-protect' },
  /*  {id:'02-点型感温',array:undefined,enable:false,name:'温感探测'},
    {id:'05-复合火焰',array:undefined,enable:false,name:'复合火焰'},
    {id:'fire-door',array:undefined,enable:false,name:'防火卷帘门'}, */
  // {id:'detector-flame',array:undefined,enable:false,name:'火焰探测'},
  // {id:'alarm-level-01',array:undefined,enable:false,name:'报警'},
  {
    id: 'occupation-disease',
    array: undefined,
    enable: false,
    name: '职业病因素区域',
    type: ['OccupationDisease'],
    belong: 'occupation-disease',
  },
  {
    id: 'text-name-0001',
    array: undefined,
    enable: true,
    name: '设备名称',
    type: true,
    belong: 'always',
  },
  {
    id: 'build-level-01',
    array: undefined,
    enable: true,
    name: '显示楼层',
    type: true,
    belong: 'always',
  },
  {
    id: 'map-bottom-001',
    array: undefined,
    enable: true,
    name: '显示地图',
    type: true,
    belong: 'always',
  },
]

export default allLayer
