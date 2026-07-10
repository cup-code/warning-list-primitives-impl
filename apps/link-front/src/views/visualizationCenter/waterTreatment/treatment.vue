<script>
import { ref } from 'vue'
import BlockCell from './BlockCell.vue'
import ForecastW from './ForecastW.vue'

export default {
  name: 'Treatment',
  components: {
    ForecastW,
    BlockCell,
  },
  setup() {
    const form = ref({})
    const forecastW = ref([
      { day: 2, percent: 64 },
      { day: 3, percent: 70 },
      { day: 4, percent: 30 },
      { day: 5, percent: 64 },
    ])
    const iconVariable = ref([
      { icon: 'temperature', value: '气温：常温日', color: '#fbbf24' },
      { icon: 'rain', value: '降雨：中雨', color: '#60a5fa' },
      { icon: 'vacation', value: '节假日：平常日', color: '#84cc16' },
    ])
    const getCircle = `absolute left-0 top-0 right-0 bottom-0 bg-blue-50  rounded-full animate-pulse opacity-7`

    return {
      form,
      forecastW,
      iconVariable,
      getCircle,
    }
  },
  data() {
    return {
      waterLevelChart: null,
      timeData: ['0~4', '8~12', '16~20', '20~24'],
    }
  },
  mounted() {
    this.initChart()
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
          right: '2%',
          bottom: '1%',
          top: '13%',
          width: '92%',
          containLabel: true,
        },
        tooltip: {},
        color: ['#60a5fa', '#f97316'],
        xAxis: {
          type: 'category',
          data: this.timeData,
          boundaryGap: true,
          axisLabel: {
            formatter: '{value} 时',
            align: 'center',
            fontSize: 16,
          },
          nameTextStyle: {
            fontSize: 16,
          },
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
          axisTick: {
            alignWithLabel: true,
            show: true,
            interval: 'auto',
            inside: true,
            lineStyle: {
              color: '#111111',
              width: 1,
            },
          },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 18,
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
          axisLabel: {
            align: 'right',
            fontSize: 16,
          },
        },
        series: [
          {
            type: 'bar',
            barWidth: '40%', // Adjust the width to span 4 hours
            data: [
              {
                value: 16.7,
                itemStyle: {
                  color: '#4d80bf',
                },
              },
              {
                value: 16.7,
                itemStyle: {
                  color: '#f78331',
                },
              },
              {
                value: 16.7,
                itemStyle: {
                  color: '#4d80bf',
                },
              },
              {
                value: 16.7,
                itemStyle: {
                  color: '#f78331',
                },
              },
            ],
            label: {
              show: true,
              position: 'inside',
              formatter: (index) => {
                console.log('dddd', index)
                return `批次${index.dataIndex + 1}`
              },
            },
            markLine: {
              data: [{ yAxis: 16.7, name: '16.7%' }],
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
  <div class="relative box-border flex flex-col">
    <div class="-mt-9 flex flex-col px-6">
      <div class="mx-2 mb-4 flex items-end justify-between">
        <div class="flex items-center">
          <svg-icon
            icon-class="timeIcon"
            style="width: 15px; height: 15px"
          />
          <span
            class="ml-1 text-sm text-white"
            style="font-size: clamp(12px, 1.5vw, 14px)"
          >当前日期：2025年1月日 10:00:00
          </span>
        </div>
        <div class="ml-4 flex items-center">
          <svg-icon
            icon-class="weather"
            style="width: 15px; height: 15px"
          />
          <span class="ml-1 text-sm text-white">今日天气：多云 10℃</span>
        </div>
      </div>
      <BlockCell
        class="flex flex-auto flex-col p-5 pt-1"
        style="height: 50vh"
      >
        <div class="flex h-full items-center">
          <div class="flex h-full flex-col">
            <div class="my-3 flex h-12 items-center text-5xl font-bold text-white">
              未来第
              <span
                class="mx-1 flex h-10 w-10 skew-y-6 transform items-center justify-center rounded bg-lime-500 px-2 py-1 font-mono text-white"
              >
                <span class="text-3xl">1</span>
              </span>
              天
            </div>
            <div
              class="flex h-full items-center"
              style="margin: 2vh 0 2vh"
            >
              <div
                class="flex h-full flex-col items-center"
                style="width: 15vw"
              >
                <div
                  v-for="item in iconVariable"
                  :key="item.value"
                  class="min-w-4 mx-1 my-auto box-border flex h-7 items-center rounded-full bg-blue-50 p-3"
                >
                  <svg-icon
                    :icon-class="item.icon"
                    style="width: 1rem; height: 1rem"
                    :color="item.color"
                  />
                  <span class="ml-2 flex items-center text-sm text-black">{{ item.value }}</span>
                </div>
              </div>
              <div class="m-auto mx-2 flex flex-auto items-center justify-start">
                <div
                  class="relative flex items-center justify-center rounded-full bg-white"
                  style="width: 12vw; height: 12vw; margin: 0 3vw; margin-right: 9vw"
                >
                  <div
                    class="z-10 box-border flex flex-col items-center justify-center rounded-full bg-blue-100"
                    style="width: 10vw; height: 10vw"
                  >
                    <div class="text-sky-400 flex items-end justify-center font-bold">
                      <span class="mr-1 text-4xl">64%</span>
                      <svg-icon
                        icon-class="waterLevel"
                        style="width: 3vw; height: 3vw"
                      />
                    </div>
                    <div class="text-base text-black">
                      预测来水百分比
                    </div>
                  </div>
                  <div
                    :class="getCircle"
                    style="width: 12vw; height: 12vw"
                  />
                  <div class="g-content animate-pulse">
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

          <div class="align-right box-border flex items-center py-1">
            <div
              id="waterLevel"
              style="width: 40vw; height: 40vh"
            />
          </div>
        </div>
      </BlockCell>

      <div class="my-2 box-border flex w-full flex-wrap">
        <BlockCell
          v-for="(item, index) in forecastW"
          :key="index"
          class="my-3 box-border flex justify-center p-2"
          :class="index % 2 === 0 ? 'mr-6' : ''"
          style="width: calc((100% - 24px) / 2); height: 14vh"
        >
          <ForecastW
            :index="index"
            :form="item"
          />
        </BlockCell>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>

<style lang="scss" scoped>
.back-info {
  width: 100%;
  height: 15vh;
  background-image: url('~@/assets/anqiBi/top.png');
  background-size: 100% 100%;
  .title {
    width: 40%;
    height: 15vh;
    margin: auto;
    text-align: center;
    background-image: linear-gradient(to top, #55c3fe 20%, #feffff); /* 线性渐变背景，方向向上 */
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
    width: 15vw;
    height: 8vw;
    position: absolute;
    bottom: -45px;
    left: -1vw;
    z-index: 99;
  }
}
</style>
