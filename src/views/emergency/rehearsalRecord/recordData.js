import moment from 'moment'

export default class RecordData {
  constructor(data) {
    const userData = JSON.parse(sessionStorage.getItem('user'))

    this.id = data ? data.id : '' // 演练id
    this.drillTime = data ? data.drillTime : moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 演练时间
    this.drillState = data ? data.drillState : '' // 演练状态 0未演练 1已演练
    this.drillSite = data ? data.drillSite : '' // 演练地点
    this.companyId = data ? data.companyId : userData.companyId // 所属公司id
    this.companyName = data ? data.companyName : userData.companyName // 所属公司名称
    this.drillPlanId = data ? data.drillPlanId : '' // 演练计划id
    this.drillPlanName = data ? data.drillPlanName : '' // 演练计划name
    this.emergencyPlanId = data ? data.emergencyPlanId : '' // 应急预案id
    this.emergencyPlanName = data ? data.emergencyPlanName : '' // 应急预案name
    this.personNumber = data ? data.personNumber : '' // 人员数量
    this.drillContent = data ? data.drillContent : '' // 演练内容
    this.remark = data ? data.remark : '' // 备注
    this.evaluation = [] // 演练评估
    this.accessorys = [] // 附件
    this.images = [] // 演练照片
  }
}
