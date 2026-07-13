<script>
import CardItem from '../components/cardItem'
import options from '../operationChart/leftChart'

export default {
  name: 'OperateLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      companyList: [
        { text: '污水：', num: 8 },
        { text: '固废：', num: 3 },
        { text: '供水：', num: 4 },
      ],
      allCharts: {
        chart_product: null,
        chart_assessment: null,
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
      this.initChart('chart_product', options.product)
      this.initChart('chart_assessment', options.assessment)
    },
  },
}
</script>

<template>
  <div style="height: 100%">
    <CardItem
      title="不同行业公司数量"
      :height="26"
    >
      <div class="content-column">
        <div
          v-for="(item, index) in companyList"
          :key="index"
          class="items"
        >
          <div class="items-label">
            {{ item.text }}
          </div>
          <div class="items-num">
            {{ item.num }}
          </div>
        </div>
      </div>
    </CardItem>

    <CardItem
      :height="30"
      title="产品类别"
    >
      <div
        id="chart_product"
        class="content"
      />
    </CardItem>
    <!-- 区域分布 -->
    <CardItem
      :height="30"
      title="区域分布"
    >
      <div
        id="chart_assessment"
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
  padding: 0 10px 10px;
  box-sizing: border-box;

  &-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 25vw;
    height: 90%;
    .items {
      display: flex;
      align-items: center;
      margin: 4% 0;
      margin-left: 50%;
      width: 100%;
      font-weight: bold;
      font-size: 22px;

      &-label {
        position: relative;
        &::after {
          position: absolute;
          left: -20px;
          top: 50%;
          transform: translateY(-50%);
          content: '';
          height: 10px;
          width: 10px;
          background-color: var(--ky-primary);
        }
      }

      &-num {
        color: #00d8ff;
      }
    }
  }
}

.assessment-type {
  width: 15vw;
  height: 5vh;
  z-index: 2;
  position: absolute;
  top: 30%;
  left: 35%;
  display: flex;
  flex-wrap: wrap;
  line-height: 4.5vh;
  text-align: center;
  font-size: 0.8vw;

  .assessment-type-item {
    width: 7vw;
    height: 4.5vh;
    margin-right: 0.5vw;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}

.assessment-data {
  width: 8vw;
  height: 10vh;
  margin-left: 1vw;
  position: absolute;
  top: 53%;
  left: 65%;
  display: flex;
  flex-wrap: wrap;
  line-height: 3vh;
  //text-align: center;
  font-size: 0.9vw;

  .assessment-data-item {
    width: 8vw;
    height: 3vh;
  }
}

//.assessment-perBg1{
//  width: 15vh;
//  height: 15vh;
//  position: absolute;
//  top: 31%;
//  left: 5.7%;
//  background-image: url('~@/assets/anqiBi/perBg1.png');
//  background-repeat: no-repeat;
//  background-size: 100% 100%;
//}
</style>
