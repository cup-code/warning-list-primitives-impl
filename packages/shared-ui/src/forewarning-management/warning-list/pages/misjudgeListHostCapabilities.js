export const misjudgeListHostRequirements = Object.freeze({
  tenantControlList: 'function',
  getDepartListSimple: 'function',
  getUserListByRoleFn: 'function',
  allWarningList: 'function',
  getStorageItem: 'function',
  setStorageItem: 'function',
  delStorageItem: 'function',
  allMachineList: 'function',
  machineList: 'function',
  batchAttentionAlarm: 'function',
  batchAttentionAlarmInternal: 'function',
  warningListHost: 'object',
})

export function assertMisjudgeListHost(host, componentName) {
  for (const [capability, expectedType] of Object.entries(
    misjudgeListHostRequirements,
  )) {
    const found = host !== null
      && host !== undefined
      && Object.prototype.hasOwnProperty.call(host, capability)
    const value = found ? host[capability] : undefined
    const valid = capability === 'warningListHost'
      ? found && value !== null && typeof value === 'object'
      : found && typeof value === expectedType

    if (!valid) {
      const expected = capability === 'warningListHost'
        ? 'non-null object'
        : expectedType
      const received = found ? typeof value : 'missing'
      throw new TypeError(
        `${componentName}: host capability "${capability}" expected ${expected}, received ${received}`,
      )
    }
  }

  return host
}

export function validateMisjudgeListHost(
  host,
  componentName,
  environment = process.env.NODE_ENV,
) {
  if (environment === 'production') return undefined
  return assertMisjudgeListHost(host, componentName)
}
