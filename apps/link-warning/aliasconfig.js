import path from 'path'
import fs from 'fs'

export function getPkgAlias() {
  const lifecycle = process.env.npm_lifecycle_event
  const PKGALIAS = {
    '@edu': 'link-angel-edu', // 宿主环境别名与应用包别名需要统一
    '@systemReview': 'link-angel-system-review',
    '@specialOperation': 'link-angel-special-operation',
    '@groupReport': 'link-angel-group-report',
    '@linkEditor': 'link-angel-editor',
    'link-shared': 'link-shared' // 共享模块别名
  }
  let alias = {}
  Object.keys(PKGALIAS).forEach((item) => {
    const linkPath = path.join(process.cwd(), './node_modules/', PKGALIAS[item], '/src')
    const localPath = linkPath || path.join(process.cwd(), './src/views/', item.split('@')[1])
    // link-shared 特殊处理 - 直接指向上级目录
    if (item === 'link-shared') {
      alias[item] = path.join(process.cwd(), '../link-shared/src')
    } else if (lifecycle == 'linkserve' || lifecycle == 'linkserve:lite') {
      alias[item] = fs.existsSync(linkPath) ? linkPath : localPath
    } else if (lifecycle == 'serve') {
      alias[item] = localPath
    } else if (lifecycle == 'build' || lifecycle == 'build:lite') {
      alias[item] = fs.existsSync(linkPath) ? linkPath : localPath
    }
  })

  return alias
}
export default { getPkgAlias }
