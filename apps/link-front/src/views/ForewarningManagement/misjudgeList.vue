<script>
import MisjudgeListPage from '@link/shared-ui/forewarning-management/warning-list/pages/misjudge'
import misjudgeListHost from './misjudgeListHost'

export default {
  name: 'MisjudgeListRoute',
  inheritAttrs: false,
  components: { MisjudgeListPage },
  data: () => ({ misjudgeListHost }),
  beforeRouteLeave(to, from, next) {
    const page = this.$refs.page
    if (!page) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('[MisjudgeListRoute] shared page ref is unavailable')
      }
      next()
      return undefined
    }
    return page.handleRouteLeave(to, from, next)
  },
}
</script>

<template>
  <MisjudgeListPage
    ref="page"
    v-bind="$attrs"
    :host="misjudgeListHost"
    v-on="$listeners"
  />
</template>
