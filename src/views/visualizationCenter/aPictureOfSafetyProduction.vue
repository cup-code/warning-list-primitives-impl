<script>
import moment from 'moment'
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api.js'
import { getScreenData } from '@/http/videoStat/screenData'
import CenterPanel from './Newcomponents/CenterPanel.vue'
import Header from './Newcomponents/Header.vue'
import LeftPanel from './Newcomponents/LeftPanel.vue'
import RightPanel from './Newcomponents/RightPanel.vue'

export default {
  components: {
    Header,
    LeftPanel,
    CenterPanel,
    RightPanel,
  },
  data() {
    return {
      departmentIds: [],
      screenData: {
        total: 0,
        alarmLive: null,
        alarmTrend: null,
        alarmTypeRank: null,
        alarmStatusLive: null,
        alarmLevelLive: null,
        videoAlarmList: null,
        departmentAlarmRank: null,
        cameraAlarmRank: null,
      },
      isAutoRefresh: false,
      companyId: '',
      leftPeriod: {},
      centerPeriod: {},
      rightPeriod: {},
      interval: null,
      isInitialDataLoaded: false,
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.companyId = userData.companyId
    this.initializeComponent()
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    // 初始化组件
    async initializeComponent() {
      await this.getTopLabel()
      // 确保配置已加载后再获取数据
      this.getDataHadler()
    },
    // 获取顶部导航栏信息
    async getTopLabel() {
      try {
        const { data } = await getSpecifiedModule(this.companyId, 'videoManagement')
        if (data.success) {
          const { result } = data
          this.isAutoRefresh = result?.filter(
            s => s.item === 'isAutoRefresh',
          )[0]?.value
          this.autoRefreshTime = result?.filter(
            s => s.item === 'autoRefreshTime',
          )[0]?.value

          result?.forEach((s) => {
            if (['trendPeriod', 'typePeriod'].includes(s.item)) {
              this.leftPeriod = { ...this.leftPeriod, [s.item]: String(s.value) }
            }
            if (['handlePeriod', 'levelPeriod'].includes(s.item)) {
              this.centerPeriod = { ...this.centerPeriod, [s.item]: String(s.value) }
            }
            if (['devicePeriod', 'orgPeriod'].includes(s.item)) {
              this.rightPeriod = { ...this.rightPeriod, [s.item]: String(s.value) }
            }
          })

          // 设置自动刷新
          if (this.isAutoRefresh && this.autoRefreshTime) {
            this.setupAutoRefresh()
          }

          this.isInitialDataLoaded = true
        }
      }
      catch (error) {
        console.error('获取配置信息失败:', error)
        this.$message.error('获取配置信息失败')
      }
    },
    // 设置自动刷新
    setupAutoRefresh() {
      if (this.interval) {
        clearInterval(this.interval)
      }

      this.interval = setInterval(() => {
        this.getDataHadler(this.departmentIds)
      }, this.autoRefreshTime * 60000)
    },
    handleResize() {
      const width = window.innerWidth
      let fontSize = 16
      if (width <= 1366)
        fontSize = 14
      if (width <= 1024)
        fontSize = 12
      if (width >= 1920)
        fontSize = 18
      if (width >= 3840)
        fontSize = 40
      document.documentElement.style.fontSize = `${fontSize}px`
    },
    async getDataHadler(ids = []) {
      this.departmentIds = ids
      const form = {}
      form.timeType = 1
      form.type = 0
      await this.getScreenData(form)
    },
    async getScreenData(form) {
      try {
        form.departmentIds = this.departmentIds.join(',')
        form.alarmDateEnd = moment().format('YYYY-MM-DD HH:mm:ss')

        if (form.timeType == 0) {
          form.alarmDateStart = moment().startOf('date').format('YYYY-MM-DD HH:mm:ss')
        }
        else if (form.timeType == 1) {
          form.alarmDateStart = moment()
            .startOf('week')
            .add(1, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        }
        else if (form.timeType == 2) {
          form.alarmDateStart = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
        }

        const { data } = await getScreenData(JSON.parse(JSON.stringify(form)))
        if (data.code == 200) {
          if (form.type === 0) {
            this.screenData = data.result
          }
          else {
            this.screenData.total = data.result.total
            const key = Object.keys(this.screenData)[form.type]
            this.screenData[key] = data.result[key]
          }
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      }
      catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      }
    },
  },
}
</script>

<template>
  <div class="grid-root">
    <div class="header-area">
      <Header @getDataHadler="getDataHadler" />
    </div>
    <div class="left-area">
      <LeftPanel
        :screenData="screenData"
        :defaultPeriod="leftPeriod"
        :departmentIds="departmentIds"
        @getScreenData="getScreenData"
      />
    </div>
    <div class="center-area">
      <CenterPanel
        :screenData="screenData"
        :defaultPeriod="centerPeriod"
        :departmentIds="departmentIds"
        @getScreenData="getScreenData"
      />
    </div>
    <div class="right-area">
      <RightPanel
        :screenData="screenData"
        :departmentIds="departmentIds"
        :defaultPeriod="rightPeriod"
        @getScreenData="getScreenData"
      />
    </div>
  </div>
</template>

<style scoped>
html,
body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.grid-root {
  display: grid;
  grid-template-rows: 8vh 6fr;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-areas:
    "header header header"
    "left center right";
  width: 100vw;
  height: 100vh;
  background: rgba(10, 30, 50);
  box-sizing: border-box;
  font-size: 1vw;
}

.header-area {
  grid-area: header;
  margin-bottom: 0.5vw;
  display: flex;
  align-items: center;
  border: 1px solid #0a5299;
  padding: 0 2vw;
  min-height: 0;
}

.left-area {
  grid-area: left;
  overflow: hidden;
  margin-bottom: 0.5vw;
  padding: 0 0.5vw;
  box-sizing: border-box;
}

.center-area {
  grid-area: center;
  overflow: hidden;
  margin-bottom: 0.5vw;
}

.right-area {
  grid-area: right;
  overflow: hidden;
  margin-bottom: 0.5vw;
  padding: 0 0.5vw;
  box-sizing: border-box;
}

body,
.grid-root {
  font-size: 1vw;
}
</style>
