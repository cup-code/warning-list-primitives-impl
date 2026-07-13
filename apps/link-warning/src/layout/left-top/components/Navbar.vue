<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import RightMenu from '@/components/RightMenu'
import LtMenu from './LtMenu'

export default {
  components: {
    Hamburger,
    LtMenu,
    RightMenu,
  },
  computed: {
    ...mapGetters(['sidebar']),
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
    <lt-menu :is-active="sidebar.opened" />
    <right-menu />
  </div>
</template>
