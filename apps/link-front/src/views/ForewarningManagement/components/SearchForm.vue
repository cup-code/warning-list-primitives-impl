<script>
import SharedSearchForm from '@link/shared-ui/forewarning-management/static-analysis/search-form'
import { staticAnalysisHost } from '../staticAnalysisHost'

export default {
  name: 'SearchForm',
  components: { SharedSearchForm },
  inheritAttrs: false,
  setup() {
    return { staticAnalysisHost }
  },
}
</script>

<template>
  <SharedSearchForm
    v-bind="$attrs"
    :noneBottom="staticAnalysisHost.searchCardNoneBottom"
    v-on="$listeners"
  />
</template>
