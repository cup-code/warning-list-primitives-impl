<script>
import CardItem from './cardItem'

export default {
  name: 'anqiBiMid',
  components: { CardItem },
  data() {
    return {
      chart: {
        width: 46,
        height: 22,
        labelTxt: true,
      },
      allCharts: {
        chart_riskWork: null, // 安全考核
      },

      companyNames: [
        { name: '全球', id: 'earth01' },
        { name: '中国', id: 'china02' },
        { name: '地市', id: 'yichang03' },
      ],
      currCompanyId: 'earth01',
      // 公司名称
      currName: '总公司',
      // 公司 简介
      introduction: '股份有限公司是从事产品生产经营',
      showIntroduce: false,
    }
  },
  mounted() {
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 关闭公司简介
    closeIntroduce() {
      this.showIntroduce = false
    },
    companyNameInMap(name, introduction) {
      this.currName = name
      this.introduction = introduction
    },
    selectCompany(index, id) {
      this.currCompanyId = id
      this.$emit('setMapImage', index)
    },

    /* 重置图表大小 */
    resizeCharts() {
      for (const key in this.allCharts) {
        if (this.allCharts[key]) {
          this.allCharts[key].resize()
        }
      }
    },
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 初始化图表
    initAll() {
      const examineSeries = [
        {
          name: '动火作业',
          data: [32, 30, 30, 33, 39, 33, 32],
        },
        {
          name: '受限空间',
          data: [12, 13, 10, 13, 9, 23, 10, 13],
        },
        {
          name: '高处作业',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
        {
          name: '临时用电',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
        {
          name: '断路作业',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
        {
          name: '动土作业',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
        {
          name: '吊装作业',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
        {
          name: '盲板抽堵',
          data: [32, 30, 30, 33, 39, 33, 32, 30],
        },
      ]
      examineSeries.forEach((item) => {
        item.barWidth = 50
        item.type = 'bar'
        item.stack = 'total'
      })
      this.initChart('chart_riskWork', {
        color: [
          '#faaa41',
          '#00aaff',
          '#ffd46f',
          '#ff8c7e',
          '#fff7e4',
          '#00decb',
          '#6763fc',
          '#71613e',
        ],
        grid: {
          left: '6%',
          top: '15%',
          bottom: '5%',
          width: '90%',
          containLabel: true,
        },
        legend: {
          width: '90%',
          left: '12%',
          top: '0%',
          orient: 'horizontal',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 13,
          textStyle: {
            color: '#fff',
            fontSize: '2px',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLabel: {
            color: '#FEFFFF',
          },
          axisLine: {
            // 坐标轴 轴线
            show: true,
            lineStyle: {
              color: '#76859f',
            },
          },
          axisTick: {
            // 坐标轴 刻度线
            show: false,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          splitNumber: 4,
          axisLabel: {
            color: '#FEFFFF',
          },
          axisLine: {
            // 坐标轴 轴线
            show: true,
            lineStyle: {
              color: '#76859f',
            },
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        series: examineSeries,
      })
    },
  },
}
</script>

<template>
  <div class="anqi-BiMid">
    <div class="chart">
      <CardItem
        title="危险作业"
        :width="chart.width"
        :height="chart.height"
        :labelTxt="chart.labelTxt"
      >
        <div
          id="chart_riskWork"
          class="chart-content"
        />
      </CardItem>
    </div>
    <div
      v-show="showIntroduce"
      class="company-introduce"
    >
      <!-- 按钮 -->
      <button
        class="closeButton"
        @click="closeIntroduce"
      >
        &times;
      </button>
      <div class="button-div">
        <!-- <router-link :to="{ path: '/map3d' }" class="button-link">ESH看板</router-link> -->
        <router-link
          :to="{ path: '/map3d' }"
          class="button-link"
        >
          安环一张图
        </router-link>
      </div>
      <div class="text-div">
        <span>{{ currName }}:</span>
        <p>{{ introduction }}</p>
      </div>
    </div>
    <div class="company-name">
      <button
        v-for="(item, index) in companyNames"
        :key="index"
        class="button"
        :style="{ color: currCompanyId === item.id ? '#fff204' : '' }"
        @click="selectCompany(index, item.id)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.anqi-BiMid {
  .chart {
    width: 46vw;
    height: 22vh;
    position: absolute;
    bottom: 0.5vh;
    background-image: url('~@/assets/anqiBi/bottomBg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .chart-content {
      width: 46vw;
      height: 15vh;
    }
  }

  .company-introduce {
    width: 60vh;
    height: 27vh;
    position: absolute;
    left: 24vh;
    bottom: 25vh;
    background-image: url('~@/assets/anqiBi/texBox.png');
    background-repeat: no-repeat;
    background-size: 100%, 100%;

    .closeButton {
      position: relative;
      margin: 10px 10px;
      float: right;
      background-color: transparent;
      color: rgb(255, 255, 255);
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
    .closeButton:hover {
      color: #409eff;
    }

    .button-div {
      padding-top: 6px;
      display: flex;
      justify-content: flex-start;
      .button-link {
        width: 90px;
        height: 30px;
        margin: 0px 6px 0px 6px;
        font-size: 12px;
        text-align: center;
        line-height: 24px;
        color: #fff;
        background-image: url('~@/assets/anqiBi/titleTiemBg2.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        background-color: transparent;
        border-style: none;
        cursor: pointer;
      }
      .button-link:hover {
        color: #fff204;
      }
    }
    .text-div {
      height: 19vh;
      overflow-x: hidden;
      /* 超出后显示 */
      overflow-y: auto;
      color: #ffffff;
      margin-right: 5px;
      padding: 5px 2px 0px 18px;
      font-size: 0.9vw;
      line-height: 3vh;
      p {
        margin: 0px;
      }
    }
    /* 整个滚动条 */
    .text-div::-webkit-scrollbar {
      /* 对应纵向滚动条的宽度 */
      width: 10px;
      /* 对应横向滚动条的宽度 */
      height: 10px;
    }

    /* 滚动条上的滚动滑块 */
    .text-div::-webkit-scrollbar-thumb {
      background-color: #49b1f5;
      border-radius: 32px;
    }

    /* 滚动条轨道 */
    .text-div::-webkit-scrollbar-track {
      background-color: #ffffff1d;
      border-radius: 32px;
    }
  }

  .company-name {
    position: absolute;
    bottom: 25vh;
    background-image: url('~@/assets/anqiBi/companyBox.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    padding-top: 3px;
    button {
      width: 76px;
      margin: 6px 6px 6px 6px;
      padding: 6px;
      font-size: 14px;
      color: #fff;
      background-color: transparent;
      border-style: none;
      cursor: pointer;
    }
    button:hover {
      color: #fff204;
      font-size: 14px;
    }
  }
}
</style>
