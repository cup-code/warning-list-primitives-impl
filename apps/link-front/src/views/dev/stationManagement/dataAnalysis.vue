<script>
import {
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  name: 'StationList',
  components: {
    OwnDeparmentTree,
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const vm = proxy
    const chartRef = ref(null)
    const timeType = ref('realtime')
    const selectedPoints = ref(['C0', 'C1', 'C3'])
    const chartInstance = ref(null)

    // 静态数据
    const staticData = {
      xAxis: [
        '1:00',
        '2:00',
        '3:00',
        '4:00',
        '5:00',
        '6:00',
        '7:00',
        '8:00',
        '9:00',
        '10:00',
        '11:00',
        '12:00',
      ],
      C0: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      C1: [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120],
      C3: [150, 150, 150, 150, 160, 150, 150, 150, 150, 150, 150, 150],
    }

    const updateChartOption = () => {
      if (!chartInstance.value)
        return

      const option = {
        color: ['#F56C6C', '#409EFF', '#67C23A'],
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            let result = `${params[0].axisValue}<br/>`
            params.forEach((item) => {
              result += `${item.seriesName}: ${item.data}<br/>`
            })
            return result
          },
        },
        legend: {
          data: ['C0进水计时', 'C1好氧1计时', 'C3好氧2计时'],
          top: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: staticData.xAxis,
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 180,
          interval: 30,
          axisLabel: {
            formatter: '{value}',
          },
        },
        series: [
          {
            name: 'C0进水计时',
            type: 'line',
            data: staticData.C0,
            smooth: true,
          },
          {
            name: 'C1好氧1计时',
            type: 'line',
            data: staticData.C1,
            smooth: true,
          },
          {
            name: 'C3好氧2计时',
            type: 'line',
            data: staticData.C3,
            smooth: true,
          },
        ],
      }

      try {
        chartInstance.value.setOption(option, true)
      }
      catch (error) {
        console.error('Error updating chart options:', error)
      }
    }

    const initChart = () => {
      const volumeEl = document.getElementById('volume3')
      if (!volumeEl)
        return

      try {
        if (!vm.$echarts)
          return

        if (chartInstance.value) {
          chartInstance.value.dispose()
        }

        chartInstance.value = vm.$echarts.init(volumeEl)

        updateChartOption()
      }
      catch (error) {
        console.error('Error initializing chart:', error)
      }
    }

    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    }

    const handleQuery = () => {
      updateChartOption()
    }

    const handleReset = () => {
      timeType.value = 'realtime'
      selectedPoints.value = ['C0', 'C1', 'C3']
      updateChartOption()
    }

    onMounted(() => {
      vm.$nextTick(() => {
        initChart()
      })
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.value) {
        chartInstance.value.dispose()
      }
    })

    const treeNodeTap = () => {}

    return {
      chartRef,
      timeType,
      selectedPoints,
      handleQuery,
      handleReset,
      treeNodeTap,
    }
  },
}
</script>

<template>
  <div class="flex h-[70vh]">
    <div class="w-64 border-r border-gray-200">
      <TreeTable>
        <OwnDeparmentTree
          slot="tree"
          @treeNodeTap="treeNodeTap"
        />
      </TreeTable>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 p-4">
      <!-- 搜索条件 -->
      <div class="mb-4">
        <el-form
          :inline="true"
          size="small"
        >
          <el-form-item label="时间类型">
            <el-radio-group v-model="timeType">
              <el-radio-button label="realtime">
                实时
              </el-radio-button>
              <el-radio-button label="hour">
                按小时
              </el-radio-button>
              <el-radio-button label="day">
                按天
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="测点组点位">
            <el-select
              v-model="selectedPoints"
              multiple
              collapse-tags
              placeholder="请选择监测点"
              style="width: 240px"
            >
              <el-option
                label="C0进水计时"
                value="C0"
              />
              <el-option
                label="C1好氧1计时"
                value="C1"
              />
              <el-option
                label="C3好氧2计时"
                value="C3"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleQuery"
            >
              查询
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 图表区域 -->
      <div class="h-full w-full bg-white">
        <div
          id="volume3"
          style="width: calc(100vw - 400px); height: 70vh"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-radio-group {
  margin-right: 16px;
}

.el-select {
  width: 200px;
}

.treetable {
  height: calc(100vh - 166px) !important;
}
</style>
