<script>
import SharedReportExportPage from '@link/shared-ui/forewarning-management/report-export'
import { reportExportHost } from './reportExportHost.js'

export default {
  name: 'ReportExport',
  inheritAttrs: false,
  components: { SharedReportExportPage },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportExportPage
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
