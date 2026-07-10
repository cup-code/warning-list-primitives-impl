import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { collectManifest } from './tree-manifest.mjs'

test('摘要忽略依赖、产物、凭据和系统文件', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-manifest-'))
  await mkdir(path.join(root, 'src'), { recursive: true })
  await mkdir(path.join(root, '.git'), { recursive: true })
  await mkdir(path.join(root, '.cache'), { recursive: true })
  await mkdir(path.join(root, '.rsbuild-cache'), { recursive: true })
  await mkdir(path.join(root, 'node_modules', 'pkg'), { recursive: true })
  await mkdir(path.join(root, 'dist'), { recursive: true })
  await writeFile(path.join(root, 'src', 'main.js'), 'export default 1\n')
  await writeFile(path.join(root, '.git', 'config'), 'ignored\n')
  await writeFile(path.join(root, '.cache', 'data'), 'ignored\n')
  await writeFile(path.join(root, '.rsbuild-cache', 'data'), 'ignored\n')
  await writeFile(path.join(root, 'node_modules', 'pkg', 'index.js'), 'ignored\n')
  await writeFile(path.join(root, 'dist', 'index.js'), 'ignored\n')
  await writeFile(path.join(root, '.npmrc'), '_auth=secret\n')
  await writeFile(path.join(root, '.DS_Store'), 'ignored\n')

  const manifest = await collectManifest(root)

  assert.deepEqual(manifest.files.map(file => file.path), ['src/main.js'])
  assert.match(manifest.digest, /^[a-f0-9]{64}$/)
})

test('文件内容改变时摘要随之改变', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-manifest-'))
  await writeFile(path.join(root, 'main.js'), 'one\n')
  const before = await collectManifest(root)
  await writeFile(path.join(root, 'main.js'), 'two\n')
  const after = await collectManifest(root)
  assert.notEqual(before.digest, after.digest)
})
