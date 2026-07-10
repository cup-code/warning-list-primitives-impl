export const menuOptions = [
  {
    value: 'views/home/home',
    label: '主页',
    describe: '登录后首页',
  },
  {
    value: 'views/manage/menu',
    label: '菜单管理',
    describe: '超级管理员的菜单管理',
    children: [
      {
        value: 'manage_menu_add',
        label: '新增',
      },
      {
        value: 'manage_menu_modify',
        label: '修改',
      },
      {
        value: 'manage_menu_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/tenantMenu',
    label: '企业菜单',
    describe: '企业的菜单管理',
    children: [
      {
        value: 'manage_tenantMenu_add',
        label: '新增',
      },
      {
        value: 'manage_tenantMenu_modify',
        label: '修改',
      },
      {
        value: 'manage_tenantMenu_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/dict',
    label: '运营字典',
    describe: '运营字典：运营字典',
    children: [
      {
        value: 'manage_dict_add',
        label: '新增',
      },
      {
        value: 'manage_dict_modify',
        label: '修改',
      },
      {
        value: 'manage_dict_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/menu_config',
    label: '菜单配置',
    describe: '菜单配置',
    children: [
      {
        value: 'manage_menu_config',
        label: '配置',
      },
    ],
  },
  {
    value: 'views/manage/staffCertificate',
    label: '人员资格证书配置',
    describe: '人员资格证书配置',
  },
  {
    value: 'views/machineManage/scMachineList',
    label: '设备列表',
    describe: '容知设备预测运维：设备列表',
  },
  {
    value: 'views/machineManage/scWarningList',
    label: '设备报警列表',
    describe: '容知设备预测运维：设备报警列表',
  },
  {
    value: 'views/machineManage/robotMachineList',
    label: '机器人设备列表',
    describe: '天创机器人：机器人设备列表',
  },
  {
    value: 'views/machineManage/robotAlarmList',
    label: '机器人报警列表',
    describe: '天创机器人：机器人报警列表',
  },
  // 安全标准化
  {
    value: 'views/occupationalHealth/sanitation',
    label: '职业卫生三同时',
    describe: '职业健康管理：职业卫生三同时',
    children: [
      {
        value: 'sanitation_add',
        label: '新增',
      },
      {
        value: 'sanitation_view',
        label: '查看',
      },
      {
        value: 'sanitation_edit',
        label: '编辑',
      },
      {
        value: 'sanitation_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/occupationalDisease',
    label: '职业病危害因素分布图',
    describe: '职业健康管理：职业病危害因素分布图',
  },
  {
    value: 'views/occupationalHealth/hazardIdentification',
    label: '职业危害因素辨识',
    describe: '职业健康管理：职业危害因素辨识',
    children: [
      {
        value: 'hazard_identification_add',
        label: '新增',
      },
      {
        value: 'hazard_identification_derive',
        label: 'Excel导出',
      },
      {
        value: 'hazard_identification_template',
        label: '下载模板',
      },
      {
        value: 'hazard_identification_import',
        label: 'Excel导入',
      },
      {
        value: 'hazard_identification_view',
        label: '查看',
      },
      {
        value: 'hazard_identification_edit',
        label: '编辑',
      },
      {
        value: 'hazard_identification_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/monitoringReport',
    label: '职业危害因素监测报告',
    describe: '职业健康管理：职业危害因素监测报告',
    children: [
      {
        value: 'monitoring_report_add',
        label: '新增',
      },
      {
        value: 'monitoring_report_view',
        label: '查看',
      },
      {
        value: 'monitoring_report_edit',
        label: '编辑',
      },
      {
        value: 'monitoring_report_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/hazardDetection',
    label: '职业危害因素检测',
    describe: '职业健康管理：职业危害因素检测',
    children: [
      {
        value: 'hazard_detection_add',
        label: '新增',
      },
      {
        value: 'hazard_detection_derive',
        label: 'Excel导出',
      },
      {
        value: 'hazard_detection_template',
        label: '下载模板',
      },
      {
        value: 'hazard_detection_import',
        label: 'Excel导入',
      },
      {
        value: 'hazard_detection_view',
        label: '查看',
      },
      {
        value: 'hazard_detection_edit',
        label: '编辑',
      },
      {
        value: 'hazard_detection_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/healthPlan',
    label: '职业健康管理方案',
    describe: '职业健康管理：职业健康管理方案',
    children: [
      {
        value: 'health_plan_add',
        label: '新增',
      },
      {
        value: 'health_plan_derive',
        label: 'Excel导出',
      },
      {
        value: 'health_plan_template',
        label: '下载模板',
      },
      {
        value: 'health_plan_import',
        label: 'Excel导入',
      },
      {
        value: 'health_plan_view',
        label: '查看',
      },
      {
        value: 'health_plan_edit',
        label: '编辑',
      },
      {
        value: 'health_plan_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/unitManagementAccount',
    label: '第三方单位管理台账',
    describe: '职业健康管理：第三方单位管理台账',
    children: [
      {
        value: 'unit_managemen_account_add',
        label: '新增',
      },
      {
        value: 'unit_managemen_account_template',
        label: '下载模板',
      },
      {
        value: 'unit_managemen_account_import',
        label: 'Excel导入',
      },
      {
        value: 'unit_managemen_account_view',
        label: '查看',
      },
      {
        value: 'unit_managemen_account_edit',
        label: '编辑',
      },
      {
        value: 'unit_managemen_account_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/physicalExamination',
    label: '体检记录台账',
    describe: '职业健康管理：体检记录台账',
    children: [
      {
        value: 'physical_examination_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/examinationList',
    label: '体检记录列表',
    describe: '职业健康管理：体检记录列表',
    children: [
      {
        value: 'examination_list_add',
        label: '新增',
      },
      {
        value: 'examination_list_derive',
        label: 'Excel导出',
      },
      {
        value: 'examination_list_template',
        label: '下载模板',
      },
      {
        value: 'examination_list_import',
        label: 'Excel导入',
      },
      {
        value: 'examination_list_view',
        label: '查看',
      },
      {
        value: 'examination_list_edit',
        label: '编辑',
      },
      {
        value: 'examination_list_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/occupationalHealth/hotWork/daysStatistics',
    label: '高温作业天数统计',
    describe: '高温作业管理：高温作业天数统计',
  },
  {
    value: 'views/occupationalHealth/hotWork/environmentalSurvey',
    label: '高温作业环境调查',
    describe: '高温作业管理：高温作业环境调查',
  },
  {
    value: 'views/occupationalHealth/hotWork/workRecord',
    label: '高温作业记录',
    describe: '高温作业管理：高温作业记录',
  },
  {
    value: 'views/occupationalHealth/laborProtection/plan',
    label: '劳保防护用品计划',
    describe: '劳保防护用品:劳保防护用品计划',
  },
  {
    value: 'views/occupationalHealth/laborProtection/useRecord',
    label: '劳保领用记录',
    describe: '劳保防护用品:劳保领用记录',
  },

  // 企业管理
  {
    value: 'views/manage/company',
    label: '公司管理',
    describe: '公司管理',
    children: [
      {
        value: 'manage_company_add_first',
        label: '添加一级公司',
      },
      {
        value: 'manage_company_add_child',
        label: '添加子公司',
      },
      {
        value: 'manage_company_modify',
        label: '修改公司信息',
      },
      {
        value: 'manage_company_delete',
        label: '删除公司信息',
      },
    ],
  },
  {
    value: 'views/manage/role',
    label: '角色权限',
    describe: '角色的菜单和数据权限配置',
    children: [
      {
        value: 'manage_role_addRole',
        label: '新增角色',
      },
      {
        value: 'manage_role_addPerson',
        label: '角色添加人员',
      },
      {
        value: 'manage_role_modify',
        label: '修改角色',
      },
      {
        value: 'manage_role_delete',
        label: '删除角色',
      },
      {
        value: 'manage_role_deletePerson',
        label: '角色删除人员',
      },
    ],
  },
  {
    value: 'views/manage/depart',
    label: '组织架构',
    describe: '组织架构',
    children: [
      {
        value: 'manage_depart_add',
        label: '新增',
      },
      {
        value: 'manage_depart_modify',
        label: '修改',
      },
      {
        value: 'manage_depart_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/departGlobal',
    label: '组织架构(全局)',
    describe: '组织架构:租户下所有的组织架构树',
    children: [
      {
        value: 'manage_depart_global_add',
        label: '新增',
      },
      {
        value: 'manage_depart_global_modify',
        label: '修改',
      },
      {
        value: 'manage_depart_global_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/user',
    label: '用户管理',
    describe: '用户管理',
    children: [
      {
        value: 'manage_user_add',
        label: '新增',
      },
      {
        value: 'manage_user_modify',
        label: '修改',
      },
      {
        value: 'manage_user_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/userGlobal',
    label: '用户管理(全局)',
    describe: '用户管理: 租户下所有的用户',
    children: [
      {
        value: 'manage_user_global_add',
        label: '新增',
      },
      {
        value: 'manage_user_global_modify',
        label: '修改',
      },
      {
        value: 'manage_user_global_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/updateUserInfo',
    label: '用户同步管理',
    describe: '用户管理: 用户同步管理',
    children: [
      {
        value: 'manage_user_update',
        label: '同步更新',
      },
    ],
  },
  {
    value: 'views/manage/post',
    label: '岗位管理',
    describe: '岗位管理',
    children: [
      {
        value: 'manage_post_add',
        label: '新增岗位',
      },
      {
        value: 'manage_post_modify',
        label: '修改岗位',
      },
      {
        value: 'manage_post_delete',
        label: '删除岗位',
      },
    ],
  },
  {
    value: 'views/manage/qualification',
    label: '企业资质',
    describe: '企业资质',
    children: [
      {
        value: 'manage_qualification_add',
        label: '新增',
      },
      {
        value: 'manage_qualification_modify',
        label: '修改',
      },
      {
        value: 'manage_qualification_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/manage/webApp',
    label: '企业信息',
    describe: '企业信息',
  },
  {
    value: 'views/manage/saveServer',
    label: '服务器配置',
    describe: '服务器配置',
  },
  {
    value: 'views/manage/wechatMini',
    label: '微信小程序',
    describe: '微信小程序',
  },
  {
    value: 'views/manage/wechatPub',
    label: '企业微信配置',
    describe: '企业微信配置',
  },
  {
    value: 'views/manage/sms',
    label: '短信配置',
    describe: '企业管理：短信配置',
  },
  {
    value: 'views/manage/email',
    label: '邮箱配置',
    describe: '企业管理：邮箱配置',
  },
  {
    value: 'views/manage/log',
    label: '日志管理',
    describe: '日志管理',
  },
  {
    value: 'views/manage/tenantControl',
    label: '租户启停',
    describe: '租户启停',
  },
  {
    value: 'views/manage/viewPoint/ThreeDViewPoint',
    label: '三维设置',
    describe: '公司管理：三维设置',
  },
  {
    value: 'views/manage/viewPoint/pointType',
    label: '标注类型',
    describe: '公司管理：标注类型',
  },
  {
    value: 'views/manage/viewPoint/beaconManagement',
    label: '标注管理',
    describe: '公司管理：标注管理',
  },
  {
    value: 'views/genCode/TableList',
    label: '表单配置',
    describe: '表单配置',
    children: [
      {
        value: 'genCode_tableList_add',
        label: 'genCode_tableList_add',
      },
    ],
  },
  {
    value: 'views/genCode/DataBaseType', // 代码生成配置：字段类型
    label: '字段类型',
    describe: '代码生成配置：字段类型',
  },
  {
    value: 'views/genCode/JavaType', // 代码生成配置：Java类型
    label: 'Java类型',
    describe: '代码生成配置：Java类型',
  },
  {
    value: 'views/genCode/GenShowTypeList', // 代码生成配置：控件类型
    label: '控件类型',
    describe: '代码生成配置：控件类型',
  },
  {
    value: 'views/genCode/ValidateType', // 代码生成配置：验证类型
    label: '验证类型',
    describe: '代码生成配置：验证类型',
  },
  {
    value: 'views/genCode/QueryType', // 代码生成配置：查询类型
    label: '查询类型',
    describe: '代码生成配置：查询类型',
  },
  {
    value: 'views/genCode/CodeParam', // 代码生成配置：生成参数
    label: '生成参数',
    describe: '代码生成配置：生成参数',
  },
  {
    value: 'views/genCode/TemplateList', // 代码生成配置：模板管理
    label: '模板管理',
    describe: '代码生成配置：模板管理',
  },
  // 双预防-通用
  {
    value: 'views/doubleDefense/common/accidentType',
    label: '事故类型',
    describe: '双重预防：事故类型',
    children: [
      {
        value: 'accident_type_add',
        label: '新增事故类型',
      },
      {
        value: 'accident_type_modify',
        label: '修改事故类型',
      },
      {
        value: 'accident_type_delete',
        label: '删除事故类型',
      },
    ],
  },
  // {
  //   value: 'views/doubleDefense/common/safetySign',
  //   label: '安全标志',
  //   describe: '双重预防：安全标志'
  // },
  // 双预防: 风险分级管控
  {
    value: 'views/doubleDefense/shandong/riskControl/riskArea',
    label: '风险区域',
    describe: '双重预防(风险分级管控)：风险区域',
    children: [
      {
        value: 'risk_area_add',
        label: '新增风险区域',
      },
      {
        value: 'risk_area_view',
        label: '查看风险区域',
      },
      {
        value: 'risk_area_modify',
        label: '修改风险区域',
      },
      {
        value: 'risk_area_delete',
        label: '删除风险区域',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/riskControl/analyseUnit',
    label: '风险分析单元',
    describe: '双重预防(风险分级管控)：风险分析单元',
    children: [
      {
        value: 'analyse_unit_add',
        label: '新增风险分析单元',
      },
      {
        value: 'analyse_unit_view',
        label: '查看风险分析单元',
      },
      {
        value: 'analyse_unit_modify',
        label: '修改风险分析单元',
      },
      {
        value: 'analyse_unit_delete',
        label: '删除风险分析单元',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/riskControl/eventManage',
    label: '风险事件管理',
    describe: '双重预防(风险分级管控)：风险事件管理',
    children: [
      {
        value: 'event_manage_add',
        label: '新增风险事件',
      },
      {
        value: 'event_manage_view',
        label: '查看风险事件',
      },
      {
        value: 'event_manage_modify',
        label: '修改风险事件',
      },
      {
        value: 'event_manage_delete',
        label: '删除风险事件',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/riskControl/levelControl',
    label: '风险分级管控',
    describe: '双重预防(风险分级管控)：风险分级管控',
    children: [
      {
        value: 'level_control_view',
        label: '查看',
      },
      {
        value: 'level_control_edit',
        label: '管控',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/hiddenDanger/hiddenTask',
    label: '管控措施巡查任务',
    describe: '双重预防(风险分级管控)：管控措施巡查任务',
  },
  {
    value: 'views/doubleDefense/shandong/hiddenDanger/hiddenRecord',
    label: '管控措施巡查记录',
    describe: '双重预防(风险分级管控)：管控措施巡查记录',
  },
  // 双预防: 隐患排查治理
  {
    value: 'views/doubleDefense/shandong/safeCheck/safeModule',
    label: '排查内容库',
    describe: '双重预防(隐患排查治理)：排查内容库',
    children: [
      {
        value: 'safe_module_type_add',
        label: '新增排查内容类型',
      },
      {
        value: 'safe_module_type_modify',
        label: '编辑排查内容类型',
      },
      {
        value: 'safe_module_type_delete',
        label: '删除排查内容类型',
      },
      {
        value: 'safe_module_add',
        label: '新增排查内容',
      },
      {
        value: 'safe_module_view',
        label: '查看排查内容',
      },
      {
        value: 'safe_module_modify',
        label: '修改排查内容',
      },
      {
        value: 'safe_module_delete',
        label: '删除排查内容',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/safeCheck/safeTable',
    label: '隐患排查表',
    describe: '双重预防(隐患排查治理)：隐患排查表',
    children: [
      {
        value: 'safe_table_type_add',
        label: '新增排查表类型',
      },
      {
        value: 'safe_table_type_modify',
        label: '编辑排查表类型',
      },
      {
        value: 'safe_table_type_delete',
        label: '删除排查表类型',
      },
      {
        value: 'safe_table_add',
        label: '新增排查表',
      },
      {
        value: 'safe_table_view',
        label: '查看排查表',
      },
      {
        value: 'safe_table_modify',
        label: '修改排查表',
      },
      {
        value: 'safe_table_delete',
        label: '删除排查表',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/safeCheck/safePlan',
    label: '隐患排查计划',
    describe: '双重预防(隐患排查治理)：隐患排查计划',
    children: [
      {
        value: 'safe_plan_add',
        label: '新增隐患排查计划',
      },
      {
        value: 'safe_plan_stop',
        label: '停/启用隐患排查计划',
      },
      {
        value: 'safe_plan_view',
        label: '查看隐患排查计划',
      },
      {
        value: 'safe_plan_modify',
        label: '修改隐患排查计划',
      },
      {
        value: 'safe_plan_delete',
        label: '删除隐患排查计划',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/safeCheck/safeTask',
    label: '隐患排查任务',
    describe: '双重预防(隐患排查治理)：隐患排查任务',
    children: [
      {
        value: 'safe_task_view',
        label: '查看隐患排查任务详情',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/safeCheck/safeBook',
    label: '隐患台账',
    describe: '双重预防(隐患排查治理)：隐患台账',
    children: [
      {
        value: 'safe_book_export',
        label: '导出隐患台账',
      },
      {
        value: 'safe_book_view',
        label: '查看隐患详情',
      },
      {
        value: 'safe_book_recheck',
        label: '复核是否重复隐患',
      },
      {
        value: 'safe_book_history',
        label: '查看流转日志',
      },
      {
        value: 'safe_book_delete',
        label: '删除隐患记录',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/safeCheck/fastReportList',
    label: '随手拍清单',
    describe: '双重预防(隐患排查治理)：随手拍清单',
  },
  // {
  //   value: 'views/doubleDefense/shandong/safeCheck/safeCount',
  //   label: '安全治理统计',
  //   describe: '双重预防-山东：安全治理统计'
  // },
  // 双预防：两单四知卡
  {
    value: 'views/doubleDefense/hubei/billCard/billRiskLvCtrl',
    label: '安全风险分级管控清单',
    describe: '双重预防(两单四知卡)：安全风险分级管控清单',
  },
  {
    value: 'views/doubleDefense/hubei/billCard/billDangerCheck',
    label: '危害因素辨识排查清单',
    describe: '双重预防(两单四知卡)：危害因素辨识排查清单',
  },
  {
    value: 'views/doubleDefense/hubei/billCard/cardWorkDuty',
    label: '岗位职责卡',
    describe: '双重预防(两单四知卡)：岗位职责卡',
    children: [
      {
        value: 'card_work_duty_add',
        label: '新增岗位职责卡',
      },
      {
        value: 'card_work_duty_view',
        label: '查看岗位职责卡',
      },
      {
        value: 'card_work_duty_modify',
        label: '修改岗位职责卡',
      },
      {
        value: 'card_work_duty_delete',
        label: '删除岗位职责卡',
      },
    ],
  },
  {
    value: 'views/doubleDefense/hubei/billCard/cardRiskEva',
    label: '风险辨识卡',
    describe: '双重预防(两单四知卡)：风险辨识卡',
    children: [
      {
        value: 'card_risk_eva_add',
        label: '新增风险辨识卡',
      },
      {
        value: 'card_risk_eva_view',
        label: '查看风险辨识卡',
      },
      {
        value: 'card_risk_eva_modify',
        label: '修改风险辨识卡',
      },
      {
        value: 'card_risk_eva_delete',
        label: '删除风险辨识卡',
      },
    ],
  },
  {
    value: 'views/doubleDefense/hubei/billCard/cardEmergency',
    label: '应急处置卡',
    describe: '双重预防(两单四知卡)：应急处置卡',
    children: [
      {
        value: 'card_emergency_add',
        label: '新增应急处置卡',
      },
      {
        value: 'card_emergency_view',
        label: '查看应急处置卡',
      },
      {
        value: 'card_emergency_modify',
        label: '修改应急处置卡',
      },
      {
        value: 'card_emergency_delete',
        label: '删除应急处置卡',
      },
    ],
  },
  {
    value: 'views/doubleDefense/hubei/billCard/cardHandleRule',
    label: '操作规程卡',
    describe: '双重预防(两单四知卡)：操作规程卡',
    children: [
      {
        value: 'card_handle_rule_add',
        label: '新增操作规程卡',
      },
      {
        value: 'card_handle_rule_view',
        label: '查看操作规程卡',
      },
      {
        value: 'card_handle_rule_modify',
        label: '修改操作规程卡',
      },
      {
        value: 'card_handle_rule_delete',
        label: '删除操作规程卡',
      },
    ],
  },
  {
    value: 'views/doubleDefense/shandong/defenseCount/defenseCount',
    label: '双预防运行统计',
    describe: '双重预防：双预防运行统计',
  },
  {
    value: 'views/doubleDefense/shandong/defenseCount/departmentCount',
    label: '双预防部门运行情况统计',
    describe: '双重预防：部门运行情况统计',
  },
  {
    value: 'views/flowable/process/ModelList', // 流程设计
    label: '流程设计',
    describe: '流程管理：流程设计',
  },
  {
    value: 'views/flowable/extension/ConditionList', // 流程表达式
    label: '流程表达式',
    describe: '流程管理：流程表达式',
  },
  {
    value: 'views/flowable/extension/ButtonList', // 常用按钮
    label: '常用按钮',
    describe: '流程管理：常用按钮',
  },
  {
    value: 'views/flowable/extension/ActCategoryList', // 分类管理
    label: '分类管理',
    describe: '流程管理：分类管理',
  },
  {
    value: 'views/flowable/extension/ListenerList', // 流程监听器
    label: '流程监听器',
    describe: '流程管理：流程监听器',
  },
  {
    value: 'views/flowable/process/RunningList', // 未完成
    label: '未完成',
    describe: '流程监控：未完成',
  },
  {
    value: 'views/flowable/process/HistoryList', // 已完成
    label: '已完成',
    describe: '流程监控：已完成',
  },
  {
    value: 'views/flowable/task/TodoList', // 待办任务
    label: '待办任务',
    describe: '我的事务：待办任务',
  },
  {
    value: 'views/flowable/task/HistoryList', // 已办事项
    label: '已办事项',
    describe: '我的事务：已办事项',
  },
  {
    value: 'views/flowable/task/ProcessList', // 发起流程
    label: '发起流程',
    describe: '我的事务：发起流程',
  },
  {
    value: 'views/flowable/task/ApplyList', // 我发起的
    label: '我发起的',
    describe: '我的事务：我发起的',
  },
  {
    value: 'views/flowable/extension/FlowCopyList', // 抄送事项
    label: '抄送事项',
    describe: '我的事务：抄送事项',
  },
  {
    value: 'views/flowable/form/FormDefinitionList', // 流程表单
    label: '流程表单',
    describe: '流程表单',
  },
  {
    value: 'views/form/MakeFormList', // 表单设计器
    label: '表单设计器',
    describe: '动态表单：表单设计器',
  },
  {
    value: 'views/dev/product',
    label: '产品管理',
    describe: '终端管理：产品管理',
  },
  {
    value: 'views/dev/productDistribution',
    label: '产品分配',
    describe: '终端管理：产品分配',
  },
  {
    value: 'views/dev/group',
    label: '终端分组',
    describe: '终端管理：终端分组',
  },
  {
    value: 'views/dev/dev',
    label: '终端管理',
    describe: '终端管理：终端管理',
  },
  {
    value: 'views/dev/map',
    label: '终端地图',
    describe: '终端管理：终端地图',
  },
  {
    value: 'views/dev/instanceList',
    label: '终端发布',
    describe: '终端管理：终端发布',
  },
  {
    value: 'views/dev/connection',
    label: '网关关联',
    describe: '终端管理：网关关联',
  },
  {
    value: 'views/dev/protocol',
    label: '协议管理',
    describe: '终端管理：协议管理',
  },
  {
    value: 'views/dev/pointGroupList',
    label: '测点组列表',
    describe: '终端管理：测点组列表',
  },
  {
    value: 'views/dev/pointGroupTrend',
    label: '测点组趋势',
    describe: '终端管理：测点组趋势',
  },
  {
    value: 'views/dev/stationManagement/stationList',
    label: '站点管理',
    describe: '终端管理：站点列表',
  },
  // 组态管理
  {
    value: 'views/hmi/hmiGroup',
    label: '组态分组',
    describe: '组态管理：组态分组',
  },
  {
    value: 'views/hmi/picManage',
    label: '我的图库',
    describe: '组态管理：我的图库',
  },
  {
    value: 'views/hmi/hmiManage',
    label: '组态管理',
    describe: '组态管理：组态管理',
  },
  {
    value: 'views/hmi/hmiPubList',
    label: '组态列表',
    describe: '组态管理：组态列表（上架的组态）',
  },
  {
    value: 'views/hmi/templateManage',
    label: '组态模板',
    describe: '模板管理：组态模板',
  },
  // 资产管理
  {
    value: 'views/eam/assetType',
    label: '设备类别',
    describe: '设备管理：设备类别',
  },
  {
    value: 'views/eam/assetList',
    label: '设备台账',
    describe: '设备管理：设备台账',
  },
  {
    value: 'views/eam/waterTreatment/treatment',
    label: '预测生产批次',
    describe: '设备管理：预测生产批次',
  },
  {
    value: 'views/eam/waterTreatment/currentTreatment',
    label: '当前生产批次',
    describe: '设备管理：当前生产批次',
  },
  {
    value: 'views/eam/VolumeCalibration/index',
    label: '容积标定',
    describe: '设备管理：容积标定',
  },
  // 工单管理
  {
    value: 'views/eam/workList',
    label: '工单列表',
    describe: '工单管理：工单列表',
  },
  {
    value: 'views/eam/fixKnowledge',
    label: '维修知识',
    describe: '工单管理：维修知识',
  },
  {
    value: 'views/eam/faultList',
    label: '故障类型',
    describe: '工单管理：故障类型',
  },
  {
    value: 'views/eam/statistics',
    label: '数据统计',
    describe: '工单管理：数据统计',
  },
  {
    value: 'views/eam/workManage/workReport',
    label: '工单列表',
    describe: '工单管理：工单列表',
  },
  {
    value: 'views/eam/workManage/workStastic',
    label: '工单统计表',
    describe: '工单管理：工单统计',
  },
  // 巡检管理
  {
    value: 'views/eam/inspectionStandard',
    label: '巡检标准',
    describe: '巡检管理：巡检标准',
    children: [
      {
        value: 'inspection_standard_add',
        label: '新增巡检标准/内容',
      },
      {
        value: 'inspection_standard_modify',
        label: '编辑巡检标准/内容',
      },
      {
        value: 'inspection_standard_delete',
        label: '删除巡检标准/内容',
      },
    ],
  },
  {
    value: 'views/eam/inspectionPosition',
    label: '巡检点',
    describe: '巡检管理：巡检点管理',
    children: [
      {
        value: 'inspection_position_add',
        label: '新增巡检点',
      },
      {
        value: 'inspection_position_modify',
        label: '修改巡检点',
      },
      {
        value: 'inspection_position_delete',
        label: '删除巡检点',
      },
    ],
  },
  {
    value: 'views/eam/inspectionPlan',
    label: '巡检计划',
    describe: '巡检管理：巡检计划',
  },
  {
    value: 'views/eam/inspectionRecord',
    label: '巡检记录',
    describe: '巡检管理：巡检记录',
  },
  {
    value: 'views/eam/inspectionExceptionRecord',
    label: '异常记录',
    describe: '巡检管理：异常记录',
  },
  {
    value: 'views/eam/violationRecordList',
    label: '违规记录',
    describe: '巡检管理：违规记录',
  },
  {
    value: 'views/eam/inspectionMonthReport',
    label: '巡检月报表',
    describe: '巡检管理：巡检月报表',
  },
  {
    value: 'views/eam/inspectionStatistics',
    label: '巡检统计',
    describe: '巡检管理：巡检统计',
  },
  // 维保管理
  {
    value: 'views/eam/maintenanceStandard',
    label: '维保标准',
    describe: '维保管理：维保标准',
    children: [
      {
        value: 'maintenance_standard_add',
        label: '新增维保标准',
      },
      {
        value: 'maintenance_standard_modify',
        label: '修改维保标准',
      },
      {
        value: 'maintenance_standard_delete',
        label: '删除维保标准',
      },
    ],
  },
  {
    value: 'views/eam/maintenancePlan',
    label: '维保计划',
    describe: '维保管理：维保计划',
    children: [
      {
        value: 'maintenance_plan_add',
        label: '新增维保计划',
      },
      {
        value: 'maintenance_plan_modify',
        label: '修改维保计划',
      },
      {
        value: 'maintenance_plan_delete',
        label: '删除维保计划',
      },
    ],
  },
  {
    value: 'views/eam/lubricateRecord',
    label: '润滑记录',
    describe: '维保管理：润滑记录',
  },
  {
    value: 'views/eam/lubricatePlan',
    label: '润滑计划',
    describe: '维保管理：润滑计划',
    children: [
      {
        value: 'lubricate_plan_add',
        label: '新增润滑计划',
      },
      {
        value: 'lubricate_plan_modify',
        label: '修改润滑计划',
      },
      {
        value: 'lubricate_plan_delete',
        label: '删除润滑计划',
      },
    ],
  },
  {
    value: 'views/eam/capitalRepairRecord',
    label: '大修记录',
    describe: '维保管理：大修记录',
  },
  {
    value: 'views/eam/maintenanceRecord',
    label: '维保记录',
    describe: '维保管理：维保记录',
  },
  {
    value: 'views/eam/maintenanceTask',
    label: '维保任务',
    describe: '维保管理：维保任务',
  },
  // 设备部分
  {
    value: 'views/equipment/equipmentList',
    label: '设备清单',
    describe: '设备清单',
    children: [
      {
        value: 'equipment_list_add',
        label: '新增设备',
      },
      {
        value: 'equipment_list_import',
        label: '设备导入',
      },
      {
        value: 'equipment_list_view',
        label: '查看设备详情',
      },
      {
        value: 'equipment_list_modify',
        label: '修改设备',
      },
      {
        value: 'equipment_list_delete',
        label: '删除设备',
      },
    ],
  },
  // 特种设备部分
  {
    value: 'views/specialEquipment/specialEquipmentList',
    label: '特种设备清单',
    describe: '特种设备清单',
    children: [
      {
        value: 'special_equipment_list_add',
        label: '新增特种设备',
      },
      {
        value: 'special_equipment_list_import',
        label: '特种设备导入',
      },
      {
        value: 'special_equipment_list_view',
        label: '查看详情',
      },
      {
        value: 'special_equipment_list_modify',
        label: '修改特种设备',
      },
      {
        value: 'special_equipment_list_delete',
        label: '删除特种设备',
      },
    ],
  },
  {
    value: 'views/specialEquipment/weeklyReport/weeklyReportTemplateList',
    label: '特种设备周报模板',
    describe: '特种设备周报模板',
    children: [
      {
        value: 'weekly_report_template_add',
        label: '新增特种设备周报模板',
      },
      {
        value: 'weekly_report_template_stop',
        label: '启/停用特种设备周报模板',
      },
      {
        value: 'weekly_report_template_view',
        label: '查看特种设备周报模板',
      },
      {
        value: 'weekly_report_template_modify',
        label: '修改特种设备周报模板',
      },
      {
        value: 'weekly_report_template_delete',
        label: '删除特种设备周报模板',
      },
    ],
  },
  {
    value: 'views/specialEquipment/weeklyReport/weeklyReportRecordList',
    label: '特种设备周报台账',
    describe: '特种设备周报台账',
    children: [
      {
        value: 'weekly_report_record_add',
        label: '新增特种设备周报',
      },
      {
        value: 'weekly_report_record_import',
        label: '特种设备周报导入',
      },
      {
        value: 'weekly_report_record_view',
        label: '查看特种设备周报详情',
      },
      {
        value: 'weekly_report_record_modify',
        label: '修改特种设备周报',
      },
      {
        value: 'weekly_report_record_delete',
        label: '删除特种设备周报',
      },
    ],
  },
  {
    value: 'views/specialEquipment/specialEquipmentCount',
    label: '特种设备统计',
    describe: '特种设备：特种设备统计',
  },
  {
    value: 'views/specialEquipment/specialEquipmentMetering',
    label: '计量设备',
    describe: '特种设备：计量设备',
    children: [
      {
        value: 'special_equipment_metering_add',
        label: '新增计量设备',
      },
      {
        value: 'special_equipment_metering_import',
        label: '计量设备导入',
      },
      {
        value: 'special_equipment_metering_view',
        label: '查看计量设备详情',
      },
      {
        value: 'special_equipment_metering_modify',
        label: '修改计量设备',
      },
      {
        value: 'special_equipment_metering_delete',
        label: '删除计量设备',
      },
    ],
  },
  // 终端报表
  {
    value: 'views/report/pointHistory',
    label: '历史数据',
    describe: '终端报表：历史数据',
  },
  {
    value: 'views/report/warn',
    label: '报警记录',
    describe: '终端报表：报警记录',
  },
  // 终端管理：规则管理
  {
    value: 'views/notice/ruleList',
    label: '规则列表',
    describe: '规则管理：规则列表',
  },
  // {
  //   value: 'views/notice/people',
  //   label: '联系人',
  //   describe: '规则管理：联系人'
  // },
  {
    value: 'views/notice/way',
    label: '通知方式',
    describe: '通知管理：通知方式',
  },
  // 终端任务
  {
    value: 'views/notice/scheduleList',
    label: '任务设置',
    describe: '终端任务：任务设置',
  },
  {
    value: 'views/notice/scheduleResList',
    label: '任务记录',
    describe: '终端任务：任务记录',
  },
  // 大屏报表
  {
    value: 'views/reportDesign/datasource/index', // 报表设计-数据源
    label: '数据源',
    describe: '大屏报表：数据源',
  },
  {
    value: 'views/reportDesign/resultset/index', // 报表设计-数据集
    label: '数据集',
    describe: '大屏报表：数据集',
  },
  {
    value: 'views/reportDesign/report/index', // 报表设计-报表管理
    label: '报表管理',
    describe: '大屏报表：报表管理',
  },
  {
    value: 'views/reportDesign/bigscreen/index', // 报表设计-大屏报表
    label: '大屏BI',
    describe: '大屏报表：大屏BI',
  },
  {
    value: 'views/reportDesign/excelreport/index', // 报表设计-表格报表
    label: '表格报表',
    describe: '大屏报表：表格报表',
  },
  {
    value: 'views/reportDesign/file/index', // 报表设计-大屏文件
    label: '大屏文件',
    describe: '大屏报表：大屏文件',
  },
  // 地图组态
  {
    value: 'views/maps/mapList',
    label: '地图列表',
    describe: '地图列表',
  },
  {
    value: 'views/maps/xxMap',
    label: '地图组态',
    describe: '地图组态',
  },
  // 园区管理
  /* {
    value: 'views/magic/magic3D',
    label: '综合',
    describe: '园区管理3D：综合'
  },
  {
    value: 'views/magic/asset3D',
    label: '资产',
    describe: '园区管理3D：资产'
  },
  {
    value: 'views/magic/dev3D',
    label: '设备',
    describe: '园区管理3D：设备'
  },
  {
    value: 'views/magic/safe3D',
    label: '安防',
    describe: '园区管理3D：安防'
  },
  {
    value: 'views/magic/eng3D',
    label: '照明',
    describe: '园区管理3D：照明'
  },
  {
    value: 'views/magic/env3D',
    label: '环境',
    describe: '园区管理3D：环境'
  },
  {
    value: 'views/magic/maintain3D',
    label: '维护',
    describe: '园区管理3D：维护'
  }, */
  // 环保三同时
  {
    value: 'views/proEnv/sameTime3/reportCheck',
    label: '项目环评报批及验收资料',
    describe: '环保三同时：项目环评报批及验收资料',
  },
  {
    value: 'views/proEnv/sameTime3/emissionPermit',
    label: '排污许可证',
    describe: '环保三同时：排污许可证',
  },
  // {
  //   value: 'views/proEnv/sameTime3/solidWaste',
  //   label: '固废产生',
  //   describe: '环保三同时：固废产生'
  // },
  {
    value: 'views/proEnv/sameTime3/waste/solidWasteProduce',
    label: '固废产生',
    describe: '废物处理：固废产生',
  },
  {
    value: 'views/proEnv/sameTime3/waste/dangerWasteProduce',
    label: '危废产生',
    describe: '废物处理：危废产生',
  },
  {
    value: 'views/proEnv/sameTime3/waste/dangerWasteTransfer',
    label: '危废转移',
    describe: '废物处理：危废转移',
  },
  {
    value: 'views/proEnv/sameTime3/waste/dangerWasteInput',
    label: '危废入库',
    describe: '废物处理：危废入库',
  },
  {
    value: 'views/proEnv/sameTime3/waste/dangerWasteOutput',
    label: '危废出库',
    describe: '废物处理：危废出库',
  },
  // {
  //   value: 'views/emergency/emSource/emSupply',
  //   label: '应急物资',
  //   describe: '应急管理：应急物资'
  // },
  // {
  //   value: 'views/emergency/emSource/emGroup',
  //   label: '应急队伍',
  //   describe: '应急管理：应急队伍'
  // },
  // {
  //   value: 'views/emergency/emSource/emProficient',
  //   label: '应急专家',
  //   describe: '应急管理：应急专家'
  // },
  // {
  //   value: 'views/emergency/emPlan/emPlan',
  //   label: '应急预案',
  //   describe: '应急管理：应急预案'
  // },
  // {
  //   value: 'views/emergency/rehearsalPlan/rehearsalPlan',
  //   label: '演练计划',
  //   describe: '应急管理：演练计划'
  // },
  // {
  //   value: 'views/emergency/rehearsalRecord/rehearsalRecord',
  //   label: '演练记录',
  //   describe: '应急管理：演练记录'
  // },
  // {
  //   value: 'views/emergency/accReport/accReport',
  //   label: '事故上报',
  //   describe: '应急管理：事故上报'
  // },
  // {
  //   value: 'views/emergency/accHandle/accHandle',
  //   label: '事故处理',
  //   describe: '应急管理：事故处理'
  // },
  // {
  //   value: 'views/fileManager/documentation',
  //   label: '文档编制',
  //   describe: '文档管理（知识库）：文档编制'
  // },
  // 文档管理
  {
    value: 'views/fileManager/documentTag',
    label: '文档管理标签',
    describe: '文档管理：文档管理标签',
    children: [
      {
        value: 'document_tag_add',
        label: '新增',
      },
      {
        value: 'document_tag_modify',
        label: '修改',
      },
      {
        value: 'document_tag_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/fileManager/documentList',
    label: '文档管理台账',
    describe: '文档管理：文档管理台账',
    children: [
      {
        value: 'document_list_add',
        label: '新增',
      },
      {
        value: 'document_list_view',
        label: '查看',
      },
      {
        value: 'document_list_modify',
        label: '修改',
      },
      {
        value: 'document_list_revise',
        label: '修订',
      },
      {
        value: 'document_list_invalid',
        label: '作废',
      },
    ],
  },
  {
    value: 'views/fileManager/reviewList',
    label: '文档评审列表',
    describe: '文档管理：文档评审会签列表',
    children: [
      {
        value: 'document_review',
        label: '文档评审',
      },
    ],
  },
  {
    value: 'views/fileManager/invalidList',
    label: '文档作废列表',
    describe: '文档管理：文档作废列表',
  },
  {
    value: 'views/fileManager/historyVersionList',
    label: '文档历史版本列表',
    describe: '文档管理：文档历史版本列表',
  },
  {
    value: 'views/baseModule/certificateManager/safeManager',
    label: '安全证照',
    describe: '基础模块：安全证照',
  },
  {
    value: 'views/baseModule/certificateManager/NoticSet',
    label: '报警配置',
    describe: '基础模块：证照报警配置',
  },
  {
    value: 'views/baseModule/certificateManager/recheckRecord',
    label: '复审记录',
    describe: '基础模块：复审记录',
  },
  {
    value: 'views/majorHazard/dangerSourceFiles',
    label: '重大危险源档案',
    describe: '重大危险源：重大危险源档案',
  },
  {
    value: 'views/majorHazard/dangerChemicalBook',
    label: '危化品台账',
    describe: '重大危险源：危化品台账',
  },
  {
    value: 'views/majorHazard/dangerChemicalIntoBook',
    label: '危化品入库台账',
    describe: '重大危险源：危化品入库台账',
  },
  {
    value: 'views/majorHazard/dangerChemicalOutBook',
    label: '危化品出库台账',
    describe: '重大危险源：危化品出库台账',
  },
  {
    value: 'views/majorHazard/dataWatch',
    label: 'DCS数据监测',
    describe: '重大危险源：DCS数据监测',
  },
  {
    value: 'views/majorHazard/videoWatch',
    label: '视频监测',
    describe: '重大危险源：视频监测',
  },
  // anqi
  {
    value: 'views/majorHazard/dangerSourceAnqi',
    label: '重大危险源档案Anqi',
    describe: '重大危险源：重大危险源档案Anqi',
    children: [
      {
        value: 'dangerSource_anqi_view',
        label: '查看重大危险源档案',
      },
      {
        value: 'dangerSource_anqi_modify',
        label: '修改重大危险源档案',
      },
      {
        value: 'dangerSource_anqi_delete',
        label: '删除重大危险源档案',
      },
    ],
  },
  {
    value: 'views/majorHazard/importanceSourceAnqi',
    label: '重要危险源档案Anqi',
    describe: '重大危险源：重要危险源档案Anqi',
    children: [
      {
        value: 'importanceSource_anqi_view',
        label: '查看重要危险源档案',
      },
      {
        value: 'importanceSource_anqi_modify',
        label: '修改重要危险源档案',
      },
      {
        value: 'importanceSource_anqi_delete',
        label: '删除重要危险源档案',
      },
    ],
  },
  {
    value: 'views/majorHazard/monitorBindAnqi',
    label: '监测绑定Anqi',
    describe: '重大危险源：监测绑定Anqi',
  },
  {
    value: 'views/majorHazard/dataWatchAnqi',
    label: 'DCS数据监测Anqi',
    describe: '重大危险源：DCS数据监测Anqi',
  },
  {
    value: 'views/majorHazard/terminalRule',
    label: '终端报警规则管理Anqi',
    describe: '重大危险源：终端报警规则管理Anqi',
  },
  {
    value: 'views/majorHazard/terminalRecord',
    label: '终端报警记录Anqi',
    describe: '重大危险源：终端报警记录Anqi',
  },
  {
    value: 'views/majorHazard/videoWatchAnqi',
    label: '视频监测Anqi',
    describe: '重大危险源：视频监测Anqi',
  },
  {
    value: 'views/majorHazard/dangerChemicalList',
    label: '危化品清单Anqi',
    describe: '重大危险源：危化品清单Anqi',
  },
  {
    value: 'views/majorHazard/criticalityByName',
    label: '危险化学品名称临界值Anqi',
    describe: '重大危险源：危险化学品名称临界值Anqi',
  },
  {
    value: 'views/majorHazard/criticalityByType',
    label: '危险化学品类别临界值Anqi',
    describe: '重大危险源：危险化学品类别临界值Anqi',
  },
  {
    value: 'views/majorHazard/gasName',
    label: '毒性气体按名称校正系数Anqi',
    describe: '重大危险源：毒性气体按名称校正系数Anqi',
  },
  {
    value: 'views/majorHazard/gasType',
    label: '毒性气体按类别校正系数Anqi',
    describe: '重大危险源：毒性气体按类别校正系数Anqi',
  },
  {
    value: 'views/majorHazard/wasteOut',
    label: '危废产生概况Anqi',
    describe: '重大危险源：危废产生概况Anqi',
  },
  {
    value: 'views/majorHazard/wasteIn',
    label: '危废入库申请Anqi',
    describe: '重大危险源：危废入库申请Anqi',
  },
  // {
  //   value: 'views/accidentAccount/accidentAccount',
  //   label: '事故台账',
  //   describe: '应急管理：事故台账'
  // },
  {
    value: 'views/accidentAccount/alarmCenter',
    label: '报警中心',
    describe: '报警中心：报警中心主页',
  },
  {
    value: 'views/majorHazard/monitorBind',
    label: '监测绑定',
    describe: '重大危险源：监测绑定',
  },

  // 特殊作业
  {
    value: '@link-angel-special-operation/safe-measure',
    label: '安全措施库',
    describe: '特殊作业：安全措施库',
  },
  {
    value: '@link-angel-special-operation/special-book',
    label: '特殊作业台账',
    describe: '特殊作业：特殊作业台账',
  },
  {
    value: '@link-angel-special-operation/work-ticket-statistic',
    label: '作业票统计',
    describe: '特殊作业：作业票统计',
  },

  {
    value: 'views/relevantContractor/contractor',
    label: '承包商',
    describe: '特殊作业：承包商',
  },
  {
    value: 'views/relevantContractor/personnel',
    label: '承包商人员',
    describe: '特殊作业：承包商人员',
  },
  {
    value: 'views/relevantContractor/qualification',
    label: '承包商人员资质',
    describe: '特殊作业：承包商人员资质',
  },
  {
    value: 'views/responsibilities/target',
    label: '安全生产目标',
    describe: '机构职责：安全生产目标',
  },
  {
    value: 'views/responsibilities/Assessment',
    label: '生产目标考评',
    describe: '机构职责：生产目标考评',
  },
  {
    value: 'views/supplier/supplier',
    label: '供应商',
    describe: '安全生产：供应商',
  },
  // {
  //   value: 'views/safetyInvestment/inputPlan',
  //   label: '安全投入计划',
  //   describe: '安全投入：安全投入计划'
  // },
  // {
  //   value: 'views/safetyInvestment/expenseBill',
  //   label: '费用台账',
  //   describe: '安全投入计划：费用台账'
  // },
  {
    value: 'views/safeIn/budget',
    label: '安全投入预算',
    describe: '安全投入：安全投入预算',
  },
  {
    value: 'views/safeIn/plan',
    label: '安全投入费用计划',
    describe: '安全投入：安全投入费用计划',
  },
  {
    value: 'views/safeIn/book',
    label: '安全投入费用台账',
    describe: '安全投入：安全投入费用台账',
  },
  {
    value: 'views/safeIn/kind',
    label: '安全投入费用分类',
    describe: '安全投入：安全投入费用分类',
  },
  {
    value: 'views/videoAi/index',
    label: '报警信息',
    describe: 'AI智能视频分析：报警信息',
  },
  {
    value: 'views/videoAi/manage',
    label: '监控管理',
    describe: 'AI智能视频分析：监控管理',
  },
  {
    value: 'views/ForewarningManagement/cameraList',
    label: '摄像头列表',
    describe: '视频运营：摄像头列表',
  },
  {
    value: 'views/ForewarningManagement/aiAuditSkill',
    label: 'AI审核技能配置',
    describe: '预警处理：AI审核技能配置',
  },
  {
    value: 'views/ForewarningManagement/allTenantWaringList',
    label: '智能复判(所有租户)',
    describe: '视频运营：智能复判(所有租户)',
  },
  {
    value: 'views/ForewarningManagement/warningList',
    label: '预警信息列表',
    describe: '视频运营：智能复判(运维)',
  },
  {
    value: 'views/ForewarningManagement/misjudgeList',
    label: '误判栏',
    describe: '视频运营：误判栏',
  },
  {
    value: 'views/ForewarningManagement/customMisjudgeList',
    label: '误判栏',
    describe: '视频运营：误判栏(客户端)',
  },
  {
    value: 'views/ForewarningManagement/attentionList',
    label: '关注预警列表',
    describe: '视频运营：关注预警列表',
  },
  {
    value: 'views/ForewarningManagement/clientWarningList',
    label: '预警信息列表',
    describe: '视频运营：预警处理(客户)',
    children: [
      {
        value: 'clientWarningList_batchDelete',
        label: '批量删除',
      },
    ],
  },
  {
    value: 'views/ForewarningManagement/cardSiren',
    label: '定位卡报警器关联',
    describe: '视频运营：定位卡报警器关联',
  },
  {
    value: 'views/ForewarningManagement/reportExport',
    label: '预警报告导出',
    describe: '视频运营：预警报告导出',
  },
  {
    value: 'views/ForewarningManagement/staticAnalyze',
    label: '统计分析',
    describe: '视频运营：预警统计分析',
  },
  {
    value: 'views/ForewarningManagement/machineList',
    label: '一体机列表',
    describe: '视频运营：一体机列表',
  },
  {
    value: 'views/ForewarningManagement/SkillConfigurationGlobal',
    label: '大模型复判技能配置(全局)',
    describe: '视频运营：大模型复判技能配置(全局)',
  },
  {
    value: 'views/ForewarningManagement/SkillConfiguration',
    label: '大模型复判技能配置',
    describe: '视频运营：大模型复判技能配置',
  },
  {
    value: 'views/videoAi/HKmanagement/hkAiBox',
    label: '海康盒子配置',
    describe: 'AI智能视屏分析：海康盒子配置',
  },
  {
    value: 'views/videoAi/HKmanagement/hkAiModel',
    label: '海康模型配置',
    describe: 'AI智能视屏分析：海康模型配置',
  },
  {
    value: 'views/PipeRack/OnTodu/team',
    label: '值班小组',
    describe: '值班管理：值班小组',
  },
  {
    value: 'views/PipeRack/OnTodu/arrange',
    label: '值班安排',
    describe: '值班管理：值班安排',
  },

  /*   {
    value: 'views/guanlang3D/index',
    label: '管廊大屏',
    describe: '管廊：管廊大屏'
  }, */
  {
    value: 'views/manage/appManage',
    label: '移动端app信息维护',
    describe: '移动端：移动端app信息维护',
  },
  {
    value: 'views/Inspection/InspectionPoint',
    label: '巡检点',
    describe: '巡检漫游：巡检点',
  },
  {
    value: 'views/Inspection/InspectionItems',
    label: '巡检项',
    describe: '巡检漫游：巡检项',
  },
  {
    value: 'views/Inspection/InspectionPlan',
    label: '巡检计划',
    describe: '巡检漫游：巡检计划',
  },
  // 数据大屏板块
  {
    value: 'views/visualizationCenter/visualizationCenter',
    label: '集团统计大屏',
    describe: '开屏页：集团统计大屏页面',
  },
  {
    value: 'views/visualizationCenter/serviceScreenCenter',
    label: '服务中心大屏',
    describe: '开屏页：服务中心大屏页面',
  },
  {
    value: 'views/visualizationCenter/operationScreenCenter',
    label: '运营中心大屏',
    describe: '开屏页：运营大屏',
  },
  {
    value: 'views/visualizationCenter/clientScreenCenter',
    label: '客户中心大屏',
    describe: '开屏页：客户中心大屏页面',
  },
  {
    value: 'views/visualizationCenter/waterTreatment',
    label: '日常生产批次安排',
    describe: '开屏页：日常生产批次安排',
  },
  {
    value: 'views/visualizationCenter/machineScreenCenter/index',
    label: '视频运营中心',
    describe: '开屏页：视频运营中心',
  },
  {
    value: 'views/home/homeBi',
    label: '预警中心大屏',
    describe: '开屏页：用户登录之后展示的大屏页',
  },
  {
    value: 'views/dataReport/shandong/kde/list',
    label: '数据上报',
    describe: '数据上报：数据交换集成数据上报（山东）',
  },
  {
    value: 'views/manage/companyConfig',
    label: '公司配置',
    describe: '系统配置：公司配置',
  },
  {
    value: 'views/visualizationCenter/aPictureOfSafetyProduction',
    label: '安全生产一张图大屏',
    describe: '安全生产一张图大屏',
  },
  // 教育培训
  // 资源库
  {
    value: '@link-angel-edu/course-part',
    label: '课件资源',
    describe: '教育培训-资源库：课件资源',
  },
  {
    value: '@link-angel-edu/course',
    label: '课程资源',
    describe: '教育培训-资源库：课程资源',
  },
  {
    value: '@link-angel-edu/question',
    label: '试题资源',
    describe: '教育培训-资源库：试题资源',
  },
  {
    value: '@link-angel-edu/paper',
    label: '试卷资源',
    describe: '教育培训-资源库：试卷资源',
    children: [
      {
        value: 'edu_paper_show_results',
        label: '查看答案',
      },
    ],
  },
  // 培训考试发布管理
  {
    value: '@link-angel-edu/train-plan',
    label: '培训计划',
    describe: '教育培训-培训考试发布管理：培训计划',
    children: [
      {
        value: 'edu_train_plan_add',
        label: '新增',
      },
      {
        value: 'edu_train_plan_modify',
        label: '编辑',
      },
      {
        value: 'edu_train_plan_view',
        label: '查看',
      },
      {
        value: 'edu_train_plan_publish',
        label: '发布',
      },
      {
        value: 'edu_train_plan_submit',
        label: '提交',
      },
      {
        value: 'edu_train_plan_audit',
        label: '审批',
      },
      {
        value: 'edu_train_plan_delete',
        label: '删除',
      },
      {
        value: 'edu_train_plan_record',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-edu/exam-pub',
    label: '培训考试发布',
    describe: '教育培训-培训考试发布管理：培训考试发布',
    children: [
      {
        value: 'edu_exam_pub_add',
        label: '新增',
      },
      {
        value: 'edu_exam_pub_modify',
        label: '编辑',
      },
      {
        value: 'edu_exam_pub_view',
        label: '查看',
      },
      {
        value: 'edu_exam_pub_publish',
        label: '发布',
      },
      {
        value: 'edu_exam_pub_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-edu/train-task',
    label: '岗位培训矩阵',
    describe: '教育培训-培训考试发布管理：岗位培训矩阵',
    children: [
      {
        value: 'edu_train_task_add',
        label: '新增',
      },
      {
        value: 'edu_train_task_modify',
        label: '编辑',
      },
      {
        value: 'edu_train_task_view',
        label: '查看',
      },
      {
        value: 'edu_train_task_publish',
        label: '发布',
      },
      {
        value: 'edu_train_task_delete',
        label: '删除',
      },
    ],
  },
  // 学员中心
  {
    value: '@link-angel-edu/online-train',
    label: '在线培训',
    describe: '教育培训-学员中心：在线培训',
  },
  {
    value: '@link-angel-edu/online-exam',
    label: '在线考试',
    describe: '教育培训-学员中心：在线考试',
  },
  // 培训考试管理台账
  {
    value: '@link-angel-edu/train-task-book',
    label: '培训任务台账',
    describe: '教育培训-培训考试管理台账：培训任务台账',
  },
  {
    value: '@link-angel-edu/exam-book',
    label: '考试台账',
    describe: '教育培训-培训考试管理台账：考试台账',
  },
  {
    value: '@link-angel-edu/three-safety-book',
    label: '三级安全教育台账',
    describe: '教育培训-培训考试管理台账：三级安全教育台账',
  },
  {
    value: '@link-angel-edu/train-statistics-chart',
    label: '教育培训统计图表',
    describe: '教育培训-培训考试管理台账：教育培训统计图表',
  },
  // 周会
  {
    value: '@link-angel-edu/weekly-meeting-management',
    label: '周会管理',
    describe: '教育培训-周会：周会管理',
    children: [
      {
        value: 'weekly_meeting_management_export',
        label: '导出',
      },
      {
        value: 'weekly_meeting_management_add',
        label: '新增',
      },
      {
        value: 'weekly_meeting_management_modify',
        label: '编辑',
      },
      {
        value: 'weekly_meeting_management_view',
        label: '查看',
      },
      {
        value: 'weekly_meeting_management_publish',
        label: '发布',
      },
      {
        value: 'weekly_meeting_management_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-edu/weekly-meeting-task',
    label: '周会任务',
    describe: '教育培训-周会：周会任务',
    children: [
      {
        value: 'weekly_meeting_task_add',
        label: '添加完成记录',
      },
      {
        value: 'weekly_meeting_task_view',
        label: '查看',
      },
    ],
  },
  // 评价管理
  {
    value: 'views/evaluateManage/saferRulesManage',
    label: '安全员规则管理',
    describe: '评价管理：安全员考评规则管理',
    children: [
      {
        value: 'safer_rules_add',
        label: '添加隐患数量考评规则',
      },
      {
        value: 'safer_rules_delete',
        label: '删除隐患数量考评规则',
      },
      {
        value: 'safer_rules_modify',
        label: '保存修改安全员考评规则',
      },
    ],
  },
  {
    value: 'views/evaluateManage/saferEvaluationList',
    label: '安全员考评台账',
    describe: '评价管理：安全员考评台账',
    children: [
      {
        value: 'safer_evaluation_list_export',
        label: '安全员考评台账导出',
      },
      {
        value: 'safer_evaluation_list_view',
        label: '安全员考评台账查看详情',
      },
      {
        value: 'safer_evaluation_list_modify',
        label: '安全员考评台账修改详情',
      },
      {
        value: 'safer_evaluation_list_review',
        label: '安全员考评台账复核',
      },
    ],
  },
  {
    value: 'views/evaluateManage/departmentRulesManage',
    label: '部门负责人考评规则',
    describe: '评价管理：部门负责人考评规则',
    children: [
      {
        value: 'department_rules_save',
        label: '保存修改部门负责人考评规则',
      },
    ],
  },
  {
    value: 'views/evaluateManage/departmentEvalluationList',
    label: '部门负责人考评台账',
    describe: '评价管理：部门负责人考评台账',
    children: [
      {
        value: 'department_evaluation_list_export',
        label: '部门负责人考评台账导出',
      },
      {
        value: 'department_evaluation_list_view',
        label: '部门负责人考评台账查看详情',
      },
      {
        value: 'department_evaluation_list_modify',
        label: '部门负责人考评台账修改详情',
      },
      {
        value: 'department_evaluation_list_review',
        label: '部门负责人考评台账复核',
      },
    ],
  },
  {
    value: 'views/evaluateManage/safetyRiskFundEvaluationList',
    label: '安全风险金考评',
    describe: '评价管理：安全风险金考评',
    children: [
      {
        value: 'safety_risk_fund_export',
        label: '安全风险金考评台账导出',
      },
      {
        value: 'safety_risk_fund_view',
        label: '安全风险金考评查看详情',
      },
      {
        value: 'safety_risk_fund_review',
        label: '安全风险金考评复核',
      },
    ],
  },
  {
    value: 'views/evaluateManage/evaluateYearStatistics',
    label: '指标对比分析',
    describe: '评价管理：指标对比分析',
    children: [
      {
        value: 'evaluate_year_statistics_export',
        label: '指标对比分析导出',
      },
    ],
  },
  {
    value: 'views/evaluateManage/evaluateChartStatistics',
    label: '绩效考核分析',
    describe: '评价管理：绩效考核分析',
  },
  // 奖励考核--三违考核
  {
    value: 'views/rewardAssessment/threeViolation/list',
    label: '三违考核列表',
    describe: '奖励考核：三违考核--新增/审批考核',
    children: [
      {
        value: 'three_violation_add',
        label: '新增三违考核',
      },
      {
        value: 'three_violation_export',
        label: '导出三违考核列表',
      },
      {
        value: 'three_violation_modify',
        label: '修改三违考核',
      },
      {
        value: 'three_violation_view',
        label: '查看三违考核',
      },
      {
        value: 'three_violation_review',
        label: '三违考核审批',
      },
      {
        value: 'three_violation_delete',
        label: '删除三违考核',
      },
    ],
  },
  {
    value: 'views/rewardAssessment/threeViolation/executeList',
    label: '考核执行列表',
    describe: '奖励考核：三违考核--考核执行列表',
    children: [
      {
        value: 'three_violation_execute_export',
        label: '导出三违考核执行列表',
      },
      {
        value: 'three_violation_execute_view',
        label: '查看三违考核执行详情',
      },
      {
        value: 'three_violation_execute',
        label: '三违考核执行',
      },
    ],
  },
  {
    value: 'views/rewardAssessment/threeViolation/statistics',
    label: '三违考核台账',
    describe: '奖励考核：三违考核--考核统计台账',
    children: [
      {
        value: 'three_violation_statistics_export',
        label: '导出三违考核台账',
      },
      {
        value: 'three_violation_statistics_view',
        label: '查看三违考核台账详情',
      },
    ],
  },
  // 奖励考核--安全奖励
  {
    value: 'views/rewardAssessment/safeReward/list',
    label: '安全奖励列表',
    describe: '奖励考核：安全奖励--新增/审批奖励',
    children: [
      {
        value: 'safe_reward_add',
        label: '新增安全奖励',
      },
      {
        value: 'safe_reward_export',
        label: '导出安全奖励列表',
      },
      {
        value: 'safe_reward_modify',
        label: '修改安全奖励',
      },
      {
        value: 'safe_reward_view',
        label: '查看安全奖励',
      },
      {
        value: 'safe_reward_review',
        label: '安全奖励审批',
      },
      {
        value: 'safe_reward_delete',
        label: '删除安全奖励',
      },
    ],
  },
  {
    value: 'views/rewardAssessment/safeReward/executeList',
    label: '奖励执行列表',
    describe: '奖励考核：安全奖励--奖励执行列表',
    children: [
      {
        value: 'safe_reward_execute_export',
        label: '导出奖励执行列表',
      },
      {
        value: 'safe_reward_execute_view',
        label: '查看安全奖励执行详情',
      },
      {
        value: 'safe_reward_execute',
        label: '安全奖励执行',
      },
    ],
  },
  {
    value: 'views/rewardAssessment/safeReward/statistics',
    label: '安全奖励台账',
    describe: '奖励考核：安全奖励--奖励统计台账',
    children: [
      {
        value: 'safe_reward_statistics_export',
        label: '导出安全奖励台账',
      },
      {
        value: 'safe_reward_statistics_view',
        label: '查看安全奖励台账详情',
      },
    ],
  },
  // 奖励考核-汇总分析
  {
    value: 'views/rewardAssessment/statisticsChart',
    label: '汇总分析',
    describe: '奖励考核：汇总分析',
  },
  // 安全生产目标与责任
  {
    value: 'views/safeProductionTarget/formulateTarget',
    label: '目标责任制',
    describe: '安全生产目标与责任：目标责任制',
  },
  {
    value: 'views/safeProductionTarget/signedList',
    label: '目标责任书台账',
    describe: '安全生产目标与责任：目标责任书台账',
  },
  {
    value: 'views/safeProductionTarget/targetConfig',
    label: '目标配置',
    describe: '安全生产目标与责任：目标配置',
  },
  {
    value: 'views/safeProductionTarget/targetAssess',
    label: '目标责任制考核',
    describe: '安全生产目标与责任：目标责任制考核',
  },
  {
    value: 'views/safeProductionTarget/targetAssessList',
    label: '目标责任制考核台账',
    describe: '安全生产目标与责任：目标责任制考核台账',
  },
  // 变更管理
  // {
  //   value: 'views/changeManagement',
  //   label: '变更管理',
  //   describe: '变更管理'
  // },
  // {
  //   value: 'views/changeManagement/changeApplication',
  //   label: '变更申请',
  //   describe: '变更管理:变更申请'
  // },
  // {
  //   value: 'views/changeManagement/IVNewReview',
  //   label: '四新评审',
  //   describe: '变更管理:四新评审'
  // },
  // {
  //   value: 'views/changeManagement/changeCount',
  //   label: '变更统计',
  //   describe: '变更管理:变更统计'
  // },
  // {
  //   value: 'views/changeManagement/changeConfig',
  //   label: '变更配置',
  //   describe: '变更管理:变更配置'
  // },

  {
    value: '@link-angel-change-management/sort-manage',
    label: '变更分类管理',
    describe: '变更管理:变更分类管理',
    children: [
      {
        value: 'sort-manage_add',
        label: '新增',
      },
      {
        value: 'sort-manage_add_children',
        label: '新增子级',
      },
      {
        value: 'sort-manage_modify',
        label: '修改',
      },
      {
        value: 'sort-manage_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-change-management/assess-info-manage',
    label: '变更评估内容管理',
    describe: '变更管理:变更评估内容管理',
    children: [
      {
        value: 'assess-info-manage_add',
        label: '新增',
      },
      {
        value: 'assess-info-manage_view',
        label: '查看',
      },
      {
        value: 'assess-info-manage_modify',
        label: '修改',
      },
      {
        value: 'assess-info-manage_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-change-management/change-request',
    label: '变更申请',
    describe: '变更管理:变更申请',
    children: [
      {
        value: 'change-request_export',
        label: '导出',
      },
      {
        value: 'change-request_add',
        label: '新增',
      },
      {
        value: 'change-request_view',
        label: '查看',
      },
      {
        value: 'change-request_flow_record',
        label: '流转记录',
      },
      {
        value: 'change-request_modify',
        label: '修改补充',
      },
    ],
  },

  {
    value: 'views/contingencyManage/contingencyTeam',
    label: '应急队伍',
    describe: '应急管理:应急队伍',
    children: [
      {
        value: 'contingency_team_add',
        label: '新增应急队伍',
      },
      {
        value: 'contingency_team_view',
        label: '查看应急队伍',
      },
      {
        value: 'contingency_team_modify',
        label: '修改应急队伍',
      },
      {
        value: 'contingency_team_delete',
        label: '删除应急队伍',
      },
    ],
  },
  {
    value: 'views/contingencyManage/contingencyMaster',
    label: '应急专家',
    describe: '应急管理:应急专家',
    children: [
      {
        value: 'contingency_master_add',
        label: '新增应急专家',
      },
      {
        value: 'contingency_master_view',
        label: '查看应急专家',
      },
      {
        value: 'contingency_master_modify',
        label: '修改应急专家',
      },
      {
        value: 'contingency_master_delete',
        label: '删除应急专家',
      },
    ],
  },
  {
    value: 'views/contingencyManage/contingencyGoods',
    label: '应急物资',
    describe: '应急管理:应急物资',
    children: [
      {
        value: 'contingency_goods_add',
        label: '新增应急物资',
      },
      {
        value: 'contingency_goods_view',
        label: '查看应急物资',
      },
      {
        value: 'contingency_goods_modify',
        label: '修改应急物资',
      },
      {
        value: 'contingency_goods_delete',
        label: '删除应急物资',
      },
      {
        value: 'contingency_goods_check',
        label: '检查应急物资',
      },
    ],
  },
  {
    value: 'views/contingencyManage/contingencyPlan',
    label: '应急预案',
    describe: '应急管理:应急预案',
    children: [
      {
        value: 'contingency_plan_add',
        label: '新增应急预案',
      },
      {
        value: 'contingency_plan_view',
        label: '查看应急预案',
      },
      {
        value: 'contingency_plan_modify',
        label: '修改应急预案',
      },
      {
        value: 'contingency_plan_delete',
        label: '删除应急预案',
      },
      {
        value: 'contingency_plan_turn',
        label: '流转记录',
      },
      {
        value: 'contingency_plan_audit',
        label: '审核应急预案',
      },
    ],
  },
  // {
  //   value: 'views/contingencyManage/contingencyPlanCheck',
  //   label: '应急预案审核',
  //   describe: '应急管理:应急预案审核'
  // },
  {
    value: 'views/contingencyManage/drillPlan',
    label: '演练计划',
    describe: '应急管理:演练计划',
    children: [
      {
        value: 'drill_plan_add',
        label: '新增演练计划',
      },
      {
        value: 'drill_plan_view',
        label: '查看演练计划',
      },
      {
        value: 'drill_plan_modify',
        label: '修改演练计划',
      },
      {
        value: 'drill_plan_delete',
        label: '删除演练计划',
      },
      {
        value: 'drill_plan_turn',
        label: '流转记录',
      },
      {
        value: 'drill_plan_audit',
        label: '审核演练计划',
      },
    ],
  },
  // {
  //   value: 'views/contingencyManage/drillPlanCheck',
  //   label: '演练计划审核',
  //   describe: '应急管理:演练计划审核'
  // },
  {
    value: 'views/contingencyManage/drillRecord',
    label: '演练记录',
    describe: '应急管理:演练记录',
    children: [
      {
        value: 'drill_record_add',
        label: '新增演练记录',
      },
      {
        value: 'drill_record_view',
        label: '查看演练记录',
      },
      {
        value: 'drill_record_modify',
        label: '修改演练记录',
      },
      {
        value: 'drill_record_delete',
        label: '删除演练记录',
      },
      {
        value: 'drill_record_rectify',
        label: '整改演练记录',
      },
    ],
  },
  {
    value: 'views/contingencyManage/total',
    label: '汇总分析',
    describe: '应急管理:汇总分析',
  },
  // 事故管理
  {
    value: 'views/accidentManage/machineAccount',
    label: '事故台账',
    describe: '事故管理:事故台账',
    children: [
      {
        value: 'accident_book_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/accidentManage/investigationReport/index',
    label: '事故调查报告',
    describe: '事故管理:事故调查报告',
    children: [
      {
        value: 'accident_investigation_add',
        label: '新增事故',
      },
      {
        value: 'accident_investigation_report_add',
        label: '新增报告',
      },
      {
        value: 'accident_investigation_report_view',
        label: '查看',
      },
      {
        value: 'accident_investigation_report_modify',
        label: '修改',
      },
      {
        value: 'accident_investigation_report_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/accidentManage/investigationReport/investigationAudit',
    label: '事故调查审批列表',
    describe: '事故管理:事故调查审批列表',
    children: [
      {
        value: 'accident_investigation_audit_view',
        label: '查看',
      },
      {
        value: 'accident_investigation_audit',
        label: '审批',
      },
    ],
  },
  {
    value: 'views/accidentManage/processReport/index',
    label: '事故处理报告',
    describe: '事故管理:事故处理报告',
    children: [
      {
        value: 'accident_process_add',
        label: '新增',
      },
      {
        value: 'accident_process_view',
        label: '查看',
      },
      {
        value: 'accident_process_modify',
        label: '修改',
      },
      {
        value: 'accident_process_delete',
        label: '删除',
      },
    ],
  },
  {
    value: 'views/accidentManage/processReport/processAudit',
    label: '事故处理审批列表',
    describe: '事故管理:事故处理审批列表',
    children: [
      {
        value: 'accident_process_audit_record',
        label: '审批扭转记录',
      },
      {
        value: 'accident_process_audit_view',
        label: '查看',
      },
      {
        value: 'accident_process_audit',
        label: '审批',
      },
    ],
  },
  {
    value: 'views/accidentManage/workInjuryManage/index',
    label: '工伤管理',
    describe: '事故管理:工伤管理',
    children: [
      {
        value: 'work_injury_add',
        label: '新增',
      },
      {
        value: 'work_injury_view',
        label: '查看',
      },
      {
        value: 'work_injury_modify',
        label: '修改',
      },
    ],
  },
  {
    value: 'views/accidentManage/workInjuryManage/directory',
    label: '停工留薪分类目录',
    describe: '事故管理:工伤管理 停工留薪分类目录',
  },
  {
    value: 'views/accidentManage/workInjuryManage/notice',
    label: '通知书模板',
    describe: '事故管理:工伤管理 停工留薪通知书模板',
  },
  {
    value: 'views/accidentManage/statisticalChart/index',
    label: '事故统计图表',
    describe: '事故管理:事故统计图表',
  },
  {
    value: 'views/fireControl/sheet',
    label: '工单管理',
    describe: '消防管理:工单管理',
  },
  {
    value: 'views/fireControl/back',
    label: '工单回执',
    describe: '消防管理:工单回执',
  },
  {
    value: 'views/fireControl/stat',
    label: '工单统计',
    describe: '消防管理:工单统计',
  },
  {
    value: 'views/fireControl/point',
    label: '测点编码',
    describe: '消防管理:测点编码',
  },
  {
    value: 'views/fireControl/run',
    label: '运行记录',
    describe: '消防管理:运行记录',
  },
  {
    value: 'views/fireControl/safetyStandardizationAudit/index',
    label: '人员安全标准化自评',
    describe: '消防管理:人员安全标准化自评',
  },
  {
    value: 'views/fireControl/safetyStandardizationAuditInput/index',
    label: '安全标准化类别录入',
    describe: '消防管理:安全标准化类别录入',
  },
  {
    value: 'views/fireControl/safetyStandardizationAuditAnhuan/index',
    label: '自评台账(安环部)',
    describe: '消防管理:自评台账(安环部)',
  },
  // 体系评审
  {
    value: '@link-angel-system-review/internal-audit-plan', // 内审管理
    label: '内审计划',
    describe: '体系评审-内审管理：内审计划',
    children: [
      {
        value: 'internal_audit_plan_export',
        label: '导出',
      },
      {
        value: 'internal_audit_plan_modify',
        label: '编辑',
      },
      {
        value: 'internal_audit_plan_add',
        label: '新增',
      },
      {
        value: 'internal_audit_plan_view',
        label: '查看',
      },
      {
        value: 'internal_audit_plan_delete',
        label: '删除',
      },
      {
        value: 'internal_audit_plan_flow',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/internal-audit-plan-check',
    label: '内审计划审核',
    describe: '体系评审-内审管理：内审计划审核',
    children: [
      {
        value: 'internal_audit_plan_check_export',
        label: '导出',
      },
      {
        value: 'internal_audit_plan_check_view',
        label: '查看',
      },
      {
        value: 'internal_audit_plan_check_delete',
        label: '删除',
      },
      {
        value: 'internal_audit_plan_check_audit',
        label: '审核',
      },
      {
        value: 'internal_audit_plan_check_submit',
        label: '提交',
      },
      {
        value: 'internal_audit_plan_check_flow',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/internal-audit-discovery',
    label: '内审发现项',
    describe: '体系评审-内审管理：内审发现项',
    children: [
      {
        value: 'internal_audit_discovery_import',
        label: '导入',
      },
      {
        value: 'internal_audit_discovery_export',
        label: '导出',
      },
      {
        value: 'internal_audit_discovery_modify',
        label: '编辑',
      },
      {
        value: 'internal_audit_discovery_add',
        label: '新增',
      },
      {
        value: 'internal_audit_discovery_view',
        label: '查看',
      },
      {
        value: 'internal_audit_discovery_delete',
        label: '删除',
      },
      {
        value: 'internal_audit_discovery_audit',
        label: '审核',
      },
    ],
  },
  {
    value: '@link-angel-system-review/internal-audit-report',
    label: '内审报告',
    describe: '体系评审-内审管理：内审报告',
    children: [
      {
        value: 'internal_audit_report_export',
        label: '导出',
      },
      {
        value: 'internal_audit_report_view',
        label: '查看',
      },
      {
        value: 'internal_audit_report_modify',
        label: '编辑',
      },
      {
        value: 'internal_audit_report_audit',
        label: '审核结论',
      },
      {
        value: 'internal_audit_report_submit',
        label: '提交审核',
      },
    ],
  },
  {
    value: '@link-angel-system-review/internal-audit-report-check',
    label: '内审报告审核',
    describe: '体系评审-内审管理：内审报告审核',
    children: [
      {
        value: 'internal_audit_report_check_export',
        label: '导出',
      },
      {
        value: 'internal_audit_report_check_view',
        label: '查看',
      },
      {
        value: 'internal_audit_report_check_audit',
        label: '审核',
      },
    ],
  },
  {
    value: '@link-angel-system-review/external-audit-plan', // 外审管理
    label: '外审计划',
    describe: '体系评审-外审管理：外审计划',
    children: [
      {
        value: 'external_audit_plan_import',
        label: '导入',
      },
      {
        value: 'external_audit_plan_export',
        label: '导出',
      },
      {
        value: 'external_audit_plan_modify',
        label: '编辑',
      },
      {
        value: 'external_audit_plan_add',
        label: '新增',
      },
      {
        value: 'external_audit_plan_view',
        label: '查看',
      },
      {
        value: 'external_audit_plan_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-system-review/external-audit-discovery',
    label: '外审发现项',
    describe: '体系评审-外审管理：外审发现项',
    children: [
      {
        value: 'external_audit_discovery_import',
        label: '导入',
      },
      {
        value: 'external_audit_discovery_export',
        label: '导出',
      },
      {
        value: 'external_audit_discovery_modify',
        label: '编辑',
      },
      {
        value: 'external_audit_discovery_add',
        label: '新增',
      },
      {
        value: 'external_audit_discovery_view',
        label: '查看',
      },
      {
        value: 'external_audit_discovery_audit',
        label: '审核',
      },
      {
        value: 'external_audit_discovery_delete',
        label: '删除',
      },
    ],
  },
  {
    value: '@link-angel-system-review/external-audit-report',
    label: '外审报告',
    describe: '体系评审-外审管理：外审报告',
    children: [
      {
        value: 'external_audit_report_export',
        label: '导出',
      },
      {
        value: 'external_audit_report_view',
        label: '查看',
      },
    ],
  },
  {
    value: '@link-angel-system-review/management-audit-plan', // 管理评审
    label: '管理评审计划',
    describe: '体系评审-管理评审：管理评审计划',
    children: [
      {
        value: 'management_audit_plan_export',
        label: '导出',
      },
      {
        value: 'management_audit_plan_import',
        label: '导入',
      },
      {
        value: 'management_audit_plan_add',
        label: '新增',
      },
      {
        value: 'management_audit_plan_view',
        label: '查看',
      },
      {
        value: 'management_audit_plan_modify',
        label: '编辑',
      },
      {
        value: 'management_audit_plan_delete',
        label: '删除',
      },
      {
        value: 'management_audit_plan_record',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/management-audit-plan-check',
    label: '管理评审计划审核',
    describe: '体系评审-管理评审：管理评审计划审核',
    children: [
      {
        value: 'management_audit_plan_check_view',
        label: '查看',
      },
      {
        value: 'management_audit_plan_check_audit',
        label: '审核',
      },
      {
        value: 'management_audit_plan_check_delete',
        label: '删除',
      },
      {
        value: 'management_audit_plan_check_submit',
        label: '提交',
      },
      {
        value: 'management_audit_plan_check_record',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/management-audit-report',
    label: '管理评审报告',
    describe: '体系评审-管理评审：管理评审报告',
    children: [
      {
        value: 'management_audit_report_export',
        label: '导出',
      },
      {
        value: 'management_audit_report_import',
        label: '导入',
      },
      {
        value: 'management_audit_report_add',
        label: '新增',
      },
      {
        value: 'management_audit_report_view',
        label: '查看',
      },
      {
        value: 'management_audit_report_modify',
        label: '编辑',
      },
      {
        value: 'management_audit_report_delete',
        label: '删除',
      },
      {
        value: 'management_audit_report_record',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/management-audit-report-check',
    label: '管理评审报告审核',
    describe: '体系评审-管理评审：管理评审报告审核',
    children: [
      {
        value: 'management_audit_report_check_view',
        label: '查看',
      },
      {
        value: 'management_audit_report_check_audit',
        label: '审核',
      },
      {
        value: 'management_audit_report_check_delete',
        label: '删除',
      },
      {
        value: 'management_audit_report_check_submit',
        label: '提交',
      },
      {
        value: 'management_audit_report_check_record',
        label: '流转记录',
      },
    ],
  },
  {
    value: '@link-angel-system-review/safety-standardization-audit-input',
    label: '安全标准化评定标准',
    describe: '体系评审：安全标准化评定标准',
    children: [
      {
        value: 'safety_standardization_audit_input_add',
        label: '新增',
      },
      {
        value: 'safety_standardization_audit_input_view',
        label: '查看',
      },
      {
        value: 'safety_standardization_audit_input_delete',
        label: '删除',
      },
      {
        value: 'safety_standardization_audit_input_modify',
        label: '编辑',
      },
    ],
  },
  {
    value: '@link-angel-system-review/safety-standardization-audit-report',
    label: '安全标准化自评报告',
    describe: '体系评审：安全标准化自评报告',
    children: [
      {
        value: 'safety_standardization_audit_report_add',
        label: '新增',
      },
      {
        value: 'safety_standardization_audit_report_view',
        label: '查看',
      },
      {
        value: 'safety_standardization_audit_report_delete',
        label: '删除',
      },
      {
        value: 'safety_standardization_audit_report_modify',
        label: '编辑',
      },
    ],
  },
  // {
  //   value: '@link-angel-system-review/safety-standardization-audit', // 安全标准化评审
  //   label: '安全标准化评审',
  //   describe: '体系评审：安全标准化评审(具体人员)'
  // },
  // {
  //   value: '@link-angel-system-review/safety-standardization-audit-anhuan',
  //   label: '自评台账(安环部)',
  //   describe: '体系评审：安全标准化评审(安环部)'
  // },
  {
    value: '@link-angel-system-review/external-inspection', // 外部检查
    label: '外部检查(安环部)',
    describe: '体系评审：外部检查(安环部)',
    children: [
      {
        value: 'external_inspection_import',
        label: '导入',
      },
      {
        value: 'external_inspection_export',
        label: '导出',
      },
      {
        value: 'external_inspection_modify',
        label: '编辑',
      },
      {
        value: 'external_inspection_add',
        label: '新增',
      },
      {
        value: 'external_inspection_view',
        label: '查看',
      },
      {
        value: 'external_inspection_delete',
        label: '删除',
      },
      {
        value: 'external_inspection_audit',
        label: '复核',
      },
      {
        value: 'external_inspection_trouble_import',
        label: '隐患导入',
      },
    ],
  },
  {
    value: '@link-angel-system-review/external-inspection-rectify',
    label: '外部检查(整改责任部门)',
    describe: '体系评审：外部检查(整改责任部门)',
    children: [
      {
        value: 'external-inspection-rectify_modify',
        label: '编辑',
      },
      {
        value: 'external-inspection-rectify_view',
        label: '查看',
      },
    ],
  },
  {
    value: '@link-angel-system-review/system-review-book', // 体系评审台账
    label: '体系评审台账',
    describe: '体系评审：体系评审台账',
    children: [
      {
        value: 'system_review_book_add',
        label: '新增',
      },
      {
        value: 'system_review_book_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/contractor/info',
    label: '承包商信息',
    describe: '承包商管理：承包商信息',
    children: [
      {
        value: 'contractor_info_add',
        label: '新增承包商信息',
      },
      {
        value: 'contractor_info_view',
        label: '查看承包商信息',
      },
      {
        value: 'contractor_info_modify',
        label: '修改承包商信息',
      },
      {
        value: 'contractor_info_delete',
        label: '删除承包商信息',
      },
      {
        value: 'contractor_info_remind',
        label: '设置提醒',
      },
      {
        value: 'contractor_info_reaudit',
        label: '复核承包商信息',
      },
      {
        value: 'contractor_info_applyReaudit',
        label: '申请复核',
      },
    ],
  },
  {
    value: 'views/contractor/archive',
    label: '承包商档案资料库',
    describe: '承包商管理：承包商档案资料库',
  },
  {
    value: 'views/contractor/black',
    label: '承包商黑名单',
    describe: '承包商管理：承包商黑名单',
    children: [
      {
        value: 'contractor_black_add',
        label: '加入黑名单',
      },
      {
        value: 'contractor_black_delete',
        label: '移除黑名单',
      },
    ],
  },
  {
    value: 'views/contractor/audit',
    label: '承包商审核',
    describe: '承包商管理：承包商审核',
    children: [
      {
        value: 'contractor_audit_period',
        label: '设置审核周期',
      },
      {
        value: 'contractor_audit_audit',
        label: '审核承包商',
      },
    ],
  },
  {
    value: 'views/contractor/pic',
    label: '承包商人员证照',
    describe: '承包商管理：承包商人员证照',
    children: [
      {
        value: 'contractor_pic_add',
        label: '新增人员证照',
      },
      {
        value: 'contractor_pic_view',
        label: '查看人员证照',
      },
      {
        value: 'contractor_pic_modify',
        label: '修改人员证照',
      },
      {
        value: 'contractor_pic_delete',
        label: '删除人员证照',
      },
      {
        value: 'contractor_pic_in',
        label: '导入人员证照',
      },
      {
        value: 'contractor_pic_out',
        label: '导出人员证照',
      },
    ],
  },
  {
    value: 'views/contractor/train',
    label: '承包商人员培训记录',
    describe: '承包商管理：承包商人员培训记录',
  },
  {
    value: 'views/contractor/exam',
    label: '承包商人员考试记录',
    describe: '承包商管理：承包商人员考试记录',
  },
  {
    value: 'views/contractor/construction',
    label: '承包商施工管理',
    describe: '承包商管理：承包商施工管理',
    children: [
      {
        value: 'contractor_construction_detail',
        label: '详情',
      },
      {
        value: 'contractor_construction_record',
        label: '审批记录',
      },
    ],
  },
  {
    value: 'views/contractor/three',
    label: '承包商三违考核',
    describe: '承包商管理：承包商三违考核',
    children: [
      {
        value: 'contractor_three_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/contractor/chart',
    label: '承包商数据分析图表',
    describe: '承包商管理：承包商数据分析图表',
  },
  // 集团报表管理
  {
    value: '@link-angel-group-report/emergency-exercise',
    label: '应急演练',
    describe: '集团报表管理-安全月度报表：应急演练',
  },
  {
    value: '@link-angel-group-report/external-inspection',
    label: '外部检查',
    describe: '集团报表管理-安全月度报表：外部检查',
  },
  {
    value: '@link-angel-group-report/hazardous-operation',
    label: '危险作业',
    describe: '集团报表管理-安全月度报表：危险作业',
  },
  {
    value: '@link-angel-group-report/safety-rewards',
    label: '安全奖励',
    describe: '集团报表管理-安全月度报表：安全奖励',
  },
  {
    value: '@link-angel-group-report/safety-train',
    label: '安全培训',
    describe: '集团报表管理-安全月度报表：安全培训',
  },
  {
    value: '@link-angel-group-report/safety-weekly-meeting',
    label: '安全周会',
    describe: '集团报表管理-安全月度报表：安全周会',
  },
  {
    value: '@link-angel-group-report/three-violations-assessment',
    label: '三违考核',
    describe: '集团报表管理-安全月度报表：三违考核',
  },
  {
    value: '@link-angel-group-report/trouble-check',
    label: '隐患排查',
    describe: '集团报表管理-安全月度报表：隐患排查',
  },
  {
    value: '@link-angel-group-report/safety-incident',
    label: '安全事故',
    describe: '集团报表管理-安全月度报表：安全事故',
  },
  {
    value: '@link-angel-group-report/weekly-check',
    label: '周检',
    describe: '集团报表管理-安全月度报表：周检',
  },
  {
    value: '@link-angel-group-report/change-management',
    label: '变更管理',
    describe: '集团报表管理-安全月度报表：变更管理',
  },
  {
    value: '@link-angel-group-report/safety-devote-expense-breakdown',
    label: '安全投入费用明细',
    describe: '集团报表管理-安全投入报表：安全投入费用明细（分子公司 ）',
  },
  {
    value: '@link-angel-group-report/safety-devote-expense-summary',
    label: '安全投入费用汇总',
    describe: '集团报表管理-安全投入报表：安全投入费用汇总（集团公司 ）',
  },
  // 敏捷开发 代码生成示例
  {
    value: 'views/modules/test/genfirst/TestGenFirstList',
    label: '单表示例',
    describe: '生成示例：单表示例',
  },
  {
    value: 'views/modules/test/onetomany/TestDataMainFormList',
    label: '主附表示例',
    describe: '生成示例：主附表示例',
  },
  {
    value: 'views/modules/test/tree/TestTreeList',
    label: '树结构示例',
    describe: '生成示例：树结构示例',
  },
  {
    value: 'views/modules/test/treetable/TestCarList',
    label: '左树右表示例',
    describe: '生成示例：左树右表示例',
  },
  {
    value: 'views/modules/test/activiti/TestActivitiLeaveList',
    label: '工作流表示例',
    describe: '生成示例：工作流表示例',
  },
  // 智能巡检V0.3
  {
    value: 'views/yxInspection/InspectionItem',
    label: '巡检项管理',
    describe: '智能巡检V0.3：巡检项管理',
    children: [
      {
        value: 'yx_inspection_item_add',
        label: '新增',
      },
      {
        value: 'yx_inspection_item_edit',
        label: '编辑',
      },
      {
        value: 'yx_inspection_item_delete',
        label: '删除',
      },
      {
        value: 'yx_inspection_item_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionPoint',
    label: '巡检点管理',
    describe: '智能巡检V0.3：巡检点管理',
    children: [
      {
        value: 'yx_inspection_point_add',
        label: '新增',
      },
      {
        value: 'yx_inspection_point_edit',
        label: '编辑',
      },
      {
        value: 'yx_inspection_point_delete',
        label: '删除',
      },
      {
        value: 'yx_inspection_point_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionRoute',
    label: '巡检路线',
    describe: '智能巡检V0.3：巡检路线管理',
    children: [
      {
        value: 'yx_inspection_route_add',
        label: '新增',
      },
      {
        value: 'yx_inspection_route_edit',
        label: '编辑',
      },
      {
        value: 'yx_inspection_route_delete',
        label: '删除',
      },
      {
        value: 'yx_inspection_route_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionPlan',
    label: '巡检计划',
    describe: '智能巡检V0.3：巡检计划管理',
    children: [
      {
        value: 'yx_inspection_plan_add',
        label: '新增',
      },
      {
        value: 'yx_inspection_plan_edit',
        label: '编辑',
      },
      {
        value: 'yx_inspection_plan_delete',
        label: '删除',
      },
      {
        value: 'yx_inspection_plan_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionRecord',
    label: '巡检记录',
    describe: '智能巡检V0.3：巡检记录查询',
    children: [
      {
        value: 'yx_inspection_record_view',
        label: '查看',
      },
      {
        value: 'yx_inspection_record_export',
        label: '导出',
      },
    ],
  },
  {
    value: 'views/yxInspection/ExceptionRecord',
    label: '异常记录',
    describe: '智能巡检V0.3：异常记录管理',
    children: [
      {
        value: 'yx_exception_record_view',
        label: '查看',
      },
      {
        value: 'yx_exception_record_handle',
        label: '处理',
      },
    ],
  },
  {
    value: 'views/yxInspection/UrgentRecord',
    label: '紧急记录',
    describe: '智能巡检V0.3：紧急记录查看',
    children: [
      {
        value: 'yx_urgent_record_view',
        label: '查看',
        describe: '紧急记录：查看详情',
      },
    ],
  },
  {
    value: 'views/yxInspection/KnowledgeBase',
    label: '知识库',
    describe: '智能巡检V0.3：巡检知识库管理',
    children: [
      {
        value: 'yx_knowledge_base_add',
        label: '新增',
      },
      {
        value: 'yx_knowledge_base_edit',
        label: '编辑',
      },
      {
        value: 'yx_knowledge_base_delete',
        label: '删除',
      },
      {
        value: 'yx_knowledge_base_view',
        label: '查看',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionOverview',
    label: '巡检总览',
    describe: '智能巡检V0.3：巡检数据总览',
  },
  {
    value: 'views/yxInspection/ViolationRecord',
    label: '违规记录',
    describe: '智能巡检V0.3：违规记录管理',
    children: [
      {
        value: 'yx_violation_record_view',
        label: '查看',
      },
      {
        value: 'yx_violation_record_handle',
        label: '审核',
      },
      {
        value: 'yx_violation_record_export',
        label: '导出',
      },
    ],
  },
  {
    value: 'views/yxInspection/SafetyRecord',
    label: '安全记录',
    describe: '智能巡检V0.3：安全记录管理',
    children: [
      {
        value: 'yx_safety_record_view',
        label: '查看',
      },
      {
        value: 'yx_safety_record_handle',
        label: '处理',
      },
      {
        value: 'yx_safety_record_export',
        label: '导出',
      },
    ],
  },
  {
    value: 'views/yxInspection/InspectionReport',
    label: '巡检报告',
    describe: '智能巡检V0.3：巡检报告',
  },
  {
    value: 'views/yxInspection/ReportArchive',
    label: '报告归档',
    describe: '智能巡检V0.3：报告归档',
    children: [
      { value: 'yx_report_archive_view', label: '查看' },
    ],
  },
  {
    value: 'views/yxInspection/InspectionOverview',
    label: '巡检总览',
    describe: '智能巡检V0.3：巡检总览',
  },
  {
    value: 'views/yxInspection/TerminalList',
    label: '终端列表',
    describe: '智能巡检：终端设备管理',
    children: [
      { value: 'yx_terminal_add', label: '新增' },
      { value: 'yx_terminal_edit', label: '编辑' },
      { value: 'yx_terminal_delete', label: '删除' },
      { value: 'yx_terminal_view', label: '查看' },
    ],
  },
  {
    value: 'views/yxInspection/InspectionMeeting',
    label: '远程指导',
    describe: '智能巡检：远程指导',
  },
  {
    value: 'views/yjInspection/TrainingSetData',
    label: '训练集数据',
    describe: '两山易检：训练集数据',
  },
  {
    value: 'views/yjInspection/TianjianData',
    label: '天健mqtt数据',
    describe: '两山易检：天健mqtt数据',
  },
  {
    value: 'views/yjInspection/TianjianInstallationRecord',
    label: '天健安装记录',
    describe: '两山易检：天健安装记录',
  },
  {
    value: 'views/yjInspection/PositionCode',
    label: '点位编码',
    describe: '两山易检：点位编码',
  },
]
