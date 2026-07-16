export const warningListHostRequirements = {
  detailPayloadMode: 'string',
  getDictList: 'function',
  getFilePrefix: 'function',
  pushWarningDetail: 'function',
}

export function assertWarningListHost(host, componentName) {
  if (!host) {
    throw new Error(`${componentName}: warning list host is required`)
  }

  for (const capability of [
    'getDictList',
    'getFilePrefix',
    'pushWarningDetail',
  ]) {
    if (typeof host[capability] !== 'function') {
      throw new Error(`${componentName}: host.${capability} must be a function`)
    }
  }

  if (!['id', 'form'].includes(host.detailPayloadMode)) {
    throw new Error(
      `${componentName}: host.detailPayloadMode "${host.detailPayloadMode}" must be "id" or "form"`,
    )
  }
}

export function validateWarningListHost(
  host,
  componentName,
  environment = process.env.NODE_ENV,
) {
  if (environment === 'production') return undefined

  return assertWarningListHost(host, componentName)
}

export function createWarningDetailData(row, context, detailPayloadMode) {
  const type = context.allType ? 'all' : context.type
  const data = { type, form: context.form }

  if (detailPayloadMode === 'id') {
    return { detailId: row.id, ...data }
  }

  if (detailPayloadMode === 'form') {
    return { detailForm: row, ...data }
  }

  throw new Error(
    `Unsupported warning detail payload mode "${detailPayloadMode}"`,
  )
}
