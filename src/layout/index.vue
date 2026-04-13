<script>
import LRLayout from './left-right'
import LTLayout from './left-top'
import TBLayout from './top-bot'

export default {
  components: {
    LRLayout,
    TBLayout,
    LTLayout,
  },
  computed: {
    layout() {
      return this.$store.state.settings.layout
    },
  },
}
</script>

<template>
  <div>
    <LRLayout v-if="layout === 'lr'" />
    <TBLayout v-if="layout === 'tb'" />
    <LTLayout v-if="layout === 'lt'" />
  </div>
</template>
