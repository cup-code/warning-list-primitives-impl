import { tableListConfig } from '@link/shared-ui/forewarning-management/warning-list/table-config'
import { WarningListConfig } from '@link/shared-ui/forewarning-management/warning-list/warning-table-config'

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

const cardSirenColumns = [
  {
    label: '定位卡号',
    prop: 'sn',
    minWidth: 140,
  },
  {
    label: '关联声光报警器',
    prop: 'sirenNameText',
    slot: 'sirenNameText',
    minWidth: 200,
  },
  {
    label: '操作',
    prop: 'operation',
    width: 180,
    align: 'right',
    fixed: 'right',
    slot: 'operation',
  },
]

export {
  cameraListConfig,
  machineListConfig,
  tableListConfig,
  WarningListConfig,
  cardSirenColumns,
}
