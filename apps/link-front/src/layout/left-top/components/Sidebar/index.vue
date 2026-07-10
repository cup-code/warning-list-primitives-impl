<script>
import { mapGetters, mapState } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      list: this.$store.state.user.ltMenus,
      currentMenuItem: '',
      currentMenu: '',
    }
  },
  watch: {
    ltMenus: {
      handler(newV, oldV) {
        if (Array.isArray(newV)) {
          return
        }
        const info = this.getFirstPath(newV)
        this.currentMenu = newV.name
        if (oldV?.name && oldV?.name !== newV?.name) {
          this.$router.push(info)
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    ...mapGetters(['sidebar']),
    ...mapState('user', ['ltMenus']),
    routes() {
      return this.$store.state.user.ltMenus
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route

      if (!route.path.split('/').includes(this.currentMenu)) {
        return localStorage.getItem('activeMenuItem')
      }
      else {
        if (meta.activeMenu) {
          return meta.activeMenu
        }

        return path
      }
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
  methods: {
    onSelected(path) {
      localStorage.setItem('activeMenuItem', path)
    },
    getFirstPath(menu) {
      if (menu?.children) {
        return `${menu.path}/${this.getFirstPath(menu.children[0])}`
      }
      else {
        return `${menu.path}`
      }
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
        active-text-color="var(--ky-primary)"
        :collapse-transition="false"
        mode="vertical"
        @select="onSelected"
      >
        <sidebar-item
          v-for="route in routes.children"
          :key="route.path"
          :hide="isCollapse"
          :routeItem="route"
          :base-path="routes.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>
