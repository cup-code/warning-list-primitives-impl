const viewPoint_table_config = [
  { label: '建筑名称', prop: 'buildName', align: 'center' },
  { label: '视角名称', prop: 'viewName', align: 'center' },
  { label: '是否默认', prop: 'isDefault', slot: 'tagBlock', align: 'center' },
  { label: '经度（x）', slot: 'x', align: 'center' },
  { label: '纬度（y）', slot: 'y', align: 'center' },
  { label: '高度（z）', slot: 'z', align: 'center' },
  { label: '倾斜角', prop: 'inclination', align: 'center', width: '220' },
  { label: '旋转角', prop: 'rotation', align: 'center' },
  { label: '距离', prop: 'distance', align: 'center' },
  {
    label: '操作',
    prop: '',
    slot: 'default',
    fixed: 'right',
    width: '190',
    align: 'right',
  },
]
const pointType_table_config = [
  { label: '标注名称', align: 'center', prop: 'typeName' },
  { label: '标注编码', align: 'center', prop: 'typeCode' },
  { label: '标注图标', slot: 'icon', align: 'center', prop: 'icon' },
  { label: '描述', align: 'center', prop: 'description' },
  { label: '操作', prop: '', slot: 'default', fixed: 'right', align: 'right' },
]

const beaconManagement_table_config = [
  { label: '标注名称', prop: 'markName', align: 'center' },
  { label: '标注种类', prop: 'markType', align: 'center' },
  { label: '标注值', prop: 'markValue', align: 'center' },
  { label: '所在位置', prop: 'locationDesc', align: 'center' },
  { label: '绘制种类', prop: 'drawType', slot: 'drawType', align: 'center' },
  { label: '建筑名称', prop: 'buildName', align: 'center' },
  { label: '楼层', prop: 'floorId', align: 'center' },
  { label: '备注', prop: 'remark', align: 'center' },
  {
    label: '操作',
    prop: '',
    slot: 'default',
    fixed: 'right',
    width: '190',
    align: 'right',
  },
]

// 文本+图标 - 工厂函数，确保 jsmap 已加载后再调用
function createJSIconTextMarker() {
  if (!window.jsmap) {
    console.error('❌ jsmap 未加载，无法创建 JSIconTextMarker')
    throw new Error('jsmap is not loaded yet')
  }
  return {
    id: 'iconTextTest',
    position: {},
    floorId: 1,
    image: '',
    text: '所在位置',
    font: 'bold 10px sans-serif',
    fontColor: '#fff645',
    imageHeight: 32,
    imageWidth: 32,
    fontStrokeColor: '#1f0fdd',
    fontStrokeWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backgroundRadius: 1,
    backgroundStrokeColor: 'rgba(0,0,0,0.3)',
    backgroundStrokeWidth: 1,
    iconTextType: window.jsmap.JSIconTextType.TOPTEXT_BOTTOMICON,
    allowPicking: true,
    // displayCondition: new window.jsmap.JSDisplayCondition(0.0, 1000),
    // nearFarScale: new window.jsmap.JSNearFarScale(0.0, 10.0, 500, 0.5),
    depthTest: true,
    offset: window.jsmap.JSControlPosition.CENTER_BOTTOM,
    show: true,
    properties: {
      name: 'iconText',
    },
  }
}

function createJSPointMarker() {
  if (!window.jsmap) {
    console.error('❌ jsmap 未加载，无法创建 JSPointMarker')
    throw new Error('jsmap is not loaded yet')
  }
  return {
    color: '#00FF00',
    size: 5,
    position: {},
    floorId: 1,
    outlineColor: '#CD5C5C',
    outlineWidth: 2,
    depthTest: true,
    show: true,
    alwaysShow: true,
    allowPicking: true,
    properties: {
      type: 0,
    },
  }
}

function createJSLineMarker() {
  if (!window.jsmap) {
    console.error('❌ jsmap 未加载，无法创建 JSLineMarker')
    throw new Error('jsmap is not loaded yet')
  }
  return {
    id: 'line',
    position: [],
    width: 5,
    floorId: 1,
    color: '#3cff2e',
    strokeColor: '#f2ff50',
    strokeWidth: 1,
    lineType: window.jsmap.JSLineType.DASH,
    allowPicking: true,
    displayCondition: new window.jsmap.JSDisplayCondition(0.0, 1000),
    smooth: true,
    show: true,
    properties: {
      test: 0,
    },
  }
}

function createJSPolygonMarker() {
  if (!window.jsmap) {
    console.error('❌ jsmap 未加载，无法创建 JSPolygonMarker')
    throw new Error('jsmap is not loaded yet')
  }
  return {
    id: 'polygon',
    position: [],
    floorId: 1,
    color: 'rgba(169, 117, 244, 0.5)',
    strokeColor: '#2bff1d',
    allowPicking: true,
    displayCondition: new window.jsmap.JSDisplayCondition(10, 1000),
    properties: {
      test: 3,
    },
  }
}

export default {
  viewPoint_table_config,
  pointType_table_config,
  beaconManagement_table_config,
  createJSIconTextMarker,
  createJSPointMarker,
  createJSLineMarker,
  createJSPolygonMarker,
}
