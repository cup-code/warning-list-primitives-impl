<script>
export default {
  name: 'CTabs',
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
      activeName: '1',
    }
  },
  methods: {
    handleClick(e) {
      this.$emit('change', e.name)
    },
  },
}
</script>

<template>
  <div class="tabs">
    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="(item, index) in tabsList"
        :key="item.label"
        :label="item.label"
        :index="index"
        :name="item.name"
        :fixed="item.fixed"
      />
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  padding: 0 0 10px;
}

::v-deep.el-tabs__nav-wrap::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px !important;
  background-color: #ffffff;
  z-index: 1;
}
</style>
