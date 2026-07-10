<script>
import { Tooltip } from 'element-ui'

export default {
  name: 'text-tooltip',
  extends: Tooltip,
  props: {
    ...Tooltip.props,
    overflow: Boolean,
  },
  methods: {
    // 重写show方法
    show() {
      // 如果文字溢出
      if (this.overflow) {
        if (this.$el.scrollWidth <= this.$el.clientWidth)
          return
      }
      // 执行原版的逻辑，绑定当前实例的this
      Tooltip.methods.show.call(this)
    },
  },
}
</script>
