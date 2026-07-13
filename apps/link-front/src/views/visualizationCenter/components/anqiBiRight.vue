<script>
import CardItem from './cardItem'

export default {
  name: 'anqiBiLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      labelTxt: true,
      weeklyCheck: [
        { name: '按周', icon: require('@/assets/anqiBi/titleTiemBg1.png') },
        { name: '按月', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
        { name: '按年', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
      ],
      weeklyMeeting: [
        { name: '按周', icon: require('@/assets/anqiBi/titleTiemBg1.png') },
        { name: '按月', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
        { name: '按年', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
      ],
      emergencyList: {
        totalName: '演练次数',
        totalCount: 0, // 20215
        category: [
          { name: '综合实战演练', count: 550, peoples: 150 },
          { name: '综合桌面演练', count: 650, peoples: 150 },
          { name: '单次实战演练', count: 615, peoples: 150 },
          { name: '示范演练', count: 450, peoples: 150 },
        ],
      },
      reviewData: [
        { attribute: '新材料', review: '85%', use: '95%', yanShou: '5%' },
        { attribute: '新设备', review: '99%', use: '100%', yanShou: '1%' },
        { attribute: '新工艺', review: '100%', use: '100%', yanShou: '0%' },
        { attribute: '新技术', review: '100%', use: '100%', yanShou: '0%' },
      ],
      allCharts: {
        chart_weeklyCheck: null,
        chart_weeklyMeeting: null,
      },
    }
  },
  mounted() {
    this.exerciseTotal()
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 演练次数累加
    exerciseTotal() {
      this.emergencyList.category.forEach((item) => {
        this.emergencyList.totalCount += item.count
      })
    },
    selectData(item, type) {
      if (type == 'weeklyCheck') {
        this.weeklyCheck.forEach((data) => {
          if (data.name == item.name) {
            data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
          }
          else {
            data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
          }
        })
      }
      else if (type == 'weeklyMeeting') {
        this.weeklyMeeting.forEach((data) => {
          if (data.name == item.name) {
            data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
          }
          else {
            data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
          }
        })
      }
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
    // 初始化图表  周检
    initAll() {
      const weeklyCheckSeries = [3, 6, 8, 260]
      this.initChart('chart_weeklyCheck', {
        grid: {
          left: '5%',
          right: '1%',
          bottom: '5%',
          top: '15%',
          width: '90%',
          containLabel: true,
        },
        tooltip: {
          axisPointer: {
            type: 'shadow',
          },
        },
        yAxis: {
          data: ['缺席', '休假', '出差', '参与'],
          axisLabel: {
            inside: false,
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            label: {
              show: true,
              margin: 30,
            },
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
        xAxis: {
          axisLabel: { color: '#fff' },
          axisLine: {
            // 坐标轴 轴线
            show: true,
            lineStyle: {
              color: '#76859f',
            },
          },
          axisTick: {
            // 坐标轴 刻度线
            show: true,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        series: [
          {
            type: 'pictorialBar',
            label: {
              show: false,
              color: '#ffffff',
              position: 'right',
              offset: [10, 0],
              fontSize: 16,
            },
            itemStyle: {
              color: '#00aaff',
              // color: new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
              //   { offset: 0, color: '#83bff6' },
              //   { offset: 0.5, color: '#188df0' },
              //   { offset: 1, color: '#188df0' }
              // ])
            },
            symbol: 'roundRect',
            symbolRepeat: true,
            symbolSize: ['40%', '80%'],
            barCategoryGap: '35%',
            data: weeklyCheckSeries,
          },
        ],
      })

      // 周会
      const weeklyMeetingSeries = [5, 9, 8, 256]
      this.initChart('chart_weeklyMeeting', {
        grid: {
          left: '5%',
          right: '1%',
          bottom: '5%',
          top: '15%',
          width: '90%',
          containLabel: true,
        },
        tooltip: {},
        xAxis: {
          axisLabel: {
            color: '#fff',
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
            show: true,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        yAxis: {
          data: ['缺席', '休假', '出差', '参与'],
          axisLabel: {
            inside: false,
            color: '#fff',
            fontSize: 14,
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
        series: [
          {
            type: 'bar',
            barWidth: 15,
            showBackground: true,
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#0794c4' },
                { offset: 0.5, color: '#1d7ec8' },
                { offset: 1, color: '#2a7ac4' },
              ]),
              shadowBlur: 5.5,
              shadowColor: 'rgba(83, 101, 166, 1)',
              // shadowOffsetY: 3,
              shadowOffsetX: 3,
            },
            data: weeklyMeetingSeries,
          },
        ],
      })
    },
  },
}
</script>

<template>
  <div>
    <!-- 安全奖励 -->
    <CardItem
      title="应急演练"
      :labelTxt="labelTxt"
    >
      <div class="content">
        <div class="total">
          <div class="total-name">
            {{ emergencyList.totalName }}
          </div>
          <div class="total-count">
            {{ emergencyList.totalCount }}
          </div>
          <div class="total-img" />
        </div>
        <div class="category">
          <div
            v-for="(item, index) in emergencyList.category"
            :key="index"
            class="category-item"
          >
            <div class="category-item-count">
              {{ item.count }}
              <span style="font-size: 12px; color: #ffffff">次</span>
            </div>
            <div class="category-item-peoples">
              {{ item.peoples }}
              <span style="font-size: 5px; color: #ffffff; font-weight: 100">人</span>
            </div>
            <div class="category-item-img" />
            <div class="category-item-name">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </CardItem>
    <!-- 四新评审 -->
    <CardItem
      title="四新评审"
      :labelTxt="labelTxt"
    >
      <div class="content">
        <el-row
          style="font-size: 0.9vw; font-weight: 700"
          class="review-table-tr"
        >
          <el-col :span="2">
            排名
          </el-col>
          <el-col :span="5">
            性质
          </el-col>
          <el-col :span="5">
            评审通过
          </el-col>
          <el-col :span="6">
            可投入使用
          </el-col>
          <el-col :span="6">
            再次整改验收
          </el-col>
        </el-row>
        <el-row
          v-for="(item, index) in reviewData"
          :key="index"
          class="review-table-tr"
          :style="`background-image:url(${require('@/assets/anqiBi/tablebg.png').default});`"
        >
          <el-col :span="2">
            {{ index }}
          </el-col>
          <el-col
            :span="5"
            style="font-size: 0.7vw; font-weight: 400"
          >
            {{ item.attribute }}
          </el-col>
          <el-col
            :span="5"
            style="color: #00d2ff"
          >
            {{ item.review }}
          </el-col>
          <el-col
            :span="6"
            style="color: #00ffde"
          >
            {{ item.use }}
          </el-col>
          <el-col
            :span="6"
            style="color: #df8f49"
          >
            {{ item.yanShou }}
          </el-col>
        </el-row>
      </div>
    </CardItem>
    <!-- 周检 -->
    <CardItem title="周检">
      <div
        id="chart_weeklyCheck"
        class="content"
      />
      <div class="Meeting">
        <div
          v-for="(item, index) in weeklyCheck"
          :key="index"
          class="meeting-item"
        >
          <div
            class="meeting-item-img"
            :style="`background-image:url(${item.icon});`"
            @click="selectData(item, 'weeklyCheck')"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </CardItem>
    <!-- 周会 -->
    <CardItem title="周会">
      <div
        id="chart_weeklyMeeting"
        class="content"
      />
      <div class="Meeting">
        <div
          v-for="(item, index) in weeklyMeeting"
          :key="index"
          class="meeting-item"
        >
          <div
            class="meeting-item-img"
            :style="`background-image:url(${item.icon});`"
            @click="selectData(item, 'weeklyMeeting')"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 25vw;
  height: 16vh;
  display: flex;
  flex-wrap: wrap;

  .total {
    width: 10vw;
    height: 16vh;
    padding-left: 1vw;
    position: relative;
    .total-img {
      width: 5.5vw;
      height: 14vh;
      margin: 1vh 1.5vw 1vh 2vw;
      background-image: url('~@/assets/anqiBi/base1.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    .total-name {
      position: absolute;
      width: 5vw;
      top: 25%;
      left: 30%;
      text-align: center;
      font-size: 1.1vw;
      font-weight: 600;
      background-image: linear-gradient(
        to bottom,
        #00d8ff 20%,
        #feffff
      ); /* 线性渐变背景，方向向上 */
      -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
      -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
    }
    .total-count {
      position: absolute;
      width: 5vw;
      top: 5%;
      left: 30%;
      text-align: center;
      font-size: 1.7vw;
      font-weight: 700;
      background-image: linear-gradient(
        to bottom,
        #00d8ff 20%,
        #feffff
      ); /* 线性渐变背景，方向向上 */
      -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
      -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
    }
  }
  .category {
    width: 14vw;
    height: 16vh;
    display: flex;
    flex-wrap: wrap;

    .category-item {
      width: 7vw;
      height: 8vh;
      position: relative;
      .category-item-img {
        width: 5vw;
        height: 7vh;
        margin: 1vh 1vw 0vh 0vw;
        background-image: url('~@/assets/anqiBi/Base2.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
      .category-item-count {
        position: absolute;
        width: 5vw;
        top: 15%;
        left: 0;
        text-align: center;
        font-size: 1.2vw;
        font-weight: 600;
        color: #00d8ff;
      }
      .category-item-peoples {
        position: absolute;
        width: 5vw;
        top: 45%;
        left: 0;
        text-align: center;
        font-size: 0.7vw;
      }
      .category-item-name {
        width: 5vw;
        position: absolute;
        top: 90%;
        left: 0;
        text-align: center;
        font-size: 0.6vh;
        font-weight: 200;
      }
    }
  }
  .review-table-tr {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 23vw;
    height: 3vh;
    margin: 0 1vw;
    text-align: center;
    line-height: 3vh;
  }
}
.Meeting {
  width: 12vw;
  height: 3vh;
  position: absolute;
  top: 25%;
  left: 8%;
  display: flex;
  flex-wrap: wrap;
  .meeting-item {
    width: 3.75vw;
    height: 3vh;
    margin: 0 0.25vw 0 0;
    .meeting-item-img {
      width: 3.75vw;
      height: 3vh;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      line-height: 3vh;
      text-align: center;
      font-size: 0.8vw;
    }
  }
}
</style>
