// LS法计算风险等级
export function getDataByLS(num) {
  let name = ''
  let value = 1
  if (num <= 7) {
    name = '低风险'
    value = 0
  }
  else if (num >= 8 && num <= 12) {
    name = '一般风险'
    value = 1
  }
  else if (num >= 13 && num <= 16) {
    name = '较大风险'
    value = 2
  }
  else {
    name = '重大风险'
    value = 3
  }
  return { name, value }
}

// LEC法计算风险等级
export function getDataByLEC(num) {
  let name = ''
  let value = 1
  if (num <= 70) {
    name = '低风险'
    value = 0
  }
  else if (num > 70 && num <= 160) {
    name = '一般风险'
    value = 1
  }
  else if (num >= 160 && num <= 320) {
    name = '较大风险'
    value = 2
  }
  else {
    name = '重大风险'
    value = 3
  }
  return { name, value }
}

// LEC判定法 - 事故发生的可能性
export const LEC_L = [
  {
    label: '(10)完全可以预料',
    value: 10,
  },
  {
    label: '(6)相当可能',
    value: 6,
  },
  {
    label: '(3)可能，但不经常',
    value: 3,
  },
  {
    label: '(1)可能性小，完全意外',
    value: 1,
  },
  {
    label: '(0.5)很不可能，可以设想',
    value: 0.5,
  },
  {
    label: '(0.2)极不可能',
    value: 0.2,
  },
  {
    label: '(0.1)实际不可能',
    value: 0.1,
  },
]

// LEC判定法 - 暴露于危险环境的频繁程度
export const LEC_E = [
  {
    label: '(10)连续暴露(8小时不离工作岗位);常态（危险状态常存）',
    value: 10,
  },
  {
    label: '(6)每天工作时间内暴露（8小时内暴露一至多次）;每天工作时间出现（危险状态出现一至多次）',
    value: 6,
  },
  {
    label: '(3)每周一次或偶然暴露',
    value: 3,
  },
  {
    label: '(2)每月一次暴露',
    value: 2,
  },
  {
    label: '(1)每年几次暴露',
    value: 1,
  },
  {
    label: '(0.5)非常罕见暴露',
    value: 0.5,
  },
]

// LEC判定法 - 发生事故产生的后果
export const LEC_C = [
  {
    label:
      '(100)大灾难，3人以上死亡，或10人以上重伤;严重违反法律法规和标准;经济损失500万元以上;公司停产;重大国际、国内影响',
    value: 100,
  },
  {
    label:
      '(40)灾难，1～2人死亡，或3人以上10人以下重伤;违反法律法规和标准;经济损失150万元以上;装置停工;行业内、省内影响',
    value: 40,
  },
  {
    label:
      '(15)非常严重，重大致残，3人以下重伤;潜在违反法规和标准;经济损失50万元以上;部分装置停工;地区影响',
    value: 15,
  },
  {
    label:
      '(7)严重重伤，丧失劳动力、截肢、骨折、听力丧失、慢性病;不符合上级或行业的安全方针、制度、规定等;经济损失10万元以上;部分设备停工;公司及周边范围影响',
    value: 7,
  },
  {
    label:
      '(3)重大伤害，包括轻微受伤、间歇不舒服;不符合公司的安全操作程序、规定;经济损失1万元以上;1套设备停工;引人关注，不利于基本的安全卫生要求',
    value: 3,
  },
  {
    label: '(1)引人注目，需要救护;完全符合;经济损失1万元以下;没有停工;形象没有受损',
    value: 1,
  },
]

// LS判定法 - 事件发生可能性L判定准则
export const LS_L = [
  {
    label:
      '(5)在现场没有采取防范、监测、保护、控制措施，或危险有害因素的发生不能被发现，或在正常情况下经常发生此类事故或事件',
    value: 5,
  },
  {
    label:
      '(4)危险有害因素的发生不能被发现，现场没有检测系统，也未做过任何监测，或在现场有控制措施，但未有效执行或控制措施不当，或危险有害因素常发生或在预期情况下发生',
    value: 4,
  },
  {
    label:
      '(3)没有保护措施，或未严格按操作程序执行，或危险、有害因素的发生容易被发现，或曾经做过监测，或过去曾经发生类似的事故或事件，或在异常情况下发生过类似事故或事件',
    value: 3,
  },
  {
    label:
      '(2)危险有害因素一旦发生能及时发现，并定期进行监测，或现场有防范控制措施，并有有效执行或过去偶尔发生危险事故或事件',
    value: 2,
  },
  {
    label:
      '(1)有充分、有效的防范、控制、监测、保护措施，或员工安全卫生意识相当高，严格执行操作规范，极不可能发生事故或事件',
    value: 1,
  },
]

// LS判定法 - 事件后果严重性S判定准则
export const LS_S = [
  {
    label:
      '(5)违反法律、法规、标准；致人死亡；财产损失大于50万元；大规模影响公司外环境；部分装置（大于2套）或设备停工；造成重大国际国内影响',
    value: 5,
  },
  {
    label:
      '(4)潜在违反法规、标准；致人丧失劳动力；财产损失大于25万元；公司内严重污染；2套装置停工或设备停工；造成行业内、省内影响',
    value: 4,
  },
  {
    label:
      '(3)不符合上级公司或行业的安全方针、制度、规定等；致人截肢、骨折、听力丧失、慢性病；财产损失大于10万元；公司范围内中等污染；一套装置或设备停工；造成地区影响',
    value: 3,
  },
  {
    label:
      '(2)不符合公司的安全操作规程；致人轻微受伤、间歇不舒服；财产损失小于10万元；装置范围内污染；受影响不大，几乎不停工；造成公司及周边范围影响',
    value: 2,
  },
  {
    label: '(1)完全符合要求；无人员伤亡；无财产损失；没有污染；没有停工；没有形象损失',
    value: 1,
  },
]

/* 湖北 */
// // 风险等级
// export const RiskLevel = [
//   { label: "低风险", value: 1 },
//   { label: "一般风险", value: 2 },
//   { label: "较大风险", value: 3 },
//   { label: "重大风险", value: 4 },
// ]
// // 管控层级
// export const CtrlLayer = [
//   { label: "公司", value: "COMPANY" },
//   { label: "工厂", value: "FACTORY" },
//   { label: "部门", value: "DEPARTMENT" },
//   // { label: "车间", value: "WORKSHOP" },
//   // { label: "工段", value: "WORK_SECTION" },
//   // { label: "班组", value: "GROUP" },
// ]

// // 管控周期
// export const CtrlCycleArr = [
//   { label: '每日', value: 1 },
//   { label: '每周', value: 2 },
//   { label: '每月', value: 3 },
//   { label: '每季度', value: 4 },
//   { label: '每年', value: 5 }
// ]

// // 风险评价方法
// export const EvaMethod = [
//   { label: '直接判定法', value: 1 },
//   { label: '风险矩阵法(LS)', value: 2 },
//   { label: '作业条件危险性评价分析法(LEC)', value: 3 }
// ]
