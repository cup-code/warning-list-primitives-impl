import assert from 'node:assert/strict'
import test from 'node:test'

async function loadCompareManifestSets() {
  const module = await import('./compare-manifests.mjs')
  return module.compareManifestSets
}

const manifest = digest => ({ digest })

test('模块可正常导入而不执行 CLI', async () => {
  const compareManifestSets = await loadCompareManifestSets()

  assert.equal(typeof compareManifestSets, 'function')
})

test('相同摘要集合返回相等', async () => {
  const compareManifestSets = await loadCompareManifestSets()

  assert.deepEqual(
    compareManifestSets({ app: manifest('same') }, { app: manifest('same') }),
    { equal: true, differences: [] },
  )
})

test('迁移后缺少键时报告差异', async () => {
  const compareManifestSets = await loadCompareManifestSets()

  assert.deepEqual(
    compareManifestSets({ app: manifest('same') }, {}),
    { equal: false, differences: ['app: 缺少迁移后摘要'] },
  )
})

test('迁移后新增键时报告差异', async () => {
  const compareManifestSets = await loadCompareManifestSets()

  assert.deepEqual(
    compareManifestSets({}, { app: manifest('same') }),
    { equal: false, differences: ['app: 缺少迁移前摘要'] },
  )
})

test('同一键的摘要不同时报告差异', async () => {
  const compareManifestSets = await loadCompareManifestSets()

  assert.deepEqual(
    compareManifestSets({ app: manifest('before') }, { app: manifest('after') }),
    { equal: false, differences: ['app: 内容摘要变化'] },
  )
})
