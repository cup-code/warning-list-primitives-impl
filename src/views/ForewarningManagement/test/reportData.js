import { getWeekday } from './dateUtils.js'

/**
 * 动态生成实况列表数据
 * @param {object} screenData 屏幕数据
 * @param {number} machineNumber 一体机数量
 * @returns {Array} 实况数据列表
 */
export function generateActualList(screenData, machineNumber) {
  const alarmLive = screenData.alarmLive || {}
  const alarmTypeRank = screenData.alarmTypeRank || []
  const cameraAlarmRank = screenData.cameraAlarmRank || {}
  const alarmLevelLive = screenData.alarmLevelLive || {}
  const total = screenData.total || 0

  // 获取最高频预警类型
  const topAlarmType = alarmTypeRank.length > 0 ? alarmTypeRank[0] : null

  // 获取最高频预警设备
  const topCameraAlarm = Object.entries(cameraAlarmRank)
    .sort(([, a], [, b]) => b - a)
    .shift()

  // 获取最高等级警告
  const alarmLevels = [
    { name: '一级预警', value: 1 },
    { name: '二级预警', value: 2 },
    { name: '三级预警', value: 3 },
    { name: '四级预警', value: 4 },
  ]

  const topLevel
    = alarmLevels.find(level => alarmLevelLive[level.value] > 0) || alarmLevels[3]

  // 获取占比最多的预警等级
  const levelWithMaxCount = Object.entries(alarmLevelLive)
    .sort(([, a], [, b]) => b - a)
    .shift()
  const maxLevel = levelWithMaxCount
    ? alarmLevels.find(l => l.value == levelWithMaxCount[0])
    : alarmLevels[3]

  return [
    {
      value: `${alarmLive.cameraNormal || 0} 路`,
      label: '接入摄像头',
    },
    {
      value: `${alarmLive.cameraSkillNumber || 0} 项`,
      label: '关联配置技能',
    },
    {
      value: `${alarmLive.cameraSkillNumber || 0} 项`,
      label: '运行配置技能',
    },
    {
      value: `${total} 次`,
      label: '累计识别风险警告',
    },
    {
      value: topAlarmType ? `${topAlarmType.alarmNumber} 次` : '0 次',
      label: topAlarmType ? topAlarmType.alarmType : '暂无数据',
      sub: '（最高频预警类型）',
    },
    {
      value: topCameraAlarm ? `${topCameraAlarm[1]} 次` : '0 次',
      label: topCameraAlarm ? topCameraAlarm[0] : '暂无数据',
      sub: '（最高频预警设备）',
    },
    {
      value: topLevel.name.replace('预警', ''),
      label: '最高等级警告',
    },
    {
      value: maxLevel.name.replace('预警', ''),
      label: '预警等级占比最多',
    },
  ]
}

/**
 * 生成基础统计列表
 * @param {number} machineNumber 一体机数量
 * @param {number} cameraNumber 摄像头数量
 * @param {number} cameraSkillNumber 摄像头技能数量
 * @returns {Array} 基础统计列表
 */
export function generateStatsList(machineNumber, cameraNumber, cameraSkillNumber) {
  return [
    { name: `一体机数量${machineNumber}台` },
    { name: `接入摄像头数量${cameraNumber}路` },
    { name: `摄像头配置技能${cameraSkillNumber}项` },
  ]
}

/**
 * 处理预警趋势表格数据
 * @param {object} alarmTrend 预警趋势数据
 * @returns {Array} 趋势表格数据
 */
export function processTrendTableData(search, alarmTrend) {
  if (search.timeType == 0) {
    return [{
      date: search.alarmDateStart.format('MM-DD'),
      week: getWeekday(search.alarmDateStart.format('MM-DD')),
      count: Object.values(alarmTrend).reduce((acc, curr) => acc + curr, 0) || 0,
    }]
  }
  // 按日期排序
  return Object.keys(alarmTrend)
    .sort((a, b) => {
      // 假设日期格式为 'MM-DD'
      // 补全年份，保证跨年时排序正确
      const year = new Date().getFullYear()
      const dateA = new Date(`${year}-${a}`)
      const dateB = new Date(`${year}-${b}`)
      return dateA - dateB
    })
    .map((s) => {
      return {
        date: s,
        week: getWeekday(s),
        count: alarmTrend[s] || 0,
      }
    })
}

/**
 * 处理预警类型排名数据
 * @param {Array} alarmTypeRank 预警类型排名原始数据
 * @returns {Array} 处理后的排名数据
 */
export function processAlarmTypeRank(alarmTypeRank) {
  if (!alarmTypeRank || !alarmTypeRank.length)
    return []

  return alarmTypeRank
    .slice(0, 10)
    .sort((a, b) => b.alarmNumber - a.alarmNumber)
    .map((item, index) => {
      return {
        rank: index + 1,
        type: item.alarmType,
        count: item.alarmNumber,
      }
    })
}

/**
 * 处理设备预警排名数据
 * @param {object} cameraAlarmRank 设备预警排名原始数据
 * @returns {Array} 处理后的排名数据
 */
export function processCameraAlarmRank(cameraAlarmRank) {
  if (!cameraAlarmRank)
    return []

  return Object.entries(cameraAlarmRank)
    .sort((a, b) => b[1] - a[1])
    .map(([deviceName, count], index) => ({
      rank: index + 1,
      deviceName,
      count,
    }))
    .slice(0, 10)
}

/**
 * 处理预警等级排名数据
 * @param {object} alarmLevelLive 预警等级数据
 * @param {number} total 总数
 * @returns {Array} 等级排名数据
 */
export function processAlarmLevelRank(alarmLevelLive, total) {
  const level = [
    { name: '一级预警', value: 1 },
    { name: '二级预警', value: 2 },
    { name: '三级预警', value: 3 },
    { name: '四级预警', value: 4 },
  ]

  return level.map((item, idx) => ({
    rank: idx + 1,
    level: item.name,
    count: alarmLevelLive[item.value] || 0,
    percent: total
      ? `${(
        ((alarmLevelLive[item.value] || 0) / total) * 100
      ).toFixed(2)}%`
      : '0.00%',
  }))
}

/**
 * 生成报告文本
 * @param {number} cameraNumber 摄像头数量
 * @param {number} cameraSkillNumber 摄像头技能数量
 * @returns {string} 报告文本
 */
export function generateReportText(cameraNumber, cameraSkillNumber) {
  return `易见 Ai 一体机不仅是"监控工具"，更是您的"安全管理助手",${cameraNumber}路摄像头覆盖全场景、${cameraSkillNumber}项技能精准识别风险、实时推送缩短响应时间。助力您持续优化安全管理。`
}
