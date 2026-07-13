import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function compareManifestSets(before, after) {
  const differences = []
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
  for (const key of keys) {
    if (!before[key]) differences.push(`${key}: 缺少迁移前摘要`)
    else if (!after[key]) differences.push(`${key}: 缺少迁移后摘要`)
    else if (before[key].digest !== after[key].digest) differences.push(`${key}: 内容摘要变化`)
  }
  return { equal: differences.length === 0, differences }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [beforePath, afterPath] = process.argv.slice(2)
  if (!beforePath || !afterPath) {
    throw new Error('用法: node compare-manifests.mjs <before.json> <after.json>')
  }
  const before = JSON.parse(await readFile(beforePath, 'utf8'))
  const after = JSON.parse(await readFile(afterPath, 'utf8'))
  const result = compareManifestSets(before, after)
  if (!result.equal) {
    console.error(result.differences.join('\n'))
    process.exitCode = 1
  } else {
    console.log('来源目录未发生变化')
  }
}
