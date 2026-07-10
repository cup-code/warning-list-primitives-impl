/* * @Author: xiaorui 特种设备统计页面 * @Date: 2023-04-19 10:25:38 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-08 10:03:45 */
<script>
import {
  getCountByEquipmentTypeAndParamKey,
  getCountByStatusFn,
  getCountByTypeFn,
} from '@/http/specialEquipment/management-api'

export default {
  data() {
    return {
      timer: null,
      loading: false,
      numCountList: [], // 统计数量列表
      pipelineLength: 0, // 蒸汽管道设备的长度
      leftPie: null,
      rightPie: null,
      leftOption: {
        title: {
          text: '特种设备类别统计',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '特种设备类别统计',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            labelLine: {
              show: false,
            },
            colorBy: 'data',
            data: [],
          },
        ],
      },
      rightOption: {
        title: {
          text: '特种设备状态统计',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '特种设备状态统计',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            labelLine: {
              show: false,
            },
            colorBy: 'data',
            data: [],
          },
        ],
      },
    }
  },
  computed: {
    /* 设置背景高度 */
    setHeight() {
      const settings = this.$store.state.settings
      let height = '50px'
      if (settings.tagModel && settings.layout !== 'lr') {
        height = '100px'
      }
      return `height:calc(100vh - ${height})`
    },
  },
  created() {
    this.allEquipmentType = this.$dictUtils.getDictList('special_equipment_type') || []
    const companyId = this.$store.state.user.user.companyId
    // 获取蒸汽管道设备的长度
    this.getPipelineLength(companyId)
  },
  mounted() {
    this.$nextTick(() => {
      this.leftPie = this.$echarts.init(document.getElementById('leftPie'))
      this.rightPie = this.$echarts.init(document.getElementById('rightPie'))
      // 获取各个类型数量
      this.getCountByType()
      this.getCountByStatus()
    })
  },
  methods: {
    getCountByType() {
      this.loading = true
      getCountByTypeFn()
        .then(({ data }) => {
          if (data.success) {
            const result = data.result || []
            // 没有的类型，则要赋值为0
            this.numCountList = this.allEquipmentType.map((item) => {
              const currentObj = result.find((type) => {
                return item.dictCode === type.type
              })
              if (currentObj) {
                return {
                  type: currentObj.type,
                  typeName: this.$dictUtils.getDictLabel(
                    'special_equipment_type',
                    currentObj.type,
                    '--',
                  ),
                  count: currentObj.count,
                }
              }
              else {
                return {
                  type: item.dictCode,
                  typeName: item.dictName,
                  count: 0,
                }
              }
            })
            // 计算总数
            let total = 0
            for (const item of this.numCountList) {
              total += item.count || 0
            }
            console.log(total)
            const dataList = this.numCountList.map((item) => {
              return {
                value: item.count,
                name: `${item.typeName + (item.count || 0)}个${(
                  ((item.count || 0) * 100)
                  / total
                ).toFixed(2)}%`,
              }
            })
            this.leftOption.series[0].data = dataList
            this.leftPie.setOption(this.leftOption)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    getCountByStatus() {
      getCountByStatusFn().then(({ data }) => {
        const result = data.result || []
        let total = 0
        for (const item of result) {
          total += item.count || 0
        }
        const dataList = result.map((item) => {
          item.statusName = item.status === '1' ? '在用' : item.status === '2' ? '报废' : '待注册'
          return {
            value: item.count,
            name: `${item.statusName + (item.count || 0)}个${(
              ((item.count || 0) * 100)
              / total
            ).toFixed(2)}%`,
          }
        })
        this.rightOption.series[0].data = dataList
        this.rightPie.setOption(this.rightOption)
      })
    },
    getPipelineLength(companyId) {
      getCountByEquipmentTypeAndParamKey(companyId, '6', 'length').then(({ data }) => {
        this.pipelineLength = data.result || 0
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="loading"
    class="count-container"
    :style="setHeight"
  >
    <div class="count-row">
      <div
        v-for="item in numCountList"
        :key="item.type"
        class="count-col"
      >
        <p>{{ item.typeName }}</p>
        <span>
          <span>{{ item.count }}</span>
          {{ item.type === '6' ? `处/${pipelineLength}米` : '个' }}
        </span>
      </div>
    </div>
    <div class="chart-area">
      <div id="leftPie" />
      <div id="rightPie" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.count-container {
  height: 100%;
  background: #f6fafe;
  width: 100%;
  padding: 20px;

  .count-row {
    height: calc(20% - 10px);
    display: flex;
    justify-content: space-between;
  }

  .count-col {
    height: 100%;
    width: 12%;
    padding: 10px 5px;
    border-radius: 5px;
    background: white;
    box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    p {
      font-size: 16px;
      margin: 0 0 5px 0;
    }

    span {
      font-size: 14px;

      span {
        font-weight: bold;
        font-size: 30px;
      }
    }
  }

  .chart-area {
    height: 80%;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;

    #leftPie,
    #rightPie {
      height: 100%;
      width: 49%;
      border-radius: 5px;
      background: white;
      box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
      padding: 5px;
    }
  }
}
</style>
