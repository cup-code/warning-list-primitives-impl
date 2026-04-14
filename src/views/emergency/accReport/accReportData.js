import moment from 'moment'

export default class AccReportData {
  constructor(data) {
    const userData = JSON.parse(sessionStorage.getItem('user'))

    this.id = data ? data.id : '' // 上报id
    this.companyId = data ? data.companyId : userData.companyId // 公司id, 新增时固定为登陆人公司
    this.companyName = data ? data.companyName : userData.companyName // 公司名称, 新增时固定为登陆人公司
    this.content = data ? data.content : '' // 内容
    this.eventName = data ? data.eventName : '' // 事件名称
    this.eventTypeId = data ? data.eventTypeId : '' // 事件类型，字典
    this.incidentType = data ? data.incidentType : '' // 事故类别 0未遂/1既遂 注意01是字符串
    this.occurSite = data ? data.occurSite : '' // 发生地点
    this.occurTime = data ? data.occurTime : moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 发生时间
    this.reportUserId = data ? data.reportUserId : userData.id // 上报人id, 新增时固定为登录人
    this.reportUserName = data ? data.reportUserName : userData.fullName // 上报人名称, 新增时固定为登录人
    this.files = [] // 附件
  }
}
