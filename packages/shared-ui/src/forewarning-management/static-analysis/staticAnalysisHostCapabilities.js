const requirements = Object.freeze([
  ['getScreenData', 'function'],
  ['exportOrgWarning', 'function'],
  ['exportPointWarning', 'function'],
  ['exportWarningLevel', 'function'],
  ['exportWarningProcess', 'function'],
  ['exportWarningTrend', 'function'],
  ['exportWarningType', 'function'],
  ['logSearchForm', 'boolean'],
  ['listenWarningTypeRefresh', 'boolean'],
  ['searchCardNoneBottom', 'boolean'],
])

export function assertStaticAnalysisHost(host) {
  for (const [capability, type] of requirements) {
    const found = host !== null
      && host !== undefined
      && Object.prototype.hasOwnProperty.call(host, capability)
    if (!found || typeof host[capability] !== type) {
      const received = found ? typeof host[capability] : 'missing'
      throw new TypeError(
        `StaticAnalysis host capability "${capability}" expected ${type}, received ${received}`,
      )
    }
  }
  return host
}

export function validateStaticAnalysisHost(
  host,
  environment = process.env.NODE_ENV,
) {
  if (environment === 'production')
    return undefined
  return assertStaticAnalysisHost(host)
}
