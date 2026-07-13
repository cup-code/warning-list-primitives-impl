import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const comparePaths = (left, right) => left < right ? -1 : left > right ? 1 : 0

async function listFiles(root, relative = '') {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => comparePaths(left.name, right.name))) {
    if (entry.name === '.DS_Store') continue

    const filePath = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(root, filePath))
    else files.push(filePath)
  }

  return files.sort(comparePaths)
}

async function hashFile(root, filePath) {
  const contents = await readFile(path.join(root, filePath))
  return createHash('sha256').update(contents).digest('hex')
}

export async function auditSharedSources(smallerRoot, largerRoot) {
  const smallerFiles = await listFiles(smallerRoot)
  const largerFiles = await listFiles(largerRoot)
  const smallerSet = new Set(smallerFiles)
  const largerSet = new Set(largerFiles)
  const commonFiles = smallerFiles.filter(file => largerSet.has(file))
  const identicalFiles = []
  const differentFiles = []

  for (const file of commonFiles) {
    const identical = await hashFile(smallerRoot, file) === await hashFile(largerRoot, file)
    ;(identical ? identicalFiles : differentFiles).push(file)
  }

  const smallerOnlyFiles = smallerFiles.filter(file => !largerSet.has(file))
  const largerOnlyFiles = largerFiles.filter(file => !smallerSet.has(file))

  return {
    counts: {
      smaller: smallerFiles.length,
      larger: largerFiles.length,
      common: commonFiles.length,
      identical: identicalFiles.length,
      different: differentFiles.length,
      smallerOnly: smallerOnlyFiles.length,
      largerOnly: largerOnlyFiles.length,
    },
    identicalFiles,
    differentFiles,
    smallerOnlyFiles,
    largerOnlyFiles,
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [smallerRoot, largerRoot, outputPath] = process.argv.slice(2)
  if (!smallerRoot || !largerRoot || !outputPath) {
    throw new Error('用法: node shared-source-audit.mjs <较小源码目录> <较大源码目录> <输出文件>')
  }

  const result = await auditSharedSources(smallerRoot, largerRoot)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result.counts))
}
