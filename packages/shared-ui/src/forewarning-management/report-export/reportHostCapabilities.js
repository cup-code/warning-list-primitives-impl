function requirement(path, type) {
  return Object.freeze({ path, type })
}

export const reportExportPageHostRequirements = Object.freeze([
  requirement('getSpecifiedModule', 'function'),
  requirement('getScreenData', 'function'),
  requirement('getWarningTypeList', 'function'),
  requirement('machineList', 'function'),
  requirement('exportToPDF', 'function'),
  requirement('getCurrentCompanyId', 'function'),
  requirement('reportDate.getWeekRange', 'function'),
  requirement('reportDate.getCurrentWeekNumber', 'function'),
  requirement('reportDate.getCurrentYear', 'function'),
  requirement('reportDate.getWeekDateStr', 'function'),
  requirement('reportDate.getCurrentTitle', 'function'),
  requirement('reportDate.getDefaultReportTitle', 'function'),
  requirement('reportData.generateActualList', 'function'),
  requirement('reportData.generateReportText', 'function'),
  requirement('reportData.generateStatsList', 'function'),
  requirement('reportData.processAlarmLevelRank', 'function'),
  requirement('reportData.processAlarmTypeRank', 'function'),
  requirement('reportData.processCameraAlarmRank', 'function'),
  requirement('reportData.processTrendTableData', 'function'),
])

export const reportFormHostRequirements = Object.freeze([
  requirement('ImageSelect', 'present'),
  requirement('uploadImage', 'function'),
  requirement('getStorage', 'function'),
  requirement('setStorage', 'function'),
  requirement('removeStorage', 'function'),
  requirement('getFilePrefix', 'function'),
  requirement('reportDate.getWeekRange', 'function'),
])

export const reportPreviewHostRequirements = Object.freeze([
  requirement('getFilePrefix', 'function'),
  requirement('showAlarmTypeAxisLabels', 'boolean'),
  requirement('useFixedWeekTitle', 'boolean'),
])

function readPath(value, path) {
  let current = value
  for (const segment of path.split('.')) {
    if (current === null || current === undefined || !Object.hasOwn(current, segment)) {
      return { found: false, value: undefined }
    }
    current = current[segment]
  }
  return { found: true, value: current }
}

function receivedType(found, value) {
  if (!found)
    return 'missing'
  if (value === null)
    return 'null'
  return typeof value
}

export function assertHostCapabilities(host, consumer, requirements) {
  for (const { path, type } of requirements) {
    const result = readPath(host, path)
    const valid = type === 'present'
      ? result.found && result.value !== null && result.value !== undefined
      : result.found && typeof result.value === type

    if (!valid) {
      throw new TypeError(
        `${consumer} host capability "${path}" expected ${type}, received ${receivedType(result.found, result.value)}`,
      )
    }
  }
  return host
}

export function validateHostCapabilities(
  host,
  consumer,
  requirements,
  environment = globalThis.process?.env?.NODE_ENV,
) {
  if (environment === 'production')
    return undefined
  return assertHostCapabilities(host, consumer, requirements)
}
