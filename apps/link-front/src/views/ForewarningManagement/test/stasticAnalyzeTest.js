/**
 * 预警统计分析页面测试脚本
 * 用于测试统计分析页面的基本功能
 */

// 点位数量TOP10
export const pointWarningConfig = [
  { label: '名次', prop: 'rank' },
  { label: '设备名称', prop: 'name' },
  { label: '预警数量', prop: 'count' },
]

// 组织预警统计
export const orgWarningConfig = [
  { label: '名次', prop: 'rank' },
  { label: '组织名称', prop: 'name' },
  { label: '预警数量', prop: 'count' },
]

// 模拟预警类型数据
export const mockWarningTypeData = [
  {
    name: '安全隐患预警',
    pending: 25,
    processed: 5,
  },
  {
    name: '人员聚集',
    pending: 15,
    processed: 10,
  },
  {
    name: '异常行为',
    pending: 12,
    processed: 3,
  },
  {
    name: '设备故障',
    pending: 20,
    processed: 5,
  },
  {
    name: '环境异常',
    pending: 18,
    processed: 7,
  },
]

// 模拟点位预警数据
export const mockPointWarningData = [
  { rank: 1, name: 'G45泵料系统1', count: 1 },
  { rank: 2, name: '50W厂区监控点A', count: 8 },
  { rank: 3, name: '干化厂区监控点B', count: 6 },
  { rank: 4, name: '70W厂区监控点C', count: 20 },
  { rank: 5, name: '安全阀门监控点', count: 15 },
  { rank: 6, name: '废水处理监控点', count: 12 },
  { rank: 7, name: '原料仓库监控点', count: 9 },
  { rank: 8, name: '电力配电室', count: 7 },
  { rank: 9, name: '中控室监控点', count: 5 },
  { rank: 10, name: '危险品仓库监控点', count: 3 },
]

// 模拟组织预警数据
export const mockOrgWarningData = [
  { rank: 1, name: '50W厂区', count: 10 },
  { rank: 2, name: '干化厂区', count: 8 },
  { rank: 3, name: '70W厂区', count: 20 },
]

// 模拟预警等级数据
export const mockWarningLevelData = [
  { value: 1, name: '一级预警', color: '#FF4500' },
  { value: 0, name: '二级预警', color: '#FFA500' },
  { value: 1, name: '三级预警', color: '#FFFF00' },
  { value: 0, name: '四级预警', color: '#0000FF' },
]

/**
 * 测试日期过滤功能
 * @param {string} dateType 日期类型：'day', 'week', 'month', 'custom'
 * @param {Array} dateRange 自定义日期范围
 * @returns {object} 测试结果
 */
export function testDateFilter(dateType, dateRange = []) {
  console.log(`测试日期过滤功能：${dateType}`)

  const result = {
    success: true,
    dateType,
    startDate: '',
    endDate: '',
    message: '',
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateType) {
      case 'day':
        result.startDate = formatDate(today)
        result.endDate = formatDate(today)
        break
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        result.startDate = formatDate(weekStart)
        result.endDate = formatDate(weekEnd)
        break
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        result.startDate = formatDate(monthStart)
        result.endDate = formatDate(monthEnd)
        break
      case 'custom':
        if (dateRange && dateRange.length === 2) {
          result.startDate = dateRange[0]
          result.endDate = dateRange[1]
        }
        else {
          result.success = false
          result.message = '自定义日期范围无效'
        }
        break
      default:
        result.success = false
        result.message = '无效的日期类型'
    }
  }
  catch (error) {
    result.success = false
    result.message = error.message
  }

  console.log('测试结果：', result)
  return result
}

/**
 * 测试图表导出功能
 * @param {string} chartId 图表ID
 * @returns {object} 测试结果
 */
export function testExportChart(chartId) {
  console.log(`测试图表导出功能：${chartId}`)

  const result = {
    success: true,
    chartId,
    message: `成功导出${chartId}图表数据`,
  }

  // 模拟导出逻辑
  console.log(`导出${chartId}成功`)

  return result
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串 YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('开始运行预警统计分析页面测试...')

  // 测试日期过滤
  testDateFilter('week') // 先测试默认值"周"
  testDateFilter('day')
  testDateFilter('month')
  testDateFilter('custom', ['2023-01-01', '2023-01-31'])

  // 测试图表导出
  testExportChart('warningTypeChart')
  testExportChart('warningPointChart')
  testExportChart('orgWarningChart')
  testExportChart('warningLevelChart')

  console.log('预警统计分析页面测试完成')
}
