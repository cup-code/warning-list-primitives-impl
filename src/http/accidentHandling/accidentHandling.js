import request from '@/utils/request'
// ---事故处理报告列表---
export function reportApprovalPage(data) {
  return request({
    url: '/accidentHandling/reportApprovalPage',
    method: 'get',
    params: data,
  })
}
// ---事故处理报告列表---审批列表
export function getApprovalList(data) {
  return request({
    url: '/accidentHandling/processReportApprovalPage',
    method: 'get',
    params: data,
  })
}
// ---查看审批扭转记录----
export function getApprovalRecordPage(data) {
  return request({
    url: '/accidentHandling/approvalRecordPage',
    method: 'get',
    params: data,
  })
}
// 查询事故编号
export function queryAccidentNumber() {
  return request({
    url: '/accidentHandling/queryAccidentNumber',
    method: 'get',
  })
}
// 根据事故编号获取详情
export function queryByAccidentNumber(id) {
  return request({
    url: `accidentHandling/queryByAccidentNumber/${id.id}`,
    method: 'get',
    params: {},
  })
}
// 事故处理--新增
export function addApprovalList(data) {
  return request({
    url: '/accidentHandling/saveHandleReport',
    //   method: 'get',
    //   params:data
    method: 'post',
    data,
  })
}
// 事故处理--暂存
export function temporaryStorageHandleReport(data) {
  return request({
    url: '/accidentHandling/temporaryStorageHandleReport',
    //   method: 'get',
    //   params:data
    method: 'post',
    data,
  })
}
// 根据id查看编辑(事故处置报告的查看只传id)
export function getAccidentDetail(data) {
  return request({
    url: '/accidentHandling/queryAccidentReportById',
    method: 'get',
    params: data,
  })
}
// 根据id查看编辑(事故处置报告的的审批传递id和handlerId)
export function getAccidentDetailShenpi(data) {
  return request({
    url: '/accidentHandling/queryAccidentReport',
    method: 'get',
    params: data,
  })
}
// 其他处置措施任务新增
export function newOtherDisposalMeasures(data) {
  return request({
    url: '/otherDisposalMeasures/newOtherDisposalMeasures',
    method: 'post',
    data,
  })
}
// ---查看审批扭转记录----
export function reportApproval(data) {
  return request({
    url: '/accidentHandling/reportApproval',
    method: 'get',
    params: data,
  })
}
// ---查看审批扭转记录----
export function accidentHandlingDelete(data) {
  return request({
    url: '/accidentHandling/accidentHandlingDelete',
    method: 'get',
    params: data,
  })
}
