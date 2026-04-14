/**
 * 动态加载 Jessibuca 播放器库
 * 只在需要时加载，避免全局加载影响首屏性能
 *
 * 支持配置：
 * 1. 本地加载：默认从 ./jessibuca/ 加载
 * 2. CDN 加载：设置 window.JESSIBUCA_CDN_URL 或环境变量 VUE_APP_JESSIBUCA_CDN
 */

let jessibucaLoaded = false
let jessibucaLoading = false
let jessibucaLoadPromise = null

// 获取 Jessibuca 资源的基础 URL
function getJessibucaBaseUrl() {
  // 优先级：window 配置 > 环境变量 > 默认本地路径
  return window.JESSIBUCA_CDN_URL
    || process.env.VUE_APP_JESSIBUCA_CDN
    || './jessibuca'
}

export function loadJessibuca() {
  // 如果已经加载过，直接返回
  if (jessibucaLoaded && window.Jessibuca) {
    return Promise.resolve(window.Jessibuca)
  }

  // 如果正在加载中，返回同一个 Promise
  if (jessibucaLoading && jessibucaLoadPromise) {
    return jessibucaLoadPromise
  }

  const baseUrl = getJessibucaBaseUrl()
  console.log(`🔄 开始加载 Jessibuca (来源: ${baseUrl})`)

  // 开始加载
  jessibucaLoading = true
  jessibucaLoadPromise = new Promise((resolve, reject) => {
    // 加载 JS
    const script = document.createElement('script')
    script.src = `${baseUrl}/jessibuca.js`
    script.onload = () => {
      jessibucaLoaded = true
      jessibucaLoading = false
      console.log('✅ Jessibuca 加载成功')
      resolve(window.Jessibuca)
    }
    script.onerror = () => {
      jessibucaLoading = false
      jessibucaLoadPromise = null
      const error = new Error(`Jessibuca 加载失败 (来源: ${baseUrl})`)
      console.error('❌ Jessibuca 加载失败')
      reject(error)
    }
    document.head.appendChild(script)
  })

  return jessibucaLoadPromise
}

/**
 * 检查 Jessibuca 是否已加载
 */
export function isJessibucaLoaded() {
  return jessibucaLoaded && !!window.Jessibuca
}
