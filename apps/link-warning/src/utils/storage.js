import Cookies from 'js-cookie'

export function setCookie(k, v) {
  if (typeof v == 'undefined' || v == null) {
    return
  }

  let val = v
  if (typeof v == 'object') {
    val = JSON.stringify(v)
  }
  Cookies.set(k, val)
}

export function getCookie(k) {
  const val = Cookies.get(k)
  try {
    // 如果是number boolean jsonstring是不会报错的
    return JSON.parse(val)
  }
  catch (e) {
    return val
  }
}
export function delCookie(k) {
  Cookies.remove(k)
}

export function setStorageItem(k, v) {
  if (typeof v == 'undefined' || v == null) {
    return
  }

  let val = v
  if (typeof v == 'object') {
    val = JSON.stringify(v)
  }
  localStorage.setItem(k, val)
}

export function getStorageItem(k) {
  const val = localStorage.getItem(k)
  try {
    // 如果是number boolean jsonstring是不会报错的
    return JSON.parse(val)
  }
  catch (e) {
    return val
  }
}
export function delStorageItem(k) {
  localStorage.removeItem(k)
}

// 安全版本的 localStorage 操作，捕获异常并静默降级
export function safeSetStorageItem(k, v) {
  try {
    setStorageItem(k, v)
    return true
  } catch (e) {
    return false
  }
}

export function safeGetStorageItem(k) {
  try {
    return getStorageItem(k)
  } catch (e) {
    return null
  }
}
