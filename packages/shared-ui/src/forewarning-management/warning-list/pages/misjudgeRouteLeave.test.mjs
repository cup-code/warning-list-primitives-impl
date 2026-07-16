import assert from 'node:assert/strict'
import test from 'node:test'

import {
  runMisjudgeRouteLeave,
  shouldClearMisjudgeCache,
} from './misjudgeRouteLeave.js'

test('keeps cache for detail paths', () => {
  assert.equal(shouldClearMisjudgeCache('/detail/warningDetail'), false)
})

test('keeps cache for paths containing misjudgeList', () => {
  assert.equal(shouldClearMisjudgeCache('/warning/misjudgeList/history'), false)
})

test('clears cache for unrelated paths', () => {
  assert.equal(shouldClearMisjudgeCache('/warning/attentionList'), true)
})

test('clears cache only for unrelated paths and always advances once', () => {
  const cases = [
    { path: '/detail/warningDetail', expectedClearCount: 0 },
    { path: '/warning/misjudgeList/history', expectedClearCount: 0 },
    { path: '/warning/attentionList', expectedClearCount: 1 },
  ]

  for (const { path, expectedClearCount } of cases) {
    let clearCount = 0
    let nextCount = 0

    runMisjudgeRouteLeave({
      to: { path },
      clearCache: () => { clearCount += 1 },
      next: () => { nextCount += 1 },
    })

    assert.equal(clearCount, expectedClearCount, path)
    assert.equal(nextCount, 1, path)
  }
})

test('propagates clearCache errors without advancing', () => {
  const clearError = new Error('clear failed')
  let nextCount = 0

  assert.throws(
    () => runMisjudgeRouteLeave({
      to: { path: '/warning/attentionList' },
      clearCache: () => { throw clearError },
      next: () => { nextCount += 1 },
    }),
    error => error === clearError,
  )
  assert.equal(nextCount, 0)
})

test('missing and non-string paths throw before clearing or advancing', () => {
  for (const path of [undefined, 42]) {
    let clearCount = 0
    let nextCount = 0

    assert.throws(() => shouldClearMisjudgeCache(path), TypeError)
    assert.throws(
      () => runMisjudgeRouteLeave({
        to: { path },
        clearCache: () => { clearCount += 1 },
        next: () => { nextCount += 1 },
      }),
      TypeError,
    )

    assert.equal(clearCount, 0)
    assert.equal(nextCount, 0)
  }
})
