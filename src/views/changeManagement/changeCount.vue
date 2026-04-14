/* * @Author: wangyang * @Date: 2023-03-21 16:09:47 * @Last Modified by: wangyang * @Last Modified
time: 2023-03-30 18:28:47 */
<script>
import { getChangeStatistics } from '@/http/changeManagement/changeManagement-api'

export default {
  data() {
    return {
      searchData: {
        applyDateType: 1,
        questionDateType: 1,
      },
      countData: {
        applyAmount: [],
        changLevelGroup: {},
        changStatusGroup: {},
        changTypeGroup: {},
        checkRectifyTotalRate: '',
        fourPropertiesGroup: {},
        rectifyRate: [],
      },
      option: {
        title: {
          text: '',
          left: 'left',
          top: 10,
        },
        color: ['#FD0006', '#5894FF', '#FFCB34'],
        tooltip: {
          trigger: 'item',
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 80,
          bottom: 20,
        },
        series: [
          {
            // name: '暂无数据',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 40,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 0, name: '四新评审中' },
              { value: 0, name: '验收中' },
              { value: 0, name: '验收完成' },
            ],
          },
        ],
      },
      monthlyOption: {
        tooltip: {
          trigger: 'axis',
        },
        color: ['#11C8E5'],
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '数据',
            data: [],
            stack: 'Total',
            type: 'line',
          },
        ],
      },
      rectificationRateOption: {
        tooltip: {
          trigger: 'axis',
        },
        color: ['#11C8E5'],
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '数据',
            stack: 'Total',
            data: [],
            type: 'line',
          },
        ],
      },
    }
  },
  created() {
    this.getChangeStatistics()
    setTimeout(() => {
      this.init()
    }, 500)
  },
  methods: {
    getChangeStatistics() {
      this.monthlyOption.xAxis.data = []
      this.monthlyOption.series[0].data = []
      this.rectificationRateOption.xAxis.data = []
      this.rectificationRateOption.series[0].data = []
      getChangeStatistics(this.searchData).then(({ data }) => {
        this.countData = data.result
        this.option.series[0].data[0].value = this.countData.changStatusGroup[0] || 0
        this.option.series[0].data[1].value = this.countData.changStatusGroup[1] || 0
        this.option.series[0].data[2].value = this.countData.changStatusGroup[2] || 0

        this.countData.applyAmount.forEach((res) => {
          this.monthlyOption.xAxis.data.push(res.dateCategory)
          this.monthlyOption.series[0].data.push(res.amount)
        })
        this.countData.rectifyRate.forEach((item) => {
          this.rectificationRateOption.xAxis.data.push(item.dateCategory)
          this.rectificationRateOption.series[0].data.push(item.amount)
        })

        // this.init()
      })
    },
    init() {
      this.myChart = this.$editorEcharts(document.getElementById('changeStatusCount'))
      this.myChart.setOption(this.option)

      this.myChart = this.$editorEcharts(document.getElementById('changeMonthlyCount'))
      this.myChart.setOption(this.monthlyOption)

      this.myChart = this.$editorEcharts(document.getElementById('changeMonthlyRectificationRate'))
      this.myChart.setOption(this.rectificationRateOption)
    },
    getDataA(num) {
      this.monthlyOption.xAxis.data = []
      this.monthlyOption.series[0].data = []
      this.searchData.applyDateType = num
      this.getChangeStatistics()

      setTimeout(() => {
        this.myChart = this.$editorEcharts(document.getElementById('changeMonthlyCount'))
        this.myChart.setOption(this.monthlyOption)
      }, 500)
    },
    getDataB(num) {
      this.rectificationRateOption.xAxis.data = []
      this.rectificationRateOption.series[0].data = []
      this.searchData.questionDateType = num
      this.getChangeStatistics()

      setTimeout(() => {
        this.myChart = this.$editorEcharts(
          document.getElementById('changeMonthlyRectificationRate'),
        )
        this.myChart.setOption(this.rectificationRateOption)
      }, 500)
    },
  },
}
</script>

<template>
  <div class="wechatMini-manage">
    <div class="first-line">
      <div class="first-line-box line">
        <h2>部门级变更</h2>
        <div class="num">
          {{ countData.changLevelGroup[1] || 0 }}个
        </div>
      </div>
      <div class="first-line-box line">
        <h2>工厂级变更</h2>
        <div class="num">
          {{ countData.changLevelGroup[2] || 0 }}个
        </div>
      </div>
      <div class="first-line-box line">
        <h2>公司级变更</h2>
        <div class="num">
          {{ countData.changLevelGroup[3] || 0 }}个
        </div>
      </div>
    </div>
    <div class="second-line">
      <div class="second-line-box line">
        <h2>新技术</h2>
        <div class="num">
          {{ countData.fourPropertiesGroup[1] || 0 }}个
        </div>
      </div>
      <div class="second-line-box line">
        <h2>新工艺</h2>
        <div class="num">
          {{ countData.fourPropertiesGroup[2] || 0 }}个
        </div>
      </div>
      <div class="second-line-box line">
        <h2>新材料</h2>
        <div class="num">
          {{ countData.fourPropertiesGroup[3] || 0 }}个
        </div>
      </div>
      <div class="second-line-box line">
        <h2>新设备</h2>
        <div class="num">
          {{ countData.fourPropertiesGroup[4] || 0 }}个
        </div>
      </div>
    </div>
    <div class="third-line">
      <div class="third-line-box line">
        <h2>管理变更</h2>
        <div class="num">
          {{ countData.changTypeGroup['管理'] || 0 }}个
        </div>
      </div>
      <div class="third-line-box line">
        <h2>人员变更</h2>
        <div class="num">
          {{ countData.changTypeGroup['人员'] || 0 }}个
        </div>
      </div>
      <div class="third-line-box line">
        <h2>工艺变更</h2>
        <div class="num">
          {{ countData.changTypeGroup['工艺'] || 0 }}个
        </div>
      </div>
      <div class="third-line-box line">
        <h2>设备设施变更</h2>
        <div class="num">
          {{ countData.changTypeGroup['设备设施'] || 0 }}个
        </div>
      </div>
      <div class="third-line-box line">
        <h2>场所变更</h2>
        <div class="num">
          {{ countData.changTypeGroup['场所'] || 0 }}个
        </div>
      </div>
    </div>
    <div class="fourth-line">
      <div class="fourth-line-box line">
        <h2>变更状态</h2>
        <div
          id="changeStatusCount"
          class="num-height"
        />
      </div>
      <div class="fourth-line-box line">
        <h2>变更问题总整改率</h2>
        <div class="num-height">
          {{ countData.checkRectifyTotalRate || 0 }}%
        </div>
      </div>
    </div>
    <div class="fifth-line">
      <div class="fifth-line-box line">
        <div class="title-box">
          <h2>变更申请数量</h2>
          <div>
            <el-button-group>
              <el-button
                type="primary"
                @click="getDataA(2)"
              >
                年度
              </el-button>
              <el-button
                type="primary"
                @click="getDataA(1)"
              >
                月度
              </el-button>
              <el-button
                type="primary"
                @click="getDataA(0)"
              >
                本周
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div
          id="changeMonthlyCount"
          style="height: 300px"
        />
      </div>
    </div>
    <div class="fifth-line">
      <div class="fifth-line-box line">
        <div class="title-box">
          <h2>变更问题整改率(%)</h2>
          <div>
            <el-button-group>
              <el-button
                type="primary"
                @click="getDataB(2)"
              >
                年度
              </el-button>
              <el-button
                type="primary"
                @click="getDataB(1)"
              >
                月度
              </el-button>
              <el-button
                type="primary"
                @click="getDataB(0)"
              >
                本周
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div
          id="changeMonthlyRectificationRate"
          style="height: 300px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wechatMini-manage {
  width: 80%;
  padding: 10px;
  .first-line,
  .second-line,
  .third-line,
  .fourth-line,
  .fifth-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    .first-line-box {
      width: calc(100% / 3 - 1%);
      padding: 5px;
      box-sizing: border-box;
    }
    .second-line-box {
      width: calc(100% / 4 - 1%);
      padding: 5px;
      box-sizing: border-box;
    }
    .third-line-box {
      width: calc(100% / 5 - 1%);
      padding: 5px;
      box-sizing: border-box;
    }
    .fourth-line-box {
      width: calc(100% / 2 - 1%);
      padding: 5px;
      box-sizing: border-box;
    }
    .fifth-line-box {
      width: 100%;
      padding: 5px;
      box-sizing: border-box;
      .title-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
  .num {
    height: 60px;
    font-size: 30px;
    text-align: center;
  }
  .num-height {
    height: 250px;
    font-size: 30px;
    text-align: center;
    line-height: 130px;
  }
}
.line {
  border: 1px solid #bbbbbb;
}
::v-deep .el-button {
  margin-left: 0 !important;
}
</style>
