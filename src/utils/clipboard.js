import Vue from 'vue'

function clipboardSuccess() {
  Vue.prototype.$message({
    message: '拷贝成功',
    type: 'success',
    duration: 1500,
  })
}

function clipboardError() {
  Vue.prototype.$message({
    message: '拷贝失败',
    type: 'error',
  })
}

export default function handleClipboard(text, event) {
  // 创建一个临时的DOM元素和Vue实例来处理复制操作
  const tempDiv = document.createElement('div')
  document.body.appendChild(tempDiv)

  // 创建一个临时的Vue实例以使用v-clipboard指令
  const vm = new Vue({
    el: tempDiv,
    data: {
      text,
    },
    methods: {
      success() {
        clipboardSuccess()
        // 清理
        document.body.removeChild(tempDiv)
        vm.$destroy()
      },
      error() {
        clipboardError()
        // 清理
        document.body.removeChild(tempDiv)
        vm.$destroy()
      },
    },
    template: `
      <button
        style="position:absolute;left:-9999px"
        v-clipboard="text"
        v-clipboard:success="success"
        v-clipboard:error="error">
      </button>
    `,
    mounted() {
      // 自动触发点击
      this.$el.click()
    },
  })
}
