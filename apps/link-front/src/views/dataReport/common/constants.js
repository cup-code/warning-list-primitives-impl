/**
 * 导出数据类型常量
 * @type {[{children: [{children: [{label: string, value: string},{label: string, value: string},{label: string, value: string},{label: string, value: string},{label: string, value: string},null], label: string, value: string},{children: [{label: string, value: string},{label: string, value: string},{label: string, value: string},{label: string, value: string},{label: string, value: string},null], label: string, value: string}], label: string, value: string}]}
 */
export const dataTypes = [
  {
    value: 'kde',
    label: '危险化学品企业双重预防机制数据上报',
    children: [
      {
        value: 'lin_shu',
        label: '临沭公司',
        children: [
          { value: 'Dpm_RiskUnit', label: '1.安全风险单元数据' },
          { value: 'Dpm_RiskEvent', label: '2.安全风险事件数据' },
          { value: 'Dpm_ControlMeasures', label: '3.安全风险管控措施数据' },
          { value: 'Dpm_MeasuresTask', label: '4.隐患排查任务数据' },
          { value: 'Dpm_MeasuresTaskRecord', label: '5.隐患排查记录数据' },
          { value: 'Dpm_DangerInvestigation', label: '6.隐患信息数据' },
          // {value: 'Test_Job', label: '7.测试'},
        ],
      },
      {
        value: 'ping_yuan',
        label: '平原公司',
        children: [
          { value: 'Dpm_RiskUnit', label: '1.安全风险单元数据' },
          { value: 'Dpm_RiskEvent', label: '2.安全风险事件数据' },
          { value: 'Dpm_ControlMeasures', label: '3.安全风险管控措施数据' },
          { value: 'Dpm_MeasuresTask', label: '4.隐患排查任务数据' },
          { value: 'Dpm_MeasuresTaskRecord', label: '5.隐患排查记录数据' },
          { value: 'Dpm_DangerInvestigation', label: '6.隐患信息数据' },
          // {value: 'Test_Job', label: '7.测试'},
        ],
      },
    ],
  },
]

/**
 * 山东数据交换上报数据表格列头
 */
const kdeListColumnHeaders = [
  {
    dataType: 'Dpm_RiskUnit',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '危险源编码',
        width: '105px',
        prop: 'hazardCode',
      },
      {
        label: '危险源责任部门',
        width: '',
        prop: 'hazardDep',
      },
      {
        label: '危险源责任部门负责人姓名',
        width: '110px',
        prop: 'hazardLiablePerson',
      },
      {
        label: '风险单元名称',
        width: '',
        prop: 'riskUnitName',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "width": "",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "修改时间",
      //   "width": "",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "width": "",
      //   "prop": "updateBy"
      // }
    ],
  },
  {
    dataType: 'Dpm_RiskEvent',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '风险分析单元编号',
        width: '',
        prop: 'riskUnitId',
      },
      {
        label: '风险事件名称',
        width: '',
        prop: 'riskEventName',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "width": "",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "修改时间",
      //   "width": "",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "width": "",
      //   "prop": "updateBy"
      // }
    ],
  },
  {
    dataType: 'Dpm_ControlMeasures',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '风险事件编号',
        width: '',
        prop: 'riskEventId',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '管控方式',
        width: '',
        prop: 'dataSrc',
      },
      {
        label: '措施描述',
        width: '',
        prop: 'riskMeasureDesc',
      },
      {
        label: '隐患排查内容',
        width: '',
        prop: 'troubleshootContent',
      },
      {
        label: '管控措施分类1',
        width: '',
        prop: 'classify1',
      },
      {
        label: '管控措施分类2',
        width: '',
        prop: 'classify2',
      },
      {
        label: '管控措施分类3',
        width: '',
        prop: 'classify3',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "width": "",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "修改时间",
      //   "width": "",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "width": "",
      //   "prop": "updateBy"
      // }
    ],
  },
  {
    dataType: 'Dpm_MeasuresTask',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '管控措施编号',
        width: '',
        prop: 'riskMeasureId',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '隐患排查内容',
        width: '',
        prop: 'troubleshootContent',
      },
      {
        label: '巡检周期',
        width: '',
        prop: 'checkCycle',
      },
      {
        label: '巡检周期单位',
        width: '',
        prop: 'checkCycleUnit',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "修改时间",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "prop": "updateBy"
      // }
    ],
  },
  {
    dataType: 'Dpm_MeasuresTaskRecord',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '隐患排查任务编号',
        width: '',
        prop: 'checkTaskId',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '排查时间',
        width: '',
        prop: 'checkTime',
      },
      {
        label: '排查结果',
        width: '',
        prop: 'checkStatus',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "创建人手机号",
      //   "prop": "createByMobile"
      // },
      // {
      //   "label": "修改时间",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "prop": "updateBy"
      // },
      // {
      //   "label": "修改人手机号",
      //   "prop": "updateByMobile"
      // }
    ],
  },
  {
    dataType: 'Dpm_DangerInvestigation',
    tableColumns: [
      {
        label: '创建时间',
        width: '135px',
        prop: 'createDate',
      },
      {
        label: '是否上报',
        width: '70px',
        prop: 'isPermission',
      },
      {
        label: '上报状态',
        width: '80px',
        prop: 'isReported',
      },
      {
        label: '危险源编码',
        width: '105px',
        prop: 'hazardCode',
      },
      {
        label: '管控措施编号',
        width: '',
        prop: 'riskMeasureId',
      },
      {
        label: '隐患排查记录编号',
        width: '',
        prop: 'checkRecordId',
      },
      {
        label: '企业编码',
        width: '90px',
        prop: 'companyCode',
      },
      {
        label: '隐患名称',
        width: '',
        prop: 'dangerName',
      },
      {
        label: '隐患等级',
        width: '',
        prop: 'dangerLevel',
      },
      {
        label: '登记时间',
        width: '',
        prop: 'registTime',
      },
      {
        label: '登记人姓名',
        width: '',
        prop: 'registrant',
      },
      {
        label: '隐患来源',
        width: '',
        prop: 'dangerSrc',
      },
      {
        label: '隐患治理类型',
        width: '',
        prop: 'dangerManageType',
      },
      {
        label: '隐患类型',
        width: '',
        prop: 'hazardDangerType',
      },
      {
        label: '隐患描述',
        width: '',
        prop: 'dangerDesc',
      },
      {
        label: '隐患原因',
        width: '',
        prop: 'dangerReason',
      },
      {
        label: '控制措施',
        width: '',
        prop: 'controlMeasures',
      },
      {
        label: '资金（单位：万元）',
        width: '',
        prop: 'cost',
      },
      {
        label: '整改责任人',
        width: '',
        prop: 'liablePerson',
      },
      {
        label: '隐患治理期限',
        width: '',
        prop: 'dangerManageDeadline',
      },
      {
        label: '验收人姓名',
        width: '',
        prop: 'checkAcceptPerson',
      },
      {
        label: '验收时间',
        width: '',
        prop: 'checkAcceptTime',
      },
      {
        label: '验收情况',
        width: '',
        prop: 'checkAcceptComment',
      },
      {
        label: '隐患状态',
        width: '',
        prop: 'dangerState',
      },
      {
        label: '删除状态',
        width: '70px',
        prop: 'deleted',
      },
      // ,
      // {
      //   "label": "创建人姓名",
      //   "prop": "createBy"
      // },
      // {
      //   "label": "修改时间",
      //   "prop": "updateDate"
      // },
      // {
      //   "label": "修改人姓名",
      //   "prop": "updateBy"
      // }
    ],
  },
]

/**
 * 山东数字集成上报数据表格列头
 * @type {*[]}
 */
const kdiListColumnHeaders = []

/**
 * 导出数据表格动态列头常量
 * @type {{kdi: *[], kde: [{tableColumns: [{prop: string, label: string},{prop: string, label: string},{prop: string, label: string},{prop: string, label: string},{prop: string, label: string},null,null,null,null,null,null], dataType: string},{tableColumns: *[], dataType: string}]}}
 */
export const tableDynamicColHeaders = {
  kde: kdeListColumnHeaders,
  kdi: kdiListColumnHeaders,
}

/**
 * 时间间隔范围类型
 * @type {{oneMonth: number, today: number, threeMonth: number, oneWeek: number}}
 */
export const dateTimeRangeTypes = {
  today: 1,
  oneWeek: 2,
  oneMonth: 3,
  threeMonth: 4,
}

/**
 * 任务操作类型
 * @type {{startup: number, trigger: number, shutdown: number, checkJobStatus: number}}
 */
export const jobOperationTypes = {
  startup: 1,
  shutdown: 2,
  trigger: 3,
  checkJobStatus: 4,
}
