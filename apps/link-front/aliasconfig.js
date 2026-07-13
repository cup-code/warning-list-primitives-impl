import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { resolveWorkspaceDependency } from '../build-paths.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function getPkgAlias() {
  const lifecycle = process.env.npm_lifecycle_event
  const PKGALIAS = {
    '@edu': 'link-angel-edu', // 宿主环境别名与应用包别名需要统一
    '@systemReview': 'link-angel-system-review',
    '@specialOperation': 'link-angel-special-operation',
    '@groupReport': 'link-angel-group-report',
    '@linkEditor': 'link-angel-editor'
  }
  let alias = {}
  Object.keys(PKGALIAS).forEach((item) => {
    const linkPath = resolveWorkspaceDependency(`${PKGALIAS[item]}/src`)
    const localPath = path.join(__dirname, './src/views/', item.split('@')[1])
    if (lifecycle == 'linkserve') {
      alias[item] = fs.existsSync(linkPath) ? linkPath : localPath
    } else if (lifecycle == 'serve') {
      alias[item] = localPath
    } else if (lifecycle == 'build') {
      alias[item] = fs.existsSync(linkPath) ? linkPath : localPath
    }
  })

  return alias
}
export default { getPkgAlias }
