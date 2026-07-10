import {
  delStorageItem,
  getStorageItem,
  setStorageItem,
} from '@/utils/storage'

const TokenKey = 'token'
const ShareTokenKey = 'shareToken'
const AccessUserKey = 'gaeaUser'

export function getToken() {
  return getStorageItem(TokenKey)
}
export function getShareToken() {
  return getStorageItem(ShareTokenKey) == null ? '' : getStorageItem(ShareTokenKey)
}
export function setToken(token) {
  return setStorageItem(TokenKey, token)
}
export function setShareToken(shareToken) {
  return setStorageItem(ShareTokenKey, shareToken)
}
export function delToken() {
  return delStorageItem(TokenKey)
}
export function delShareToken() {
  return delStorageItem(ShareTokenKey)
}

export function getAccessUser() {
  return getStorageItem(AccessUserKey)
}
export function setAccessUser(accessUser) {
  return setStorageItem(AccessUserKey, accessUser)
}
export function delAccessUser() {
  return delStorageItem(AccessUserKey)
}

// 获取当前用户的所有的权限码，判断是否有
export function hasPermission(permissionStr) {
  // 不需要权限
  if (permissionStr == null || permissionStr.length == 0) {
    return true
  }

  // 登录用户的全部权限码
  const user = getAccessUser()
  if (user == null || user.authorities == null) {
    return false
  }
  const opAuthoritiesStr = JSON.stringify(user.authorities)

  // permissionStr可能是：authorityManage、authorityManage:insert、authorityManage:insert|authorityManage:update
  const needPermissionArray = permissionStr.split('|')
  for (let i = 0; i < needPermissionArray.length; i++) {
    // 只要有其中的一个权限，就返回true
    let needPermission = needPermissionArray[i] // authorityManage、authorityManage:insert
    needPermission = needPermission.replace(/ /g, '') // 去除authorityManage : insert中:前后的空格

    if (opAuthoritiesStr.includes(needPermission)) {
      return true
    }
  }
  return false
}
