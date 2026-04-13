<script>
import { getScreenDatas } from './common'
import Panel from './Panel.vue'

export default {
  components: {
    Panel,
  },
  props: {
    screenData: {
      total: null,
      alarmLive: null,
      alarmTrend: null,
      alarmTypeRank: null,
      alarmStatusLive: null,
      alarmLevelLive: null,
      videoAlarmList: [],
      departmentAlarmRank: null,
      cameraAlarmRank: null,
    },
    defaultPeriod: {
      type: Object,
      default: {},
    },
    departmentIds: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      alarmLevel: ['', '一级', '二级', '三级', '四级'],
      videoAlarmList: [],
      alarmStatusLive: null,
      alarmLevelLive: null,
      activeIndex: 0,
      periods: [
        {
          value: '0',
          label: '日',
        },
        {
          value: '1',
          label: '周',
        },
        {
          value: '2',
          label: '月',
        },
      ],
      visibleEvents: [],
      selectedTrendPeriod: '1', // 默认选中的趋势按钮
      selectedRankingPeriod: '1', // 默认选中的排名按钮
      scrollTime: null,
      alarmLevelLive: {},
      alarmStatusLive: {},
      defaultCircle: {
        type: 'pie',
        center: ['26%', '50%'],
        radius: ['45%', '65%'],
        silent: true,
        z: 1,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: 1,
            name: 'empty',
            itemStyle: { color: 'lightgray', opacity: 1 },
          },
        ],
        tooltip: { show: false },
        animation: false,
      },
    }
  },
  computed: {
    currentEvent() {
      return this.videoAlarmList[this.activeIndex]
    },
  },
  watch: {
    'defaultPeriod': {
      handler(val) {
        const { handlePeriod, levelPeriod } = { ...val }
        this.selectedTrendPeriod = handlePeriod || '1'
        this.selectedRankingPeriod = levelPeriod || '1'
        this.getHandlingData({
          type: 4,
          timeType: this.selectedTrendPeriod,
        })
        this.getLevelData({
          type: 5,
          timeType: this.selectedRankingPeriod,
        })
      },
      immediate: true,
    },
    'screenData.videoAlarmList': {
      handler(val) {
        this.videoAlarmList = val
        setTimeout(() => {
          this.visibleEvents = this.videoAlarmList
        }, 800)

        this.$nextTick(() => {
          this.initPoint()
        })
      },
      deep: true,
    },
  },
  created() {
    this.getPrefix()
  },
  mounted() {
    // 添加resize监听器
    window.addEventListener('resize', this.handleResize)

    // 初始化画布内容
    this.$nextTick(() => {
      // 延迟执行resize以确保图表正确渲染
      setTimeout(() => {
        this.handleResize()
      }, 1000)
    })
  },
  beforeDestroy() {
    // 移除resize监听器
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    async getHandlingData(form) {
      const data = await getScreenDatas(form, 'alarmStatusLive', this.departmentIds)
      const { digital, total } = data
      this.alarmStatusLive = digital
      this.$nextTick(() => {
        this.initHandlingChart(digital, total)
      })
    },
    async getLevelData(form) {
      const data = await getScreenDatas(form, 'alarmLevelLive', this.departmentIds)
      const { digital, total } = data
      this.alarmLevelLive = digital
      this.$nextTick(() => {
        this.initLevelChart(digital, total)
      })
    },
    initPoint() {
      this.drawImageWithBoxes(this.currentEvent)
    },
    drawImageWithBoxes(info) {
      const canvasEl = this.$refs.canvasImage
      if (!canvasEl)
        return

      const annotations = info && info.annotations ? JSON.parse(info.annotations) : []

      const ctx = canvasEl.getContext('2d')
      const container = this.$refs.imageContainer
      if (!container)
        return

      // 获取canvas显示尺寸
      const displayWidth = canvasEl.clientWidth
      const displayHeight = canvasEl.clientHeight

      // 设置canvas实际渲染分辨率
      const devicePixelRatio = window.devicePixelRatio || 1
      canvasEl.width = displayWidth * devicePixelRatio
      canvasEl.height = displayHeight * devicePixelRatio

      // 高分辨率调整
      ctx.scale(devicePixelRatio, devicePixelRatio)

      // 添加白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = info && info.alarmPic ? this.filePrefix + info.alarmPic : ''
      img.style.objectFit = 'contain' // 改为contain以保持图片比例

      // 检查组件是否已销毁，避免生命周期问题
      if (this._isDestroyed || this._isBeingDestroyed) {
        return
      }

      img.onload = () => {
        const originalWidth = img.width
        const originalHeight = img.height

        ctx.clearRect(0, 0, displayWidth, displayHeight)

        // 重新绘制白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, displayWidth, displayHeight)

        // 直接使用canvas尺寸绘制图片，不考虑原始比例
        ctx.drawImage(
          img,
          0,
          0,
          originalWidth,
          originalHeight,
          0,
          0,
          displayWidth,
          displayHeight,
        )

        // 画标注框（如果有）
        if (annotations && annotations.length > 0) {
          ctx.strokeStyle = 'red'
          ctx.lineWidth = 2
          annotations.forEach((item) => {
            const [x, y, width, height] = item.bbox
            // 根据canvas尺寸计算新的标注框位置和大小
            const boxX = (x / originalWidth) * displayWidth
            const boxY = (y / originalHeight) * displayHeight
            const boxWidth = (width / originalWidth) * displayWidth
            const boxHeight = (height / originalHeight) * displayHeight
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
          })
        }
      }

      img.onerror = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, displayWidth, displayHeight)
        ctx.fillStyle = '#f00'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('图片加载失败', displayWidth / 2, displayHeight / 2)
      }
    },

    // 初始化 visibleEvents，使其默认显示前五张
    updateVisibleEvents() {
      this.visibleEvents = this.videoAlarmList
    },

    prevEvent() {
      this.activeIndex
        = (this.activeIndex - 1 + this.videoAlarmList.length) % this.videoAlarmList.length
      this.updateVisibleEvents()
      this.initPoint()
    },
    nextEvent() {
      this.activeIndex = (this.activeIndex + 1) % this.videoAlarmList.length
      this.updateVisibleEvents()
      this.initPoint()
    },
    selectEvent(index) {
      this.activeIndex = index
      this.initPoint()
    },
    initHandlingChart(digital, total) {
      // 误报不参与计算
      const currentTotal = digital['误报'] ? total - digital['误报'] : total

      try {
        const live = digital
        let data = [
          { name: '待加急处理', num: 0, value: 0 },
          { name: '待处理', num: 0, value: 0 },
          { name: '有效', num: 0, value: 0 },
        ]

        data = data.map(item => ({
          name: item.name,
          num: live[item.name],
          value: ((live[item.name] / currentTotal) * 100).toFixed(2),
        }))

        // 判断数据是否为空或所有项为0
        const isEmpty
          = !Object.keys(live).length || Object.keys(live).every(item => !item)

        const chartDom = document.getElementById('handlingChart')
        if (!chartDom) {
          console.error('未找到图表容器')
          return
        }

        const existingChart = this.$echarts.getInstanceByDom(chartDom)
        if (existingChart) {
          existingChart.dispose()
        }

        const chart = this.$echarts.init(chartDom, null, { renderer: 'canvas' })

        // 正常色彩
        const color = ['#0CD2E6', '#3751E6', '#FFC722']
        // 置灰色彩
        const grayColor = ['#d3d3d3', '#d3d3d3', '#d3d3d3']
        const useGray = isEmpty

        const baseFontSize = window.innerWidth / 100
        const labelFontSize = Number(baseFontSize * 0.8).toFixed(0)

        // 由于当前 ECharts 版本 showEmptyCircle 不生效，手动添加一个灰色的底层环形 series 实现同样效果
        const option = {
          backgroundColor: '#050e31',
          color: useGray ? grayColor : color,
          grid: {
            top: '10%',
            left: '2%',
            right: '1%',
            bottom: '1%',
          },
          tooltip: {
            trigger: 'item',
          },
          legend: {
            orient: 'vertical',
            top: 'center',
            selectedMode: 'multiple',
            right: 0,
            itemWidth: 15,
            textStyle: {
              align: 'left',
              verticalAlign: 'middle',
              rich: {
                name: {
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: labelFontSize,
                },
                value: {
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: labelFontSize,
                },
                rate: {
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: labelFontSize,
                },
              },
            },
            data: data.map(item => item.name),
            formatter: (name) => {
              const item = data.find(item => item.name === name)
              // 空数据时显示0%
              return `{name|${name}}{value| ${Number(item.value) || 0}%} {rate| ${
                item.num || 0
              }个}`
            },
          },
          series: useGray
            ? [
                // 底层灰色环形
                {
                  ...this.defaultCircle,
                },
                // 顶层置灰数据环形
                {
                  type: 'pie',
                  center: ['26%', '50%'],
                  radius: ['45%', '65%'],
                  z: 2,
                  label: {
                    show: false,
                    position: 'center',
                  },
                  avoidLabelOverlap: false,
                  emphasis: {
                    label: {
                      show: false,
                      fontSize: labelFontSize,
                    },
                    scale: true,
                    scaleSize: 5,
                  },
                  labelLine: {
                    show: false,
                  },
                  legendHoverLink: true,
                  data: [
                    { value: 1, name: '待加急处理' },
                    { value: 0, name: '待处理' },
                    { value: 0, name: '有效' },
                  ],
                  itemStyle: {
                    color: '#d3d3d3',
                  },
                  tooltip: { show: false },
                  animation: false,
                },
              ]
            : [
                { ...this.defaultCircle },
                {
                  type: 'pie',
                  center: ['26%', '50%'],
                  radius: ['45%', '65%'],
                  label: {
                    show: false,
                    position: 'center',
                  },
                  avoidLabelOverlap: false,
                  emphasis: {
                    label: {
                      show: true,
                      formatter: (params) => {
                        return params.value > 0 ? `${params.name} ` : ''
                      },
                      fontSize: labelFontSize,
                    },
                    scale: true,
                    scaleSize: 5,
                  },
                  labelLine: {
                    show: false,
                  },
                  legendHoverLink: true,
                  data: data.map((item) => {
                    return { value: item.value, name: item.name }
                  }),
                },
              ],
        }

        chart.setOption(option)

        // 添加响应式调整
        const resizeChart = () => {
          if (chart && !chart.isDisposed()) {
            chart.resize()
          }
        }

        window.addEventListener('resize', resizeChart)

        // 在组件销毁时移除事件监听器
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', resizeChart)
          if (chart && !chart.isDisposed()) {
            chart.dispose()
          }
        })

        // 监听图例点击事件
        chart.on('legendselectchanged', (params) => {})

        // 监听数据项点击事件
        chart.on('click', (params) => {
          // 空数据时不跳转
          if (isEmpty)
            return
          this.$router.push({
            path: '/videoOperation/ForeWarningManagement/clientWarningInfoList',
            query: {
              customerStatus: this.$dictUtils.getDictList('CustomerStatus').find((s) => {
                return s.dictName === params.name
              })?.dictCode,
              timeType: this.selectedTrendPeriod,
            },
          })
        })
      }
      catch (error) {
        console.error('初始化处理情况图表失败:', error)
      }
    },
    initLevelChart(digital, total) {
      try {
        const live = digital
        let data = [
          { name: '一级预警', num: 0, value: 0, id: 1 },
          { name: '二级预警', num: 0, value: 0, id: 2 },
          { name: '三级预警', num: 0, value: 0, id: 3 },
          { name: '四级预警', num: 0, value: 0, id: 4 },
        ]

        data = data.map(item => ({
          name: item.name,
          num: live[item.id],
          value: ((live[item.id] / total) * 100).toFixed(2),
        }))

        const isEmpty
          = !Object.keys(live).length || Object.keys(live).every(item => !item)

        const chartDom = document.getElementById('levelChart')
        if (!chartDom) {
          console.error('未找到图表容器')
          return
        }

        const existingChart = this.$echarts.getInstanceByDom(chartDom)
        if (existingChart) {
          existingChart.dispose()
        }

        const chart = this.$echarts.init(chartDom, null, { renderer: 'canvas' })

        const color = ['red', 'orange', 'yellow', '#3751E6']
        const grayColor = ['#d3d3d3', '#d3d3d3', '#d3d3d3', '#d3d3d3']
        const useGray = isEmpty
        const baseFontSize = window.innerWidth / 100
        const labelFontSize = Number(baseFontSize * 0.8).toFixed(0)
        const option = {
          backgroundColor: '#050e31',
          color: useGray ? grayColor : color,
          grid: {
            top: '10%',
            left: '2%',
            right: '5%',
            bottom: '1%',
            containLabel: true,
          },
          tooltip: {
            trigger: 'item',
            hideDelay: 500,
          },
          legend: {
            orient: 'vertical',
            top: 'center',
            right: 0,
            itemWidth: 15,
            textStyle: {
              align: 'left',
              verticalAlign: 'middle',
              rich: {
                name: {
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: labelFontSize,
                },
                value: {
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: labelFontSize,
                },
                rate: {
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: labelFontSize,
                },
              },
            },
            data,
            formatter: (name) => {
              if (data.length) {
                const item = data.find(item => item.name === name)
                return `{name|${name}}{value| ${Number(item.value) || 0}%} {rate| ${
                  item.num || 0
                }个}`
              }
            },
          },
          series: useGray
            ? [
                { ...this.defaultCircle },
                {
                  type: 'pie',
                  center: ['26%', '50%'],
                  radius: ['45%', '65%'],
                  label: {
                    show: false,
                    position: 'center',
                  },
                  avoidLabelOverlap: false,
                  emphasis: {
                    // 鼠标悬浮时不高亮
                    scale: false,
                    itemStyle: {
                      // 禁用高亮色
                      color: '#d3d3d3',
                      borderColor: '#d3d3d3',
                      borderWidth: 0,
                      shadowBlur: 0,
                    },
                    label: {
                      show: false,
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  legendHoverLink: false,
                  data,
                  itemStyle: {
                    color: '#d3d3d3',
                  },
                  tooltip: { show: false },
                  animation: false,
                  // 禁用鼠标悬浮高亮
                  hoverAnimation: false,
                },
              ]
            : [
                { ...this.defaultCircle },
                {
                  type: 'pie',
                  center: ['26%', '50%'],
                  radius: ['45%', '65%'],
                  label: {
                    show: false,
                    position: 'center',
                  },
                  avoidLabelOverlap: false,
                  emphasis: {
                    label: {
                      show: true,
                      formatter: (params) => {
                        return params.value > 0 ? `${params.name} ` : ''
                      },
                      fontSize: labelFontSize,
                    },
                    scale: true,
                    scaleSize: 5,
                  },
                  labelLine: {
                    show: false,
                  },
                  legendHoverLink: true,
                  data: data.map((item) => {
                    return { value: item.num, name: item.name }
                  }),
                },
              ],
        }

        chart.setOption(option)

        // 添加响应式调整
        const resizeChart = () => {
          if (chart && !chart.isDisposed()) {
            chart.resize()
          }
        }

        window.addEventListener('resize', resizeChart)

        // 在组件销毁时移除事件监听器
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', resizeChart)
          if (chart && !chart.isDisposed()) {
            chart.dispose()
          }
        })

        // 监听图例点击事件
        chart.on('legendselectchanged', (params) => {})

        // 监听数据项点击事件
        chart.on('click', (params) => {
          const alarmLevel = {
            一级预警: 1,
            二级预警: 2,
            三级预警: 3,
            四级预警: 4,
          }

          if (isEmpty)
            return
          this.$router.push({
            path: '/videoOperation/ForeWarningManagement/clientWarningInfoList',
            query: {
              alarmLevel: alarmLevel[params.name],
              timeType: this.selectedRankingPeriod,
            },
          })
        })
      }
      catch (error) {
        console.error('初始化等级占比图表失败:', error)
      }
    },
    async handleHandlingButtonClick(period) {
      this.selectedTrendPeriod = period
      this.getHandlingData({
        type: 4,
        timeType: this.selectedTrendPeriod,
      })
    },
    async handleLevelButtonClick(period) {
      this.selectedRankingPeriod = period
      this.getLevelData({
        type: 5,
        timeType: this.selectedRankingPeriod,
      })
    },
    // 刷新预警事件
    async refreshEvents() {
      // alert('刷新预警事件成功');
      // 模拟获取新数据
      this.$emit('getScreenData', {
        type: 6,
        timeType: 0,
      })
      this.updateVisibleEvents()
    },
    // 刷新预警处理情况
    async refreshHandling() {
      // alert('刷新预警处理情况成功');
      this.getHandlingData({
        type: 4,
        timeType: this.selectedTrendPeriod,
      })
    },
    // 刷新预警等级占比
    async refreshLevel() {
      // alert('刷新预警等级占比成功');
      this.getLevelData({
        type: 5,
        timeType: this.selectedRankingPeriod,
      })
    },
    onMore() {
      this.$router.push('/videoOperation/ForeWarningManagement/clientWarningInfoList')
    },

    // 处理窗口大小变化，重绘图表
    handleResize() {
      // 重新初始化图表大小
      const handlingChart = this.$echarts.getInstanceByDom(
        document.getElementById('handlingChart'),
      )
      const levelChart = this.$echarts.getInstanceByDom(
        document.getElementById('levelChart'),
      )

      if (handlingChart) {
        handlingChart.resize()
      }

      if (levelChart) {
        levelChart.resize()
      }

      // 重新绘制当前图像
      this.$nextTick(() => {
        this.drawImageWithBoxes(this.currentEvent)
      })
    },
  },
}
</script>

<template>
  <div class="panelBox">
    <div class="top-panel">
      <Panel customStyle="height: 100%" @refresh="refreshEvents">
        <div class="all-event-display">
          <div ref="imageContainer" class="event-display">
            <template v-if="currentEvent">
              <canvas
                id="images"
                ref="canvasImage"
                style="width: 100%; height: 100%; border-radius: 8px"
              />
              <div class="overlay">
                <p v-if="currentEvent.alarmType">
                  事件名称：{{ currentEvent.alarmType }}
                </p>
                <p>预警时间：{{ currentEvent.alarmDate }}</p>
                <p>预警等级：{{ alarmLevel[currentEvent.alarmLevel] || "未知等级" }}</p>
                <p>摄像头名称：{{ currentEvent.cameraName }}</p>
              </div>
            </template>
          </div>
          <div class="event-thumbnails-wrapper">
            <button class="carousel-btn prev-btn" @click="prevEvent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>
            <div class="event-thumbnails">
              <img
                v-for="(event, index) in visibleEvents"
                :key="index"
                :src="filePrefix + event.alarmPic"
                :alt="event.cameraName"
                :class="{ active: videoAlarmList.indexOf(event) === activeIndex }"
                @click="selectEvent(videoAlarmList.indexOf(event))"
              >
            </div>
            <button class="carousel-btn next-btn" @click="nextEvent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </div>
      </Panel>
    </div>
    <div class="bottom-panels">
      <Panel
        customStyle="margin-right:0.25vw"
        title="预警处理情况"
        isMore
        @refresh="refreshHandling"
        @more="onMore"
      >
        <div style="height: 80%">
          <div class="time-period-buttons">
            <el-button
              v-for="period in periods"
              :key="period.value"
              type="primary"
              size="mini"
              :class="{ active: selectedTrendPeriod === period.value }"
              @click="handleHandlingButtonClick(period.value)"
            >
              {{ period.label }}
            </el-button>
          </div>
          <div id="handlingChart" class="chart-wrapper" />
        </div>
      </Panel>
      <Panel
        customStyle="margin-left:0.25vw"
        title="预警等级占比"
        isMore
        @refresh="refreshLevel"
        @more="onMore"
      >
        <div style="height: 80%">
          <div class="time-period-buttons">
            <el-button
              v-for="period in periods"
              :key="period.value"
              type="primary"
              size="mini"
              :class="{ active: selectedRankingPeriod === period.value }"
              @click="handleLevelButtonClick(period.value)"
            >
              {{ period.label }}
            </el-button>
          </div>
          <div id="levelChart" class="chart-wrapper" />
        </div>
      </Panel>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.all-event-display {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 预警事件展示样式 */
.warning-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 新增的div样式（层级高于图片） */
.overlay {
  position: absolute;
  right: 0.7vw;
  bottom: 0.7vw;
  // width: 30%;
  height: auto;
  min-height: 8vw;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  z-index: 10;
  font-size: 1vw;
  border-radius: 0.3vw;
  padding: 0.7vw;
}

.overlay p {
  margin-top: 0.14vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 通用按钮样式 */
button {
  padding: 0.5vw 1vw;
  font-size: 1vw;
  cursor: pointer;
  border: none;
  border-radius: 0.2vw;
  color: white;
  transition: background-color 0.3s ease;
  background-color: #0a5299;
  margin: 5px;
}

/* 悬停时改变背景颜色 */
button:hover {
  background-color: #0a5299;
}

/* 状态显示 */
.status-pending {
  color: red;
}

.status-invalid {
  color: white;
}

.status-valid {
  color: green;
}

/* 退出按钮特殊样式 */
.logout-btn {
  background-color: #f44336;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 10px;
}

/* 悬停时的退出按钮样式 */
.logout-btn:hover {
  background-color: #e53935;
}

/* 退出按钮点击时效果 */
.logout-btn:active {
  background-color: #c62828;
}

/* 居中对齐和适应 */
.header-right {
  display: flex;
  align-items: center;
}

.header-right button {
  margin-right: 10px;
  /* 按钮间的间距 */
}

.event-display {
  width: 100%;
  min-height: 50%;
  // max-height: 70%; /* 限制最大高度为视口高度的35% */
  position: relative;
  overflow: hidden; /* 防止内容溢出 */
  flex: 1;
}

/* 设置canvas固定高度 */
#images {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 使图像填充整个canvas */
  border-radius: 8px;
}

.event-thumbnails-wrapper {
  display: flex;
  align-items: center;
  margin-top: 0.5vw;
  gap: 5px;
  position: relative;
  max-height: 20%;
  padding: 8px 10px;
  box-sizing: border-box;
  /* 增加左右内边距 */
}

.event-thumbnails {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: scroll;
  justify-content: flex-start !important;
  padding: 0 10px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: 0;
  height: 8.5vh;
}

.event-thumbnails img {
  // height: 60px; /* 降低高度 */
  width: 20%;
  height: 100%;
  /* 让每张图片占据容器的 20%，并留出间隔 */
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.event-thumbnails img.active {
  border-color: #00f0ff;
  box-shadow: 0 4px 12px rgba(0, 240, 255, 0.2);
}

/* 预警记录样式 */
.record-box {
  background-color: rgba(21, 47, 89);
}

.info {
  display: flex;
  width: 100%;
  /* 确保子元素占满父容器 */
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 21, 41, 0.8);
}

::-webkit-scrollbar-thumb {
  background: #0a5299;
  border-radius: 2px;
  margin-top: 2px;
}

.top-panel {
  height: 60%;
}

/* 中间面板底部状态 */
.bottom-panels {
  display: flex;
  height: calc(40% - 0.5vw);
  margin-top: 0.5vw;
}

.chart-wrapper {
  height: 80%;
  width: 100%;
}

/* 日期切换组件样式 */
.time-period-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  .active {
    background: #00f0ff;
    color: #000;
    border-color: #00f0ff;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);

    &:hover {
      border-color: #00f0ff;
      color: #fff;
    }
  }
}

.time-period-buttons .el-button {
  padding: 0.3vw 0.8vw;
  font-size: 0.9vw;
}

.carousel-btn {
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加组件自适应调整逻辑 */
.panelBox {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 限制最大高度 */
  overflow: hidden; /* 防止内容溢出 */
}
</style>
