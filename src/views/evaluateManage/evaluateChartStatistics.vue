/* * @Author: xiaorui 评价管理：绩效考核分析柱状图统计页面 * @Date: 2023-03-18 11:32:16 * @Last
Modified by: xiaorui * @Last Modified time: 2023-03-18 17:11:13 */
<script>
import {
  getEvaluateLeaderStatisticsFn,
  getEvaluateSaferStatisticsFn,
} from '@/http/evaluate-manage/evaluate-api'
import CompanyTree from '@/views/common-ui/CompanyTree'

export default {
  components: {
    CompanyTree,
  },
  data: () => ({
    loading: false,
    timeValue: '',
    saferForm: {
      companyId: '',
      startDate: '',
      endDate: '',
    },
    leaderForm: {
      companyId: '',
      startDate: '',
      endDate: '',
    },
    options: {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      yAxis: [
        {
          type: 'value',
        },
      ],
      // series: [
      //   {
      //     name: 'Union Ads',
      //     type: 'bar',
      //     stack: 'Ad',
      //     emphasis: {
      //       focus: 'series'
      //     },
      //     data: [220, 182, 191, 234, 290, 330, 310]
      //   }
      // ]
    },
  }),
  computed: {
    /* 设置背景高度 */
    setHeight() {
      const settings = this.$store.state.settings
      let height = '50px'
      if (settings.tagModel && settings.layout !== 'lr') {
        height = '100px'
      }
      return `calc(100vh - ${height})`
    },
  },
  mounted() {
    const companyId = this.$store.state.user.user.companyId
    const date = new Date()
    const year = date.getFullYear()
    const currentMonth = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
    this.saferForm.companyId = companyId
    this.saferForm.startDate = `${year}-01`
    this.saferForm.endDate = `${year}-${currentMonth}`
    this.leaderForm.companyId = companyId
    this.leaderForm.startDate = `${year}-01`
    this.leaderForm.endDate = `${year}-${currentMonth}`
    this.timeValue = [this.saferForm.startDate, this.saferForm.endDate]
    this.saferChart = this.$editorEcharts(document.getElementById('saferChart'))
    this.leaderChart = this.$editorEcharts(document.getElementById('leaderChart'))
    this.getChartData('safer')
    this.getChartData('leader')
  },
  methods: {
    // 点击公司树的item
    treeNodeTap(v) {
      // 记录公司id
      this.saferForm.companyId = v.id
      this.leaderForm.companyId = v.id
      this.getChartData('safer')
      this.getChartData('leader')
    },
    getChartData(type) {
      let func, sForm, currentChart
      if (type === 'safer') {
        func = getEvaluateSaferStatisticsFn
        sForm = this.saferForm
        currentChart = this.saferChart
      }
      else {
        func = getEvaluateLeaderStatisticsFn
        sForm = this.leaderForm
        currentChart = this.leaderChart
      }
      func(sForm).then(({ data }) => {
        if (data.success) {
          const xNames = data.result.map((item) => {
            return item.departmentName
          })
          const rewardAmountArr = data.result.map((item) => {
            return item.rewardAmount
          })
          const deductionAmountArr = data.result.map((item) => {
            return item.deductionAmount
          })
          const xAxis = {
            type: 'category',
            data: xNames,
            axisLabel: {
              // x轴文字的配置
              show: true,
              interval: 0, // 使x轴文字显示全
              formatter(params) {
                let newParamsName = ''
                const paramsNameNumber = params.length
                const provideNumber = 5 // 一行显示几个字
                const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
                if (paramsNameNumber > provideNumber) {
                  for (let p = 0; p < rowNumber; p++) {
                    let tempStr = ''
                    const start = p * provideNumber
                    const end = start + provideNumber
                    if (p == rowNumber - 1) {
                      tempStr = params.substring(start, paramsNameNumber)
                    }
                    else {
                      tempStr = `${params.substring(start, end)}\n`
                    }
                    newParamsName += tempStr
                  }
                }
                else {
                  newParamsName = params
                }
                return newParamsName
              },
            },
          }
          const series = [
            {
              name: '实际奖励金额',
              type: 'bar',
              stack: 'Ad',
              emphasis: {
                focus: 'series',
              },
              data: rewardAmountArr,
            },
            {
              name: '实际扣除金额',
              type: 'bar',
              stack: 'Ad',
              emphasis: {
                focus: 'series',
              },
              data: deductionAmountArr,
            },
          ]
          const option = Object.assign(this.options, {
            series,
            xAxis,
          })
          currentChart.setOption(option, true)
        }
      })
    },
    // 获取起止时间
    getSaferTimeValue(v) {
      if (v && v.length) {
        this.saferForm.startDate = v[0]
        this.saferForm.endDate = v[1]
        this.getChartData('safer')
      }
      else {
        this.saferForm.startDate = ''
        this.saferForm.endDate = ''
      }
    },
    getLeaderTimeValue(v) {
      if (v && v.length) {
        this.leaderForm.startDate = v[0]
        this.leaderForm.endDate = v[1]
        this.getChartData('leader')
      }
      else {
        this.leaderForm.startDate = ''
        this.leaderForm.endDate = ''
      }
    },
  },
}
</script>

<template>
  <div
    class="treetable"
    :style="`height:${setHeight}`"
  >
    <CompanyTree
      class="left-box"
      @treeNodeTap="treeNodeTap"
    />
    <div class="right-box">
      <div class="chartArea">
        <div class="titleArea">
          <div class="title">
            部门安全员绩效统计分析
          </div>
          <el-date-picker
            v-model="timeValue"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM"
            @change="getSaferTimeValue"
          />
        </div>
        <div
          id="saferChart"
          style="height: 80%"
        />
      </div>
      <div class="chartArea">
        <div class="titleArea">
          <div class="title">
            部门主负责人绩效统计分析
          </div>
          <el-date-picker
            v-model="timeValue"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM"
            @change="getLeaderTimeValue"
          />
        </div>
        <div
          id="leaderChart"
          style="height: 80%"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.treetable {
  padding: 10px 10px 10px 10px;
  background: #f3f7f9;
  display: flex;
  .left-box {
    padding-right: 10px;
    width: 240px;
    height: 100%;
    position: relative;
    transition: all 0.2s linear;
    .left-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: calc(100% - 10px);
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .right-box {
    background: #fff;
    transition: all 0.2s linear;
    height: 100%;
    flex: 1;
    padding: 10px;
    .chartArea {
      height: 50%;
      .titleArea {
        display: flex;
        justify-content: space-between;
        .title {
          font-weight: bolder;
          position: relative;
          font-size: 16px;
          text-indent: 12px;
        }
        .title::before {
          content: '';
          width: 8px;
          height: 20px;
          background: #11c8e5;
          position: absolute;
          left: 0;
        }
      }
    }
  }
}
</style>
