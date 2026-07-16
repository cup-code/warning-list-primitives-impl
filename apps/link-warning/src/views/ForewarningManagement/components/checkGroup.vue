<script>
import CheckGroup from '@link/shared-ui/forewarning-management/warning-list/check-group'
import warningListHost from '../warningListHost'

export default {
  name: 'CheckGroupHost',
  inheritAttrs: false,
  components: { CheckGroup },
  data: () => ({ warningListHost }),
}
</script>

<template>
  <CheckGroup v-bind="$attrs" :host="warningListHost" v-on="$listeners" />
</template>
