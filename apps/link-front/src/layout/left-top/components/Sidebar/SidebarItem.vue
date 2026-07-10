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
    routeItem: {
      type: Object,
      required: true,
    },
    basePath: {
      type: String,
      default: '',
    },
    hide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },

  methods: {
    generateTitle,
    /* 地址解析 */
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
    <app-link
      v-if="!routeItem.children || routeItem.children.length == 0"
      :to="resolvePath(routeItem.path)"
      :query="routeItem.query || ''"
    >
      <!-- class="submenu-title-noDropdown" -->
      <el-menu-item :index="resolvePath(routeItem.path)">
        <item
          :icon="routeItem.meta && routeItem.meta.icon"
          side
          :hide="hide"
          :title="generateTitle(routeItem.meta.key, routeItem.meta.title)"
        />
      </el-menu-item>
    </app-link>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(routeItem.path)"
      popper-append-to-body
    >
      <template slot="title">
        <item
          v-if="routeItem.meta"
          :hide="hide"
          side
          :icon="routeItem.meta && routeItem.meta.icon"
          :title="generateTitle(routeItem.meta.key, routeItem.meta.title)"
        />
      </template>
      <sidebar-item
        v-for="child in routeItem.children"
        :key="child.path"
        :is-nest="true"
        :routeItem="child"
        :hide="hide"
        :base-path="resolvePath(routeItem.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>
