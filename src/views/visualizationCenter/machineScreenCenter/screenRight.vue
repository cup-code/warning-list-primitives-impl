<script>
import moment from 'moment'
import { tenantControlList } from '@/http/manage-api'
import { getUserListByRoleFn } from '@/http/safe-production/user-manage-api'
import {
  machineRank,
  machineTypeYear,
  warningStatusList,
} from '@/http/videoWarning/warning-api'
import CardItem from '../components/cardItem'
import EList from '../components/EList'
import options from './rightChart'
import SelectBlock from './selectBlock'

export default {
  name: 'OperateRight',
  components: {
    CardItem,
    EList,
    SelectBlock,
  },
  props: {
    allMachineList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: {
        head: ['', '一体机', '预警总数', '已审核数'],
        list: [],
      },
      dateRange: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
      allCharts: {
        chart_statics: null,
        chart_failureType: null,
      },
      form: {},
      disposeUser: [],
      tenantList: [],
      statusData: [
        { value: 0, name: '待审核' },
        { value: 0, name: '加急' },
        { value: 0, name: '有效' },
        { value: 0, name: '无效' },
        { value: 0, name: '误报' },
        { value: 0, name: '不确定' },
      ],
      typeYearData: [],
      rankingData: [],
    }
  },
  mounted() {
    this.getAllTent()
    this.getInternalDisposeUserId()
    this.initAll() // 初始化所有图表
    this.initAllData() // 获取并初始化所有数据
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
      // 初始化状态统计饼图
      this.initChart('chart_statics', options.statics)
      // 初始化类型统计柱状图
      this.initChart('chart_failureType', options.failureType)
    },

    async getAllTent() {
      const res = await tenantControlList()
      if (res.data.success) {
        this.tenantList = res.data.result.map((item) => {
          return {
            id: item.tenantCode,
            name: item.tenantName,
          }
        })
      }
    },

    async getPeopleList({ pageParam = 1 }) {
      const res = await getUserListByRoleFn({
        pageNum: pageParam,
        pageSize: 10,
        withoutChildrenDepartment: true,
        userStatusList: 1,
        withMyDepartmentTypeParent: false,
      })

      const { data } = res
      if (data.success) {
        const { result } = data
        if (pageParam < result.pages) {
          // 递归获取下一页数据
          const nextPageData = await this.getPeopleList({ pageParam: result.nextPage })
          // 合并当前页和下一页的数据
          return [...result.list, ...(nextPageData || [])]
        }
        return result.list
      }
      return []
    },

    async getInternalDisposeUserId() {
      const list = await this.getPeopleList({ pageParam: 1 })
      if (list.length) {
        this.disposeUser = list.map((item) => {
          return {
            id: item.id,
            name: item.fullName,
          }
        })
      }
    },

    onChange(key, event) {
      if (!Object.keys(event).length) {
        delete this.form[key]

        this.fetchStatusData()
        return
      }
      if (key === 'time') {
        this.form.alarmDateStart = moment(event[0]).format('YYYY-MM-DD HH:mm:ss')
        this.form.alarmDateEnd = moment(event[1]).format('YYYY-MM-DD HH:mm:ss')
      }
      else {
        this.form[key] = event.id
      }

      this.fetchStatusData()
    },

    // 获取预警状态统计数据
    async fetchStatusData() {
      try {
        const res = await warningStatusList(this.form)
        if (res.data && res.data.success) {
          this.statusData = res.data.result || []
          this.updateStatusChart()
        }
      }
      catch (error) {
        console.error('获取预警状态统计数据失败:', error)
      }
    },

    // 更新状态统计图表
    updateStatusChart() {
      // 根据后端返回的数据格式进行匹配
      this.statusData = this.statusData.map((item) => {
        const index = this.$dictUtils
          .getDictList('InternalStatus')
          .find(d => d.dictCode === item.internalStatus)
        return {
          value: item.count,
          name: index.dictName,
        }
      })

      // 检查是否所有值都为0
      const hasNonZeroValues = this.statusData.some(item => item.value > 0)

      // 更新饼图数据
      if (this.allCharts.chart_statics) {
        this.allCharts.chart_statics.setOption({
          series: [
            {
              // 如果所有值为0，则传空数组以显示空圆占位符
              data: hasNonZeroValues ? this.statusData : [],
            },
          ],
        })
      }
    },

    // 获取预警类型年度统计数据
    async fetchTypeYearData() {
      try {
        const res = await machineTypeYear()
        if (res.data && res.data.success) {
          this.typeYearData = res.data.result || []
          this.updateTypeYearChart()
        }
      }
      catch (error) {
        console.error('获取预警类型年度统计数据失败:', error)
      }
    },

    // 更新类型统计图表
    updateTypeYearChart() {
      if (!this.typeYearData.length) {
        // 如果没有数据，设置空数据
        if (this.allCharts.chart_failureType) {
          this.allCharts.chart_failureType.setOption({
            series: [],
          })
        }
        return
      }

      // 假设后端返回的数据结构包含年份和各类型数量
      const years = [...new Set(this.typeYearData.map(item => item.year))].filter(
        item => item !== null && item !== undefined,
      )
      const warningTypes = [...new Set(this.typeYearData.map(item => item.alarmType))]

      // 按类型组织数据
      const series = warningTypes.map((type) => {
        const data = years.map((year) => {
          const item = this.typeYearData.find(
            d => d.year === year && d.alarmType === type,
          )
          return item ? item.count : 0
        })

        return {
          name: type,
          data,
          barWidth: 8,
          type: 'bar',
          itemStyle: {
            shadowBlur: 5.5,
            shadowColor: 'rgba(83, 101, 166, 1)',
            shadowOffsetY: 1,
            shadowOffsetX: 1,
          },
        }
      })

      // 更新柱状图
      if (this.allCharts.chart_failureType) {
        this.allCharts.chart_failureType.setOption({
          xAxis: {
            data: years,
          },
          legend: {
            data: warningTypes,
          },
          series,
        })
      }
    },

    // 获取一体机预警Top10数据
    async fetchRankingData() {
      try {
        const res = await machineRank()
        if (res.data && res.data.success) {
          this.rankingData = res.data.result || []
          this.updateRankingTable()
        }
      }
      catch (error) {
        console.error('获取一体机预警Top10数据失败:', error)
      }
    },

    // 更新排名表格
    updateRankingTable() {
      if (!this.rankingData.length)
        return

      // 格式化表格数据
      this.tableData.list = this.rankingData.map((item, index) => {
        return {
          name: item.machineName || `一体机${index + 1}`,
          time: String(item.total) || '0',
          local: String(item.dispose) || '0',
        }
      })
    },

    // 初始化所有数据
    async initAllData() {
      await this.fetchStatusData()
      await this.fetchTypeYearData()
      await this.fetchRankingData()
    },
  },
}
</script>

<template>
  <div>
    <!-- 工单状态统计 -->
    <CardItem :height="30" title="状态统计">
      <div class="flex items-center w-full justify-start px-2">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
          size="mini"
          class="custom-date-picker"
          style="width: 15vw; background: transparent"
          @change="onChange('time', $event)"
        />

        <el-popover placement="bottom" width="240" trigger="click">
          <div
            slot="reference"
            class="h-7 ml-4 leading-7 box-border flex items-center border border-white py-1 px-2 rounded"
          >
            <span class="text-xs mr-1">更多筛选</span>
            <i class="el-icon-s-operation" />
          </div>

          <el-form labelPosition="left" label-width="56px">
            <el-form-item label="集团:">
              <SelectBlock
                :list="tenantList"
                placeholder="请选择集团"
                @change="onChange('tCode', $event)"
              />
            </el-form-item>
            <el-form-item label="一体机:">
              <SelectBlock
                :list="allMachineList"
                placeholder="请选择一体机"
                @change="onChange('machineId', $event)"
              />
            </el-form-item>

            <el-form-item label="审核人:">
              <SelectBlock
                :list="disposeUser"
                placeholder="请选择审核人"
                @change="onChange('internalDisposeUserId', $event)"
              />
            </el-form-item>
          </el-form>
        </el-popover>
      </div>
      <div id="chart_statics" class="content" />
    </CardItem>
    <!-- 故障类型分布 -->
    <CardItem :height="30" title="类型统计">
      <div id="chart_failureType" class="content" />
    </CardItem>
    <!-- 流量卡欠费到期时间  -->
    <CardItem :height="30" title="一体机预警TOP10">
      <div class="content">
        <EList :listData="tableData">
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
      background-image: url("~@/assets/anqiBi/base1.png");
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
        background-image: url("~@/assets/anqiBi/Base2.png");
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

// 添加自定义样式
::v-deep .custom-date-picker {
  .el-input__inner {
    background-color: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: #ffffff !important;
  }
  .el-range-separator,
  .el-range-input {
    color: #fff !important;
    background-color: transparent !important;
  }
  .el-input__icon {
    color: #fff !important;
  }
}

::v-deep .custom-cascader {
  .el-input__inner {
    background-color: transparent !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    color: white !important;
  }
  .el-input__icon {
    color: white !important;
  }
}
</style>
