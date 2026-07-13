import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { auditSharedSources } from './shared-source-audit.mjs'

test('按相对路径和内容分类，并稳定排序且排除 .DS_Store', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'link-audit-'))
  const warning = path.join(root, 'warning')
  const front = path.join(root, 'front')
  await mkdir(path.join(warning, 'nested'), { recursive: true })
  await mkdir(path.join(front, 'nested'), { recursive: true })

  await Promise.all([
    writeFile(path.join(warning, 'same.js'), 'same\n'),
    writeFile(path.join(front, 'same.js'), 'same\n'),
    writeFile(path.join(warning, 'different.js'), 'warning\n'),
    writeFile(path.join(front, 'different.js'), 'front\n'),
    writeFile(path.join(warning, 'z-warning-only.js'), 'warning\n'),
    writeFile(path.join(warning, 'nested', 'a-warning-only.js'), 'warning\n'),
    writeFile(path.join(front, 'z-front-only.js'), 'front\n'),
    writeFile(path.join(front, 'nested', 'a-front-only.js'), 'front\n'),
    writeFile(path.join(warning, '.DS_Store'), 'warning metadata'),
    writeFile(path.join(front, '.DS_Store'), 'different front metadata'),
  ])

  const result = await auditSharedSources(warning, front)

  assert.deepEqual(result, {
    counts: {
      smaller: 4,
      larger: 4,
      common: 2,
      identical: 1,
      different: 1,
      smallerOnly: 2,
      largerOnly: 2,
    },
    identicalFiles: ['same.js'],
    differentFiles: ['different.js'],
    smallerOnlyFiles: ['nested/a-warning-only.js', 'z-warning-only.js'],
    largerOnlyFiles: ['nested/a-front-only.js', 'z-front-only.js'],
  })
})
