/**
 * 统一错误处理工具
 */

/**
 * 处理 API 错误
 * @param {Error} error 错误对象
 * @param {Object} proxy Vue 实例代理
 * @param {string} defaultMessage 默认错误消息
 */
export function handleApiError(error, proxy, defaultMessage = "操作失败") {
  console.error("API Error:", error);

  let message = defaultMessage;

  if (error.response) {
    // 服务器返回错误
    message = error.response.data?.message || defaultMessage;
  } else if (error.message) {
    // 请求错误
    message = error.message;
  }

  if (proxy?.$message) {
    proxy.$message.error(message);
  }
}

/**
 * 处理 API 响应
 * @param {Object} response API 响应
 * @param {Object} proxy Vue 实例代理
 * @param {Object} options 配置项
 * @param {string} options.successMessage 成功消息
 * @param {string} options.errorMessage 错误消息
 * @returns {boolean} 是否成功
 */
export function handleApiResponse(response, proxy, options = {}) {
  const { successMessage, errorMessage = "操作失败" } = options;

  if (response?.success) {
    if (successMessage && proxy?.$message) {
      proxy.$message.success(successMessage);
    }
    return true;
  } else {
    const message = response?.message || errorMessage;
    if (proxy?.$message) {
      proxy.$message.error(message);
    }
    return false;
  }
}

/**
 * 创建确认对话框
 * @param {Object} proxy Vue 实例代理
 * @param {string} message 确认消息
 * @param {string} title 标题
 * @returns {Promise<boolean>} 用户是否确认
 */
export function confirmAction(proxy, message, title = "提示") {
  return new Promise((resolve) => {
    proxy
      ?.$confirm(message, title, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

/**
 * 创建删除确认对话框
 * @param {Object} proxy Vue 实例代理
 * @param {string} itemName 要删除的项目名称
 * @returns {Promise<boolean>} 用户是否确认
 */
export function confirmDelete(proxy, itemName) {
  return confirmAction(proxy, `确定要删除"${itemName}"吗？`, "删除确认");
}

export default {
  handleApiError,
  handleApiResponse,
  confirmAction,
  confirmDelete,
};