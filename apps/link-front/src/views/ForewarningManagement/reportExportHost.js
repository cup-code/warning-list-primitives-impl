import ImageSelect from '@/components/ImageSelect'
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api'
import { upLoadImg } from '@/http/manage-api'
import { getScreenData } from '@/http/videoStat/screenData'
import { getWarningTypeList, machineList } from '@/http/videoWarning/warning-api'
import { getStorage, setStorage } from '@/utils/index'
import * as reportDate from './test/dateUtils.js'
import { exportToPDF } from './test/pdfExport.js'
import * as reportData from './test/reportData.js'

export const reportCapabilities = Object.freeze({
  showAlarmTypeAxisLabels: true,
  useFixedWeekTitle: true,
})

export const reportExportHost = Object.freeze({
  getSpecifiedModule,
  getScreenData,
  getWarningTypeList,
  machineList,
  exportToPDF,
  ImageSelect,
  uploadImage: upLoadImg,
  getStorage,
  setStorage,
  removeStorage(key) {
    localStorage.removeItem(key)
  },
  reportDate,
  reportData,
  getFilePrefix() {
    const data = JSON.parse(localStorage.getItem('globalData'))
    return data?.minioFilePrefix || ''
  },
  getCurrentCompanyId() {
    return JSON.parse(sessionStorage.getItem('user')).companyId
  },
  ...reportCapabilities,
})
