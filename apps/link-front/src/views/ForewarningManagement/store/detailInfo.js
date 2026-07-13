import { createDetailInfoModule } from '@link/warning-feature/detail-info'
import {
  allWarningAudit,
  allWarningList,
  attentionAlarm,
  clientWarningAudit,
  clientWarningList,
  maintenanceWarningAudit,
  maintenanceWarningList,
} from '@/http/videoWarning/warning-api'

export default createDetailInfoModule({
  allWarningAudit,
  allWarningList,
  attentionAlarm,
  clientWarningAudit,
  clientWarningList,
  maintenanceWarningAudit,
  maintenanceWarningList,
})
