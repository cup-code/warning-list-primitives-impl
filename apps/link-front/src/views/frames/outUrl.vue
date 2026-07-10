<script>
export default {
  data: () => ({
    outUrl: '',
    openNewPage: 'false',
    pageName: '',
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
    // console.log('outurl')
    // console.log(this.outUrl)
    // console.log(this.openNewPage)
    if (this.openNewPage === 'true') {
      const element = document.createElement('a')
      element.setAttribute('href', this.outUrl)
      element.setAttribute('target', '_blank')
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  },
  methods: {
    findFn() {
      this.recursionFn(this.routes)
    },
    recursionFn(dt) {
      dt.forEach((item) => {
        if (item.name === this.router.name) {
          this.outUrl = item.externalUrl
          this.openNewPage = item.remarks
          this.pageName = item.menuName
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
  <div class="outUrl-iframe">
    <el-button
      v-if="openNewPage === 'true'"
      type="text"
      class="textSty"
    >
      已打开第三方链接
      <br>
      <p>{{ pageName }}</p>
      <br>
      <p>{{ outUrl }}</p>
    </el-button>
    <iframe
      v-else
      :src="outUrl"
      frameborder="0"
      style="width: 100%; height: 100%"
    />
  </div>
</template>

<style lang="scss" scoped>
.outUrl-iframe {
  position: relative;
  box-sizing: border-box;
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
