<script>
import path from "path";
import Item from "@/layout/components/Item";

import { isExternal } from "@/utils/validate";

export default {
  components: {
    Item,
  },
  data() {
    return {
      routeList: [],
      moreList: [],
      CurrentActiveMenu: "",
      menuNameLists: [],
    };
  },
  computed: {
    routes() {
      this.routeList = [];
      const mainList = [];
      this.moreList = [];
      this.$router.options.routes.forEach((item) => {
        if (!item.hidden && !item.redirect) {
          const obj = { route: item, single: false };
          if (!item.children || item.children.length == 0) {
            obj.single = true;
          }
          this.routeList.push(obj);
        }
      });
      // 1-6个菜单时不显示更多
      if (this.routeList.length < 7) {
        for (const item of this.routeList) {
          mainList.push(item);
        }
      }
      // 大于6个菜单时，显示5个菜单+更多
      else {
        for (let i = 0; i < this.routeList.length; i++) {
          if (i < 5) {
            mainList.push(this.routeList[i]);
          } else {
            this.moreList.push(this.routeList[i]);
          }
        }
      }

      return mainList;
    },
    activeMenuName() {
      const route = this.$route;
      const { meta, path } = route;

      const menuNameLists = this.routes.map((item) => {
        const { name } = item.route;
        return name;
      });

      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }

      if (menuNameLists.includes(route.path.split("/")[1])) {
        return `/${path.split("/")[1]}`;
      } else {
        return localStorage.getItem("activeMenu");
      }
    },
  },
  created() {
    this.dropClick(this.activeMenuName);
  },

  methods: {
    dropClick(routePath) {
      localStorage.setItem("activeMenu", routePath);
      let routeItem = {};
      for (const item of this.routeList) {
        if (item.route.path == routePath) {
          routeItem = item;
          break;
        }
      }
      if (routeItem.single) this.$router.push(routeItem.path);
      else this.$store.dispatch("user/ltMenus", routeItem.route);
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath;
      }
      if (isExternal(this.basePath)) {
        return this.basePath;
      }
      return path.resolve(this.basePath, routePath);
    },
  },
};
</script>

<template>
  <div class="lt-bg">
    <el-menu
      :default-active="activeMenuName"
      class="lt-menu"
      mode="horizontal"
      @select="dropClick"
    >
      <!-- 单个 -->
      <el-menu-item
        v-for="(item, index) in routes"
        :key="index"
        :index="resolvePath(item.route.path)"
      >
        <item
          :icon="item.route.meta.icon"
          :title="item.route.meta.title"
          align="center"
        />
      </el-menu-item>
      <!-- 更多 -->
      <el-submenu v-if="moreList.length" ref="subMenu" popper-append-to-body index="">
        <template slot="title">
          <item icon="el-icon-menu" title="更多" align="center" />
        </template>
        <el-menu-item
          v-for="child in moreList"
          :key="child.route.path"
          :index="resolvePath(child.route.path)"
          class="nest-menu"
        >
          <item :icon="child.route.meta.icon" :title="child.route.meta.title" />
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.lt-bg {
  flex: 1;
  display: flex;
  align-items: center;
  width: 100%;
  .el-menu--horizontal {
    border-bottom: none !important;
  }
  .lt-menu {
    background: transparent;
    display: flex;
    height: 100%;
    .el-menu-item,
    .el-submenu__title {
      padding: 0 16px;
      text-align: center;
      min-width: 120px;
      border-bottom: none !important;
      // height: 50px !important;
      line-height: 45px !important;
      height: 45px;
      &:hover {
        background: #ecf5ff;
      }
      &:focus {
        background-color: transparent;
      }
      & > span {
        // margin-left: 6px;
        display: inline-block;
        margin-top: -4px;
      }
      [class^="el-icon-"] {
        margin-right: 8px;
        margin-top: -4px;
      }
    }
    .el-submenu__title {
      .el-submenu__icon-arrow {
        position: unset;
        margin-top: 0;
        margin-left: 6px;
      }
    }
    .el-menu-item.is-active {
      color: var(--ky-primary) !important;
    }
    // .el-menu-item.is-active,
    // .el-submenu.is-active > .el-submenu__title {
    //   color: #409eff;
    //   & > .svg-icon {
    //     color: #409eff;
    //   }
    // }
  }
}
</style>
