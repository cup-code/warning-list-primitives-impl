import { getScreenData } from '@/http/videoStat/screenData'
import {
  exportOrgWarning,
  exportPointWarning,
  exportWarningLevel,
  exportWarningProcess,
  exportWarningTrend,
  exportWarningType,
} from '@/http/videoWarning/warning-api'

export const staticAnalysisHost = Object.freeze({
  getScreenData,
  exportOrgWarning,
  exportPointWarning,
  exportWarningLevel,
  exportWarningProcess,
  exportWarningTrend,
  exportWarningType,
  logSearchForm: true,
  listenWarningTypeRefresh: true,
  searchCardNoneBottom: false,
})
