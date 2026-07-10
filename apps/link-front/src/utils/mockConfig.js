/**
 * Mock 配置统一管理
 * 控制是否使用 Mock 数据
 *
 * 注意：生产环境应始终设置为 false
 */

// 全局 Mock 开关
// 设置为 true 时使用 Mock 数据，false 时使用真实 API
export const USE_MOCK = false;

// 各模块 Mock 开关（可单独控制）
export const MOCK_CONFIG = {
  // 巡检项
  inspectionItem: false,
  // 巡检计划
  inspectionPlan: false,
  // 巡检路线
  inspectionRoute: false,
  // 巡检点
  inspectionPoint: false,
  // 知识库
  knowledgeBase: false,
  // 巡检记录
  inspectionRecord: false,
  // 异常记录
  exceptionRecord: false,
  // 违章记录
  violationRecord: false,
  // 安全记录
  safetyRecord: false,
};

/**
 * 获取模块的 Mock 状态
 * @param {string} module 模块名称
 * @returns {boolean} 是否使用 Mock
 */
export function getMockStatus(module) {
  // 优先使用模块配置，其次使用全局配置
  return MOCK_CONFIG[module] ?? USE_MOCK;
}

export default USE_MOCK;