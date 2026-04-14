<script>
import path from 'path'
import FixiOSBug from '@/layout/components/FixiOSBug'
import Item from '@/layout/components/Item'
import AppLink from '@/layout/components/Link'
import { generateTitle } from '@/utils/i18n'
import { isExternal } from '@/utils/validate'

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
      if (showingChildren.length === 1) {
        return true
      }

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
    <el-menu-item
      :index="resolvePath(onlyOneChild.path)"
      :class="{ 'submenu-title-noDropdown': !isNest }"
    >
      <item
        :icon="onlyOneChild.meta.icon || (routeItem.meta && routeItem.meta.icon)"
        :title="generateTitle(onlyOneChild.meta.key, onlyOneChild.meta.title)"
      />
    </el-menu-item>
  </div>
</template>
