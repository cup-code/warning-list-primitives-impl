export default class CtrlData {
  constructor(data) {
    this.taskId = data.taskId || '' // 主键id
    this.controlMeasuresId = data.controlMeasuresId || '' // 风险管控id
    this.controlHierarchy = data.controlHierarchy || '' // 管控层级
    this.controlDept = data.controlDept || [] // 管控部门
    this.controlResponsible = data.controlResponsible || [] // 管控责任人
    this.controlCycle = data.controlCycle || 1 // 管控周期
    this.controlCycleUnit = data.controlCycleUnit === undefined ? '' : data.controlCycleUnit // 管控周期单位
    this.controlFrequency = data.controlFrequency || 1 // 管控频率
  }

  /* 返回需要提交的信息 */
  setReqData(eventId) {
    const params = {
      taskId: this.taskId,
      eventId,
      controlMeasuresId: this.controlMeasuresId,
      controlHierarchy: this.controlHierarchy,
      controlDept: this.controlDept,
      controlResponsible: this.controlResponsible,
      controlCycle: this.controlCycle,
      controlCycleUnit: this.controlCycleUnit,
      controlFrequency: this.controlFrequency,
    }
    return params
  }
}
