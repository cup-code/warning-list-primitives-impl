import { tenantControlList } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUserListByRoleFn } from '@/http/safe-production/user-manage-api'
import {
  allMachineList,
  allWarningList,
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
  machineList,
} from '@/http/videoWarning/warning-api'
import { delStorageItem, getStorageItem, setStorageItem } from '@/utils/storage'
import warningListHost from './warningListHost'

const misjudgeListHost = {
  tenantControlList,
  getDepartListSimple,
  getUserListByRoleFn,
  allWarningList,
  getStorageItem,
  setStorageItem,
  delStorageItem,
  allMachineList,
  machineList,
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
  warningListHost,
}

export default misjudgeListHost
