export default {
  list: [
    { label: '工单编号', prop: 'workOrderNum' },
    { label: '工单创建时间', prop: 'createdTime' },
    { label: '所属公司', prop: 'companyName' },
    { label: '所属部门', prop: 'departmentName' },
    // { label: '工单等级', prop: 'assetName' },
    // { label: '紧急程度', prop: 'assetNo' },
    // { label: '当前节点', prop: 'assetPrincipalId', align: 'left' },
    { label: '上报人员', prop: 'createdByName' },
    { label: '工单描述', prop: 'faultDesc', align: 'left' },
    { label: '工单状态', prop: 'orderStatus' },
    { label: '工单类型', prop: 'workOrderType' },
    { label: '工单更新时间', prop: 'updatedTime' },
    {
      label: '操作',
      prop: '',
      slot: 'default',
      align: 'right',
      fixed: 'right',
      width: '180px',
    },
  ],
  tabsList: [
    { label: '待办', name: '1' },
    { label: '我发起', name: '2' },
    { label: '经办', name: '3' },
  ],
  fliterList: [
    {
      label: '工单编号',
      prop: 'workOrderNum',
      component: 'FInput',
      placeholder: '请输入报修名称',
    },
    {
      label: '工单类型',
      prop: 'workOrderType',
      component: 'FSelection',
      options: [],
    },
    { label: '工单创建日期', prop: 'workTime', component: 'FPickerTime' },
  ],
}
