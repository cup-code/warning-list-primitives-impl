import { readFile } from 'node:fs/promises'

export function compareManifestSets(before, after) {
  const differences = []
  for (const key of Object.keys(before)) {
    if (!after[key]) differences.push(`${key}: 缺少迁移后摘要`)
    else if (before[key].digest !== after[key].digest) differences.push(`${key}: 内容摘要变化`)
  }
  return { equal: differences.length === 0, differences }
}

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
