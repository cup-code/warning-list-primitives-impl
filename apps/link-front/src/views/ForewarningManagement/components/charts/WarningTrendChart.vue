<script>
import SharedWarningTrendChart from '@link/shared-ui/forewarning-management/static-analysis/charts/warning-trend-chart'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'WarningTrendChart',
  components: { SharedWarningTrendChart },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedWarningTrendChart
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
