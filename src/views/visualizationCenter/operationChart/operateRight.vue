<script>
import CardItem from '../components/cardItem'
import EList from '../components/EList'
import options from '../operationChart/rightChart'

export default {
  name: 'OperateRight',
  components: {
    CardItem,
    EList,
  },
  data() {
    return {
      tableData: {
        head: ['', '用户', '到期时间', '剩余时间'],
        list: [
          { name: '集团A', time: '2025-10-31', local: '216天' },
          { name: '集团B', time: '2025-05-31', local: '75天' },
          { name: '集团C', time: '2025-08-31', local: '150天' },
        ],
      },
      allCharts: {
        chart_statics: null,
        chart_failureType: null,
      },
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
      this.initChart('chart_statics', options.statics)
      this.initChart('chart_failureType', options.failureType)
    },
  },
}
</script>

<template>
  <div>
    <!-- 工单状态统计 -->
    <CardItem
      :height="30"
      title="状态统计"
    >
      <div
        id="chart_statics"
        class="content"
      />
    </CardItem>
    <!-- 故障类型分布 -->
    <CardItem
      :height="30"
      title="类型统计"
    >
      <div
        id="chart_failureType"
        class="content"
      />
    </CardItem>
    <!-- 流量卡欠费到期时间  -->
    <CardItem
      :height="30"
      title="到期时间"
    >
      <div class="content">
        <EList
          v-slot="props"
          :listData="tableData"
        >
          <!-- <view slot="residue">
            {{ getResidue(props) }}
          </view> -->
        </EList>
      </div>
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
