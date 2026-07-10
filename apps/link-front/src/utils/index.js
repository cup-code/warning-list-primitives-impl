import moment from 'moment'
import { routeEnum } from './appRouteConfig'

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element) {
    return
  }
  let classString = element.className
  if (classString.includes('el-popup-parent--hidden')) {
    classString = `el-popup-parent--hidden ${className}`
  }
  else {
    classString = className
  }
  element.className = classString
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {object} source
 * @returns {object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    }
    else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

// 设置localStorage(加上失效控制: 不传time的话默认为半小时)
export function setStorage(key, data, time) {
  try {
    if (!localStorage) {
      return false
    }
    if (!time || isNaN(time)) {
      time = 30 * 60 // 默认半小时
    }
    const cacheExpireDate = new Date() - 1 + time * 1000
    const cacheVal = { val: data, exp: cacheExpireDate }
    localStorage.setItem(key, JSON.stringify(cacheVal)) // 存入缓存值
  }
  catch (e) { }
}

// 获取localStorage(加上失效时间判断)
export function getStorage(key) {
  try {
    if (!localStorage) {
      return false
    }
    const cacheVal = localStorage.getItem(key)
    const result = JSON.parse(cacheVal)
    const now = new Date() - 1
    // 缓存不存在
    if (!result) {
      return null
    }
    // 缓存过期
    if (now > result.exp) {
      localStorage.removeItem(key)
      return null
    }

    return result.val
  }
  catch (e) {
    localStorage.removeItem(key)
    return null
  }
}
function setBusinessType(menu, list) {
  if (menu.businessType === 1) {
    list.forEach((item) => {
      if (item.id === menu.parentId) {
        item.businessType = 1
        setBusinessType(item, list)
      }
    })
  }
}
export function setPermissionTreeData(source) {
  const cloneData = JSON.parse(JSON.stringify(source))
  const btnPermissions = cloneData
    .filter(item => item.channelType === 'WEB' && item.menuType === '3')
    .map(menu => menu.vueComponent) // 保存所拥有的按钮权限
  sessionStorage.setItem('btnPermissions', JSON.stringify(btnPermissions || '[]'))
  // 给开屏页类型的菜单的上级也赋值为开屏页类型，登录后在用户菜单栏不展示
  cloneData.forEach((item) => {
    setBusinessType(item, cloneData)
  })
  // 过滤掉不是web页面的菜单类型和按钮类型的菜单,过滤掉开屏页
  const cloneDataExceptBtn = cloneData.filter((item) => {
    return item.channelType === 'WEB' && item.menuType !== '3' && item.businessType !== 1
  })
  cloneDataExceptBtn.forEach((item) => {
    item.englishName = item.englishName.replace(/\s*/g, '') // 去掉英文名中的空格
    item.path = item.menuType === '0' ? `/${item.englishName}` : item.englishName
    item.name = item.englishName
    // item.component = item.menuType === '0' ? `layout/index` : item.menuType === '1' ? 'views/second/second' : item.vueComponent

    // zbs: 为了解决动态表单发布生成菜单后，点击菜单要传递参数
    // item.component = item.menuType === '0' ? `layout/index` : item.menuType === '1' ? 'views/second/second' : item.vueComponent.split('?')[0]
    // item.query = item.menuType === '2' ? item.vueComponent.split('?')[1] : ''
    if (item.menuType === '0') {
      item.component = item.englishName === 'park' ? 'layout/magic/index' : `layout/index`
    }
    else {
      if (item.pageSourceType === '1' && item.vueComponent) {
        item.component = item.vueComponent.split('?')[0]
        item.query = item.vueComponent.split('?')[1] || ''
      }
      else if (item.pageSourceType === '2' && item.externalUrl) {
        item.component = `views/frames/outUrl`
      }
      else if (item.pageSourceType === '3' && item.externalUrl) {
        item.component = `views/frames/outUrl`
      }
      else {
        item.component = `views/second/second`
      }
    }
  })
  cloneDataExceptBtn.sort((a, b) => {
    return a.sort - b.sort
  })
  // console.log(JSON.stringify(cloneDataExceptBtn))
  return cloneDataExceptBtn.filter((father) => {
    const branchArr = cloneDataExceptBtn.filter(child => father.id === child.parentId)
    if (branchArr.length > 0) {
      father.children = branchArr
    }
    return !father.parentId // 返回第一层
  })
}
// 把扁平数据转化成树形结构
export function setTreeData(source) {
  const cloneData = JSON.parse(JSON.stringify(source))
  cloneData.sort((a, b) => {
    return a.sort - b.sort
  })
  return cloneData.filter((father) => {
    const branchArr = cloneData.filter(child => father.id === child.parentId)
    if (branchArr.length > 0) {
      father.children = branchArr
    }
    return !father.parentId // 返回第一层
    // return !father.parentId //返回第一层
  })
}
// 根据接口数据初始化路由 begin
export function initRouter(store, res) {
  let constRoutes = []
  const menuData = res.result
  if (!menuData.length) {
    return
  }

  // 过滤掉小程序端的菜单， 只要pc端的
  // menuData = menuData.filter(item => item.channelType === 'WEB');

  // 生成 路由, 并保存在constRoutes
  constRoutes = initRouterNode(constRoutes, menuData)
  // 把生成的路由，动态注册， 并保存在store中
  store.dispatch('user/menus', constRoutes)
  sessionStorage.setItem('routerList', JSON.stringify(constRoutes))

  console.log(constRoutes, 333111)
}

function initRouterNode(routers, data) {
  for (const item of data) {
    const menu = Object.assign({}, item)
    menu.component = lazyLoading(menu.component)
    if (item.children && item.children.length > 0) {
      menu.children = []
      initRouterNode(menu.children, item.children)

      // if(item.children.length === 1) {
      //   menu.alwaysShow = true;
      // }
    }
    else {
      delete menu.children
    }

    const meta = {}
    meta.title = menu.menuName ? menu.menuName : null
    meta.icon = menu.icon ? menu.icon : null
    meta.url = menu.url ? menu.url : null
    meta.key = menu.englishName ? menu.englishName : null
    meta.perms = ['add', 'remove']
    menu.meta = meta

    routers.push(menu)
  }

  return routers
}

function lazyLoading(url) {
  return exactMatchNpmRoutes(url)
}

// 精确匹配路由
function exactMatchNpmRoutes(routePath) {
  const reg = /^@link-angel/
  if (reg.test(routePath)) {
    const [pathPrefix, pathSuffix] = routePath.split('/')
    if (process.env.NODE_ENV === 'development') {
      if (process.env.VUE_APP_LIFECYCLE === 'linkserve') {
        // 本地软连接
        return (routeEnum(pathSuffix)[pathPrefix] || {}).devLink
      }
      else {
        // 项目内
        return (routeEnum(pathSuffix)[pathPrefix] || {}).dev
      }
    }
    else if (process.env.NODE_ENV === 'production') {
      return (routeEnum(pathSuffix)[pathPrefix] || {}).pro
    }
  }

  // 优化：使用更精确的路径匹配，避免将所有文件打包到一个异步块
  // 根据路径前缀进行分组，减少异步块大小
  const pathSegments = routePath.split('/')
  const firstSegment = pathSegments[0]

  // 根据不同的模块进行分组
  if (firstSegment === 'views') {
    const secondSegment = pathSegments[1]
    if (secondSegment) {
      return () => import(/* webpackChunkName: "views-[request]" */ `@/${routePath}.vue`)
    }
  }
  console.log(routePath, 2222)
  // 对于其他路径，使用更通用的分组
  return () => import(/* webpackChunkName: "async-[request]" */ `@/${routePath}.vue`)
}

// 根据接口数据初始化路由 end
export function formatDate(date, format) {
  if (!date) {
    return 'N/A'
  }
  format = format || 'YYYY-MM-DD HH:mm:ss' // HH是24小时制， hh是12小时制
  return moment(date).format(format)
}
/**
 * 是否有权限
 * @param {*} key
 */
export function hasBtnPermission(key) {
  return JSON.parse(sessionStorage.getItem('btnPermissions') || '[]').includes(key) || false
}
/**
 * 表单对象赋值:
 * 对目标对象存在且源对象同样存在的属性，全部覆盖；
 * 目标对象不存在但是源对象存在的属性， 全部丢弃；
 * 目标对象存在但是源对象不存在的属性，如果是字符串赋值为空串，其余类型赋值为undefined
 */
export function recover(target, source) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object')
  }
  const to = new Object(target)
  if (source === undefined || source === null) {
    return to
  }
  const keysArray = Object.keys(new Object(target))
  for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
    const nextKey = keysArray[nextIndex]
    const desc = Object.getOwnPropertyDescriptor(target, nextKey)
    if (desc !== undefined && desc.enumerable) {
      if (to.hasOwnProperty(nextKey)) {
        if (Array.isArray(to[nextKey])) {
          to[nextKey] = source[nextKey]
        }
        else if (to[nextKey] instanceof Object) {
          recover(to[nextKey], source[nextKey])
        }
        else if (source[nextKey] !== undefined) {
          to[nextKey] = source[nextKey]
        }
        else if (typeof to[nextKey] === 'string') {
          to[nextKey] = ''
        }
        else {
          to[nextKey] = undefined
        }
      }
    }
  }
  return to
}

/**
 * 去除对象中null属性
 */
export function removeEmptyField(obj = {}) {
  let newObj = {}
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }
  if (Array.isArray(obj)) {
    newObj = []
  }
  if (obj instanceof Object) {
    for (const attr in obj) {
      // 属性值不为'',null,undefined才加入新对象里面(去掉'',null,undefined)
      if (
        obj?.hasOwnProperty(attr)
        && obj[attr] !== ''
        && obj[attr] !== null
        && obj[attr] !== undefined
      ) {
        if (obj[attr] instanceof Object) {
          // 空数组或空对象不加入新对象(去掉[],{})
          if (JSON.stringify(obj[attr]) === '{}' || JSON.stringify(obj[attr]) === '[]') {
            continue
          }
          // 属性值为对象,则递归执行去除方法
          newObj[attr] = removeEmptyField(obj[attr])
        }
        else if (
          typeof obj[attr] === 'string'
          && ((obj[attr].includes('{') && obj[attr].includes('}'))
            || (obj[attr].includes('[') && obj[attr].includes(']')))
        ) {
          // 属性值为JSON时
          try {
            const attrObj = JSON.parse(obj[attr])
            if (attrObj instanceof Object) {
              newObj[attr] = removeEmptyField(attrObj)
            }
          }
          catch (e) {
            newObj[attr] = obj[attr]
          }
        }
        else {
          newObj[attr] = obj[attr]
        }
      }
    }
  }
  return newObj
}
