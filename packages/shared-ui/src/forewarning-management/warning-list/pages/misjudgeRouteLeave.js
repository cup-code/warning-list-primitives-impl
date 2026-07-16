export function shouldClearMisjudgeCache(path) {
  return !path.includes('/detail') && !path.includes('misjudgeList')
}

export function runMisjudgeRouteLeave({ to, clearCache, next }) {
  if (shouldClearMisjudgeCache(to.path)) clearCache()
  next()
}
