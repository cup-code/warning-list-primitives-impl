<script>
import SharedPointWarningTable from '@link/shared-ui/forewarning-management/static-analysis/charts/point-warning-table'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'PointWarningTable',
  components: { SharedPointWarningTable },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedPointWarningTable
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
