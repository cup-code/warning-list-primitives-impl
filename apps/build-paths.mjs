import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appsDirectory = path.dirname(fileURLToPath(import.meta.url))

export const workspaceNodeModules = path.resolve(appsDirectory, '../node_modules')

export function resolveWorkspaceDependency(dependencyPath) {
  return path.join(workspaceNodeModules, dependencyPath)
}
