import { axiosParams } from '../common/utils'

/**
 * 获取远程指导房间信息（按当前登录用户所属公司返回）
 * @returns {Promise} result: { appId, companyId, roomId, roomName }
 *   - appId    音视频 appId（即 TRTC SDKAppId，进房时 Number 转换）
 *   - roomId   会议 ID（字符串房间号，进房用作 strRoomId）
 *   - roomName 会议名称（仅展示）
 *   - companyId 所属公司 ID
 */
export function getInspectionRoom() {
  return axiosParams('get', `/yx/inspectionRoom/getRoom`)
}

/**
 * 获取进房用户签名（userSig 由后端签发，前端不接触密钥）
 * @param {string} userId - 进房用户 id（取当前登录用户 id，保证房间内唯一）
 * @returns {Promise} result: userSig 字符串
 */
export function getInspectionUserSign(userId) {
  return axiosParams('get', `/yx/inspectionRoom/getUserSign`, { userId })
}
