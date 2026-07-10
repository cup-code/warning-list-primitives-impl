<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      default: '',
    },
  },
  computed: {
    isExternal() {
      return isExternal(this.to)
    },
    type() {
      if (this.isExternal) {
        return 'a'
      }
      return 'router-link'
    },
  },
  methods: {
    linkProps(to) {
      if (this.isExternal) {
        return {
          href: to,
          target: '_blank',
          rel: 'noopener',
        }
      }

      if (this.query) {
        return {
          to: {
            path: to,
            query: this.queryToObj(this.query),
          },
        }
      }

      return {
        to,
      }
    },
    // 把‘a=123&name=张三’这种字符串转化为对象
    queryToObj(str) {
      const res = {}
      const temp = str.split('&')
      let tempItem
      temp.forEach((item) => {
        tempItem = item.split('=')
        res[tempItem[0]] = tempItem[1]
      })
      return res
    },
  },
}
</script>

<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>
