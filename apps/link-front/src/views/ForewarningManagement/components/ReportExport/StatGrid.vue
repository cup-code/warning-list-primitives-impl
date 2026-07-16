<script>
import SharedStatGrid from '@link/shared-ui/forewarning-management/report-export/stat-grid'
import { reportCapabilities } from '../../reportExportHost.js'

export default {
  name: 'StatGrid',
  inheritAttrs: false,
  components: { SharedStatGrid },
  data: () => ({ reportCapabilities }),
}
</script>

<template>
  <SharedStatGrid
    v-bind="$attrs"
    :use-fixed-week-title="reportCapabilities.useFixedWeekTitle"
    v-on="$listeners"
  />
</template>
