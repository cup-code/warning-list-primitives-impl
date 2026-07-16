<script>
import SharedStaticAnalysis from '@link/shared-ui/forewarning-management/static-analysis'
import { staticAnalysisHost } from './staticAnalysisHost'

export default {
  name: 'StaticAnalyze',
  components: { SharedStaticAnalysis },
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedStaticAnalysis :host="staticAnalysisHost" />
</template>
