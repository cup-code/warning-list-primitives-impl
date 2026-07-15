const customerOptions = [
  { label: '有效', value: '2' },
  { label: '误报', value: '3' },
]

const internalOptions = [
  { label: '误报', value: '4' },
  { label: '有效', value: '2' },
  { label: '无效', value: '3' },
  { label: '不确定', value: '5' },
]

export function getBatchDealOptions(userType) {
  return userType === 'CustomerStatus' ? customerOptions : internalOptions
}

export function getBatchDealCopy(userType) {
  return userType === 'CustomerStatus'
    ? {
        title: '批量处理预警',
        resultRequired: '请选择处理结果',
        success: '批量处理成功',
      }
    : {
        title: '批量审核预警',
        resultRequired: '请选择审核结果',
        success: '批量审核成功',
      }
}

export function buildBatchDealParams({
  selectedWarnings,
  auditRes,
  opinion,
  userType,
  submitType,
}) {
  const params = {
    alarms: selectedWarnings.map(item => ({
      alarmId: item.id,
      tenantCode: item.tenantCode,
    })),
    status: auditRes,
    opinion,
  }

  if (userType !== 'CustomerStatus') params.type = submitType
  return params
}

export function selectBatchDealApi(userType, {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
}) {
  return {
    CustomerStatus: batchAttentionAlarm,
    InternalStatus: batchAttentionAlarmInternal,
    all: batchAttentionAlarmInternal,
  }[userType]
}
