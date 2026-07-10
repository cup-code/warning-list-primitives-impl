<script>
import CardItem from '../components/cardItem'
import options from './Chart.js'
import ClientList from './clientList'

export default {
  name: 'ClientRight',
  components: {
    CardItem,
    ClientList,
  },
  data() {
    return {
      labelTxt: true,
      tableData: {
        head: ['问题描述', '设备名称', '报警时间', '操作'],
        list: [
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
          {
            problem: '电流过低报警',
            name: 'BM23-G102-2-012',
            time: '2024-07-15',
            local: '通知',
          },
        ],
      },
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
        chart_survey: null,
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
      this.initChart('chart_survey', options.survey)
    },
  },
}
</script>

<template>
  <div>
    <!-- 实时报警数据 -->
    <CardItem
      :height="30"
      title="实时报警数据"
    >
      <div class="content">
        <ClientList :listData="tableData" />
      </div>
    </CardItem>
    <CardItem
      :height="30"
      title="满意度调查"
    >
      <div
        id="chart_survey"
        class="content"
      />
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 25vw;
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;

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
