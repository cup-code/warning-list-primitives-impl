<script>
export default {
  props: {
    msgData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      permissions: [], // 用户路由权限信息列表
      routeList: [], // 已注册的路由列表
    }
  },
  created() {
    this.$router.options.routes.forEach((item) => {
      if (!item.hidden && !item.redirect) {
        const obj = { route: item, single: false }
        if (!item.children || item.children.length == 0) {
          obj.single = true
        }
        this.routeList.push(obj)
      }
    })
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
    this.permissions = userData.permissions || []
  },
  methods: {
    /* 点击前往查看 */
    toCheckClick() {
      let compPath = ''
      let params = {}

      switch (this.msgData.businessType) {
        case 'DpmHbHiddenTrouble': // 湖北隐患台账
          compPath = 'views/doubleDefense/hubei/safeCheck/safeBook'
          params = { id: this.msgData.businessId }
          this.jumpToPath(compPath, params)
          break
        case 'DpmSdHiddenTrouble': // 山东隐患台账
          compPath = 'views/doubleDefense/shandong/safeCheck/safeBook'
          params = { id: this.msgData.businessId }
          this.jumpToPath(compPath, params)
          break
        case '安全证照预警': // 人员证照
        case '安全证照报警':
        case '安全证照更新':
          compPath = 'views/baseModule/certificateManager/safeManager'
          params = { id: this.msgData.businessId }
          this.jumpToPath(compPath, params)
          break
        default:
      }
    },
    /* 跳转目标页面 */
    jumpToPath(compPath, query) {
      const englishNameList = []
      let parentId = ''
      // 通过项目路径找到指定路由，获取parentId和englishName

      for (const item of this.permissions || []) {
        if (item.vueComponent == compPath) {
          englishNameList.push(item.englishName)
          parentId = item.parentId
          break
        }
      }
      // 通过parentId查询所有父对象的englishName，并拼接成路径
      while (parentId) {
        const params = this.searchRoute(parentId)
        parentId = params.parentId
        englishNameList.push(params.englishName)
      }
      const finalPath = `/${englishNameList.reverse().join('/')}`
      // 通过拼出的路径获取左右侧菜单变化
      const tagPath = `/${finalPath.split('/')[1]}`
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
      // 最终跳转
      this.$router.push({ path: finalPath, query })
    },
    /* 查找路由信息 */
    searchRoute(parentId) {
      const params = { englishName: '', parentId: '' }
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
      for (const item of userData.permissions) {
        if (item.id == parentId) {
          params.englishName = item.englishName
          params.parentId = item.parentId
          break
        }
      }
      return params
    },
  },
}
</script>

<template>
  <div class="msgbg">
    <el-card
      class="card-box"
      :body-style="{ padding: '0px' }"
    >
      <h5>{{ msgData.message }}</h5>
      <div class="content-box">
        <div class="content">
          {{ msgData.messageText }}
        </div>
      </div>
      <div
        v-if="msgData.businessType"
        class="link-box"
      >
        <span @click="toCheckClick">前往查看</span>
      </div>
      <div class="footer">
        <span>{{ msgData.createdTime }}</span>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.msgbg {
  display: flex;
  justify-content: center;
  width: 100%;

  .card-box {
    padding: 0 60px;
    width: 100%;
    font-size: 14px;
    background: #faf6f6;

    h5 {
      font-size: 16px;
      text-align: center;
      font-weight: normal;
      line-height: 20px;
      border-bottom: 1px solid lightgray;
    }

    .content-box {
      background: white;
      border-radius: 10px;
      margin: 5px 0 0 0;
      .content {
        text-indent: 28px;
        line-height: 30px;
        padding: 20px;
      }
    }
    .link-box {
      margin: 10px 0 0 0;
      text-align: center;
      height: 20px;
      line-height: 20px;
      span {
        font-size: 16px;
        color: blue;
        cursor: pointer;
      }
    }
    .footer {
      text-align: right;
      margin: 20px 0;
      color: #999;
      // padding: 30px 0;

      span {
        display: block;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
