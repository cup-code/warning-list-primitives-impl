<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    align: {
      type: String,
      default: 'left',
    },
    hide: {
      type: Boolean,
      default: false,
    },
    side: {
      type: Boolean,
      default: false,
    },
  },
  render(h, context) {
    const {
      icon,
      title,
      hide,
      side,
    } = context.props

    const vnodes = []
    if (icon) {
      vnodes.push(h('i', { class: [icon, 'sub-el-icon'] }))
    }

    if (title) {
      if (side) {
        if (hide && !icon) {
          vnodes.push(h('i', { class: [icon, 'sub-el-icon'] }))
        }
        vnodes.push(h('span', { class: hide ? 'subTitlehHide' : 'subTitle' }, title))
      }

      if (!side) {
        vnodes.push(h('span', { class: 'subTitle' }, title))
      }
    }
    return vnodes
  },
}
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 24px !important;
  height: 18px;
  text-align: center;
  line-height: 18px;
  /* padding: 0 10px; */
}

.subTitlehHide {
  animation-name: hideText;
  animation-duration: 0.3s; /* 动画持续时间为1秒 */
  animation-fill-mode: forwards; /* 保持动画结束时的状态 */
  animation-timing-function: linear; /* 动画速度曲线 */
}

.subTitle {
  animation-name: visibleText;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

@keyframes visibleText {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
