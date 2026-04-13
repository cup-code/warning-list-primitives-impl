<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import RightMenu from '@/components/RightMenu'
import TagBar from '@/layout/components/TagBar'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    RightMenu,
    TagBar,
  },
  computed: {
    ...mapGetters(['sidebar']),
    tagModel() {
      return this.$store.state.settings.tagModel
    },
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
  },
}
</script>

<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <TagBar
      v-if="tagModel"
      class="tag-container"
    />
    <breadcrumb
      v-if="!tagModel"
      class="breadcrumb-container"
    />
    <right-menu />
  </div>
</template>

<style lang="scss">
.tag-container {
  max-width: calc(100% - 300px);
  flex: 1;
  display: flex;
  justify-content: flex-start;
}
</style>
