import linkSdk from 'link-sdk'

const { get } = linkSdk.axiosUtil

// 查询人员任务对应的培训考试详情
export function getTrainExamDetail(id) {
  return get(`/aqEduStuCenter/getTrainExamDetail?taskId=${id}`)
}
