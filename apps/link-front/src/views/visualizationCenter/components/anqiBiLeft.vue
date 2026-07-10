<script>
import CardItem from './cardItem'
// 违规统计表
import illegalTable from './illegalTable.vue'

export default {
  name: 'anqiBiLeft',
  components: {
    CardItem,
    IllegalTable: illegalTable,
  },
  data() {
    return {
      // 安全奖励数据
      userList: [
        {
          name: '隐患举报',
          count: 1500,
          icon: require('@/assets/anqiBi/riskicon.png'),
        },
        {
          name: '三违举报',
          count: 1200,
          icon: require('@/assets/anqiBi/3Dicon.png'),
        },
        {
          name: '安全活动',
          count: 1500,
          icon: require('@/assets/anqiBi/anQuanicon.png'),
        },
        {
          name: '其他奖励',
          count: 1400,
          icon: require('@/assets/anqiBi/othericon.png'),
        },
      ],
      assessmentList: [
        { name: `违章指挥`, value: 14, sum: 2400, Proportion: '14%' },
        { name: '违反劳动纪律 ', value: 26, sum: 1000, Proportion: '26%' },
        { name: '违章操作', value: 30, sum: 1200, Proportion: '30%' },
        // { value: 30 }
      ],
      assessmentType: [
        {
          name: '内部人员违章',
          icon: require('@/assets/anqiBi/titleTiemBg1.png'),
        },
        {
          name: '第三方人员违章',
          icon: require('@/assets/anqiBi/titleTiemBg2.png'),
        },
      ],
      allCharts: {
        chart_assessment: null, // 安全考核
        chart_census: null, // 隐患统计
        chart_examine: null, // 外部检查
      },

      // dialog 弹窗
      dialogTitle: '违章指挥数据统计',
      showInfoDialog: false,
      illegalData: [],
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
    selectData(item) {
      this.assessmentType.forEach((data) => {
        if (data.name == item.name) {
          data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
        }
        else {
          data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
        }
      })
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
      this.initChart('chart_assessment', {
        color: ['#e1d45c', '#04c5be', '#00a2ff', '#013057'],
        legend: {
          type: 'scroll',
          pageIconColor: '#e1d45c',
          pageTextStyle: {
            color: '#fff',
          },
          left: '36%',
          top: '40%',
          orient: 'vertical',
          itemHeight: 12,
          itemWidth: 8,
          itemGap: 15,
          icon: 'roundRect',
          textAlign: 'center',
          textStyle: {
            color: '#fff',
            fontSize: '12',
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '50%'],
            left: '0%%',
            top: '0%',
            width: '40%',
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#ffffff',
                formatter: `{total|${4600}}` + `\n\r` + `{active|` + `考核金额` + `}`,
                rich: {
                  total: { fontSize: 20, color: '#ffffff' },
                  active: { fontSize: 12, color: '#ffffff' },
                },
              },
            },
            data: this.assessmentList,
          },
        ],
      })
      const censusSeries = [
        {
          name: '整改中',
          data: [10, 21, 5, 3, 0, 0, 8],
        },
        {
          name: '已验收',
          data: [150, 232, 200, 80, 0, 0, 190],
        },
        {
          name: '待验收',
          data: [20, 12, 0, 5, 0, 0, 30],
        },
        {
          name: '延期整改',
          data: [1, 3, 0, 1, 0, 0, 6],
        },
      ]
      censusSeries.forEach((item) => {
        item.barWidth = 8
        item.type = 'bar'
        item.itemStyle = {
          shadowBlur: 5.5,
          shadowColor: 'rgba(83, 101, 166, 1)',
          shadowOffsetY: 1,
          shadowOffsetX: 1,
        }
      })
      this.initChart('chart_census', {
        color: ['#2c8eef', '#05c5be', '#e1c35c', '#ef9364'],
        grid: {
          left: '5%',
          right: '1%',
          bottom: '0%',
          top: '15%',
          width: '90%',
          containLabel: true,
        },
        legend: {
          width: '90%',
          right: '5%',
          orient: 'horizontal',
          itemWidth: 8,
          itemHeight: 8,
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
          data: ['1月', '3月', '5月', '7月', '9月', '11月'],
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
            show: true,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        series: censusSeries,
      })

      // 外部监查
      const examineSeries = [
        {
          name: '已完成', // 已完成并回复
          data: [4, 3, 3, 4, 0, 0, 0],
          itemStyle: {
            shadowBlur: 5.5,
            shadowColor: 'rgba(83, 101, 166, 1)',
            shadowOffsetY: 1,
            shadowOffsetX: 1,
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#02afe7' },
              { offset: 0.5, color: '#0067ab' },
              { offset: 1, color: '#091773' },
            ]),
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
            },
          },
        },
        {
          name: '未完成', // 未到期
          data: [1, 1, 1, 1, 0, 0, 0],
          itemStyle: {
            shadowBlur: 5.5,
            shadowColor: 'rgba(83, 101, 166, 1)',
            shadowOffsetY: 1,
            shadowOffsetX: 1,
            color: '#01ddcf',
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
            },
          },
        },
      ]
      examineSeries.forEach((item) => {
        item.barWidth = 18
        item.type = 'bar'
        item.stack = 'Ad'
      })
      this.initChart('chart_examine', {
        grid: {
          left: '5%',
          right: '1%',
          bottom: '5%',
          top: '15%',
          width: '90%',
          containLabel: true,
        },
        legend: {
          width: '90%',
          right: '25%',
          orient: 'horizontal',
          itemWidth: 8,
          itemHeight: 8,
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
          // formatter:'{b}<br />{a0}:{c0}  %<br/>{a1}: {c1}%',
          // 百分比
          /* formatter(param) {
            return param[0].name+
            '<br/>' + param[0].seriesName+':'+(param[0].value/(param[0].value+param[1].value))*100+'%'+
            '<br/>' + param[1].seriesName+':'+(param[1].value/(param[0].value+param[1].value))*100+'%';
          } */
          formatter(param) {
            return (
              `${param[0].name
              }<br/>${
                param[0].seriesName
              }:${
                param[0].value}/${param[0].value + param[1].value
              }<br/>${
                param[1].seriesName
              }:${
                param[1].value}/${param[0].value + param[1].value}`
            )
          },
        },
        xAxis: {
          type: 'category',
          data: ['1月', '3月', '5月', '7月', '9月', '11月'],
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
  <div>
    <!-- 安全奖励 -->
    <CardItem title="安全奖励">
      <div class="content">
        <div
          v-for="(item, index) in userList"
          :key="index"
          class="jlItem"
        >
          <div
            class="sort-img"
            :style="`background-image:url(${item.icon});`"
          />
          <div style="width: 6vw; height: 6vh">
            <div class="sort-title">
              {{ item.name }}
            </div>
            <div class="sort-count">
              {{ item.count }}
              <span style="font-size: 0.5vw; color: #ffffff">元</span>
            </div>
          </div>
        </div>
      </div>
    </CardItem>
    <!-- 安全考核 -->
    <CardItem title="安全考核">
      <div class="assessment-type">
        <div
          v-for="(item, index) in assessmentType"
          :key="index"
          class="assessment-type-item"
          :style="`background-image:url(${item.icon});`"
          @click="selectData(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="assessment-data">
        <div
          v-for="(item, index) in assessmentList"
          v-if="item.name"
          :key="index"
          class="assessment-data-item"
        >
          {{ item.sum }}元 {{ item.Proportion }}
        </div>
      </div>
      <div
        id="chart_assessment"
        class="content"
      />
      <!--      <div class='assessment-perBg1'/> -->
    </CardItem>
    <!-- 隐患统计 -->
    <CardItem title="隐患统计">
      <div
        id="chart_census"
        class="content"
      />
    </CardItem>
    <!-- 外部检查 -->
    <CardItem title="外部检查">
      <div
        id="chart_examine"
        class="content"
      />
    </CardItem>
    <template>
      <el-dialog
        v-max-dialog
        class="div-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="70%"
        append-to-body
        :close-on-click-modal="false"
        top="8vh"
      >
        <illegalTable :tableData="illegalData" />
      </el-dialog>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 25vw;
  height: 16vh;
  display: flex;
  flex-wrap: wrap;

  .jlItem {
    width: 12vw;
    height: 8vh;
    display: flex;
    flex-wrap: wrap;

    .sort-img {
      width: 4vw;
      height: 6vh;
      margin: 0 1vw;
    }

    .sort-title {
      width: 6vw;
      height: 3vh;
      line-height: 3vh;
      letter-spacing: 1px;
    }

    .sort-count {
      width: 6vw;
      height: 3vh;
      font-size: 1.5vw;
      font-weight: 600;
      color: #00d8ff;
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
