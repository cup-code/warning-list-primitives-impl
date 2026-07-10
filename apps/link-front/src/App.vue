<script>
export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload,
    }
  },
  data() {
    return {
      isRouterAlive: true,
    }
  },
  created() {
    this.$store.dispatch('settings/refreshSetting')
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    },
  },
}
</script>

<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<style lang="scss" scoped>
.contentArea {
  padding: 10px;
}
.cesium-credit-logoContainer {
  display: none !important;
}
// 设置提示信息只展示一个，重要，勿删！
.el-message {
  top: 20px !important;
}
// 查看-文字颜色
.look-over {
  color: var(--ky-primary);
}
// 修改-按钮颜色
.revise {
  color: #ffb930 !important;
}
// 表格XX名称-字体颜色
.check {
  cursor: pointer;
  color: var(--ky-primary);
}
// 新增按钮样式
.add-button {
  background: #ffffff !important;
  border: 1px solid var(--ky-primary) !important;
  color: var(--ky-primary) !important;
}
// 导出excel按钮样式
.export-excel {
  background: #ffffff;
  border: 1px solid #efefef;
  color: black;
}
// 重置按钮样式
.reset {
  border: 1px solid #bbbbbb;
  background: #ffffff;
  color: black;
}
</style>
