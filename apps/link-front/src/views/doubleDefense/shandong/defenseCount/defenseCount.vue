<script>
import { getDefenseCount } from '@/http/defense/defenseCount-api.js'
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant'
import CheckFinish from './components/CheckFinish.vue'
import { NumCountList } from './components/constant'
import DangeMsg from './components/DangeMsg.vue'
import NumCount from './components/NumCount.vue'
import RectifyFinish from './components/RectifyFinish.vue'
import RiskFinish from './components/RiskFinish.vue'
import RiskUnit from './components/RiskUnit.vue'

export default {
  components: {
    NumCount,
    RiskUnit,
    RiskFinish,
    CheckFinish,
    RectifyFinish,
    DangeMsg,
  },
  data() {
    return {
      timer: null,
      isLoading: false,
      numCountList: NumCountList, // 统计数量列表
      riskLevList: RiskLevel, // 风险等级统计列表
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
  mounted() {
    this.getInfoData()
    window.addEventListener('resize', this.resizeEvt)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeEvt)
  },
  methods: {
    getInfoData() {
      this.isLoading = true
      getDefenseCount()
        .then((res) => {
          if (res.data.success) {
            const result = res.data.result
            // 处理数量
            for (const item of this.numCountList) {
              item.num = result[item.key]
            }
            // 处理风险单元统计
            this.setRiskUnit(result.riskIdentificationLevelGroup || [])
            // 处理安全风险分析完成率
            this.setRiskFinish(result.riskAnalysisCompletionRate || [])
            // 处理排查任务完成率
            this.setCheckFinish(result.checkTaskCompletionRate || [])
            // 处理隐患整改率
            this.setRectifyFinish(result.hiddenTroubleRectificationVOS || [])
          }
          else {
            this.$message.warning(res.data.message || '获取统计信息失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取统计信息出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 处理风险单元统计 */
    setRiskUnit(resList) {
      for (const item of this.riskLevList) {
        for (const res of resList) {
          if (Number.parseInt(res.groupBy) === item.value) {
            item.num = res.amount
            break
          }
        }
      }
      // 计算总数
      let total = 0
      for (const item of this.riskLevList) {
        total += item.num || 0
      }
      // console.log(total)
      // console.log(this.riskLevList)
      const dataList = this.riskLevList.map((item) => {
        return {
          value: item.num,
          name: `${item.label + (item.num || 0)}个${(((item.num || 0) * 100) / total).toFixed(2)}%`,
          itemStyle: { color: item.color },
        }
      })
      this.$refs.riskUnit.setChart(dataList)
    },
    /* 处理安全风险分析完成率 */
    setRiskFinish(riskNum) {
      this.$refs.riskFinish.setChart(riskNum / 100)
    },
    /* 处理排查任务完成率 */
    setCheckFinish(checkList) {
      const xList = []
      const yList = []
      for (const item of checkList || []) {
        xList.push(`${item.groupBy}月`)
        yList.push(item.amount)
      }
      this.$refs.checkFinish.setChart(xList, yList)
    },
    /* 处理隐患整改率 */
    setRectifyFinish(rectifyList) {
      const xList = []
      // const yList = []
      // for (let item of rectifyList || []) {
      //   xList.push(item.groupBy + '月')
      //   yList.push(item.amount)
      // }
      const rectifiedCountArr = [] // 已整改数量
      const notRectifiedCountArr = [] // 未整改数量
      const rectificationRateArr = [] // 整改率
      rectifyList.forEach((item) => {
        xList.push(`${item.month}月`)
        rectifiedCountArr.push(item.rectifiedCount)
        notRectifiedCountArr.push(item.notRectifiedCount)
        rectificationRateArr.push(item.rectificationRate.toFixed(2))
      })
      const yList = [
        {
          name: '已整改数量',
          type: 'bar',
          color: '#67C23A',
          data: rectifiedCountArr,
        },
        {
          name: '未整改数量',
          type: 'bar',
          color: '#F56C6C',
          data: notRectifiedCountArr,
        },
        {
          name: '整改率(%)',
          type: 'line',
          color: '#138EFC',
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top',
            formatter(params) {
              return params.value > 0 ? `${params.value}%` : ''
            },
          },
          data: rectificationRateArr,
        },
      ]
      this.$refs.rectifyFinish.setChart(xList, yList)
    },
    /* 屏幕尺寸变化事件 */
    resizeEvt() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(this.doResize, 500)
    },
    /* 处理屏幕尺寸变化 */
    doResize() {
      this.$refs.riskUnit.resizeChart()
      this.$refs.riskFinish.resizeChart()
      this.$refs.checkFinish.resizeChart()
      this.$refs.rectifyFinish.resizeChart()
    },
  },
}
</script>

<template>
  <!-- 双预防运行统计 -->
  <div
    v-loading="isLoading"
    class="defense-container"
    :style="setHeight"
  >
    <div class="defense-bg">
      <!-- 左侧部分 -->
      <div class="bg-left">
        <!-- 风险数量 -->
        <el-row
          class="count-row"
          :gutter="20"
          style="height: calc(16% - 15px)"
        >
          <el-col
            v-for="item in numCountList"
            :key="item.name"
            class="count-col"
            :span="6"
          >
            <NumCount
              class="count-card"
              :info="item"
            />
          </el-col>
        </el-row>
        <!-- 风险单元统计 + 安全风险分析完成率 -->
        <el-row
          class="count-row"
          :gutter="20"
          style="height: calc(28% - 15px)"
        >
          <el-col
            class="count-col"
            :span="12"
          >
            <RiskUnit
              ref="riskUnit"
              class="count-card"
            />
          </el-col>
          <el-col
            class="count-col"
            :span="12"
          >
            <RiskFinish
              ref="riskFinish"
              class="count-card"
            />
          </el-col>
        </el-row>
        <!-- 排查任务完成率 -->
        <el-row
          class="count-row"
          :gutter="20"
          style="height: calc(28% - 15px)"
        >
          <el-col
            class="count-col"
            :span="24"
          >
            <CheckFinish
              ref="checkFinish"
              class="count-card"
            />
          </el-col>
        </el-row>
        <!-- 隐患整改率 -->
        <el-row
          :gutter="20"
          style="height: calc(28% - 15px)"
        >
          <el-col
            class="count-col"
            :span="24"
          >
            <RectifyFinish
              ref="rectifyFinish"
              class="count-card"
            />
          </el-col>
        </el-row>
      </div>
      <!-- 右侧部分 - 隐患动态 -->
      <!-- <div class="bg-right count-card">
        <DangeMsg />
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.defense-container {
  height: 100%;
  background: #f6fafe;
  width: 100%;
  padding: 20px;

  .count-card {
    height: 100%;
    padding: 10px 5px;
    border-radius: 5px;
    background: white;
    box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
  }

  .count-row {
    height: 100%;
    margin: 0 0 20px 0;
  }

  .count-col {
    height: 100%;
  }

  .defense-bg {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .bg-left {
      height: 100%;
      // width: calc(75% - 10px);
      width: calc(100% - 20px);
    }

    .bg-right {
      height: 100%;
      width: calc(25% - 10px);
    }
  }
}
</style>
