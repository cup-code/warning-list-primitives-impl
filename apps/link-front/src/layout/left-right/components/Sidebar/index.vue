<script>
import { mapGetters } from 'vuex'
import SidebarItem from '@/layout/components/SidebarItem'
import Logo from './Logo'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(['sidebar']),
    routes() {
      console.log(222, this.$router.options.routes)
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return {
        menuText: '#bfcbd9',
        menuActiveText: '#409eff',
        subMenuActiveText: '#f4f4f5',
        menuBg: '#304156',
        menuHover: '#263445',
        subMenuBg: '#1f2d3d',
        subMenuHover: '#001528',
        sideBarWidth: '220px',
      }
    },
    isCollapse() {
      return !this.sidebar.opened
    },
  },
}
</script>

<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :routeItem="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>
