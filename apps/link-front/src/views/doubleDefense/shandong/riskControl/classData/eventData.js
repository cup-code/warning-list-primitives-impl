export default class EventData {
  constructor(data) {
    const measure_main = JSON.parse(sessionStorage.getItem('dictList')).measure_main || []
    const measureList = measure_main.map((item) => {
      return {
        controlMeasuresMainType: item.id,
        controlMeasuresDesc: '',
        checkContent: '',
      }
    })
    this.id = data ? data.id : '' // 风险事件id
    this.accidentTypeIds = data && data.accidentTypeIds ? data.accidentTypeIds : [] // 事故类型数组
    this.eventInfo = { evaluationMethod: 1 } // 事件详情
    this.controlMeasures = data && data.controlMeasures ? data.controlMeasures : measureList // 管控措施
    this.ls_l = '' // 发生性 ** 自定义
    this.ls_s = '' // 严重性 ** 自定义
    this.lec_l = '' // 事故发生的可能性（L） ** 自定义
    this.lec_e = '' // 暴露于危险环境的频繁程度（E）  ** 自定义
    this.lec_c = '' // 发生事故产生的后果（C）  ** 自定义
    this.risk_val = '' // 风险值  ** 自定义

    this.resetData(data)
  }

  /* 数据初始化 */
  resetData(data) {
    this.eventInfo.analysisUnitId = data ? data.analysisUnitId : '' // 风险分析单元
    this.eventInfo.eventName = data ? data.eventName : '' // 风险事件名称
    this.eventInfo.eventLocation = data ? data.eventLocation : '' // 风险位置
    this.eventInfo.eventDesc = data ? data.eventDesc : '' // 事件描述
    this.eventInfo.checkCriteria = data ? data.checkCriteria : '' // 检查标准
    this.eventInfo.evaluationMethod = data ? data.evaluationMethod : 3 // 风险评价方法 1\直接判定 2\ls矩阵法 3\lec分析法
    this.eventInfo.evaluationDetail = data ? data.evaluationDetail : '' // 风险评价详情，json字符串
    this.eventInfo.riskLevel = data ? data.riskLevel : '' // 风险等级
    this.eventInfo.controlHierarchy = data ? data.controlHierarchy : '' // 管控层级
    this.eventInfo.suggestedImprovementMeasures = data ? data.suggestedImprovementMeasures : '' // 建议管控措施
    this.eventInfo.remark = data ? data.remark : '' // 备注

    this.ls_l = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).ls_l : ''
    this.ls_s = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).ls_s : ''
    this.lec_l = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).lec_l : ''
    this.lec_e = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).lec_e : ''
    this.lec_c = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).lec_c : ''
    this.risk_val = data && data.evaluationDetail ? JSON.parse(data.evaluationDetail).risk_val : ''
  }

  /* 添加管控措施 */
  addMeasure() {
    const params = {}
    params.checkBasic = '' // 排查依据
    params.checkContent = '' // 排查内容
    params.controlMeasuresDesc = '' // 管控措施内容
    params.controlMeasuresMainType = '' // 管控措施主类型
    params.controlMeasuresMinorType = '' // 管控措施次类型
    params.controlType = '' // 管控方式 1自动化监控 2隐患排查
    this.controlMeasures.push(params)
  }

  /* 返回需要提交的数据 */
  getReqData() {
    const {
      analysisUnitId,
      eventName,
      eventLocation,
      eventDesc,
      checkCriteria,
      evaluationMethod,
      riskLevel,
      controlHierarchy,
      suggestedImprovementMeasures,
      remark,
    } = this.eventInfo
    const eventInfo = {
      analysisUnitId,
      eventName,
      eventLocation,
      eventDesc,
      checkCriteria,
      evaluationMethod,
      riskLevel,
      controlHierarchy,
      suggestedImprovementMeasures,
      remark,
    }
    console.log(eventInfo)
    switch (Number.parseInt(evaluationMethod)) {
      case 1:
        eventInfo.evaluationDetail = ''
        break
      case 2:
        eventInfo.evaluationDetail = JSON.stringify({
          ls_l: this.ls_l,
          ls_s: this.ls_s,
        })
        break
      case 3:
        eventInfo.evaluationDetail = JSON.stringify({
          lec_l: this.lec_l,
          lec_e: this.lec_e,
          lec_c: this.lec_c,
          risk_val: this.risk_val,
        })
        break
      default:
    }
    const params = {
      accidentTypeIds: this.accidentTypeIds,
      eventInfo,
      controlMeasures: this.controlMeasures,
    }
    if (this.id) {
      params.id = this.id
    }
    return params
  }
}
