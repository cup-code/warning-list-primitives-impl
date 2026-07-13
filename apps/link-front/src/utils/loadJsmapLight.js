/**
 * 按需动态加载 jsmapLight 资源 (js/css)
 * 避免全局加载，确保资源仅在需要时引入
 *
 * 支持：
 * 1. 本地加载（默认 ./jsmaplight/）
 * 2. CDN 加载（window.JSMAP_CDN_URL 或 VUE_APP_JSMAP_CDN）
 * 只加载 jsmap_light.css 和 jsmap_light.js，无需全部大包
 */

let jsmapLoaded = false;
let jsmapLoading = false;
let jsmapLoadPromise = null;
let jsmapScriptTag = null;
let jsmapStylesheetTag = null;

// 获取 jsmap 资源的基础 URL
function getJsmapBaseUrl() {
  return (
    window.JSMAP_CDN_URL ||
    process.env.VUE_APP_JSMAP_CDN ||
    './jsmapLight'
  );
}

// 按需加载 jsmapLight JS/CSS 核心资源
export function loadJsmapLight() {
  // 已加载
  if (jsmapLoaded && window.jsmap) {
    return Promise.resolve(window.jsmap);
  }
  // 正在加载
  if (jsmapLoading && jsmapLoadPromise) {
    return jsmapLoadPromise;
  }

  const baseUrl = getJsmapBaseUrl();
  jsmapLoading = true;
  jsmapLoadPromise = new Promise((resolve, reject) => {
    // 加载 CSS 按需
    if (!jsmapStylesheetTag || !document.contains(jsmapStylesheetTag)) {
      jsmapStylesheetTag = document.createElement('link');
      jsmapStylesheetTag.rel = 'stylesheet';
      jsmapStylesheetTag.type = 'text/css';
      jsmapStylesheetTag.href = `${baseUrl}/jsmap_light.css`;
      document.head.appendChild(jsmapStylesheetTag);
    }

    // 加载 JS 按需
    if (!jsmapScriptTag || !document.contains(jsmapScriptTag)) {
      jsmapScriptTag = document.createElement('script');
      jsmapScriptTag.src = `${baseUrl}/jsmap_light.js`;
      jsmapScriptTag.onload = () => {
        jsmapLoaded = true;
        jsmapLoading = false;
        resolve(window.jsmap);
      };
      jsmapScriptTag.onerror = () => {
        jsmapLoading = false;
        jsmapLoadPromise = null;
        reject(new Error(`jsmapLight 加载失败 (来源: ${baseUrl})`));
      };
      document.head.appendChild(jsmapScriptTag);
    } else if (window.jsmap) {
      jsmapLoaded = true;
      jsmapLoading = false;
      resolve(window.jsmap);
    }
  });

  return jsmapLoadPromise;
}

// 兼容原有命名
export const loadJsmap = loadJsmapLight;

/**
 * 检查 jsmapLight 是否已加载完成
 */
export function isJsmapLoaded() {
  return jsmapLoaded && !!window.jsmap;
}

/**
 * 卸载 jsmapLight 资源，支持重复加载与释放
 */
export function unloadJsmap() {
  if (jsmapScriptTag && jsmapScriptTag.parentNode) {
    jsmapScriptTag.parentNode.removeChild(jsmapScriptTag);
  }
  if (jsmapStylesheetTag && jsmapStylesheetTag.parentNode) {
    jsmapStylesheetTag.parentNode.removeChild(jsmapStylesheetTag);
  }

  jsmapScriptTag = null;
  jsmapStylesheetTag = null;
  jsmapLoaded = false;
  jsmapLoading = false;
  jsmapLoadPromise = null;

  if (window.jsmap) {
    try {
      if (typeof window.jsmap?.destroy === 'function') {
        window.jsmap.destroy();
      }
    } catch (error) {
      // 卸载异常不影响主流程
    }
    delete window.jsmap;
  }
}
