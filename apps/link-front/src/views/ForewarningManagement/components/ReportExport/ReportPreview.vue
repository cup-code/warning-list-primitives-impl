<script>
import SharedReportPreview from '@link/shared-ui/forewarning-management/report-export/preview'
import { reportExportHost } from '../../reportExportHost.js'

export default {
  name: 'ReportPreview',
  inheritAttrs: false,
  components: { SharedReportPreview },
  data: () => ({ reportExportHost }),
}
</script>

<template>
  <SharedReportPreview
    v-bind="$attrs"
    :host="reportExportHost"
    v-on="$listeners"
  />
</template>
