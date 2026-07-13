import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, readlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const excludedDirectories = new Set([
  '.git',
  '.cache',
  '.rsbuild-cache',
  'dist',
  'node_modules',
])
const excludedFiles = new Set(['.DS_Store', '.npmrc'])

async function walk(root, relative = '') {
  const directory = path.join(root, relative)
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue
    if (!entry.isDirectory() && excludedFiles.has(entry.name)) continue

    const filePath = path.posix.join(relative.split(path.sep).join('/'), entry.name)
    const absolutePath = path.join(root, filePath)

    if (entry.isDirectory()) {
      files.push(...await walk(root, filePath))
      continue
    }

    const stat = await lstat(absolutePath)
    const content = stat.isSymbolicLink()
      ? Buffer.from(`symlink:${await readlink(absolutePath)}`)
      : await readFile(absolutePath)
    files.push({
      path: filePath,
      size: stat.size,
      sha256: createHash('sha256').update(content).digest('hex'),
    })
  }

  return files
}

export async function collectManifest(root) {
  const absoluteRoot = path.resolve(root)
  const files = await walk(absoluteRoot)
  const digest = createHash('sha256')
    .update(files.map(file => `${file.path}\0${file.size}\0${file.sha256}`).join('\n'))
    .digest('hex')
  return { root: absoluteRoot, digest, files }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = process.argv[2]
  if (!root) throw new Error('用法: node tree-manifest.mjs <目录>')
  process.stdout.write(`${JSON.stringify(await collectManifest(root), null, 2)}\n`)
}
