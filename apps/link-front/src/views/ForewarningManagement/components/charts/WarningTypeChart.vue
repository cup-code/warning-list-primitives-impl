<script>
import SharedWarningTypeChart from '@link/shared-ui/forewarning-management/static-analysis/charts/warning-type-chart'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'WarningTypeChart',
  components: { SharedWarningTypeChart },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedWarningTypeChart
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
