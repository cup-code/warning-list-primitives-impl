/**
 * Storage namespace wrapper for iframe isolation.
 *
 * Automatically adds prefix to all localStorage/sessionStorage operations
 * so that clearing cache in the iframe (this project) does not affect
 * the parent page's storage, and vice versa.
 *
 * MUST be imported at the very top of main.js before any other module.
 */

const LS_NS = 'link_'
const SS_NS = 'link_s_'

// --- Save original methods ---

const _lsGet = localStorage.getItem.bind(localStorage)
const _lsSet = localStorage.setItem.bind(localStorage)
const _lsDel = localStorage.removeItem.bind(localStorage)
const _lsKeys = () => { try { return Object.keys(localStorage) } catch (e) { return [] } }

const _ssGet = sessionStorage.getItem.bind(sessionStorage)
const _ssSet = sessionStorage.setItem.bind(sessionStorage)
const _ssDel = sessionStorage.removeItem.bind(sessionStorage)
const _ssKeys = () => { try { return Object.keys(sessionStorage) } catch (e) { return [] } }

// --- Override localStorage ---

localStorage.getItem = function (key) {
  return _lsGet(LS_NS + key)
}

localStorage.setItem = function (key, value) {
  try {
    return _lsSet(LS_NS + key, value)
  }
  catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[storage] localStorage quota exceeded for key:', key)
    }
  }
}

localStorage.removeItem = function (key) {
  return _lsDel(LS_NS + key)
}

// --- Override sessionStorage ---

sessionStorage.getItem = function (key) {
  return _ssGet(SS_NS + key)
}

sessionStorage.setItem = function (key, value) {
  try {
    return _ssSet(SS_NS + key, value)
  }
  catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[storage] sessionStorage quota exceeded for key:', key)
    }
  }
}

sessionStorage.removeItem = function (key) {
  return _ssDel(SS_NS + key)
}

// --- Exported functions for targeted clearing ---

export function clearNamespacedSession() {
  _ssKeys().filter(k => k.startsWith(SS_NS)).forEach(k => _ssDel(k))
}

export function clearNamespacedStorage() {
  _lsKeys().filter(k => k.startsWith(LS_NS)).forEach(k => _lsDel(k))
}

export function clearNamespacedAll() {
  clearNamespacedSession()
  clearNamespacedStorage()
}

export function storageAvailable(type = 'localStorage') {
  const storage = type === 'sessionStorage' ? { get: _ssGet, set: _ssSet, del: _ssDel }
    : { get: _lsGet, set: _lsSet, del: _lsDel }
  const testKey = '__storage_test__'
  try {
    storage.set(testKey, '1')
    storage.get(testKey)
    storage.del(testKey)
    return true
  }
  catch (e) {
    return false
  }
}
