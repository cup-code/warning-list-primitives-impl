<script>
export default {
  name: 'HelpCenter',
  methods: {
    click() {
      const isCo = !window.location.href.split('/#/')[0].includes('cloud') // 是否是企业版
      this.toHelp(isCo)
    },
    toHelp(isCo) {
      let url = 'https://cloud.kylink.cc/kcloud-doc/person/'
      if (isCo) {
        url = 'https://cloud.kylink.cc/kcloud-doc/company/'
      }

      // 方式一、 使用自己组件打开的方式
      const routeUrl = this.$router.resolve({
        path: `/help`,
        query: {
          src: url,
          isCo: isCo ? 1 : 0, // 是否是企业版
        },
      })
      window.open(routeUrl.href, '_blank')

      // 方式二、  直接打开一个标签页的方式
      // window.open(url);
    },
  },
}
</script>

<template>
  <div @click="click">
    <svg-icon icon-class="help" />
  </div>
</template>
