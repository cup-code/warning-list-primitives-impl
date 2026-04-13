<script>
export default {
  data() {
    return {
      routeList: [],
    }
  },
  computed: {
    tagList() {
      return this.$store.state.settings.tagList
    },
  },
  created() {
    this.routeList = []
    this.$router.options.routes.forEach((item) => {
      if (!item.hidden && !item.redirect) {
        const obj = { route: item, single: false }
        if (!item.children || item.children.length == 0) {
          obj.single = true
        }
        this.routeList.push(obj)
      }
    })
  },
  methods: {
    /* 关闭页签 */
    tagClose(index) {
      if (this.$route.fullPath === this.tagList[index].path) {
        this.$router.push(this.tagList[index - 1].path)
      }
      this.$store.dispatch('settings/delTag', index)
    },
    /* 点击页签 */
    tagClick(tag) {
      console.log(tag, 88888)
      const tagPath = `/${tag.path.split('/')[1]}`
      let routeData = {}
      for (const item of this.routeList) {
        if (item.route.path == tagPath) {
          routeData = item
          break
        }
      }
      if (routeData.single) {
        this.$store.dispatch('user/ltMenus', [])
      }
      else {
        this.$store.dispatch('user/ltMenus', routeData.route)
      }
      this.$router.push({ path: tag.path })
    },
    /* 右键点击tag */
    tagRightClick(index) {
      const tagItem = this.tagList[index]
      this.$store.dispatch('settings/resetTag', tagItem)
      this.$router.push({ path: tagItem.path })
    },
  },
}
</script>

<template>
  <div>
    <div class="tag-box">
      <span
        v-for="(item, index) in tagList"
        :key="item.path"
        @contextmenu.prevent="tagRightClick(index)"
      >
        <el-tag
          :class="{ active: $route.fullPath == item.path }"
          class="tag-item"
          size="medium"
          type="info"
          :closable="item.closable"
          @close="tagClose(index)"
          @click="tagClick(item)"
        >{{ item.title }}</el-tag>
      </span>
    </div>
  </div>
</template>

<style lang="scss">
.tag-box {
  padding: 0 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  .tag-item {
    height: 28px;
    display: block;
    margin: 0 5px;
    cursor: pointer;
  }
  .el-tag__close {
    color: black;
  }
  .active {
    background-color: #409eff;
    color: white;
    .el-tag__close {
      color: white;
    }
  }
  .el-tag + .el-tag {
    margin: 0 5px;
  }
}
</style>
