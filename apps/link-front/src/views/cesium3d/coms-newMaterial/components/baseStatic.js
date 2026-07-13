export const textLabel = [
  { label: '检测时间', value: 'signTime', id: 1 },
  { label: '检测点位', value: 'gasAnalystPoint', id: 2 },
  { label: '氧气含量', value: 'oxygen', id: 3 },
  { label: '硫化氢', value: 'hydrogenSulfide', id: 4 },
  { label: '一氧化碳', value: 'carbonMonoxide', id: 5 },
  { label: '可燃气体', value: 'flammableGases', id: 6 },
  { label: '结论', value: 'conclusion', id: 7 },
  { label: '检测人', value: 'signImagePath', id: 8 },
]
export const spaceLabel = [
  { label: '检测时间', value: 'signTime', id: 1 },
  { label: '检测点位', value: 'checkPoint', id: 2 },
  {
    label: '起重机型号',
    value: 'craneModel',
    id: 3,
  },
  {
    label: '设备状态',
    value: 'deviceStatus',
    id: 4,
  },
  {
    label: '驾驶人状态',
    value: 'driverStatus',
    id: 5,
  },
  {
    label: '最大起重量',
    value: 'maxWeight',
    id: 6,
  },
  { label: '结论', value: 'conclusion', id: 7 },
  { label: '检测人', value: 'signImagePath', id: 8 },
]
export const powerLabel = [
  { label: '检测时间', value: 'signTime', id: 1 },
  { label: '检测点位', value: 'checkPoint', id: 2 },
  {
    label: '接入点保护与负荷承载能力',
    value: 'checkProtectAndLoad',
    id: 3,
  },
  {
    label: '临时用电线缆型号',
    value: 'cableModel',
    id: 4,
  },
  {
    label: 'PE线与重复接地点设置',
    value: 'peLineAndRepeatPoint',
    id: 5,
  },
  {
    label: '安全防护',
    value: 'safetyProtection',
    id: 6,
  },
  { label: '结论', value: 'conclusion', id: 7 },
  { label: '检测人', value: 'signImagePath', id: 8 },
]
export const circuitLabel = [
  { label: '检测时间', value: 'signTime', id: 1 },
  { label: '检测点位', value: 'gasAnalystPoint', id: 2 },
  {
    label: '断路安全措施',
    value: 'safetyProtection',
    id: 3,
  },
  {
    label: '安全警示标识',
    value: 'safetyWarning',
    id: 4,
  },
  {
    label: '夜间照明与灯光警示',
    value: 'nightLightWarning',
    id: 5,
  },
  {
    label: '车辆人员疏导措施',
    value: 'vehiclePeopleDiversion',
    id: 6,
  },
  { label: '结论', value: 'conclusion', id: 7 },
  { label: '检测人', value: 'signImagePath', id: 8 },
]
export const breakGroundLabel = [
  { label: '检测时间', value: 'signTime', id: 1 },
  { label: '检测点位', value: 'checkPoint', id: 2 },
  {
    label: '动土区域深度',
    value: 'depth',
    id: 3,
  },
  {
    label: '安全防护措施',
    value: 'safetyProtection',
    id: 4,
  },
  {
    label: '夜间照明与警示',
    value: 'nightLight',
    id: 5,
  },
  {
    label: '支护与放坡',
    value: 'supportAndSlope',
    id: 6,
  },
  {
    label: '下部电缆与管道',
    value: 'undergroundCable',
    id: 7,
  },
  { label: '结论', value: 'conclusion', id: 8 },
  { label: '检测人', value: 'signImagePath', id: 9 },
]

export const identifyRisks = [
  {
    risk: '作业人员不清楚作业内容及现场风险因素；',
    method: '现场进行安全培训，对作业内容交底，作业人员和监护人熟悉逃生路线。',
    value: 0,
    number: 1,
  },
  {
    risk: '作业人员有禁忌症易发生人身伤亡事故；',
    method: '作业人员身体条件符合要求。',
    value: 0,
    number: 2,
  },
  {
    risk: '未规范穿戴防护用品对人身造成伤害；',
    method: '认真检查作业人员着装、安全帽、安全带等防护用品符合要求。',
    value: 0,
    number: 3,
  },
  {
    risk: '作业区域工器具坠落伤人；',
    method: '作业人员携带有工具袋，严禁高空抛物。',
    value: 0,
    number: 4,
  },
  {
    risk: '高处作业易发生坠落；',
    method: '作业者佩戴安全带作业，戴好安全帽。',
    value: 0,
    number: 5,
  },
  {
    risk: '作业区域闲杂人员进入造成伤害；',
    method: '作业点下方设警戒区并有警戒标志。',
    value: 0,
    number: 6,
  },
  {
    risk: '施工搭设脚手架、防护网、防护围栏不规范造成人员坠落；',
    method: '现场搭设的脚手架、防护网、防护栏符合安全规程。',
    value: 0,
    number: 7,
  },
  {
    risk: '作业面上有孔洞易坠落伤人；',
    method: '用隔板将孔洞封严或用搭设围栏与孔洞隔离。',
    value: 0,
    number: 8,
  },
  {
    risk: '垂直交叉作业坠落物坠落伤人；',
    method: '垂直分层作业中间有隔离设施。',
    value: 0,
    number: 9,
  },
  {
    risk: '作业时安全绳、梯子断裂坠落伤人；',
    method: '检查梯子或绳梯符合安全规程规定。',
    value: 0,
    number: 10,
  },
  {
    risk: '作业现场上下通行不畅；',
    method: '建立通道，搭设上下梯子。',
    value: 0,
    number: 11,
  },
  {
    risk: '作业场所照明不符合要求；',
    method: '使用安全电压照明。',
    value: 0,
    number: 12,
  },
  {
    risk: '在脚手板等不承重物上放置重物，导致断裂，发生高处坠落；',
    method: '在石棉瓦等不承重物上作业应搭设牢固承重板并站在固定承重板上。',
    value: 0,
    number: 13,
  },
  {
    risk: '夜间高处作业照明不足易发生事故；',
    method: '夜间高处作业应充足照明，安装临时行灯、防爆灯，使用安全电压。',
    value: 0,
    number: 14,
  },
  {
    risk: '梯子未固定易发生人员伤亡事故；',
    method: '登高梯子进行固定，符合安全规程规定。',
    value: 0,
    number: 15,
  },
  {
    risk: '作业现场脚手板、踏板等未固定；',
    method: '在高处作业使用固定好的跳板、踏板等。',
    value: 0,
    number: 16,
  },
  {
    risk: '作业时安全带未有效系挂；',
    method: '安全带必须高挂低用。',
    value: 0,
    number: 17,
  },
  {
    risk: '作业现场未设置监护人；',
    method: '必须设专人监护，且监护人必须坚守岗位。',
    value: 0,
    number: 18,
  },
  {
    risk: '监护人看不到作业人员作业；',
    method: '作业人与监护人确定联络信号定期联络。',
    value: 0,
    number: 19,
  },
  {
    risk: '发生突发事件遗漏作业人员；',
    method: '每次作业前清点人数。',
    value: 0,
    number: 20,
  },
  {
    risk: '特殊天气高处作业易发生伤人事故；',
    method: '遇有5级以上强风、浓雾、大雪、暴雨等恶劣天气，不得进行高处作业。',
    value: 0,
    number: 21,
  },
]

export const closeSignSections = [
  [
    {
      description: '作业现场负责人签字：',
      role: '作业现场负责人',
    },
    {
      description: '涉及电气系统作业属地电工签字：',
      role: '属地电气管理人员',
    },
  ],
  [
    {
      description: '监护人签字：',
      role: '监护人',
    },
    {
      description: '作业单位负责人或作业实施单位主管部门人员签字:',
      role: '作业属地单位部门',
    },
  ],
  [
    {
      description: '作业属地单位/部门管理人员或作业属地安全环保管理职能部门人员签字:',
      role: '安全环保管理职能部门',
    },
  ],
]

export const confirmSections = [
  [
    {
      description: '作业单位现场负责人或作业实施单位主管部门负责人现场安全环保确认签字：',
      role: '作业现场负责人',
      type: ['气体检测审批', '安全确认审批'],
    },
    {
      description: '若涉及相关方及属地电工,则相关方及属地电工现场安全环保确认签字：',
      role: '相关方现场负责人',
      type: ['气体检测审批', '安全确认审批'],
    },
  ],
  [
    {
      description: '作业属地管理人员现场安全环保确认签字:',
      role: '作业属地单位部门',
      type: ['气体检测审批', '安全确认审批'],
    },
    {
      description: '作业属地安全环保管理职能部门现场安全环保确认签字:',
      role: '安全环保管理职能部门',
      type: ['气体检测审批', '安全确认审批'],
    },
  ],
]

export const signatureSections = [
  [
    {
      description:
        '我代表作业单位(作业实施单位)提出作业申请，并组织进行作业风险分析，确认安全措施落实到位。',
      title: '作业现场负责人签字：',
      role: '作业现场负责人',
    },
    {
      description:
        '我代表相关方单位对作业方案进行确认，能够确保我方作业安全同时我方将保证作业单位的安全。',
      title: '相关方现场负责人签字：',
      role: '相关方现场负责人',
    },
  ],
  [
    {
      description: '我确认作业单位已经落实安全措施，我承诺全程坚守作业现场对作业进行监护。',
      title: '监护人签字:',
      role: '监护人',
    },
    {
      description: '我代表属地确认现场用电符合属地电气系统要求。',
      title: '属地电气管理人员签字：',
      role: '属地电气管理人员',
    },
  ],
  [
    {
      description:
        '我代表业务主管部门，对作业实施单位方案进行审核，并确认符合作业安全环保需求，批准作业。',
      title: '作业主管部门负责人签字：',
      role: '作业主管部门负责人',
    },
    {
      description:
        '我代表作业属地单位/部门审核许可证，并对作业现场安全措施落实情况进行了检查确认。',
      title: '作业属地单位部门签字：',
      role: '作业属地单位部门',
    },
    {
      description: '我代表属地安全环保管理职能部门对作业方案进行审核，并现场检查符合作业标准要求。',
      title: '安全环保管理职能部门签字：',
      role: '安全环保管理职能部门',
    },
  ],
  [
    {
      description: '我代表公司，审核高度危险作业方案，已安排现场检查并确认符合作业标准要求。',
      title: '公司领导审批：',
      role: '公司领导',
    },
  ],
]

export const specialWorkItems = [
  { name: '交叉作业', value: 1 },
  { name: '多重作业', value: 2 },
  { name: '夜间作业', value: 3 },
  { name: '相关方作业', value: 4 },
  { name: '特殊气候条件作业', value: 5 },
  { name: '特殊时段作业', value: 6 },
  { name: '其他', value: 7 },
]

export const otherWorkItem = [
  { name: '临时用电', code: 1004, value: 1 },
  { name: '高处作业', code: 1003, value: 2 },
  { name: '吊装作业', code: 1007, value: 3 },
  { name: '有限空间作业', code: 1002, value: 4 },
  { name: '盲板抽堵', code: 1008, value: 5 },
  { name: '断路作业', code: 1005, value: 6 },
  { name: '动土作业', code: 1006, value: 7 },
  { name: '其他', value: 8 },
]
export const workRisks = [
  { name: '物体打击', value: 1 },
  { name: '车辆伤害', value: 2 },
  { name: '机械伤害', value: 3 },
  { name: '起重伤害', value: 4 },
  { name: '触电', value: 5 },
  { name: '淹溺', value: 6 },
  { name: '灼烫', value: 7 },
  { name: '火灾', value: 8 },
  { name: '高处坠落', value: 9 },
  { name: '坍塌', value: 10 },
  { name: '冒顶片帮', value: 11 },
  { name: '透水', value: 12 },
  { name: '放炮', value: 13 },
  { name: '火药爆炸', value: 14 },
  { name: '瓦斯炸', value: 15 },
  { name: '锅炉爆炸', value: 16 },
  { name: '容器爆炸', value: 17 },
  { name: '中毒', value: 18 },
  { name: '窒息', value: 19 },
  { name: '其它爆炸', value: 20 },
  { name: '其他', value: 21 },
]

export const checkboxValue = [
  { label: '是', value: true },
  { label: '否', value: false },
]
