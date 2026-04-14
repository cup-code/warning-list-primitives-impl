import { axiosParams,createAxiosFromStore ,axiosPost} from '../common/utils'

// 设备列表
/**
 *
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.deviceName - 设备名称
 */

export function machineList(params) {
  return axiosParams('get', `scRonds/pageQueryDevice`, params)
}

// 删除设备
/**
 *
 * @param {string} params.deviceId - 设备ID
 */
export function deleteMachine(params) {
  return axiosParams('post', `scRonds/deleteDeviceInfo`, params)
}

// 绑定声光报警器
/**
 *
 * @param {string} params.deviceId - 设备ID
 * @param {string} params.sirenIds - 声光报警器ID 声光报警器ID,多个用英文逗号分隔
 */
export function bindVideoSiren(params) {
  return axiosParams('post', `scRonds/bindSiren`, params)
}

// 报警信息列表
/**
 *
 * @param {string} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.alarmTimeStart - 报警开始时间
 * @param {string} params.alarmTimeEnd - 报警结束时间
 * @param {string} params.deviceName - 设备名称
 */
export function alarmInfoList(params) {
  return axiosParams('get', `scRonds/pageQueryAlarm`, params)
}


// 天创机器人

// 添加修改机器人设备
/**
 *
 * @param {string} params.id - 主键id
 * @param {string} params.remarks - 备注
 * @param {string} params.robotCode - 机器人编号
 * @param {string} params.robotId - 机器人ID
 * @param {string} params.robotName - 机器人名称
 */
export function addOrUpdateRobotDevice(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `robot/tian/souRobotDevice`, params)
}

//查询机器人设备
/**
 * 查询机器人设备列表（可分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 显示数
 * @param {string} [params.robotCode] - 机器人编号
 * @param {string} [params.robotId] - 机器人ID
 * @param {string} [params.robotName] - 机器人名称
 */
export function robotDevicePageList(params) {
  return axiosParams('get', `robot/tian/queryRobotDevice`, params)
}


// 删除机器人设备
/**
 * 删除机器人设备
 * @param {object} params - 删除参数
 * @param {string} params.id - 机器人设备主键ID
 */
export function removeRobotDevice(params) {
  return axiosParams('post', `robot/tian/delRobotDevice`, params)
}

/**
 * 查询机器人报警信息列表
/**
 * 查询机器人报警信息列表
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 显示数（必填）
 * @param {string} [params.alarmContent] - 告警原因（可选）
 * @param {string} [params.alarmTimeStart] - 告警时间起（date-time，可选）
 * @param {string} [params.alarmTimeEnd] - 告警时间止（date-time，可选）
 * @param {boolean} [params.isPage] - 是否分页（可选）
 * @param {string} [params.robotCode] - 机器人编号（可选）
 * @param {string} [params.robotId] - 机器人ID（可选）
 */
export function queryRobotAlarmList(params) {
  return axiosParams('get', `robot/tian/queryRobotAlarm`, params)
}
