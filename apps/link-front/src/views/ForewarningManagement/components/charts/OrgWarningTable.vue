<script>
import SharedOrgWarningTable from '@link/shared-ui/forewarning-management/static-analysis/charts/org-warning-table'
import { staticAnalysisHost } from '../../staticAnalysisHost'

export default {
  name: 'OrgWarningTable',
  components: { SharedOrgWarningTable },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedOrgWarningTable
    v-bind="$attrs"
    :host="staticAnalysisHost"
    v-on="$listeners"
  />
</template>
