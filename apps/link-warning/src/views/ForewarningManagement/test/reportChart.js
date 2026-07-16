import { createReportChartMixin } from '@link/shared-ui/forewarning-management/report-export/chart-mixin'
import { reportCapabilities } from '../reportExportHost.js'

export default createReportChartMixin({
  showAlarmTypeAxisLabels: reportCapabilities.showAlarmTypeAxisLabels,
})
