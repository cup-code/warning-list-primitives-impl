<script>
import SharedWarningLevelChart from '@link/shared-ui/forewarning-management/static-analysis/charts/warning-level-chart'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'WarningLevelChart',
  components: { SharedWarningLevelChart },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedWarningLevelChart
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
