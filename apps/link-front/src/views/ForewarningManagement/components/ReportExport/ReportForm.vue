<script>
import SharedReportForm from '@link/shared-ui/forewarning-management/report-export/form'
import { reportExportHost } from '../../reportExportHost.js'

export default {
  name: 'ReportForm',
  inheritAttrs: false,
  components: { SharedReportForm },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportForm
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
