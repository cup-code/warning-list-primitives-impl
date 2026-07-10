export default class EmPlanData {
  constructor(data) {
    this.id = data ? data.id : null
    this.planName = data ? data.planName : '' // 预案名称
    this.companyId = data ? data.companyId : '' // 所属公司id
    this.companyName = data ? data.companyName : '' // 所属公司名称
    this.planType = data ? data.planType : '' // 预案类型id, 字典项
    this.isFiling = data ? data.isFiling : true // 是否已备案
    this.filingNumber = data ? data.filingNumber : '' // 如果选择已备案，则需要输入备案号
    this.accidentType = data ? data.accidentType : '' // 事故类型id, 字典项
    this.person = data && data.person ? data.person : { name: '', phone: '' } // 指挥长数据, 回显数据是json格式
    this.personTow = data && data.personTow ? data.personTow : [{ name: '', phone: '' }] // 副指挥长数据列表
    this.personOther = data && data.personOther ? data.personOther : [{ name: '', phone: '' }] // 其他成员数据列表
    this.planDept
      = data && data.planDept ? data.planDept : [{ deptName: '', principal: '', principalPhone: '' }] // 参与单位数据列表
    this.measure = data ? data.measure : '' // 处置措施
    this.files = [] // 上传文件列表
    this.materials = data && data.materials ? data.materials : [] // 应急物资
    this.team = data && data.team ? data.team : [] // 应急队伍
    this.expert = data && data.expert ? data.expert : [] // 应急专家
  }

  /* 添加副指挥长 */
  addViceLeader() {
    this.personTow.push({
      name: '',
      phone: '',
    })
  }

  /* 添加其他成员 */
  addOther() {
    this.personOther.push({
      name: '',
      phone: '',
    })
  }

  /* 添加参与单位 */
  addUnit() {
    this.planDept.push({ deptName: '', principal: '', principalPhone: '' })
  }

  /* 格式化为提交格式的数据 */
  getSaveData() {
    const params = {
      planName: this.planName,
      companyId: this.companyId,
      companyName: this.companyName,
      planType: this.planType,
      isFiling: this.isFiling,
      filingNumber: this.filingNumber,
      accidentType: this.accidentType,
      person: JSON.stringify(this.person),
      personTow: JSON.stringify(this.personTow),
      personOther: JSON.stringify(this.personOther),
      planDept: JSON.stringify(this.planDept),
      measure: this.measure,
      files: this.files,
      materials: JSON.stringify(this.materials),
      team: JSON.stringify(this.team),
      expert: JSON.stringify(this.expert),
    }
    if (this.id) {
      params.id = this.id
    }
    return params
  }
}
