<script>
import {
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
import { getScreenData } from '@/http/videoStat/screenData'
import {
  ChartCard,
  ChartContainer,
  Charts,
  SearchForm,
} from './components'

export default {
  name: 'StaticAnalyze',
  components: {
    ChartCard,
    SearchForm,
    ChartContainer,
    WarningTypeChart: Charts.WarningTypeChart,
    WarningLevelChart: Charts.WarningLevelChart,
    WarningTrendChart: Charts.WarningTrendChart,
    WarningProcessChart: Charts.WarningProcessChart,
    PointWarningTable: Charts.PointWarningTable,
    OrgWarningTable: Charts.OrgWarningTable,
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const timeType = ref(1)

    // 搜索表单数据
    const searchForm = ref({
      timeType: 1,
      alarmDateStart: '',
      alarmDateEnd: '',
    })

    // 图表数据对象
    const dataInfo = ref({
      pointWarningData: [],
      orgWarningData: [],
      warningTypeData: [],
      alarmLevelData: [],
      alarmTypeRanks: [],
      trendData: {},
      processData: [],
      totals: 0,
      color: ['#FF4500', '#FFA500', '#FFFF00', '#0069b9'],
      processColors: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      refetch: () => fetchChartData(),
    })

    // 获取图表数据的方法
    const fetchChartData = async () => {
      try {
        const { data } = await getScreenData(searchForm.value)
        if (data && data.result) {
          const {
            departmentAlarmRank,
            cameraAlarmRank,
            alarmTypeRank,
            alarmLevelLive,
            alarmTrend,
            total,
            alarmStatusLive,
          } = data.result

          const level = [
            { name: '一级预警', value: 1 },
            { name: '二级预警', value: 2 },
            { name: '三级预警', value: 3 },
            { name: '四级预警', value: 4 },
          ]

          dataInfo.value.totals = total

          dataInfo.value.alarmTypeRanks = alarmTypeRank
            .sort((a, b) => b.alarmNumber - a.alarmNumber)
            .reverse()
            .slice(0, 10)

          dataInfo.value.orgWarningData
            = Object.keys(departmentAlarmRank)
              .map((key, index) => ({
                rank: index + 1,
                name: key,
                count: departmentAlarmRank[key],
              }))
              .slice(0, 10) || []

          dataInfo.value.pointWarningData
            = Object.keys(cameraAlarmRank)
              .map((key, index) => ({
                rank: index + 1,
                name: key,
                count: cameraAlarmRank[key],
              }))
              .slice(0, 10) || []

          dataInfo.value.warningTypeData = alarmTypeRank
            .map(item => item.alarmNumber)
            .slice(0, 10)

          dataInfo.value.alarmLevelData = level.map(item => ({
            name: item.name,
            value: alarmLevelLive[item.value] || 0,
            itemStyle: { color: dataInfo.value.color[item.value - 1] },
          }))

          dataInfo.value.processData = Object.keys(alarmStatusLive).map(key => ({
            name: key,
            value: alarmStatusLive[key],
            itemStyle: { color: dataInfo.value.processColors[key - 1] },
          }))

          // 预警趋势数据
          dataInfo.value.trendData = alarmTrend || {}
        }
      }
      catch (error) {
        console.error('查询图表数据出错:', error)
        proxy.$message?.error('获取图表数据失败，请稍后重试')
      }
    }

    // 搜索数据
    const searchData = (form = {}) => {
      if (Object.keys(form).length > 0) {
        console.log(form, 'form')
        searchForm.value = { ...form }
      }
      fetchChartData()
    }

    // 处理导出成功事件
    const handleExportSuccess = (event) => {
      console.log('导出成功:', event)
      // 可以在这里添加全局的成功处理逻辑
    }

    // 处理导出错误事件
    const handleExportError = (event) => {
      console.error('导出失败:', event)
      // 可以在这里添加全局的错误处理逻辑
    }

    // 处理刷新事件
    const handleRefresh = (event) => {
      console.log('刷新图表:', event.chart)
      fetchChartData()
    }

    // 处理图表点击事件
    const handleChartClick = (event) => {
      console.log('图表点击:', event)
      // 可以在这里处理图表点击的业务逻辑
      // 比如跳转到详情页、显示详细信息等
    }

    // 处理表格行点击事件
    const handleRowClick = (event) => {
      console.log('表格行点击:', event)
      // 可以在这里处理表格行点击的业务逻辑
    }

    // 处理表格选择变化事件
    const handleSelectionChange = (event) => {
      console.log('表格选择变化:', event)
      // 可以在这里处理表格选择变化的业务逻辑
    }

    onMounted(() => {
      searchData()
    })

    return {
      timeType,
      searchForm,
      dataInfo,
      searchData,
      handleExportSuccess,
      handleExportError,
      handleRefresh,
      handleChartClick,
      handleRowClick,
      handleSelectionChange,
    }
  },
}
</script>

<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <SearchForm :initialTimeType="timeType" @search="searchData" />

    <!-- 主要内容区域 -->
    <ECard>
      <ChartContainer>
        <!-- 预警类型TOP10 -->
        <WarningTypeChart
          :data="dataInfo.alarmTypeRanks"
          :searchForm="searchForm"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
          @refresh="handleRefresh"
          @chart-click="handleChartClick"
        />

        <!-- 预警趋势 -->
        <WarningTrendChart
          :data="dataInfo.trendData"
          :searchForm="searchForm"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
          @chart-click="handleChartClick"
        />

        <!-- 预警等级占比 -->
        <WarningLevelChart
          :data="dataInfo.alarmLevelData"
          :total="dataInfo.totals"
          :searchForm="searchForm"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
          @chart-click="handleChartClick"
        />

        <!-- 预警处理状态 -->
        <WarningProcessChart
          :data="dataInfo.processData"
          :total="dataInfo.totals"
          :colors="dataInfo.processColors"
          :searchForm="searchForm"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
          @chart-click="handleChartClick"
        />

        <!-- 设备预警排名TOP10 -->
        <PointWarningTable
          :data="dataInfo.pointWarningData"
          :searchForm="searchForm"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
        />

        <!-- 组织预警排名TOP10 -->
        <OrgWarningTable
          :data="dataInfo.orgWarningData"
          :searchForm="searchForm"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
        />
      </ChartContainer>
    </ECard>
  </div>
</template>
