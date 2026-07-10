/**
 * Tab-scoped session storage utility.
 *
 * Auth data is stored in BOTH Vuex (in-memory, primary) and sessionStorage
 * (persistence layer for page refresh). In cross-origin iframe contexts
 * where sessionStorage may be blocked by browser policies (Safari ITP,
 * Chrome partitioning), the app still functions within the current page
 * lifecycle via Vuex — but session cannot survive a page refresh.
 *
 * All sessionStorage calls are wrapped in try-catch for SecurityError.
 */

import store from '@/store'

const TK_KEY = 'tk'
const AUTH_TOKEN_KEY = 'authToken'
const ALIVE_KEY = 'isAlive'

function safeGet(key) {
  try {
    return sessionStorage.getItem(key)
  }
  catch (e) {
    return null
  }
}

function safeSet(key, value) {
  try {
    sessionStorage.setItem(key, value)
  }
  catch (e) { /* sessionStorage unavailable (cross-origin iframe) */ }
}

function safeClear() {
  try {
    sessionStorage.clear()
  }
  catch (e) { /* ignore */ }
}

// --- iframe detection ---

export function isInIframe() {
  try {
    return window.self !== window.top
  }
  catch (e) {
    return true // cross-origin access error = we're in an iframe
  }
}

// --- Auth Token (Authorization header) ---
// Primary: Vuex store. Persistence: sessionStorage.

export function getAuthToken() {
  return store.state.user.token || safeGet(TK_KEY)
}

export function setAuthToken(token) {
  store.dispatch('user/token', token)
  safeSet(TK_KEY, token)
}

// --- Tenant Token (X-Link-Tenant header) ---

export function getTenantToken() {
  return store.state.user.tenantToken || safeGet(AUTH_TOKEN_KEY) || ''
}

export function setTenantToken(token) {
  store.dispatch('user/tenantToken', token)
  safeSet(AUTH_TOKEN_KEY, token)
}

// --- Session Alive (with TTL) ---
// Primary: Vuex store. Persistence: sessionStorage.

export function setSessionAlive(ttlSeconds) {
  if (!ttlSeconds || isNaN(ttlSeconds)) {
    ttlSeconds = 30 * 60
  }
  const exp = new Date() - 1 + ttlSeconds * 1000
  // Vuex (always available, survives within page lifecycle)
  store.dispatch('user/sessionAliveExp', exp)
  // sessionStorage (best-effort, for page refresh)
  safeSet(ALIVE_KEY, JSON.stringify({ val: true, exp }))
}

export function getSessionAlive() {
  // Check Vuex first (works in iframe without sessionStorage)
  const vuexExp = store.state.user.sessionAliveExp
  if (vuexExp) {
    const now = new Date() - 1
    if (now <= vuexExp) {
      return true
    }
    // Expired in Vuex, clear it
    store.dispatch('user/sessionAliveExp', null)
  }
  // Fallback to sessionStorage (for page refresh restore)
  try {
    const raw = safeGet(ALIVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed) return null
    const now = new Date() - 1
    if (now > parsed.exp) {
      try { sessionStorage.removeItem(ALIVE_KEY) } catch (e) { /* ignore */ }
      return null
    }
    return parsed.val
  }
  catch (e) {
    return null
  }
}

// --- Session Lifecycle ---

export function clearSession() {
  store.dispatch('user/logout')
  safeClear()
}

/**
 * Validate that session data is consistent (both token and user present).
 * Checks Vuex first (always available), then sessionStorage.
 */
export function validateSession() {
  const vuexToken = !!store.state.user.token
  const vuexUser = !!store.state.user.user
  if (vuexToken && vuexUser) return true
  // Fall back to sessionStorage (for page refresh scenario)
  const ssToken = !!safeGet(TK_KEY)
  const ssUser = !!safeGet('user')
  return ssToken && ssUser
}
