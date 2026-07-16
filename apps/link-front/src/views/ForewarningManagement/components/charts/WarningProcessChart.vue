<script>
import SharedWarningProcessChart from '@link/shared-ui/forewarning-management/static-analysis/charts/warning-process-chart'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'WarningProcessChart',
  components: { SharedWarningProcessChart },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedWarningProcessChart
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
