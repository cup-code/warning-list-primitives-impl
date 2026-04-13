<script>
import {
  machineCompanyList,
  machineIndustryList,
  machineRegionList,
} from '@/http/videoWarning/warning-api'
import CardItem from '../components/cardItem'
import options from './leftChart'

export default {
  name: 'OperateLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      companyList: [
        { industry: '污水', count: 0 },
        { industry: '固废', count: 0 },
        { industry: '供水', count: 0 },
      ],
      manufacturerList: [],
      allCharts: {
        chart_product: null,
        chart_assessment: null,
      },
      regionList: [],
      chartOptions: JSON.parse(JSON.stringify(options)),
    }
  },
  async mounted() {
    this.initAll() // 初始化所有图表
    await this.loadAllData() // 加载所有数据
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
      this.initChart('chart_product', this.chartOptions.product)
      this.initChart('chart_assessment', this.chartOptions.assessment)
    },

    // 更新图表数据
    updateCharts() {
      if (this.allCharts.chart_product) {
        const productOption = {
          xAxis: {
            data: this.manufacturerList.map(item => item.manufacturer || '未知厂商'),
          },
          series: {
            data: this.manufacturerList.map(item => item.count || 0),
          },
        }
        this.allCharts.chart_product.setOption(productOption)
      }

      if (this.allCharts.chart_assessment) {
        // 获取区域分布总数
        const totalCount = this.regionList.reduce(
          (sum, item) => sum + (item.count || 0),
          0,
        )

        // 确保与 assessmentList 中的区域名称顺序对应
        const assessmentData = [
          { name: '东北', value: 0 },
          { name: '华北', value: 0 },
          { name: '华东', value: 0 },
          { name: '华中', value: 0 },
          { name: '华南', value: 0 },
          { name: '西南', value: 0 },
          { name: '西北', value: 0 },
        ]

        // 更新区域数据
        this.regionList.forEach((item) => {
          const region = item.region || '未知区域'
          const existingRegion = assessmentData.find(r => r.name === region)
          if (existingRegion) {
            existingRegion.value = item.count || 0
          }
          else {
            // 如果是新区域，添加到列表中
            assessmentData.push({
              name: region,
              value: item.count || 0,
            })
          }
        })

        const assessmentOption = {
          legend: {
            show: true,
            data: assessmentData.map(item => item.name),
          },
          series: [
            {
              label: {
                normal: {
                  formatter:
                    `{total|${totalCount}}` + `\n\r` + `{active|` + `分布数量` + `}`,
                },
              },
              data: assessmentData,
            },
          ],
        }
        this.allCharts.chart_assessment.setOption(assessmentOption)
      }
    },

    async getMachineIndustryList() {
      try {
        const res = await machineIndustryList()
        if (res.data && res.data.result) {
          this.companyList = this.companyList.map((s) => {
            const found = res.data.result.find(item => s.industry === item.industry)
            return {
              industry: s.industry,
              count: found ? found.count : 0,
            }
          })
        }
      }
      catch (error) {
        console.error('获取行业数据失败:', error)
      }
    },

    async getMachineCompanyList() {
      try {
        const res = await machineCompanyList()
        if (res.data && res.data.result) {
          this.manufacturerList = res.data.result
          this.updateCharts()
        }
      }
      catch (error) {
        console.error('获取厂商数据失败:', error)
      }
    },

    async getMachineRegionList() {
      try {
        const res = await machineRegionList()
        if (res.data && res.data.result) {
          this.regionList = res.data.result
          this.updateCharts()
        }
      }
      catch (error) {
        console.error('获取区域数据失败:', error)
      }
    },

    // 加载所有数据
    async loadAllData() {
      await this.getMachineIndustryList()
      await this.getMachineCompanyList()
      await this.getMachineRegionList()
    },
  },
}
</script>

<template>
  <div style="height: 100%">
    <CardItem title="不同行业一体机数量" :height="26">
      <div class="content-column">
        <div v-for="(item, index) in companyList" :key="index" class="items">
          <div class="items-label">
            {{ item.industry }}：
          </div>
          <div class="items-num">
            {{ item.count }}
          </div>
        </div>
      </div>
    </CardItem>

    <CardItem :height="30" title="一体机厂商统计">
      <div id="chart_product" class="content" />
    </CardItem>
    <!-- 区域分布 -->
    <CardItem :height="30" title="区域分布">
      <div id="chart_assessment" class="content" />
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
          content: "";
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
