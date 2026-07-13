<script>
import SidebarItem from '@/layout/components/SidebarItem'

export default {
  components: {
    SidebarItem,
  },
  data() {
    return {
      moreList: [],
    }
  },
  computed: {
    routes() {
      const routeList = []
      const mainList = []
      this.moreList = []
      this.$router.options.routes.forEach((item) => {
        if (!item.hidden && !item.redirect) {
          routeList.push(item)
        }
      })
      if (routeList.length > 4) {
        this.moreList.push({
          meta: { icon: 'el-icon-menu', title: '更多' },
          path: '',
          children: [],
        })
      }
      for (let i = 0; i < routeList.length; i++) {
        if (i < 4)
          mainList.push(routeList[i])
        else this.moreList[0].children.push(routeList[i])
      }
      return mainList
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
  },
}
</script>

<template>
  <div class="tb-mid-menu">
    <el-menu
      :default-active="activeMenu"
      class="tb-menu"
      mode="horizontal"
    >
      <sidebar-item
        v-for="route in routes"
        :key="route.path"
        :routeItem="route"
        :base-path="route.path"
      />
      <sidebar-item
        v-for="route in moreList"
        :key="route.path"
        :routeItem="route"
        :base-path="route.path"
      />
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.tb-mid-menu {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  .tb-menu {
    background: transparent;
    border-bottom: none !important;
    display: flex;
    .el-menu-item,
    .el-submenu__title {
      height: 50px !important;
      line-height: 50px !important;
      color: #333;
      &:focus {
        background-color: transparent;
      }
      & > span {
        margin-left: 6px;
      }
      [class^='el-icon-'] {
        margin-right: 0;
      }
    }
    .el-submenu__title {
      .el-submenu__icon-arrow {
        position: unset;
        margin-top: 0;
        margin-left: 6px;
      }
    }
    .el-menu-item.is-active,
    .el-submenu.is-active > .el-submenu__title {
      color: #409eff;
      & > .svg-icon {
        color: #409eff;
      }
    }
  }
}
</style>
