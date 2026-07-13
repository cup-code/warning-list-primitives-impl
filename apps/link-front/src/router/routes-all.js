import Layout from '@/layout'

export default [
  // 培训考试  end
  {
    path: '/',
    redirect: '/login',
  },
  // 用户登录
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/one'), // 新的登录页
    hidden: true,
  },
  // 自动登录
  {
    name: 'autoLogin',
    path: '/autoLogin',
    component: () => import('@/views/login/autoLogin'), // 自动登录
    hidden: true,
  },
  // 用户注册
  {
    name: 'register',
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true,
  },
  // 租户登录
  {
    name: 'tenantLogin',
    path: '/tenantLogin',
    component: () => import('@/views/login/tenant'), // 租户登录页
    hidden: true,
  },
  {
    path: '/fireControlLocal',
    hidden: true,
    component: Layout,
    children: [{
      path: 'backSheet/:workOrderCode',
      name: 'backSheet',
      component: () => import('@/views/fireControl/back.vue'),
      meta: {
        title: '工单回执',
      },
    }],
  },
  // 排污许可证-分享
  {
    path: '/showEmissionPermit',
    hidden: true,
    component: () => import('@/views/proEnv/sameTime3/emissionPermit.vue'),
  },


  // 培训考试  begin
  // 在线考试
  {
    path: '/courseAndTest/onlineExam/exam',
    hidden: true,
    component: () => import('link-angel-edu/lib/online-exam-detail/index.js'),
  },
  // 考试记录
  {
    path: '/courseAndTest/recordsExam/exam',
    hidden: true,
    component: () => import('link-angel-edu/lib/records-exam-detail/index.js'),
  },
  // 在线培训
  {
    path: '/courseAndTest/onlineTrain/train',
    hidden: true,
    component: () => import('link-angel-edu/lib/online-train-detail/index.js'),
  },

  // 租户申请
  {
    name: 'tenantRegister',
    path: '/tenantRegister',
    component: () => import('@/views/register/tenant'), // 租户申请页
    hidden: true,
  },

  // 404
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
  },
  // 推送通知书给当事人
  {
    path: '/accidentManage/workInjuryManage/notice',
    component: () => import('@/views/accidentManage/workInjuryManage/notice'),
    hidden: true,
  },

  // 帮助文档
  {
    name: 'help',
    path: '/help',
    component: () => import('@/views/help/index'), // 帮助文档
    hidden: true,
  },
  // 个人中心
  {
    hidden: true,
    path: '/userCenter',
    component: Layout,
    children: [{
      path: 'index',
      name: 'userCenter',
      component: () => import('@/views/userCenter/index'), // 个人中心
      meta: {
        title: '个人中心',
        icon: 'el-icon-user',
      },
    }],
  },
  // 详情
  {
    hidden: true,
    path: '/detail',
    component: Layout,
    children: [{
      path: 'product/:id',
      name: 'productDetail',
      component: () => import('@/views/detail/product'),
      meta: {
        title: '产品详情',
      },
    }, {
      path: 'device/:pid/:did/:dcd',
      name: 'deviceDetail',
      component: () => import('@/views/detail/device'),
      meta: {
        title: '终端详情',
      },
    }, {
      path: 'danger/:id/:method',
      name: 'dangerSource',
      component: () => import('@/views/majorHazard/danSouAnqi-components/dangerSourceDetail'),
      meta: {
        title: '重大危险源详情',
      },
    }, {
      path: 'important/:id/:method',
      name: 'importantSource',
      component: () => import('@/views/majorHazard/danSouAnqi-components/importantSourceDetail'),
      meta: {
        title: '重要危险源详情',
      },
    }, {
      path: 'asset/:did/:method', // 接收两个参数：设备id和模式，模式判断是新增还是修改
      name: 'assetDetail',
      component: () => import('@/views/detail/asset'),
      meta: {
        title: '设备档案',
      },
    }, {
      path: 'inspectionPlanDetail/:id/:method', // 接收两个参数：计划id和模式，模式判断是新增还是修改
      name: 'inspectionPlanDetail',
      component: () => import('@/views/detail/inspectionPlanDetail'),
      meta: {
        title: '计划详情',
      },
    }, {
      path: 'yxInspectionRecordDetail/:id', // 智能巡检V0.3 巡检记录详情
      name: 'yxInspectionRecordDetail',
      component: () => import('@/views/yxInspection/InspectionRecordDetail'),
      meta: {
        title: '巡检记录详情',
      },
    }, {
      path: 'yxInspectionPlanDetail/:id/:method', // 智能巡检V0.3 巡检计划详情
      name: 'yxInspectionPlanDetail',
      component: () => import('@/views/yxInspection/InspectionPlanDetail'),
      meta: {
        title: '巡检计划详情',
      },
    },
    {
      path: '/dev/stationManagement/stationInfo',
      name: 'stationInfo',
      component: () => import('@/views/dev/stationManagement/stationInfo'),
      meta: {
        title: '站点信息',
      },
    },
    //巡检报告
    {
      path: '/yxInspection/inspectionReport',
      name: 'inspectionReport',
      component: () => import('@/views/yxInspection/InspectionReport.vue'),
      meta: {
        title: '巡检报告',
      },
    },
    // {
    //   path: 'changeDetail/:id/:method/', // 接收两个参数：申请id、模式，模式判断是新增还是修改
    //   name: 'changeDetail',
    //   component: () => import('@/views/detail/changeDetail'),
    //   meta: {
    //     title: '变更详情'
    //   }
    // },
    // 变更管理
    {
      name: 'changeManagement',
      path: '/changeManagement',
      hidden: true,
      component: () => import('link-angel-change-management/lib/change-detail/index.js'), // 发布后路径
    }, {
      path: 'inspectionRecordDetail/:id', // 接收一个参数：巡检记录的id
      name: 'inspectionRecordDetail',
      component: () => import('@/views/detail/inspectionRecordDetail'),
      meta: {
        title: '巡检详情',
      },
    }, {
      path: 'maintenancePlanDetail', // 接收一个参数：维保计划的id
      name: 'maintenancePlanDetail',
      component: () => import('@/views/detail/maintenancePlanDetail'),
      meta: {
        title: '维保计划详情',
      },
    }, {
      path: 'rule/:id',
      name: 'ruleDetail',
      component: () => import('@/views/detail/rule'),
      meta: {
        title: '规则配置',
      },
    }, {
      path: 'ruleAnqi/:id',
      name: 'ruleAnqiDetail',
      component: () => import('@/views/detail/ruleAnqi'),
      meta: {
        title: '规则配置',
      },
    }, {
      path: 'mapView/:id',
      name: 'mapViewDetail',
      component: () => import('@/views/detail/mapView'),
      meta: {
        title: '地图预览',
      },
    }, {
      path: 'mapEdit/:id',
      name: 'mapEditDetail',
      component: () => import('@/views/detail/mapEdit'),
      meta: {
        title: '地图编辑',
      },
    }, {
      path: 'checkProjectDetail',
      name: 'checkProjectDetail',
      component: () => import('@/views/detail/checkProject'),
      meta: {
        title: '巡检详情',
      },
    }, {
      path: 'maintenanceProjectDetail',
      name: 'maintenanceProjectDetail',
      component: () => import('@/views/detail/maintenanceProject'),
      meta: {
        title: '保养详情',
      },
    }, {
      path: 'specialEquipmentDetail',
      name: 'specialEquipmentDetail',
      component: () => import('@/views/detail/specialEquipmentDetail'),
      meta: {
        title: '特种设备详情',
      },
    }, {
      path: 'specialEquipmentWeeklyReportTemplateDetail',
      name: 'specialEquipmentWeeklyReportTemplateDetail',
      component: () => import('@/views/detail/specialEquipmentWeeklyReportTemplateDetail'),
      meta: {
        title: '特种设备周报模板详情',
      },
    }, {
      path: 'specialEquipmentWeeklyReportThisWeekRecordDetail',
      name: 'specialEquipmentWeeklyReportThisWeekRecordDetail',
      component: () =>
        import('@/views/specialEquipment/weeklyReport/components/thisWeekReportRecordList'),
      meta: {
        title: '特种设备周报本周记录详情',
      },
    }, {
      path: 'userDetail',
      name: 'userDetail',
      component: () => import('@/views/detail/userDetail'),
      meta: {
        title: '用户信息一人一档',
      },
    },
    /* {
    path: 'mapView/:id',
    name: 'mapViewDetail',
    component: () =>
      import('@/views/detail/mapView'),
    meta: {
      title: '地图预览'
    }
  },
  {
    path: 'mapEdit/:id',
    name: 'mapEditDetail',
    component: () =>
      import('@/views/detail/mapEdit'),
    meta: {
      title: '地图编辑'
    }
  }, */
    // 评价管理-安全员考评台账-跳转隐患台账页面
    {
      path: 'dangerBookList',
      name: 'dangerBookList',
      component: () => import('@/views/doubleDefense/shandong/safeCheck/safeBook'),
      meta: {
        title: '隐患台账',
      },
    },
    // 评价管理-安全员考评台账-跳转变更管理页面
    {
      path: 'changeApplicationList',
      name: 'changeApplicationList',
      hidden: true,
      component: () => import('link-angel-change-management/lib/change-request/index.js'),
      // import('link-angel-change-management/src/pages/changeRequest/index.vue'),
      meta: {
        title: '变更申请',
      },
    },
    // 评价管理：跳转特种作业证照页面
    {
      path: 'safetCertificate',
      name: 'safetCertificate',
      hidden: true,
      component: () => import('@/views/baseModule/certificateManager/safeManager'),
      // import('link-angel-change-management/src/pages/changeRequest/index.vue'),
      meta: {
        title: '安全证照',
      },
    },
    // 评价管理-安全员考评台账-跳转随手拍页面
    {
      path: 'fastReportList',
      name: 'fastReportList',
      component: () => import('@/views/doubleDefense/shandong/safeCheck/fastReportList'),
      meta: {
        title: '随手拍清单',
      },
    },
    // 评价管理-指标对比分析-跳转事故台账页面
    {
      path: 'machineAccount',
      name: 'machineAccount',
      component: () => import('@/views/accidentManage/machineAccount'),
      meta: {
        title: '事故台账',
      },
    },
    // 评价管理-指标对比分析-跳转应急管理：演练记录页面
    {
      path: 'drillRecord',
      name: 'drillRecord',
      component: () => import('@/views/contingencyManage/drillRecord'),
      meta: {
        title: '演练记录',
      },
    },
    // 评价管理-指标对比分析-跳转特殊作业台账页面
    {
      path: 'specialWorkList',
      name: 'specialWorkList',
      component: () => import('link-angel-special-operation/lib/special-book/index.js'),
      // component: () => import('link-angel-special-operation/src/pages/specialBook/index.vue'),

      meta: {
        title: '特殊作业台账',
      },
    },
    // 三违考核统计台账--跳转三违考核列表页面
    {
      path: 'threeViolationList',
      name: 'threeViolationList',
      component: () => import('@/views/rewardAssessment/threeViolation/list'),
      meta: {
        title: '三违考核列表',
      },
    }, {
      path: 'threeViolationExecuteList',
      name: 'threeViolationExecuteList',
      component: () => import('@/views/rewardAssessment/threeViolation/executeList'),
      meta: {
        title: '考核执行列表',
      },
    },
    // 安全奖励统计台账--跳转安全奖励列表页面
    {
      path: 'safeRewardList',
      name: 'safeRewardList',
      component: () => import('@/views/rewardAssessment/safeReward/list'),
      meta: {
        title: '安全奖励列表',
      },
    }, {
      path: 'safeRewardExecuteList',
      name: 'safeRewardExecuteList',
      component: () => import('@/views/rewardAssessment/safeReward/executeList'),
      meta: {
        title: '奖励执行列表',
      },
    },
    // 教育培训
    // 培训计划
    {
      path: '/trainPlan',
      name: 'trainPlan',
      component: () => import('link-angel-edu/lib/train-plan/index.js'),
    },
    // 周会管理
    {
      path: '/weeklyMeetingManagement',
      name: 'weeklyMeetingManagement',
      component: () => import('link-angel-edu/lib/weekly-meeting-management/index.js'),
    },
    // 周会任务
    {
      path: '/weeklyMeetingTask',
      name: 'weeklyMeetingTask',
      component: () => import('link-angel-edu/lib/weekly-meeting-task/index.js'),
    },
    // 培训任务台账
    {
      path: '/trainTaskBook',
      name: 'trainTaskBook',
      component: () => import('link-angel-edu/lib/train-task-book/index.js'),
    },
    // 体系评审 begin
    // 内审穿透页
    {
      path: 'systemReview/internalStrike',
      name: 'systemReviewInternalStrike',
      component: () => import('link-angel-system-review/lib/internal-strike/index.js'),
      props: true,
    },
    // 外审穿透页
    {
      path: 'systemReview/externalStrike',
      name: 'systemReviewExternalStrike',
      component: () => import('link-angel-system-review/lib/external-strike/index.js'),
      props: true,
    },
    // 安全生产标准穿透页
    {
      path: 'systemReview/safetyStandardStrike',
      name: 'systemReviewSafetyStandardStrike',
      component: () => import('link-angel-system-review/lib/safety-standard-strike/index.js'),
      props: true,
    },
    // 内审计划审核（首页代办跳转）
    {
      path: 'systemReview/internalAuditPlanCheck',
      name: 'systemReviewInternalAuditPlanCheck',
      component: () => import('link-angel-system-review/lib/internal-audit-plan-check/index.js'),
      props: true,
    },
    // 内审发现项（首页代办跳转）
    {
      path: 'systemReview/internalAuditDiscovery',
      name: 'systemReviewInternalAuditDiscovery',
      component: () => import('link-angel-system-review/lib/internal-audit-discovery/index.js'),
      props: true,
    },
    // 外审发现项（首页代办跳转）
    {
      path: 'systemReview/externalAuditDiscovery',
      name: 'systemReviewExternalAuditDiscovery',
      component: () => import('link-angel-system-review/lib/external-audit-discovery/index.js'),
      props: true,
    },
    // 管理评审计划审核（首页代办跳转）
    {
      path: 'systemReview/managementAuditPlanCheck',
      name: 'systemReviewManagementAuditPlanCheck',
      component: () =>
        import('link-angel-system-review/lib/management-audit-plan-check/index.js'),
      props: true,
    },
    // 管理评审报告审核（首页代办跳转）
    {
      path: 'systemReview/managementAuditReportCheck',
      name: 'systemReviewManagementAuditReportCheck',
      component: () =>
        import('link-angel-system-review/lib/management-audit-report-check/index.js'),
      props: true,
    },
    // 外部检查（安环部）
    {
      path: '/externalInspection',
      name: 'externalInspection',
      component: () => import('link-angel-system-review/lib/external-inspection/index.js'),
    },
    // 体系评审 end
    // 集团报表 begin
    // 月份费用明细
    {
      path: 'safetyDevote/expenseStrike',
      name: 'safetyDevoteExpenseStrike',
      component: () => import('link-angel-group-report/lib/expense-strike/index.js'),
      props: true,
    },
    // 集团报表 end
    // 文档管理
    {
      // 审批待办
      path: 'documentReviewList',
      name: 'documentReviewList',
      component: () => import('@/views/fileManager/reviewList'),
      meta: {
        title: '文档评审列表',
      },
    }, {
      // 工单处理列表
      path: 'workReportList',
      name: 'workReportList',
      component: () => import('@/views/eam/workManage/workReport'),
      meta: {
        title: '文档评审列表',
      },
    }, {
      // 驳回，给申请人发送待办。申请人再编辑待办任务
      path: 'documentList',
      name: 'documentList',
      component: () => import('@/views/fileManager/documentList'),
      meta: {
        title: '文档管理台账',
      },
    }, {
      path: 'warningDetail',
      name: 'warningDetail',
      component: () => import('@/views/detail/warningDetail'),
      meta: {
        title: '预警详情',
      },
    }],
  },
  // 智能巡检V0.3
  {
    path: '/yxInspection',
    component: Layout,
    hidden: true,
    meta: {
      title: '智能巡检',
      icon: 'el-icon-video-camera-solid',
    },
    children: [
      {
        path: 'exceptionRecord',
        name: 'ExceptionRecord',
        component: () => import('@/views/yxInspection/ExceptionRecord'),
        meta: {
          title: '异常记录',
        },
      },
      {
        path: 'urgentRecord',
        name: 'UrgentRecord',
        component: () => import('@/views/yxInspection/UrgentRecord'),
        meta: {
          title: '紧急记录',
        },
      },
      {
        path: 'terminalList',
        name: 'TerminalList',
        component: () => import('@/views/yxInspection/TerminalList'),
        meta: { title: '终端列表' },
      },
      {
        path: 'inspectionMeeting',
        name: 'InspectionMeeting',
        component: () => import('@/views/yxInspection/InspectionMeeting.vue'),
        meta: { title: '远程指导' },
      },
    ],
  },
  // 组态
  {
    name: 'editor',
    path: '/editor',
    component: () => import('link-angel-editor/lib/main/index.js'),
    hidden: true,
  },
  // 蓝工的3d地图
  {
    name: 'map3d',
    path: '/map3d',
    component: () => import('@/views/cesium3d/newMaterial'),
    hidden: true,
  },
  // #region 流程相关
  {
    path: '/flowable',
    component: Layout,
    hidden: true,
    meta: {
      title: '流程应用',
      icon: 'el-icon-video-camera-solid',
    },
    children: [{
      hidden: true,
      path: 'task/TaskFormDetail',
      component: () => import('@/views/flowable/task/TaskFormDetail'),
      name: 'TaskFormDetail',
      meta: {
        title: '详情',
        icon: 'el-icon-document',
      },
    }, {
      hidden: true,
      path: 'task/TaskForm',
      component: () => import('@/views/flowable/task/TaskForm'),
      name: 'TaskForm',
      meta: {
        title: '详情',
        icon: 'el-icon-document',
      },
    }, {
      hidden: true,
      path: 'task/TaskFormEdit',
      component: () => import('@/views/flowable/task/TaskFormEdit'),
      name: 'TaskFormEdit',
      meta: {
        title: '编辑',
        icon: 'el-icon-document',
      },
    }, {
      hidden: true,
      path: 'form/FormDefinitionJsonList',
      component: () => import('@/views/flowable/form/FormDefinitionJsonList'),
      name: 'FormDefinitionJsonList',
      meta: {
        title: '版本管理',
        icon: 'el-icon-document',
      },
    }],
  },

  // #region 动态表单
  {
    path: '/form',
    component: Layout,
    hidden: true,
    meta: {
      title: '动态表单',
      icon: 'el-icon-video-camera-solid',
    },
    children: [{
      hidden: true,
      path: 'generateList',
      component: () => import('@/views/form/GenerateList'),
      name: 'form-preview-list',
      meta: {
        title: '列表',
        icon: 'el-icon-document',
      },
    }, {
      hidden: true,
      path: 'generateList_DIY',
      component: () => import('@/views/form/GenerateList_DIY'),
      name: 'form-preview-list-diy',
      meta: {
        title: '列表',
        icon: 'el-icon-document',
      },
    }],
  },

  // 无菜单的 大屏和报表的 设计、预览
  {
    name: 'excelreportDesigner',
    path: '/excelreportDesigner',
    component: () => import('@/views/reportDesign/excelreport/designer'),
    hidden: true,
  },
  {
    name: 'excelreportViewer',
    path: '/excelreportViewer',
    component: () => import('@/views/reportDesign/excelreport/viewer'),
    hidden: true,
  },
  {
    name: 'bigscreenDesigner',
    path: '/bigscreenDesigner',
    component: () => import('@/views/reportDesign/bigscreen/designer'),
    hidden: true,
  },
  {
    name: 'bigscreenViewer',
    path: '/bigscreenViewer',
    component: () => import('@/views/reportDesign/bigscreen/viewer'),
    hidden: true,
  },
  {
    name: 'ForewarningManagement/videoPlay',
    path: '/ForewarningManagement/videoPlay',
    component: () => import('@/views/common-ui/videoPlay'),
    hidden: true,
  },

  // 分享
  {
    name: 'kyReport',
    path: '/kyReport/**/**',
    component: () => import('@/views/reportDesign/share'),
    hidden: true,
  },
]
