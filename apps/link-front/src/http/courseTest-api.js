import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from './common/utils'

// 课件资源  begin
// 查询课件列表
export function getEduCourseWare(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 课件类别
  if (params.type) {
    pr += `&type=${params.type}`
  }
  return axiosGet(axios, `eduCourseware/getPageList?${pr}`)
}
// 新增/修改课件类别
export function saveCourseWareType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCoursewareType/saveOrUpdate`, params)
}
// 删除 课件类别
export function deleteCourseWareType(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCoursewareType/delete?id=${id}`)
}
// 新增/修改课件
export function saveCourseWare(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourseware/saveOrUpdate`, params)
}
// 删除 课件
export function deleteCourseWare(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourseware/deleteById?id=${id}`)
}

// 课件资源  end

// 课程资源 begin
// 查询课程列表
export function getEduCourse(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 课程类别
  if (params.type) {
    pr += `&type=${params.type}`
  }
  return axiosGet(axios, `eduCourse/getPageList?${pr}`)
}
// 新增/修改课程类别
export function saveCourseType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourseType/saveOrUpdate`, params)
}
// 删除 课程类别
export function deleteCourseType(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourseType/delete?id=${id}`)
}
// 新增/修改课程
export function saveCourse(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourse/saveOrUpdate`, params)
}
// 根据课程id, 获取课程信息
export function getCourseInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduCourse/getById?id=${id}`)
}
// 删除 课程
export function deleteCourse(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduCourse/deleteById?id=${id}`)
}

// 课程资源 end

// 试题资源 bengin
// 查询试题列表
export function getQuestion(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 试题类别
  if (params.type) {
    pr += `&type=${params.type}`
  }
  // 试题类型
  if (params.questionModel) {
    pr += `&questionModel=${params.questionModel}`
  }
  return axiosGet(axios, `eduQuestion/getPageList?${pr}`)
}
// 查询试题类别
export function getQuestionType() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduQuestionType/getTypeTree`)
}
// 新增/修改试题类别
export function saveQuestionType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduQuestionType/saveOrUpdate`, params)
}
// 删除 试题类别
export function deleteQuestionType(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduQuestionType/delete?id=${id}`)
}
// 新增/修改试题
export function saveQuestion(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduQuestion/saveOrUpdate`, params)
}
// 根据试题id, 获取试题信息
export function getQuestionInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduQuestion/getById?id=${id}`)
}
// 删除 试题
export function deleteQuestion(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduQuestion/deleteById?id=${id}`)
}
// 试题资源 end

// 试卷资源 bengin
// 查询试卷列表
export function getPaper(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 试卷类别
  if (params.type) {
    pr += `&type=${params.type}`
  }
  return axiosGet(axios, `eduPape/getPageList?${pr}`)
}
// 新增/修改试卷类别
export function savePaperType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduPaperType/saveOrUpdate`, params)
}
// 删除 试卷类别
export function deletePaperType(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduPaperType/delete?id=${id}`)
}
// 新增/修改试卷
export function savePaper(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduPape/saveOrUpdate`, params)
}
// 根据试卷id, 获取试卷信息
export function getPaperInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduPape/getById?id=${id}&pageNum=1&pageSize=10000`)
}
// 删除 试题
export function deletePaper(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduPape/deleteById?id=${id}`)
}
// 试卷资源 end

// 培训计划 bengin
// 查询培训计划
export function getTrainPlan(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 培训类型
  if (params.trainType) {
    pr += `&trainType=${params.trainType}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  return axiosGet(axios, `eduTrainPlan/getPageList?${pr}`)
}
// 新增/修改培训计划
export function saveTrainPlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduTrainPlan/saveOrUpdate`, params)
}
// 根据id, 获取培训计划
export function getTrainPlanInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduTrainPlan/getById?id=${id}`)
}
// 删除 培训计划
export function deleteTrainPlan(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduTrainPlan/deleteById?id=${id}`)
}
// 培训计划 end

// 培训任务 bengin
// 查询培训任务
export function getTrainTask(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  return axiosGet(axios, `eduTrainTask/getPageList?${pr}`)
}
// 根据id, 获取培训任务
export function getTrainTaskInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduTrainTask/getById?id=${id}`)
}
// 新增/修改培训任务
export function saveTrainTask(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduTrainTask/saveOrUpdate`, params)
}
// 删除 培训任务
export function deleteTrainTask(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduTrainTask/deleteById?id=${id}`)
}
// 根据条件分页获取 培训任务详情
export function getTrainTaskInfoByUser(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 培训任务id
  if (params.id) {
    pr += `&id=${params.id}`
  }
  // 状态
  if (params.status) {
    pr += `&status=${params.status}`
  }
  // 用户姓名
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  // 部门
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  return axiosGet(axios, `eduTrainTask/getPageListTaskUser?${pr}`)
}
// 获取培训任务里每个用户的课件信息
export function getTrainTaskUserInfo(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `eduTrainTask/getTaskCourseUserList?taskId=${params.taskId}&userId=${params.userId}`,
  )
}
// 发布培训任务
export function publishTrainTask(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduTrainTask/publish?id=${id}`)
}

// 培训任务 end

// 考试管理 begin
// 查询考试列表
export function getExam(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 结果
  if (params.result) {
    pr += `&result=${params.result}`
  }
  // 用户id
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  // 姓名
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  // 发布状态
  if (params.publishState) {
    pr += `&publishState=${params.publishState}`
  }
  return axiosGet(axios, `eduExamPublish/getPageList?${pr}`)
}
// 考试统计页面接口（只查询已发布状态的考试）
export function getExamPub(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}&publishState=PUBLISHED`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 结果
  if (params.result) {
    pr += `&result=${params.result}`
  }
  // 用户id
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  // 姓名
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  return axiosGet(axios, `eduExamPublish/getPageList?${pr}`)
}
// 获取考试详情(考试统计-考试详情)
export function getExamStatisInfo(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 考试id
  if (params.examId) {
    pr += `&examId=${params.examId}`
  }
  // 结果
  if (params.result) {
    pr += `&result=${params.result}`
  }
  // 姓名
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  // 部门
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  return axiosGet(axios, `eduExamPublish/getPageListExamUser?${pr}`)
}
// 删除 考试任务
export function deleteExam(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduExamPublish/deleteById?id=${id}`)
}
// 根据id, 获取考试详情
export function getExamInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduExamPublish/getById?id=${id}`)
}
export function saveExam(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduExamPublish/saveOrUpdate`, params)
}
// 发布考试
export function publishExam(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduExamPublish/publish?id=${id}`)
}
// 发起补考
export function launchExamAgain(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `eduExamPublish/launchExamAgain?id=${params.id}&examId=${params.examId}&userId=${params.userId}`,
  )
}
// 考试管理 end

// 学员中心 begin
// 在线考试列表
export function getOnlineExam(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}&type=1`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  return axiosGet(axios, `eduStuCenter/pageQueryOnlineExam?${pr}`)
}
// 考试记录列表
export function getRecordsExam(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}&type=2`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  return axiosGet(axios, `eduStuCenter/pageQueryOnlineExam?${pr}`)
}
// 参加考试:  (type: 1. 参加考试； 2. 查看试卷)
export function joinExamByType(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduStuCenter/joinExam?examId=${params.examId}&type=${params.type}`)
}
// 考试交卷
export function submitExam(id, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduStuCenter/submitExam?examId=${id}`, params)
}
// 分页获取人员培训任务列表
export function getOnlineTrain(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  return axiosGet(axios, `eduStuCenter/onlineTrain?${pr}`)
}
// 查看培训任务
export function joinTrainById(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `eduStuCenter/getTrainById?trainTaskId=${params.trainTaskId}`)
}
// 培训存档
export function submitTrain(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `eduStuCenter/submitTrain`, params)
}

// 学员中心 end
