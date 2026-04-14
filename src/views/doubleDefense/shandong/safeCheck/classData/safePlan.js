export class SafePlanData {
  constructor(data) {
    this.id = data ? data.id : '' // 新建无id，修改有id
    this.departmentId = data ? data.departmentId : ''
    this.departmentName = data ? data.departmentName : ''
    this.checkPlanCode = data ? data.checkPlanCode : '' // 计划编号
    this.checkPlanName = data ? data.checkPlanName : '' // 计划名称
    this.checkPlanType = data ? data.checkPlanType : '' // 计划类型
    this.checkLocation = data ? data.checkLocation : '' // 检查地点
    this.remark = data ? data.remark : '' // 备注
    this.checkPlanCategory = data ? data.checkPlanCategory : '' // 检查专业
    this.frequencyType = data ? data.frequencyType : 1 // 1临时  2周期
    this.planStartDateTime = data ? data.planStartDateTime : '' // 临时： 计划开始时间
    this.planEndDateTime = data ? data.planEndDateTime : '' // 临时： 计划结束时间
    this.cycleYear = data ? data.cycleYear : ''
    this.durationDays = data ? data.durationDays : 1
    this.cycleUnit = data ? data.cycleUnit : 3 // 周期：周期类型  日/周/月 --> 1/2/3
    this.cycleFrequency = data ? data.cycleFrequency : '' // 周期：每x日/月，周不需要
    this.cycleRule = data ? data.cycleRule : '' // 周期：日-不需要   周1-7: 2,3,4,5,6,7,1   月- 1-31日: 1~31 ,提交时用字符串以逗号分隔
    this.controlHierarchy = data ? data.controlHierarchy : '' // 检查级别
    this.remindUserList = data ? data.remindUserList : [] // 异常提醒人员数组，保存需要传id构成的数组string[]，接收是对象数组
    this.checkUserList = data ? data.checkUserList : [] // 检查人员数组，保存需要传id构成的数组string[]，接收是对象数组
    this.checkContentList = data ? data.checkContentList : [] // checkBasis检查依据 checkContent检查内容 recommendedLevel建议等级
  }

  /* 设置选择的周期 */
  setCycleDate(item) {
    // console.log(item)
    this.cycleYear = item.cycleYear
    this.durationDays = item.durationDays
    this.cycleUnit = item.cycleUnit
    this.cycleFrequency = item.cycleFrequency
    this.cycleRule = item.cycleRule.join()
  }

  /* 设置选择的人员 type:notic异常提醒人员 check检查人员 */
  setPeople(dataList, type) {
    const oldList = []
    for (const item of dataList) {
      const obj = { userId: item.id, userFullName: item.fullName }
      oldList.push(obj)
    }
    if (type == 'notic') {
      this.remindUserList = oldList
    }
    else if (type == 'check') {
      this.checkUserList = oldList
    }
  }

  /* 选择人员回显数据 */
  setPeopleBack(type) {
    let oldList = []
    const newList = []
    if (type == 'notic') {
      oldList = this.remindUserList || []
    }
    else if (type == 'check') {
      oldList = this.checkUserList
    }
    for (const item of oldList) {
      const obj = { id: item.userId, fullName: item.userFullName }
      newList.push(obj)
    }
    return newList
  }
}
