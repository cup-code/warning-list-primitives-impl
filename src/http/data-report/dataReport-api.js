import axios from 'axios'
import qs from 'qs'
import { axiosPost } from '@/http/common/utils'
import { jobOperationTypes } from '@/views/dataReport/common/constants'

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
}

const request = {
  kde: {
    lin_shu: (function () {
      return axios.create({
        baseURL: window.g.DATA_REPORT_URL.kde.find(item => item.name === 'lin_shu').url,
        headers,
      })
    })(),
    ping_yuan: (function () {
      return axios.create({
        baseURL: window.g.DATA_REPORT_URL.kde.find(item => item.name === 'ping_yuan').url,
        headers,
      })
    })(),
  },
  kdi: {},
}

function axiosBuilderByDataType(dataType) {
  return request[dataType[0]][dataType[1]]
}

/**
 * 任务操作
 * @param operationType 操作类型
 * @param dataType 数据类型
 * @param params 参数
 * @returns {*}
 */
export function jobOperation(operationType, dataType, params) {
  const axios = axiosBuilderByDataType(dataType)
  let path

  switch (operationType) {
    case jobOperationTypes.startup:
      path = '/job/startup'
      break
    case jobOperationTypes.shutdown:
      path = '/job/shutdown'
      break
    case jobOperationTypes.trigger:
      path = '/job/trigger'
      break
    default:
      path = '/job/checkJobStarted'
  }

  return axiosPost(axios, path, qs.stringify(params))
}

/**
 * 分页查询
 *
 * @param dataType 数据类别
 * @param params 查询参数
 * @returns {*}
 */
export function paging(dataType, params) {
  const axios = axiosBuilderByDataType(dataType)
  return axiosPost(axios, '/data/paging', qs.stringify(params))
}

/**
 * 更新数据是否允许上报
 * @param dataType 数据类别
 * @param params 更新参数
 * @returns {*}
 */
export function updatePermission(dataType, params) {
  const axios = axiosBuilderByDataType(dataType)
  return axiosPost(axios, '/data/updatePermission', qs.stringify(params))
}
