/**
 * 巡检项表格配置
 */
export const InspectionItemsTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '摄像头',
    prop: 'cameraName',
    width: 150,
    align: 'center',
  },
  {
    label: '巡检算法',
    prop: 'skills',
    align: 'left',
  },
  // {
  //   label: '排序',
  //   prop: 'sort',
  //   width: 80,
  //   align: 'center',
  // },
  {
    label: '创建时间',
    prop: 'createdTime',
    width: 180,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

/**
 * 巡检点表格配置
 */
export const InspectionPointTableConfig = [
  {
    label: '排序',
    prop: 'sortOrder',
    width: 80,
    align: 'center',
  },
  {
    label: '巡检点名称',
    prop: 'placeName',
    width: 150,
    align: 'center',
  },
  {
    label: '编号',
    prop: 'placeCode',
    width: 120,
    align: 'center',
  },
  {
    label: '位置',
    prop: 'placePosition',
    width: 150,
    align: 'center',
  },
  {
    label: '备注',
    prop: 'remarks',
    width: 150,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

/**
 * 巡检项表格配置
 */
export const SetItemsTableConfig = [
  {
    label: '排序号',
    prop: 'sortOrder',
    width: 80,
    align: 'center',
  },
  {
    label: '巡检类型',
    prop: 'typeName',
    width: 150,
    slot: 'typeName',
    align: 'center',
  },
  {
    label: '巡检项',
    prop: 'itemName',
    minWidth: 200,
    align: 'center',
    slot: 'itemName',
  },
  // {
  //   label: '排序号',
  //   prop: 'sortOrder',
  //   width: 120,
  //   align: 'center',
  //   slot: 'sortOrder',
  // },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]

/**
 * 巡检计划表格配置
 */
export const InspectionPlanTableConfig = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
  },
  {
    label: '计划名称',
    prop: 'planName',
    minWidth: 160,
    align: 'center',
  },
  {
    label: '计划编码',
    prop: 'planCode',
    minWidth: 140,
    align: 'center',
  },
  {
    label: '排序号',
    prop: 'sortOrder',
    width: 100,
    align: 'center',
  },
  {
    label: '备注',
    prop: 'remarks',
    minWidth: 180,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center',
  },
]
