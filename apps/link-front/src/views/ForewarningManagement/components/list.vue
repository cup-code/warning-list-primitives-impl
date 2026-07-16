<script>
import ForewarningList from '@link/shared-ui/forewarning-management/warning-list/list'
import warningListHost from '../warningListHost'

export default {
  name: 'ForewarningListWrapper',
  components: { ForewarningList },
  inheritAttrs: false,
  data: () => ({ warningListHost }),
  methods: {
    setSelections(ids) {
      return this.$refs.sharedList.setSelections(ids)
    },
  },
}
</script>

<template>
  <ForewarningList
    ref="sharedList"
    v-bind="$attrs"
    :host="warningListHost"
    v-on="$listeners"
  />
</template>
