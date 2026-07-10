<script>
export default {
  name: 'ETabs',
  props: {
    tabsList: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      active: '1',
    }
  },
  methods: {
    onTabClick(targetName) {
      this.active = targetName.name

      this.$emit('tabClick', targetName.name)
    },
  },
}
</script>

<template>
  <div>
    <el-tabs
      v-model="active"
      @tab-click="onTabClick"
    >
      <el-tab-pane
        v-for="(item, index) in tabsList"
        :key="item.name"
        :index="index"
        :label="item.title"
        :name="item.name"
      >
        {{ item.content }}
        <slot />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style></style>
