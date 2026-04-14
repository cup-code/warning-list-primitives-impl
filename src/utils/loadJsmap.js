/**
 * 动态加载 jsmap 库
 * 只在需要时加载，避免全局加载 13MB 的资源
 *
 * 支持配置：
 * 1. 本地加载：默认从 ./jsmap/ 加载
 * 2. CDN 加载：设置 window.JSMAP_CDN_URL 或环境变量 VUE_APP_JSMAP_CDN
 */

let jsmapLoaded = false
let jsmapLoading = false
let jsmapLoadPromise = null
let jsmapScriptTag = null
let jsmapStylesheetTag = null

// 获取 jsmap 资源的基础 URL
function getJsmapBaseUrl() {
  // 优先级：window 配置 > 环境变量 > 默认本地路径
  return window.JSMAP_CDN_URL
    || process.env.VUE_APP_JSMAP_CDN
    || './jsmap'
}

export function loadJsmap() {
  // 如果已经加载过，直接返回
  if (jsmapLoaded && window.jsmap) {
    return Promise.resolve(window.jsmap)
  }

  // 如果正在加载中，返回同一个 Promise
  if (jsmapLoading && jsmapLoadPromise) {
    return jsmapLoadPromise
  }

  const baseUrl = getJsmapBaseUrl()
  console.log(`🔄 开始加载 jsmap (来源: ${baseUrl})`)

  // 开始加载
  jsmapLoading = true
  jsmapLoadPromise = new Promise((resolve, reject) => {
    // 加载 CSS
    if (!jsmapStylesheetTag || !document.contains(jsmapStylesheetTag)) {
      jsmapStylesheetTag = document.createElement('link')
      jsmapStylesheetTag.rel = 'stylesheet'
      jsmapStylesheetTag.type = 'text/css'
      jsmapStylesheetTag.href = `${baseUrl}/jsmap.css`
      document.head.appendChild(jsmapStylesheetTag)
    }

    // 加载 JS
    if (!jsmapScriptTag || !document.contains(jsmapScriptTag)) {
      jsmapScriptTag = document.createElement('script')
      jsmapScriptTag.src = `${baseUrl}/jsmap.js`
      jsmapScriptTag.onload = () => {
        jsmapLoaded = true
        jsmapLoading = false
        console.log('✅ jsmap 加载成功')
        resolve(window.jsmap)
      }
      jsmapScriptTag.onerror = () => {
        jsmapLoading = false
        jsmapLoadPromise = null
        const error = new Error(`jsmap 加载失败 (来源: ${baseUrl})`)
        console.error('❌ jsmap 加载失败')
        reject(error)
      }
      document.head.appendChild(jsmapScriptTag)
    }
    else if (window.jsmap) {
      jsmapLoaded = true
      jsmapLoading = false
      resolve(window.jsmap)
    }
  })

  return jsmapLoadPromise
}

/**
 * 检查 jsmap 是否已加载
 */
export function isJsmapLoaded() {
  return jsmapLoaded && !!window.jsmap
}

/**
 * 卸载 jsmap 资源，释放内存并允许后续页面重新按需加载
 */
export function unloadJsmap() {
  if (jsmapScriptTag && jsmapScriptTag.parentNode) {
    jsmapScriptTag.parentNode.removeChild(jsmapScriptTag)
  }
  if (jsmapStylesheetTag && jsmapStylesheetTag.parentNode) {
    jsmapStylesheetTag.parentNode.removeChild(jsmapStylesheetTag)
  }

  jsmapScriptTag = null
  jsmapStylesheetTag = null
  jsmapLoaded = false
  jsmapLoading = false
  jsmapLoadPromise = null

  if (window.jsmap) {
    try {
      if (typeof window.jsmap?.destroy === 'function') {
        window.jsmap.destroy()
      }
    }
    catch (error) {
      console.warn('⚠️ 卸载 jsmap 时销毁实例失败：', error)
    }
    delete window.jsmap
  }

  console.log('♻️ jsmap 资源已卸载')
}
