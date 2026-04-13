/**
 * storage-namespace.js
 *
 * Global localStorage/sessionStorage namespace proxy for same-origin iframe
 * cache isolation. Automatically prefixes all storage keys so that this
 * project's data does not collide with (or get cleared by) the parent page.
 *
 * - localStorage keys:  link_{originalKey}
 * - sessionStorage keys: link_s_{originalKey}
 *
 * Import this module FIRST in main.js (before any other imports) to ensure
 * all subsequent storage access goes through the proxy.
 *
 * Cookie (js-cookie) is NOT proxied — it bypasses the Storage API entirely.
 */

const LOCAL_PREFIX = 'link_'
const SESSION_PREFIX = 'link_s_'

// Preserve original Storage.prototype methods before overriding
const _origGetItem = Storage.prototype.getItem
const _origSetItem = Storage.prototype.setItem
const _origRemoveItem = Storage.prototype.removeItem
const _origKey = Storage.prototype.key

// --- localStorage proxy ---

localStorage.getItem = function (key) {
  return _origGetItem.call(this, LOCAL_PREFIX + key)
}

localStorage.setItem = function (key, value) {
  return _origSetItem.call(this, LOCAL_PREFIX + key, value)
}

localStorage.removeItem = function (key) {
  return _origRemoveItem.call(this, LOCAL_PREFIX + key)
}

// --- sessionStorage proxy ---

sessionStorage.getItem = function (key) {
  return _origGetItem.call(this, SESSION_PREFIX + key)
}

sessionStorage.setItem = function (key, value) {
  return _origSetItem.call(this, SESSION_PREFIX + key, value)
}

sessionStorage.removeItem = function (key) {
  return _origRemoveItem.call(this, SESSION_PREFIX + key)
}

// --- Targeted clear functions ---

/**
 * Clear only namespaced sessionStorage entries (link_s_*).
 * Safe to call in an iframe — will NOT touch the parent page's data.
 */
export function clearNamespacedSession() {
  const keysToRemove = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = _origKey.call(sessionStorage, i)
    if (key && key.startsWith(SESSION_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => _origRemoveItem.call(sessionStorage, key))
}

/**
 * Clear only namespaced localStorage entries (link_*).
 * Safe to call in an iframe — will NOT touch the parent page's data.
 */
export function clearNamespacedStorage() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = _origKey.call(localStorage, i)
    if (key && key.startsWith(LOCAL_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => _origRemoveItem.call(localStorage, key))
}

// Convenient aliases
export const clearSession = clearNamespacedSession
export const clearProjectStorage = clearNamespacedStorage
