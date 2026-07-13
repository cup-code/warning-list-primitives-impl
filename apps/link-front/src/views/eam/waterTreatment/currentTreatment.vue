<script>
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
import {
  getCurrentDeviceState,
  getIoTrendHis,
  getIoTrendReal,
} from '@/http/dev/manage-api.js'

import {
  forecastWater,
  specificDayWater,
} from '@/http/safe-production/production-schedule-api.js'
import BlockCell from './BlockCell.vue'
import PickTime from './pickTime.vue'

export default {
  name: 'CurrentTreatment',
  components: {
    BlockCell,
    PickTime,
  },
  setup() {
    const form = ref([])
    const batch = ref([])
    const emergencyBatch = ref([])
    const forecastW = ref([
      { rainCls: '', tempCls: '', inflow: '0', dateCls: '', curve: {}, batch: [] },
    ])
    const station = ref('丹务1')
    const toDay = ref(new Date().toISOString().split('T')[0])
    const currentTimeData = ref('')
    const currentState = ref('')
    const isRealData = ref(false)
    const iconVariable = ref([
      {
        icon: 'temperature',
        value: '气温：',
        color: '#fbbf24',
        prop: 'tempCls',
      },
      { icon: 'rain', value: '降雨：', color: '#60a5fa', prop: 'rainCls' },
      {
        icon: 'vacation',
        value: '节假日：',
        color: '#84cc16',
        prop: 'dateCls',
      },
    ])
    const getCircle = `absolute left-0 top-0 right-0 bottom-0 bg-blue-50  rounded-full animate-pulse opacity-7`

    const { refetch: refetchRealData } = useQuery({
      queryKey: ['isRealData'],
      queryFn: () => getIoTrendReal('25F710BAD7E5706D', 'C1_D01_02801'),
      onSuccess: ({ data }) => {
        if (data.success) {
          const { value } = data.result
          isRealData.value = Boolean(Number.parseInt(value))
        }
      },
    })

    const getBatchFunction = async (type) => {
      const currentTime = new Date().getHours() + new Date().getMinutes() / 60

      const list = forecastW.value[0]?.batch
        .filter(i => i.category === type)
        .map((a) => {
          return {
            startTime:
              new Date(a.scheduleStartTime).getHours()
                + new Date(a.scheduleStartTime).getMinutes() / 60,
            endTime:
              new Date(a.scheduleEndTime).getHours()
                + new Date(a.scheduleEndTime).getMinutes() / 60,
            quantity: a.drainRatio,
            batchNumber: a.batchId,
            executeState: a.executeState,
            category: a.category,
            scheduleInfo: JSON.parse(a.scheduleInfo),
          }
        })
        .map((item) => {
          const currentDate = new Date(currentTimeData.value).getTime()
          const todayDate = new Date(toDay.value).getTime()

          let status = ''
          if (currentDate > todayDate) {
            status = '未执行'
          }
          else if (currentDate < todayDate) {
            status = '已执行'
          }
          else {
            if (currentTime < item.startTime) {
              status = '未执行'
            }
            else if (currentTime < item.endTime) {
              status = isRealData.value ? '执行中' : '已执行'
            }
            else {
              status = '已执行'
            }
          }

          return { ...item, status }
        })

      return list
    }

    const getWaterFunction = async (result) => {
      const timeSet = new Set(result.map(item => item.dateStr))
      form.value = Array.from(timeSet).map(t =>
        result.filter(item => t === item.dateStr),
      )

      forecastW.value = form.value.map((item, index) => {
        const listSet = new Set(
          item.map(i =>
            JSON.stringify({
              inflow: Math.round(i.inflow * 100),
              dateCls: i.dateCls,
              tempCls: i?.tempCls || '',
              rainCls: i.rainCls,
              curve: JSON.parse(i.curve),
              quantity: Math.round(i.drainRatio * 100),
              day: index + 1,
            }),
          ),
        )

        return { ...JSON.parse(Array.from(listSet)[0]), batch: item }
      })

      batch.value = await getBatchFunction('常规批次')
      emergencyBatch.value = await getBatchFunction('应急批次')
    }

    const { refetch: refetchCurrentState } = useQuery({
      queryKey: ['currentState'],
      queryFn: () => getCurrentDeviceState(),
      onSuccess: ({ data }) => {
        if (data.success) {
          const { result } = data
          currentState.value = result
        }
      },
    })

    const { refetch } = useQuery({
      queryKey: ['WaterLevel', station.value],
      queryFn: () => forecastWater({ station: station.value }),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          const { result } = data
          getWaterFunction(result)
        }
      },
    })

    const { refetch: refetchSpecificDayWater } = useQuery({
      queryKey: ['specificDayWater', station.value, currentTimeData.value],
      queryFn: () =>
        specificDayWater({
          station: station.value,
          dateStr: currentTimeData.value,
        }),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          const { result } = data
          getWaterFunction(result)
        }
      },
    })

    const onChange = (value) => {
      currentTimeData.value = value

      console.log('object', currentTimeData.value)
      refetchSpecificDayWater()
    }

    const onselect = (info) => {
      console.log('object', info)
      station.value = info
      refetch()
    }

    return {
      form,
      onselect,
      toDay,
      forecastW,
      iconVariable,
      getCircle,
      currentTimeData,
      refetchRealData,
      batch,
      emergencyBatch,
      currentState,
      refetchCurrentState,
      onChange,
    }
  },
  data() {
    return {
      waterLevelChart: null,
      waterComparisonChart: null,
      waterComparisonChart2: null,
      emergencyChart: null,
      timeData: [0, 4, 7, 12, 16, 20, 24],
      currentLocation: {
        province: '',
        city: '',
      },
      waterChart: {
        dcd: '25F710BAD7E5706D',
        icd: '',
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
        endDate: new Date(new Date()).getTime(),
      },
      waterData: {
        time: [],
        value: [],
      },
      actualWaterData: {
        time: [],
        value: [],
      },
      weatherInfo: {
        temperature: null,
        condition: '加载中...',
        windDirection: '',
        windScale: '',
      },
      point: null,
      isFullScreen: false,
      status: [
        // { name: "未执行", color: "#40c00b" },
        { name: '执行中', color: '#e5c90c' },
        { name: '已执行', color: '#0b8dc0' },
      ],
      stageStatus: [
        { label: '排水百分比：', prop: 'drain_ratio', unit: '' },
        // { label: "总时间：", prop: "total_time", unit: "分钟" },
        { label: '进水时间：', prop: 'inlet_time', unit: '分钟' },
        { label: '曝气时间：', prop: 'aeration_time', unit: '分钟' },
        { label: '沉淀时间：', prop: 'sediment_time', unit: '分钟' },
        { label: '排水时间：', prop: 'drain_time', unit: '分钟' },
        // { label: "闲置时间：", prop: "idle_time", unit: "分钟" },
      ],
    }
  },
  computed: {
    getColor() {
      return this.isFullScreen ? '#222' : '#ffffff'
    },
  },
  watch: {
    batch: {
      handler() {
        this.initChart()
      },
      deep: true,
    },
  },
  async created() {
    await this.getForecastWater()
    await this.getActualWater()
  },
  mounted() {
    if (this.forecastW[0]?.inflow > 0.6 && this.forecastW[0]?.inflow <= 0.7) {
      this.timeData = [0, 4, 7, 12, 16, 20, 24]
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.waterLevelChart) {
      this.waterLevelChart.dispose()
      this.waterLevelChart = null
    }
    if (this.waterComparisonChart) {
      this.waterComparisonChart.dispose()
      this.waterComparisonChart = null
    }
  },
  methods: {
    handleFullScreen() {
      this.isFullScreen = !this.isFullScreen

      if (this.isFullScreen) {
        this.initChart2()
      }
    },
    getTimes(time) {
      return [0, 20, 40, 60].includes(Number(new Date(time).getMinutes()))
        ? `${new Date(time).getHours()}:${new Date(time).getMinutes()}`
        : ''
    },

    getForecastWater() {
      this.waterChart.icd = 'C1_D01_40177'
      getIoTrendHis(this.waterChart)
        .then(({ data }) => {
          const list = new Set([
            ...data.result
              .map((item) => {
                return this.getTimes(item.eventDate)
              })
              .filter(item => item !== ''),
          ])

          this.waterData = {
            time: Array.from(list),
            value: data.result,
          }
          this.initChart()
        })
        .catch((err) => {
          console.log('err', err)
        })
    },

    getActualWater() {
      this.waterChart.icd = 'C1_D01_40165'
      getIoTrendHis(this.waterChart)
        .then(({ data }) => {
          const list = new Set([
            ...data.result
              .map((item) => {
                return this.getTimes(item.eventDate)
              })
              .filter(item => item !== ''),
          ])

          this.actualWaterData = {
            time: Array.from(list),
            value: data.result,
          }
          this.initChart()
        })
        .catch((err) => {
          console.log('err', err)
        })
    },

    getWaterLevelOption(type = '') {
      const status = {
        未执行: '#40c00b',
        执行中: '#e5c90c',
        已执行: '#0b8dc0',
      }

      let batchList = []
      if (type === 'emergency') {
        batchList = Array.isArray(this.emergencyBatch) ? [...this.emergencyBatch] : []
      }
      else {
        batchList = Array.isArray(this.batch) ? [...this.batch] : []
      }

      console.log(2222, batchList)
      const maxValue
        = batchList.length > 0
          ? Math.max(...batchList.map(s => Math.round((s?.quantity || 0) * 100))) + 10
          : 100

      return {
        grid: {
          left: '4%',
          right: '18%',
          bottom: '1%',
          top: '6%',
          width: '92%',
          containLabel: true,
        },
        legend: {
          data: ['待执行', '执行中', '已执行'],
          show: true,
          textStyle: {
            color: '#ffffff',
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: (params) => {
            const batchItem = batchList[params.value]
            if (batchItem?.status === '执行中') {
              return `<div class="flex items-center">
               ${this.currentState}
               </div>`
            }
            if (batchItem?.status === '已执行' || batchItem?.category === '常规批次') {
              return `<div class="flex flex-col px-2">
             ${this.stageStatus
                .map((s, index) => {
                  const separator = index < this.stageStatus.length - 1 ? ';' : ''
                  return `<div>${s.label}${batchItem.scheduleInfo[s.prop] || ''}${
                    s.unit
                  }${separator}</div>`
                })
                .join('')}
                </div>`
            }
            return ''
          },
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 24,
          interval: 1,
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
          axisLabel: {
            align: 'center',
            color: '#ffffff',
            fontSize: 13,
          },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 20 || maxValue,
          align: 'right',
          fontSize: 14,
          formatter: '{value}%',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fff',
            },
          },
          axisLabel: {
            color: '#ffffff',
            fontSize: 13,
            formatter: '{value}%',
          },
        },
        series: [
          {
            type: 'custom',
            renderItem: (params, api) => {
              let batches = []
              batches = batchList.map((item) => {
                return {
                  start: item.startTime,
                  end: item.endTime,
                  batch: `批次${item.batchNumber}`,
                  color: item.category === '常规批次' ? '#40c00b' : status[item.status],
                  quantity: 0.18 || item.quantity,
                  category: item.category,
                }
              })

              const categoryIndex = params.dataIndex
              const batch = batches[categoryIndex] || {
                batch: '',
                color: '',
                quantity: 0,
                category: '',
              }

              const x1 = api.coord([batch?.start, 0])[0]
              const x2 = api.coord([batch?.end, 0])[0]
              const y1 = api.coord([0, 0])[1]
              const y2 = api.coord([0, batch?.quantity * 100])[1]

              const rectShape = {
                type: 'rect',
                shape: {
                  x: x1,
                  y: y2,
                  width: x2 - x1,
                  height: y1 - y2,
                },
                style: {
                  fill: batch?.color,
                },
              }
              const textConfig = {
                type: 'text',
                style: {
                  text: batch.batch,
                  textAlign: 'center',
                  layout: 'center',
                  textVerticalAlign: 'middle',
                  fill: '#ffffff',
                  x: x1 + (x2 - x1) / 2,
                  y: y2 + (y1 - y2) / 2,
                  fontSize: 14,
                  fontWeight: 'bold',
                },
              }
              // const iconConfig = {
              //   type: "path",
              //   shape: {
              //     pathData: this.path[batch?.category],
              //     layout: "cover",
              //     x: x1 + (x2 - x1) / 2 - 10,
              //     y: y2 + 10,
              //     width: 20,
              //     height: 20,
              //   },
              //   style: {
              //     fill: "#ffffff",
              //   },
              // };

              return {
                type: 'group',
                children: [rectShape, textConfig],
              }
            },
            data: [0, 1, 2, 3, 4, 5, 6],
            // markLine: {
            //   data: batchList.map((s) => {
            //     return {
            //       name: `${s?.quantity * 100}%`,
            //       yAxis: s?.quantity * 100 || 0,
            //     };
            //   }),
            //   lineStyle: {
            //     color: "#60a5fa",
            //     fontSize: 14,
            //   },
            // },
          },
        ],
      }
    },

    getWaterComparisonOption() {
      const time = new Date().getHours() + new Date().getMinutes() / 60 + 1
      const timeLength = Array.from({ length: time }, (_, i) => {
        return i <= 23 ? [`${i}:00`, `${i}:10`, `${i}:20`, `${i}:30`, `${i}:40`, `${i}:50`] : ['24:00']
      })
      const generateRandomArray = (lengths) => {
        const arr = []
        for (let i = 0; i < lengths; i++) {
          const list = Array.from({ length: lengths }, (_, i) => {
            if (i % 2 === 0) {
              return 1
            }
            else if (i === 32) {
              return 1.3
            }
            else if (i === 34) {
              return 1.4
            }
            return 1.1
          })
          arr.push(list[i])
        }
        return arr
      }
      const randomArray = generateRandomArray(timeLength.flat().length)
      return {
        grid: {
          left: '2%',
          right: '20%',
          bottom: '2%',
          top: '13%',
          containLabel: true,
        },
        legend: {
          data: ['实际来水累计水量', '预测来水水量', '瞬时流量'],
          textStyle: {
            color: this.getColor,
          },
          orient: 'vertical',
          top: 10,
          right: 0,
          formatter: (name) => {
            return name
          },
        },
        color: ['#0284c7', '#fb7185', '#16a34a'],
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `
            <div>${params[0]?.axisValue}</div>
            <ul>
            ${
              params[0]?.seriesName
                ? `<li  class="flex items-center"><div class="mr-1 w-3 h-3 rounded-full" style="background-color:${params[0]?.color}"></div>${params[0]?.seriesName}:${params[0]?.value}m³</li>`
                : ''
            }
              ${
                params[1]?.seriesName
                  ? `<li v-if="params[1]?.value" class="flex items-center my-1"><div class="mr-1 w-3 h-3 rounded-full" style="background-color:${params[1]?.color}"></div>${params[1]?.seriesName}:${params[1]?.value}m³</li>`
                  : ''
              }
              ${
                params[2]?.seriesName
                  ? `<li v-if="params[2]?.value" class="flex items-center"><div class="mr-1 w-3 h-3 rounded-full" style="background-color:${params[2]?.color}"></div>${params[2]?.seriesName}:${params[2]?.value}m³/h</li>`
                  : ''
              }
              </ul>
            `
          },
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          data:
            this.forecastW[0]?.curve.time
            || Array.from({ length: 25 }, (_, i) => i)
              .map((i) => {
                return i <= 23 ? [`${i}`, `${i}:20`, `${i}:40`] : ['24']
              })
              .flat(),
          axisLine: {
            lineStyle: {
              color: this.getColor,
            },
          },
          axisLabel: {
            color: this.getColor,
            fontSize: 13,
            rotate: 45,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: '水量(m³)',
            position: 'left',
            alignTicks: true,
            splitNumber: 4,
            nameTextStyle: {
              color: this.getColor,
            },
            axisLine: {
              lineStyle: {
                color: this.getColor,
              },
            },
            axisLabel: {
              color: this.getColor,
              fontSize: 13,
            },
          },
          {
            type: 'value',
            name: '流量(m³/h)',
            alignTicks: true,
            position: 'right',
            min: 0,
            max: 4,
            splitNumber: 4,
            nameTextStyle: {
              color: this.getColor,
            },
            axisLabel: {
              color: this.getColor,
              formatter: '{value}',
              fontSize: 13,
            },
            axisLine: {
              lineStyle: {
                color: this.getColor,
              },
            },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'none',
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'none',
          },
        ],
        series: [
          {
            name: '实际来水累计水量',
            type: 'line',
            yAxisIndex: 0,
            data: this.forecastW[0]?.curve.time?.map((item, index) => {
              const time = (
                Number(item.split(':')[0])
                + Number(item.split(':')[1]) / 60
              ).toFixed(2)
              return item === 0
                ? '0'
                : Number(
                    Number(Number(Number(Number(randomArray[index]) * time).toFixed(2))),
                  )
            }),
            symbol: 'emptyCircle',
            symbolSize: 5,
            lineStyle: {
              width: 2,
            },
          },
          {
            name: '预测来水水量',
            type: 'line',
            yAxisIndex: 0,
            data: this.forecastW[0]?.curve.volume,
            symbol: 'emptyCircle',
            symbolSize: 5,
            lineStyle: {
              width: 2,
            },
          },
          {
            name: '瞬时流量',
            type: 'line',
            yAxisIndex: 1,
            data: randomArray,
            symbol: 'emptyCircle',
            symbolSize: 5,
            lineStyle: {
              width: 2,
            },
          },
        ],
      }
    },
    async initChart2() {
      const waterComparisonOption = await this.getWaterComparisonOption()

      const waterComparisonEl2 = document.getElementById('water-comparison2')
      if (waterComparisonEl2) {
        // 如果图表已存在，先销毁
        if (this.waterComparisonChart2) {
          this.waterComparisonChart2.dispose()
        }
        this.waterComparisonChart2 = this.$echarts.init(waterComparisonEl2)
        this.waterComparisonChart2.setOption(waterComparisonOption, true)
      }
    },
    async initChart() {
      await this.$nextTick()

      const waterLevelOption = await this.getWaterLevelOption()
      const emergencyOption = await this.getWaterLevelOption('emergency')
      const waterComparisonOption = await this.getWaterComparisonOption()

      // 确保DOM元素已经渲染

      try {
        const waterLevelEl = document.getElementById('waterLevel')
        const waterComparisonEl = document.getElementById('water-comparison')
        const emergencyEl = document.getElementById('emergency')

        if (emergencyEl) {
          if (this.emergencyChart) {
            this.emergencyChart.dispose()
          }
          this.emergencyChart = this.$echarts.init(emergencyEl)
          this.emergencyChart.setOption(emergencyOption, true)
        }

        if (waterLevelEl) {
          // 如果图表已存在，先销毁
          if (this.waterLevelChart) {
            this.waterLevelChart.dispose()
          }
          this.waterLevelChart = this.$echarts.init(waterLevelEl)
          this.waterLevelChart.setOption(waterLevelOption, true)
        }

        if (waterComparisonEl) {
          // 如果图表已存在，先销毁
          if (this.waterComparisonChart) {
            this.waterComparisonChart.dispose()
          }
          this.waterComparisonChart = this.$echarts.init(waterComparisonEl)
          this.waterComparisonChart.setOption(waterComparisonOption, true)
        }

        // 添加窗口大小改变时的自适应
        window.removeEventListener('resize', this.handleResize) // 先移除已有的监听器
        window.addEventListener('resize', this.handleResize)
      }
      catch (error) {
        console.error('图表初始化失败:', error)
      }
    },
    handleResize() {
      if (this.waterLevelChart) {
        this.waterLevelChart.resize()
      }
      if (this.waterComparisonChart) {
        this.waterComparisonChart.resize()
      }
      if (this.waterComparisonChart2) {
        this.waterComparisonChart2.resize()
      }
      if (this.emergencyChart) {
        this.emergencyChart.resize()
      }
    },
  },
}
</script>

<template>
  <div class="relative p-0 page-container" style="height: calc(100vh - 45px)">
    <img
      src="@/assets/anqiBi/bg.png"
      class="fixed top-0 right-0 bottom-0 left-0 w-screen h-screen"
      loading="lazy"
    >

    <div class="box-border flex relative flex-col h-screen">
      <div class="flex justify-center items-start back-info">
        <div class="title">
          当日生产批次安排
        </div>
      </div>
      <div class="flex flex-col px-6 -mt-12">
        <div class="flex justify-between items-end mx-2 mb-4">
          <div class="flex items-center">
            <svg-icon icon-class="timeIcon" style="width: 15px; height: 15px" />
            <span
              class="ml-1 text-sm text-white"
              style="font-size: clamp(12px, 1.5vw, 14px)"
            >当前日期：{{
              `${new Date().getFullYear()}年${(new Date().getMonth() + 1)
                .toString()
                .padStart(2, "0")}月${new Date()
                .getDate()
                .toString()
                .padStart(2, "0")}日`
            }}
            </span>
          </div>
        </div>
        <BlockCell class="flex relative flex-auto px-5 py-1" style="height: 42vh">
          <div class="h-full" style="width: 36vw">
            <div class="flex flex-wrap items-center my-2 text-xl font-bold text-white">
              <div class="mr-2 w-2 h-8 bg-blue-400" />
              <div class="mr-2">
                预测来水量
              </div>
              <ESelect
                label="选择站点"
                class="mr-2"
                textColor="text-white"
                @getValue="onselect"
              />
            </div>
            <div class="flex flex-col items-start">
              <div class="flex justify-start my-2">
                <PickTime textColor="text-white" @change="onChange" />
              </div>
              <div class="flex justify-between items-center mx-2 w-full">
                <div class="flex flex-col justify-center items-center my-4">
                  <div
                    v-for="(item, index) in iconVariable"
                    :key="item.value"
                    class="box-border flex items-center p-3 mx-1 h-7 bg-blue-50 rounded-full min-w-4"
                    :style="{ margin: index === 1 ? '2vw 0' : '0' }"
                  >
                    <svg-icon
                      :icon-class="item.icon"
                      style="width: 1rem; height: 1rem"
                      :color="item.color"
                    />
                    <span class="flex items-center ml-2 text-sm text-black">
                      {{
                        item.value && forecastW[0] && forecastW[0][item.prop]
                          ? `${item.value}${forecastW[0][item.prop]}`
                          : ""
                      }}
                    </span>
                  </div>
                </div>
                <div
                  class="flex relative justify-center items-center bg-white rounded-full"
                  style="width: 10vw; height: 10vw; margin: 2vw auto"
                >
                  <div
                    class="box-border flex z-10 flex-col justify-center items-center bg-blue-100 rounded-full"
                    style="width: 8.5vw; height: 8.5vw"
                  >
                    <div class="flex justify-center items-end font-bold text-sky-400">
                      <div class="mr-1" style="font-size: 1.4vw">
                        {{
                          forecastW[0] && forecastW[0].inflow
                            ? Number(forecastW[0].inflow)
                            : 0
                        }}%
                      </div>
                      <svg-icon icon-class="waterLevel" style="width: 2vw; height: 2vw" />
                    </div>
                    <div class="text-black" style="font-size: 1vw; margin-top: 7px">
                      预测来水百分比
                    </div>
                  </div>
                  <div :class="getCircle" style="width: 10vw; height: 10vw" />
                  <div class="animate-pulse g-content">
                    <svg-icon
                      icon-class="waveIcon"
                      class="iconImage"
                      color="#60a5fa"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-auto w-full h-full">
            <div class="flex-auto" style="padding-left: 50px">
              <div class="flex h-1/2">
                <div id="waterLevel" style="width: 100%; height: 100%" />
                <div
                  class="text-base text-center text-white"
                  style="
                    writing-mode: vertical-rl;
                    line-height: 1.5;
                    letter-spacing: 4px;
                    text-orientation: upright;
                  "
                >
                  正常批次
                </div>
              </div>

              <div class="flex relative h-1/2">
                <div
                  class="flex absolute top-0 -left-16 flex-col justify-end items-end"
                  style="width: 5vw"
                >
                  <div
                    v-for="(item, index) in status"
                    :key="index"
                    class="flex items-center mb-1 text-white"
                  >
                    <div
                      class="mr-2 w-3 h-3 rounded-full"
                      :style="{ backgroundColor: item.color }"
                    />
                    <div style="font-size: 14px">
                      {{ item.name }}
                    </div>
                  </div>
                </div>
                <div id="emergency" style="width: 100%; height: 100%" />
                <div
                  class="text-base text-center text-white"
                  style="
                    writing-mode: vertical-rl;
                    letter-spacing: 4px;
                    line-height: 1.5;
                    text-orientation: upright;
                  "
                >
                  应急批次
                </div>
              </div>
            </div>
          </div>
        </BlockCell>

        <BlockCell class="px-5 my-3" style="height: 36vh">
          <div class="box-border flex flex-row w-full h-full">
            <div class="flex mt-5 text-xl font-bold text-white">
              <div class="mr-2 w-2 h-8 bg-blue-400" />
              来水流量对比

              <div
                class="box-border flex items-center p-1 px-2 ml-2 h-7 text-xs rounded-md border border-black border-dashed cursor-pointer white text-"
                @click="handleFullScreen"
              >
                全屏展示
              </div>
            </div>
            <div class="flex flex-auto justify-center items-center">
              <div
                v-show="!isFullScreen"
                id="water-comparison"
                style="width: 57vw; height: 34vh"
              />
            </div>
          </div>
        </BlockCell>
      </div>
    </div>

    <div
      v-if="isFullScreen"
      class="flex absolute top-0 right-0 bottom-0 left-0 z-30 justify-center items-center w-full h-full"
      style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px)"
    >
      <div
        class="box-border flex relative justify-center items-center p-2 w-3/4 h-2/3 bg-white"
      >
        <div
          class="flex absolute top-0 right-0 justify-center items-center w-10 h-10 text-black rounded-full cursor-pointer"
          @click="isFullScreen = false"
        >
          <i class="el-icon-close" style="font-size: 1rem" />
        </div>

        <div id="water-comparison2" style="width: 100%; height: 90%; z-index: 100" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.back-info {
  width: 100%;
  height: 14vh;
  background-image: url("~@/assets/anqiBi/top.png");
  background-size: 100% 100%;
  .title {
    width: 40%;
    height: 14vh;
    margin: auto;
    text-align: center;
    background-image: linear-gradient(
      to top,
      #55c3fe 20%,
      #feffff
    ); /* 线性渐变背景，方向向上 */
    -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
    -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
    line-height: 8vh;
    font-size: clamp(16px, 2vw, 30px);
    font-family: FZDaHei-B02;
    font-weight: 800;
    letter-spacing: 10px;
  }
}

.g-content {
  position: absolute;
  bottom: 0px;
  height: 10vw;
  overflow: hidden;
  display: flex;
  width: 10vw;
  z-index: 10;
  border-radius: 50%;

  .iconImage {
    width: 110%;
    height: 8vw;
    position: absolute;
    bottom: -45px;
    z-index: 99;
  }
}
</style>
