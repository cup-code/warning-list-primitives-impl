<script>
import WarningInfo from '@link/shared-ui/forewarning-management/warning-list/warning-info'
import warningListHost from '../warningListHost'

export default {
  name: 'WarningInfoHost',
  inheritAttrs: false,
  components: { WarningInfo },
  data: () => ({ warningListHost }),
}
</script>

<template>
  <WarningInfo v-bind="$attrs" :host="warningListHost" v-on="$listeners" />
</template>
