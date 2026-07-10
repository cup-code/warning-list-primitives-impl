<script>
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'

import { forecastWater } from '@/http/safe-production/production-schedule-api.js'
import BlockCell from './BlockCell.vue'
import ForecastW from './ForecastW.vue'

export default {
  name: 'Treatment',
  components: {
    ForecastW,
    BlockCell,
  },
  setup() {
    const form = ref([])
    const batch = ref()
    const forecastW = ref([
      { tempCls: '', rainCls: '', inflow: '0', dateCls: '', batch: [] },
    ])
    const station = ref('丹务1')

    const toDay = ref(new Date().toISOString().split('T')[0])

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

    const { refetch } = useQuery({
      queryKey: ['WaterLevel', station.value],
      queryFn: () => forecastWater({ station: station.value }),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        if (data.success) {
          const { result } = data
          const time = new Set([
            ...result.map((item) => {
              return item.dateStr
            }),
          ])
          form.value = Array.from(time)
            .filter(s => s !== toDay.value)
            .map((t) => {
              return result.filter(item => t === item.dateStr)
            })

          forecastW.value = form.value.map((item, index) => {
            const list = new Set([
              ...item.map((i) => {
                return JSON.stringify({
                  inflow: Number.parseInt(i.inflow * 100),
                  dateCls: i.dateCls,
                  tempCls: i.tempCls,
                  rainCls: i.rainCls,
                  quantity: Math.round(i.drainRatio * 100),
                  day: index + 1,
                })
              }),
            ])

            return { ...JSON.parse(Array.from(list)[0]), batch: item }
          })

          batch.value = forecastW.value[0].batch
            .filter(i => i.category === '常规批次')
            .map((a) => {
              return {
                startTime:
                  new Date(a.scheduleStartTime).getHours()
                    + new Date(a.scheduleStartTime).getMinutes() / 60,
                quantity: a.drainRatio,
                batchNumber: a.batchId,
                endTime:
                  new Date(a.scheduleEndTime).getHours()
                    + new Date(a.scheduleEndTime).getMinutes() / 60,
              }
            })
            .filter(item => item !== null) // Filter out null values
          console.log('batch', batch.value)
        }
      },
    })

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
      batch,
    }
  },
  data() {
    return {
      waterLevelChart: null,
      timeData: [0, 4, 7, 12, 16, 20, 24],
      currentLocation: {
        province: '',
        city: '',
      },
      weatherInfo: {
        temperature: null,
        condition: '加载中...',
        windDirection: '',
        windScale: '',
      },
      point: null,
    }
  },
  watch: {
    batch: {
      handler() {
        setTimeout(() => {
          this.initChart()
        }, 800)
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    if (this.forecastW[0].inflow > 0.6 && this.forecastW[0].inflow <= 0.7) {
      this.timeData = [0, 4, 7, 12, 16, 20, 24]
    }

    setTimeout(() => {
      this.initChart()
    }, 800)
  },
  beforeDestroy() {
    if (this.waterLevelChart) {
      this.waterLevelChart.dispose()
      this.waterLevelChart = null
    }
  },
  methods: {
    initChart() {
      const option = {
        title: {
          show: true,
          top: '0%',
          left: '38%',
          text: '常规批次安排目标',
          textStyle: {
            color: '#ffffff',
          },
        },
        grid: {
          left: '3%',
          right: '8%',
          bottom: '1%',
          top: '13%',
          width: '92%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'yAxis',
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 24,
          // data: this.timeData,
          interval: 4,
          boundaryGap: ['0%', '20%'],
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
          axisLabel: {
            align: 'center',
            color: '#ffffff',
            fontSize: 16,
          },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 24,
          interval: 3,
          axisLabel: {
            align: 'right',
            fontSize: 16,
            formatter: '{value}%',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fff',
            },
          },
        },
        series: [
          {
            type: 'custom',
            renderItem: (params, api) => {
              const batches = this.batch?.map((item) => {
                return {
                  start: item.startTime,
                  end: item.endTime,
                  batch: `批次${item.batchNumber}`,
                  color: '#0b8dc0',
                  quantity: 0.18 || item.quantity,
                  // quantity: item.quantity,
                }
              })

              const categoryIndex = params.dataIndex
              const batch = batches[categoryIndex] || {
                batch: '',
                color: '',
                quantity: 0,
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
                  textVerticalAlign: 'middle',
                  fill: '#fff',
                  x: x1 + (x2 - x1) / 2,
                  y: y2 + (y1 - y2) / 2,
                },
              }

              return {
                type: 'group',
                children: [rectShape, textConfig],
              }
            },
            data: [0, 1, 2, 3, 4, 5, 6],
            markLine: {
              silent: false,
              data: [
                {
                  yAxis: this.forecastW[0]?.quantity,
                  name: `${this.forecastW[0]?.quantity}%`,
                },
              ],
              lineStyle: {
                color: '#60a5fa',
                fontSize: 14,
              },
            },
          },
        ],
      }
      if (document.getElementById('waterLevel')) {
        this.waterLevelChart = this.$echarts.init(document.getElementById('waterLevel'))
        this.waterLevelChart.setOption(option)
      }
    },
  },
}
</script>

<template>
  <div class="p-0 page-container" style="height: calc(100vh - 45px)">
    <img
      src="@/assets/anqiBi/bg.png"
      class="fixed top-0 right-0 bottom-0 left-0 w-screen h-screen"
      loading="lazy"
    >

    <div class="box-border flex relative flex-col h-screen">
      <div class="flex justify-center items-start back-info">
        <div class="title">
          未来生产批次安排
        </div>
      </div>
      <div class="flex flex-col px-6 -mt-9">
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
          <!-- <div class="flex items-center ml-4">
            <svg-icon icon-class="weather" style="width: 15px; height: 15px" />
            <span class="ml-1 text-sm text-white">
              今日天气：{{ weatherInfo.condition }} {{ weatherInfo.temperature }}℃
            </span>
          </div> -->
        </div>
        <BlockCell
          class="flex flex-col flex-auto p-5 pt-1"
          :style="`height: ${
            forecastW.length > 4 ? '43vh' : forecastW.length > 2 ? '60vh' : '76vh'
          }`"
        >
          <div class="flex items-center h-full">
            <div class="flex flex-col h-full">
              <div class="flex items-center">
                <div
                  class="flex items-center my-3 mr-4 h-12 text-5xl font-bold text-white"
                >
                  未来第
                  <span
                    class="flex justify-center items-center px-2 py-1 mx-1 w-10 h-10 font-mono text-white bg-lime-500 rounded transform skew-y-6"
                  >
                    <span class="text-3xl">1</span>
                  </span>
                  天
                </div>

                <ESelect label="选择站点" @getValue="onselect" />
              </div>
              <div class="flex items-center h-full" style="margin: 2vh 0 2vh">
                <div
                  class="flex flex-col justify-center items-center h-full"
                  style="width: 15vw"
                >
                  <div
                    v-for="(item, index) in iconVariable"
                    :key="item.value"
                    class="box-border flex items-center p-3 mx-1 h-7 bg-blue-50 rounded-full min-w-4"
                    :style="index === 1 ? 'margin: 6vh 0' : ''"
                  >
                    <svg-icon
                      :icon-class="item.icon"
                      style="width: 1rem; height: 1rem"
                      :color="item.color"
                    />
                    <span class="flex items-center ml-2 text-sm text-black">{{ item.value }}{{ forecastW[0][item.prop] }}</span>
                  </div>
                </div>
                <div class="flex flex-auto justify-start items-center m-auto mx-2">
                  <div
                    class="flex relative justify-center items-center bg-white rounded-full"
                    style="width: 12vw; height: 12vw; margin: 0 3vw; margin-right: 7vw"
                  >
                    <div
                      class="box-border flex z-10 flex-col justify-center items-center bg-blue-100 rounded-full"
                      style="width: 10vw; height: 10vw"
                    >
                      <div class="flex justify-center items-end font-bold text-sky-400">
                        <div class="mr-1" style="font-size: 1.5vw">
                          {{ Number(forecastW[0].inflow) }}%
                        </div>
                        <svg-icon
                          icon-class="waterLevel"
                          style="width: 3vw; height: 3vw"
                        />
                      </div>
                      <div class="text-black" style="font-size: 1.1vw; margin-top: 7px">
                        预测来水百分比
                      </div>
                    </div>
                    <div :class="getCircle" style="width: 12vw; height: 12vw" />
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

            <div class="box-border flex flex-col flex-auto py-1 h-full align-right">
              <div class="flex justify-center items-center h-full">
                <div id="waterLevel" style="width: 40vw; min-height: 37vh" />
              </div>
            </div>
          </div>
        </BlockCell>

        <div class="box-border flex flex-wrap my-2 w-full">
          <BlockCell
            v-for="(item, index) in forecastW"
            :key="index"
            class="box-border flex justify-center p-2 my-3"
            :class="index !== 0 ? (index % 2 !== 0 ? 'mr-6' : '') : 'hidden'"
            style="width: calc((100% - 24px) / 2); height: 14vh"
          >
            <ForecastW :index="index" :form="item" />
          </BlockCell>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.back-info {
  width: 100%;
  height: 15vh;
  background-image: url("~@/assets/anqiBi/top.png");
  background-size: 100% 100%;
  .title {
    width: 40%;
    height: 15vh;
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
  height: 12vw;
  overflow: hidden;
  display: flex;
  width: 12vw;
  z-index: 99;
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
