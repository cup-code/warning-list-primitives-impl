<script>
export default {
  data: () => ({
    hmiUrl: '',
  }),
  computed: {
    // 所有菜单的路由表数据
    routes() {
      return this.$router.options.routes
    },
    // 当前路由
    router() {
      return this.$route
    },
  },
  created() {
    this.findFn()
  },
  methods: {
    findFn() {
      this.recursionFn(this.routes)
    },

    recursionFn(dt) {
      dt.forEach((item) => {
        if (item.name === this.router.name) {
          this.hmiUrl = item.hmiUrl
        }
        if (item.children && item.children.length > 0) {
          this.recursionFn(item.children)
        }
      })
      return dt
    },
  },
}
</script>

<template>
  <div class="hmi-iframe">
    <iframe
      :src="hmiUrl"
      frameborder="0"
      style="width: 100%; height: 100%"
    />
  </div>
</template>

<style lang="scss" scoped>
.hmi-iframe {
  position: relative;
  padding: 10px;
  height: calc(100vh - 50px);
}
</style>
