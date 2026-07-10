export function underLineToCame(path) {
  return path.replace(/-\w/g, (match, p1, offset, string) => {
    return match.replace('-', '').toUpperCase()
  })
}

// 自动匹配路由
export function autoMatchNpmRoutes(routePath) {
  const reg = /^@link-angel/
  const reg_pre = /^@link-angel-/
  if (reg.test(routePath)) {
    const [pathPrefix, pathSuffix] = routePath.split('/')
    const entryDir = underLineToCame(pathPrefix.replace(reg_pre, ''))
    const npmEntryDir = pathPrefix.replace('@', '')
    const everyPageDir = underLineToCame(pathSuffix)
    if (process.env.NODE_ENV == 'development') {
      // 项目内
      return () => import(`@/views/${entryDir}/pages/${everyPageDir}/index.vue`)
      // 本地软连接
      // return () => import(`npmEntryDir/src/pages/${everyPageDir}/index.vue`)
    }
    else if (process.env.NODE_ENV == 'production') {
      // return () => import(`npmEntryDir/lib/${pathSuffix}/index.js`)
      return () => import(`@/views/${entryDir}/pages/${everyPageDir}/index.vue`)
    }
  }
  return () => import(`@/${routePath}.vue`)
}

// 防止路由路径变量解析所有路由资源
export function routeEnum(pathUrl) {
  const fileName = underLineToCame(pathUrl)

  // 可参照标准格式
  // '@link-angel-system-review':{
  //   dev:() => import(`@/views/systemReview/pages/${fileName}/index.vue`),
  //   devLink:() => import(`link-angel-system-review/src/pages/${fileName}/index.vue`),
  //   pro:() => import(`link-angel-system-review/lib/${pathUrl}/index.js`),
  // }
  const NPM_ROUTES_ENUM = {
    '@link-angel-edu': {
      devLink: () => import(`link-angel-edu/src/pages/${fileName}/index.vue`),
      pro: () => import(`link-angel-edu/lib/${pathUrl}/index.js`),
    },
    '@link-angel-system-review': {
      devLink: () => import(`link-angel-system-review/src/pages/${fileName}/index.vue`),
      pro: () => import(`link-angel-system-review/lib/${pathUrl}/index.js`),
    },
    '@link-angel-special-operation': {
      devLink: () => import(`link-angel-special-operation/src/pages/${fileName}/index.vue`),
      pro: () => import(`link-angel-special-operation/lib/${pathUrl}/index.js`),
    },
    '@link-angel-change-management': {
      devLink: () => import(`link-angel-change-management/src/pages/${fileName}/index.vue`),
      pro: () => import(`link-angel-change-management/lib/${pathUrl}/index.js`),
    },
    '@link-angel-group-report': {
      devLink: () => import(`link-angel-group-report/src/pages/${fileName}/index.vue`),
      pro: () => import(`link-angel-group-report/lib/${pathUrl}/index.js`),
    },
    '@link-angel-editor': {
      devLink: () => import(`link-angel-editor/lib/${pathUrl}/index.js`),
      pro: () => import(`link-angel-editor/lib/${pathUrl}/index.js`),
    },
  }
  return NPM_ROUTES_ENUM
}
