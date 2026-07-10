/**
 * 动态加载 Luckysheet 库
 * 只在需要时加载，避免全局加载 7.6MB 的资源
 *
 * 支持配置：
 * 1. 本地加载：默认从 ./luckysheet/ 加载
 * 2. CDN 加载：设置 window.LUCKYSHEET_CDN_URL 或环境变量 VUE_APP_LUCKYSHEET_CDN
 */

let luckysheetLoaded = false
let luckysheetLoading = false
let luckysheetLoadPromise = null

// 获取 Luckysheet 资源的基础 URL
function getLuckysheetBaseUrl() {
  // 优先级：window 配置 > 环境变量 > 默认本地路径
  return window.LUCKYSHEET_CDN_URL
    || process.env.VUE_APP_LUCKYSHEET_CDN
    || './luckysheet'
}

export function loadLuckysheet() {
  // 如果已经加载过，直接返回
  if (luckysheetLoaded && window.luckysheet) {
    return Promise.resolve(window.luckysheet)
  }

  // 如果正在加载中，返回同一个 Promise
  if (luckysheetLoading && luckysheetLoadPromise) {
    return luckysheetLoadPromise
  }

  const baseUrl = getLuckysheetBaseUrl()
  console.log(`🔄 开始加载 Luckysheet (来源: ${baseUrl})`)

  // 开始加载
  luckysheetLoading = true
  luckysheetLoadPromise = new Promise((resolve, reject) => {
    // 加载 CSS（按顺序加载）
    const cssFiles = [
      `${baseUrl}/plugins/css/pluginsCss.css`,
      `${baseUrl}/plugins/plugins.css`,
      `${baseUrl}/css/luckysheet.css`,
      `${baseUrl}/assets/iconfont/iconfont.css`,
    ]

    cssFiles.forEach((href) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    })

    // 加载 plugin.js
    const pluginScript = document.createElement('script')
    pluginScript.src = `${baseUrl}/plugins/js/plugin.js`

    pluginScript.onload = () => {
      // plugin.js 加载完成后，加载主文件
      const mainScript = document.createElement('script')
      mainScript.src = `${baseUrl}/luckysheet.umd.js`

      mainScript.onload = () => {
        luckysheetLoaded = true
        luckysheetLoading = false
        console.log('✅ Luckysheet 加载成功')
        resolve(window.luckysheet)
      }

      mainScript.onerror = () => {
        luckysheetLoading = false
        luckysheetLoadPromise = null
        const error = new Error(`Luckysheet 主文件加载失败 (来源: ${baseUrl})`)
        console.error('❌ Luckysheet 加载失败')
        reject(error)
      }

      document.head.appendChild(mainScript)
    }

    pluginScript.onerror = () => {
      luckysheetLoading = false
      luckysheetLoadPromise = null
      const error = new Error(`Luckysheet plugin 加载失败 (来源: ${baseUrl})`)
      console.error('❌ Luckysheet 加载失败')
      reject(error)
    }

    document.head.appendChild(pluginScript)
  })

  return luckysheetLoadPromise
}

/**
 * 检查 Luckysheet 是否已加载
 */
export function isLuckysheetLoaded() {
  return luckysheetLoaded && !!window.luckysheet
}
