<script>
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api.js'
import { getDepartListSimple } from '@/http/map/gis-map'

export default {
  data() {
    return {
      currentDateTime: new Date().toLocaleString(),
      selectDep: null,
      routerList: [],
      businessTypeList: [],
      companyId: '',
      titleInfo: {
        title: '',
        logo: '',
      },
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.companyId = userData.companyId
    this.getTopLabel()
    this.getPrefix()
  },
  mounted() {
    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
    // 每秒更新 currentDateTime
    this.timeInterval = setInterval(this.updateTime, 1000)
    this.getDepartList()
  },
  beforeDestroy() {
    // 清除定时器，防止内存泄漏
    clearInterval(this.timeInterval)
  },
  methods: {
    // 获取顶部导航栏信息
    getTopLabel() {
      getSpecifiedModule(this.companyId, 'videoManagement').then(({ data }) => {
        if (data.success) {
          const { result } = data
          this.titleInfo.title = result.filter(s => s.item === 'warningTitle')[0].value
          this.titleInfo.logo = result.filter(s => s.item === 'warningLogo')[0].value
        }
      })
    },
    async getDepartList() {
      const { data } = await getDepartListSimple()
      if (data.code == 200) {
        this.businessTypeList = data.result.filter(item => !item.onlyTreeUse)
      }
      else {
        this.$message.error(data.message || '查询失败')
      }
    },
    selectHandler(e) {
      if (!e)
        this.$emit('getDataHadler', this.selectDep)
    },
    // 返回管理中心
    toCenterClick() {
      this.clickchange(this.routerList[0])
    },
    clickchange(item) {
      this.defaultPath = item.path
      this.openDefaultMenu(item)
    },
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`
        if (item.children[0].query) {
          this.defaultPath += `?${item.children[0].query}`
        }
        this.openDefaultMenu(item.children[0])
      }
      else {
        if (item.pageSourceType == 1) {
          // 如果是前端组件类型
          this.$router.push(this.defaultPath)
        }
        else if (item.pageSourceType == 3) {
          // 如果是外链地址
          const element = document.createElement('a')
          element.setAttribute('href', item.externalUrl)
          element.setAttribute('target', '_blank')
          element.style.display = 'none'
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
        }
      }
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      }
      else {
        document.exitFullscreen()
      }
    },
    updateTime() {
      this.currentDateTime = new Date().toLocaleString()
    },
  },
}
</script>

<template>
  <div class="headerBox space vertical_center">
    <div class="w-48">
      <span class="datetime">{{ currentDateTime }}</span>
    </div>
    <div class="flex items-center mx-auto h-12 titleH1">
      <el-image
        v-if="titleInfo.logo"
        :src="filePrefix + titleInfo.logo"
        fit="contain"
        style="height: 70%"
      />
      <div class="ml-2 text-white">
        {{ titleInfo.title || "视频智能管理驾驶舱" }}
      </div>
    </div>
    <div class="vertical_center flex_row">
      <el-select
        v-model="selectDep"
        class="org-select"
        multiple
        collapse-tags
        placeholder="全部部门"
        @visible-change="selectHandler"
      >
        <el-option
          v-for="item in businessTypeList"
          :key="item.id"
          :label="item.departmentName"
          :value="item.id"
        />
      </el-select>
      <div
        style="color: white"
        class="mb-1 bi-top-right"
        @click="toCenterClick"
      >
        <div
          style="
            width: 100%;
            height: 50%;
            margin-bottom: 0.5rem;
            line-height: 0.8333vw;
            color: #ffffff;
          "
        >
          您好，{{ $store.state.user.user.fullName }}
        </div>
        <div
          style="
            width: 100%;
            height: 50%;
            line-height: 1.25vw;
            color: #00e7ff;
            cursor: pointer;
          "
        >
          进入管理中心>>
        </div>
      </div>
      <button class="fullscreen-btn" @click="toggleFullscreen">
        <span class="fullscreen-icon" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.headerBox {
  flex: 1;
  height: 6vh !important;
  border-radius: 4px;
  box-sizing: border-box;
  justify-content: space-around;
  background: rgba(0, 33, 64, 0.3) !important;
}

.header-right {
  flex: 1;
  gap: 20px;
  display: flex;
  align-items: center;
}

.org-select {
  margin: 0 1rem;
  max-width: 200px;
}

.org-select,
.el-input__inner {
  color: #fff !important;
  cursor: pointer !important;
  font-size: 14px !important;
  border-radius: 4px !important;
  border: 1px solid #0a5299 !important;
  background: rgba(0, 21, 41, 0.8) !important;
}

.flex_row,
.space,
.vertical_center {
  display: flex;
}

/* 使用nvue页面必须样式结束 */
.flex_row {
  flex-direction: row !important;
}

/* 左右或左中右布局 */
.space {
  justify-content: space-between;
}

/* 垂直居中 */
.vertical_center {
  align-items: center;
}

.org-select option {
  background: #001529;
}

.datetime {
  color: #fff;
  font-size: 1rem;
  padding: 6px 12px;
  white-space: nowrap;
  padding: 6px 12px;
}

.titleH1 {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
  white-space: nowrap;
}

.bi-top-right {
  margin: 0 1rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.fullscreen-btn {
  background: rgba(0, 21, 41, 0.3);
  border: 1px solid #0a5299;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
}

.fullscreen-btn:hover {
  background: rgba(10, 82, 153, 0.3);
  border-color: #00f0ff;
}

.fullscreen-icon {
  width: 16px;
  height: 16px;
  position: relative;
}

/* 进入全屏图标 */
.fullscreen-icon::before,
.fullscreen-icon::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border: 2px solid #fff;
}

.fullscreen-icon::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.fullscreen-icon::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

/* 退出全屏图标 */
.container.fullscreen .fullscreen-icon::before {
  top: 2px;
  left: 2px;
  border: 2px solid #00f0ff;
  border-left: none;
  border-top: none;
}

.container.fullscreen .fullscreen-icon::after {
  bottom: 2px;
  right: 2px;
  border: 2px solid #00f0ff;
  border-right: none;
  border-bottom: none;
}

.container.fullscreen .fullscreen-btn {
  background: rgba(0, 240, 255, 0.1);
  border-color: #00f0ff;
}
</style>
