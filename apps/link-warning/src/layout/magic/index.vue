<script>
import LRLayout from '@/layout/left-right'
import LTLayout from '@/layout/left-top'
import TBLayout from '@/layout/top-bot'

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
    <LRLayout
      v-if="layout === 'lr'"
      :base3D="true"
    />
    <TBLayout
      v-if="layout === 'tb'"
      :base3D="true"
    />
    <LTLayout
      v-if="layout === 'lt'"
      :base3D="true"
    />
  </div>
</template>
