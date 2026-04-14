export default class RePlanData {
  constructor(data) {
    this.id = data ? data.id : null
    this.companyId = data ? data.companyId : '' // 所属公司id
    this.companyName = data ? data.companyName : '' // 所属公司名称
    this.drillItem = data ? data.drillItem : '' // 演练项目
    this.drillName = data ? data.drillName : '' // 计划名称
    this.drillObject = data ? data.drillObject : '' // 参演对象
    this.drillTime = data ? new Date(data.drillTime).getTime() : new Date().getTime() // 演练时间
    this.drillWay = data ? data.drillWay : '' // 演练方式
    this.dutyDept = data ? data.dutyDept : '' // 负责部门id
    this.dutyDeptName = data ? data.dutyDeptName : '' // 负责部门name
    this.dutyPerson = data ? data.dutyPerson : '' // 负责人id
    this.dutyPersonName = data ? data.dutyPersonName : '' // 负责人name
    this.files = [] // 附件
    this.organizePerson = data ? data.organizePerson : '' // 组织人员
    this.planType = data ? data.planType : '' // 预案类型id, 字典项
    this.remark = data ? data.remark : '' // 备注
  }

  /* 获取负责部门名称 */
  setDutyDeptName(dataList) {
    for (const item of dataList) {
      if (item.id === this.dutyDept) {
        this.dutyDeptName = item.departmentName
        break
      }
    }
  }

  /* 获取负责人名称 */
  setDutyPersonName(dataList) {
    for (const item of dataList) {
      if (item.id === this.dutyPerson) {
        this.dutyPersonName = item.fullName
        break
      }
    }
  }
}
