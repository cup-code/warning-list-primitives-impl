<script>
import path from 'path'
import { generateTitle } from '@/utils/i18n'
import { isExternal } from '@/utils/validate'
import FixiOSBug from './FixiOSBug'
import Item from './Item'
import AppLink from './Link'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    routeItem: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  methods: {
    generateTitle,
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter((item) => {
        if (item.hidden) {
          return false
        }
        else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      // if (showingChildren.length === 1) {
      //   return true
      // }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    },
  },
}
</script>

<template>
  <div v-if="!routeItem.hidden">
    <template
      v-if="
        hasOneShowingChild(routeItem.children, routeItem)
          && (!onlyOneChild.children || onlyOneChild.noShowingChildren)
          && !routeItem.alwaysShow
      "
    >
      <AppLink
        v-if="onlyOneChild.meta"
        :to="resolvePath(onlyOneChild.path)"
        :query="onlyOneChild.query || ''"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <Item
            :icon="onlyOneChild.meta.icon || (routeItem.meta && routeItem.meta.icon)"
            :title="generateTitle(onlyOneChild.meta.key, onlyOneChild.meta.title)"
          />
        </el-menu-item>
      </AppLink>
    </template>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(routeItem.path)"
      popper-append-to-body
    >
      <template slot="title">
        <Item
          v-if="routeItem.meta"
          :icon="routeItem.meta && routeItem.meta.icon"
          :title="generateTitle(routeItem.meta.key, routeItem.meta.title)"
        />
      </template>
      <sidebar-item
        v-for="child in routeItem.children"
        :key="child.id"
        :is-nest="true"
        :routeItem="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<style lang="scss" scoped>
//<style lang="scss" scoped>
.coll-menu {
  width: 219px;
  height: 50px;
  line-height: 50px;
}

.scrollbar-wrapper .el-menu-item.is-active {
  background-color: #506bdb !important;
  // border-right: 5px solid #11c8e5;
}
.scrollbar-wrapper .el-menu-item:hover {
  background-color: #506bdb !important;
  color: white !important;
  // border-right: 5px solid #11c8e5;
}

.scrollbar-wrapper .el-submenu__title {
  color: #fff !important;
}
.scrollbar-wrapper .el-submenu__title:hover {
  background-color: #506bdb !important;
  color: #fff !important;
  // border-right: 5px solid #11c8e5;
}

// .el-menu--vertical .homepage-submenu-hover .el-submenu > .el-submenu__title:hover,
.scrollbar-wrapper .el-menu--vertical .el-menu-item:hover {
  background-color: #506bdb !important;
  color: #fff !important;
}
</style>
