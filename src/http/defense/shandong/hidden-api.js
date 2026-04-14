import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 隐患排查任务 */
// 获取隐患排查任务分页
export function hiddenDangerCheckTaskByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenTroubleCheckTask/page${reqStr}`)
}
// 隐患排查任务页面单元类型页签数据
export function getTaskCountByUnitTypeFn(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (
      params[key] != undefined
      && key !== 'pageNum'
      && key !== 'pageSize'
      && key !== 'analysisUnitType'
    ) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenTroubleCheckTask/countGroupByUnitType${reqStr}`)
}
/* 隐患排查记录 */
// 获取隐患排查记录分页
export function hiddenDangerCheckRecordByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenTroubleCheckTask/recordPage${reqStr}`)
}
// 评价管理部门负责人-查询已完成的重要风险分析单元对应的风险管控记录
export function getDepartDangerCheckRecordByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenTroubleCheckTask/importantUnitPage${reqStr}`)
}
// 隐患排查记录页面单元类型页签数据
export function getRecordCountByUnitTypeFn(params) {
  console.log(params)
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (
      params[key] != undefined
      && key !== 'pageNum'
      && key !== 'pageSize'
      && key !== 'analysisUnitType'
    ) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenTroubleCheckTask/countRecordGroupByUnitType${reqStr}`)
}
// 修改任务是否一人完成即可
export function hiddenDangerCheckSinglePerson(singlePerson, taskId) {
  const axios = createFormUrlencodedAxios()
  return axiosPost(axios, `dpm/hiddenTroubleCheckTask/switchSinglePerson/${taskId}/${singlePerson}`)
}
