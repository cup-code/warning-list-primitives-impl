<script>
// 查询 历史、实时、测点列表
import {
  getAllIoByGroup,
  getIoTrendHis,
  getIoTrendReal,
  getmyCompanyPointGroup,
} from '@/http/dev/pointGroup-api.js'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  data() {
    return {
      isLoading: false,
      // 左侧树传参
      treeProp: {
        title: '测点组列表',
        isAdd: false,
        isEdit: false,
        isDel: false,
        getTreeFunc: () => {
          return new Promise((resolve) => {
            getmyCompanyPointGroup().then((res) => {
              if (res.data && res.data.success) {
                res.data.result.forEach((item) => {
                  if (item.nodeType === 'company') {
                    item.onlyTreeUse = true
                  }
                })
              }
              resolve(res)
            })
          })
        },
        isTreeType: false,
        defaultProps: {
          children: 'children',
          label: 'nodeName',
          id: 'id',
          sort: 'sort',
          pid: 'parentId',
        },
      },
      groupPointList: [], // 测点组点位数据
      // 可选列表：时间、类型
      timeTypeList: [
        { label: '实时', value: 1 },
        { label: '历史', value: 2 },
      ],
      // 搜索相关数据
      searchData: {
        timeType: 2,
        pickList: [],
      },
      searchSnapshoot: {}, // 搜索数据整理及快照
      chartList: [], // 图表数据
      chartTimer: null, // 计时器
      startFlag: false, // 是否开始递归请求
      maxCount: 100, // 实时图表数据最大数量
      myChart: null, // 图表实例
      // 图表配置项
      chartOption: {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: [],
        },
        xAxis: {
          min: 'dataMin',
          max: 'dataMax',
          splitNumber: 10,
          type: 'time',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        series: [],
      },
      isShow: false,
    }
  },
  mounted() {
    // 图表自适应大小
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    this.closeCirculation()
  },

  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击测点组树的item */
    treeNodeTap(data) {
      if (data) {
        if (data.onlyTreeUse)
          return

        // 当左侧树点击后查询测点组的测点列表
        getAllIoByGroup(data.id)
          .then((res) => {
            if (res.data.success) {
              this.groupPointList = res.data.result
              this.searchData.pickList = []
              if (this.groupPointList.length === 0) {
                this.$message.warning('该测点组下暂无测点')
              }
            }
            else {
              this.$message.warning(res.data.message || '获取测点失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取测点出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
    /* 点击搜索 */
    searchClick() {
      if (this.searchData.pickList.length == 0) {
        this.$message.warning('请选择至少1个点位')
        return
      }
      // 先关闭循环
      this.closeCirculation()
      const deviceAndIoCodeList = []
      // 选中点位后对应的数据
      for (const code of this.searchData.pickList) {
        for (const item of this.groupPointList) {
          if (item.id == code) {
            deviceAndIoCodeList.push({
              deviceCode: item.deviceCode,
              ioCode: item.ioCode,
              ioName: item.ioName,
            })
          }
        }
      }
      let reqFunc = () => {}
      let isReal = false
      switch (Number.parseInt(this.searchData.timeType)) {
        case 1: // 实时
          reqFunc = getIoTrendReal
          this.searchSnapshoot = deviceAndIoCodeList
          isReal = true
          break
        case 2: // 历史
          reqFunc = getIoTrendHis
          this.searchSnapshoot = {
            startDate: this.searchData.startDate,
            endDate: this.searchData.endDate,
            deviceAndIoCodeList,
          }
          break
        default:
          this.searchSnapshoot = {}
      }
      this.reqPointData(reqFunc, this.searchSnapshoot, isReal)
    },
    /* 点击搜索,触发请求接口 */
    reqPointData(reqFunc, params, isReal = false) {
      this.isLoading = true
      reqFunc(params)
        .then((res) => {
          if (res.data.success) {
            const resList = res.data.result
            this.chartList = []
            this.initChart(resList)
            if (isReal) {
              this.startFlag = true
              this.refreshChart()
            }
          }
          else {
            this.$message.warning(res.data.message || '获取测点数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取测点数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /* 初始化图表 */
    initChart(resList) {
      if (this.myChart) {
        this.$echarts.dispose(this.myChart)
        this.myChart = null
      }
      const chartDom = document.getElementById('pointChart')
      this.myChart = this.$echarts.init(chartDom)
      const nameList = resList.map((item) => {
        return item.name
      })
      this.chartList = resList.map((item) => {
        return {
          name: item.name,
          type: 'line',
          smooth: true,
          data: item.valueList
            ? item.valueList.map((dataItem) => {
                return [dataItem.eventDate, dataItem.value]
              })
            : [],
        }
      })
      this.chartOption.legend.data = nameList

      this.chartOption.series = this.chartList
      this.myChart.setOption(this.chartOption)
    },
    /* 刷新图表数据 */
    refreshChart() {
      // 获取测点实时数据
      getIoTrendReal(this.searchSnapshoot)
        .then((res) => {
          if (res.data.success) {
            res.data.result.forEach((item, index) => {
              if (this.chartList[index].data.length >= this.maxCount) {
                this.chartList[index].data.shift()
              }
              if (item.valueList && item.valueList.length > 0) {
                this.chartList[index].data.push([
                  item.valueList[0].eventDate,
                  item.valueList[0].value,
                ])
              }
              else {
                this.chartList[index].data.push([])
              }
            })
            this.chartOption.series = this.chartList
            this.myChart.setOption(this.chartOption)
          }
          else {
            this.$message.warning(res.data.result || '获取实时数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取实时数据出错', err)
        })
        .finally(() => {
          if (this.startFlag) {
            this.chartTimer = setTimeout(() => {
              this.refreshChart()
            }, 1000)
          }
        })
    },
    /* 图表尺寸自适应 */
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    /* 关闭循环请求 */
    closeCirculation() {
      this.startFlag = false
      if (this.chartTimer) {
        clearTimeout(this.chartTimer)
        this.chartTimer = null
      }
    },
    resetEvent() {
      this.searchData.timeType = ''
      this.searchData.startDate = ''
      this.searchData.endDate = ''
      this.searchData.pickList = []
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" v-loading="isLoading">
    <!-- 左侧树 -->
    <TreeBox
      slot="tree"
      v-bind="treeProp"
      ref="pointTreeBox"
      @treeNodeTap="treeNodeTap"
    />
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 搜索栏 -->
      <el-form
        ref="searchForm"
        :inline="true"
        :model="searchData"
      >
        <el-form-item label="时间类型">
          <el-select
            v-model="searchData.timeType"
            placeholder="请选择时间类型"
            style="width: 120px"
          >
            <el-option
              v-for="item in timeTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="searchData.timeType == 2"
          label="开始时间"
          prop="startDate"
          :rules="[{ required: true, message: '请选择开始时间', trigger: 'change' }]"
        >
          <el-date-picker
            v-model="searchData.startDate"
            style="width: 150px"
            clearable
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item
          v-if="searchData.timeType === 2"
          label="结束时间"
          prop="endDate"
          :rules="[{ required: true, message: '请选择结束时间', trigger: 'change' }]"
        >
          <el-date-picker
            v-model="searchData.endDate"
            style="width: 150px"
            clearable
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item v-if="isShow" label="测点组点位">
          <el-select
            v-model="searchData.pickList"
            style="width: 100%"
            multiple
            placeholder="请选择测点组点位"
            clearable
          >
            <el-option
              v-for="item in groupPointList"
              :key="item.id"
              :label="item.ioName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            :loading="isLoading"
            @click="resetEvent"
          >
            重置
          </el-button>
          <el-button
            v-if="!isShow"
            type="text"
            icon="el-icon-arrow-down"
            @click="openUp"
          >
            高级筛选
          </el-button>
          <el-button
            v-else
            type="text"
            icon="el-icon-arrow-up"
            style="color: black"
            @click="putAway"
          >
            收起
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <div id="pointChart" slot="table" />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
#pointChart {
  height: 100%;
  width: 100%;
}
</style>
