<script>
import html2canvas from 'html2canvas'
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { exportWarningType } from '@/http/videoWarning/warning-api'
import ChartCard from '../ChartCard.vue'

export default {
  name: 'WarningTypeChart',
  components: {
    ChartCard,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    searchForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['export-success', 'export-error', 'refresh', 'chart-click'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()
    const chartInstance = ref(null)

    // 导出状态
    const exporting = ref(false)
    const exportingImage = ref(false)
    const refreshing = ref(false)

    const initChart = () => {
      const chartDom = document.getElementById('warningTypeChart')
      if (!chartDom)
        return

      chartInstance.value = proxy.$echarts.init(chartDom)
      updateChart()

      // 添加点击事件
      chartInstance.value.on('click', (params) => {
        emit('chart-click', { params, chart: 'warningType' })
      })
    }

    const updateChart = () => {
      if (!chartInstance.value)
        return

      chartInstance.value.setOption({
        color: ['#5470C6', '#91CC75'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter(params) {
            const data = params[0]
            return `${data.name}<br/>${data.seriesName}: ${data.value}次`
          },
        },
        legend: {
          data: ['数量'],
          right: '1%',
          textStyle: {
            fontSize: 12,
          },
        },
        grid: {
          top: '15%',
          left: '2%',
          right: '5%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            fontSize: 11,
          },
        },
        yAxis: {
          type: 'category',
          data: props.data?.map(item => item.alarmType || ''),
          axisLabel: {
            fontSize: 11,
            interval: 0,
            formatter(value) {
              // 长文本截断
              return value.length > 8 ? `${value.substring(0, 8)}...` : value
            },
          },
          axisTick: {
            alignWithLabel: true,
          },
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            data: props.data?.map(item => ({
              value: item.alarmNumber || 0,
              itemStyle: {
                color: new proxy.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#5470C6' },
                  { offset: 1, color: '#91CC75' },
                ]),
              },
            })),
            barWidth: 16,
            label: {
              show: true,
              position: 'right',
              fontSize: 10,
              color: '#333',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          },
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'elasticOut',
      })
    }

    // 导出Excel
    const handleExportExcel = async () => {
      if (exporting.value)
        return

      exporting.value = true
      try {
        proxy.$openLoading({
          lock: true,
          text: '正在导出Excel，请稍候...',
          background: 'rgba(0, 0, 0, 0.1)',
        })

        const params = {
          ...props.searchForm,
          type: 3, // 预警类型排名类型
        }

        await exportWarningType(params)

        emit('export-success', { type: 'excel', chart: 'warningType' })
        proxy.$message?.success('Excel导出成功')
      }
      catch (error) {
        console.error('导出Excel失败:', error)
        emit('export-error', { type: 'excel', chart: 'warningType', error })
        proxy.$message?.error('导出Excel失败，请稍后重试')
      }
      finally {
        exporting.value = false
        proxy.$closeLoading()
      }
    }

    // 导出图片
    const handleExportImage = async () => {
      if (exportingImage.value)
        return

      exportingImage.value = true
      try {
        proxy.$openLoading({
          lock: true,
          text: '正在生成图片，请稍候...',
          background: 'rgba(0, 0, 0, 0.1)',
        })

        const chartElement = document.getElementById('warningTypeChart')
        if (!chartElement) {
          throw new Error('未找到图表元素')
        }

        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          useCORS: true,
          scale: 2,
          willReadFrequently: true,
        })

        // 创建下载链接
        const link = document.createElement('a')
        link.download = `预警类型排名TOP10-${new Date().getTime()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        emit('export-success', { type: 'image', chart: 'warningType' })
        proxy.$message?.success('图片导出成功')
      }
      catch (error) {
        console.error('导出图片失败:', error)
        emit('export-error', { type: 'image', chart: 'warningType', error })
        proxy.$message?.error('导出图片失败，请稍后重试')
      }
      finally {
        exportingImage.value = false
        proxy.$closeLoading()
      }
    }

    const resizeChart = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    }

    // 监听数据变化
    watch(
      () => props.data,
      () => {
        updateChart()
      },
      { deep: true },
    )

    onMounted(() => {
      initChart()
      window.addEventListener('resize', resizeChart)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeChart)
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }
    })

    return {
      chartInstance,
      exporting,
      exportingImage,
      refreshing,
      handleExportExcel,
      handleExportImage,
    }
  },
}
</script>

<template>
  <ChartCard
    title="预警类型排名TOP10"
    chartId="warningTypeChart"
    @export-excel="handleExportExcel"
    @export-image="handleExportImage"
  >
    <!-- 图表内容 -->
    <div id="warningTypeChart" class="chart" />
  </ChartCard>
</template>

<style scoped lang="scss">
.warning-type-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 6px 6px 0 0;

    .chart-title {
      font-size: 16px;
      font-weight: 600;
    }

    .chart-actions {
      display: flex;
      gap: 8px;

      .el-button {
        padding: 6px 12px;
        border-radius: 4px;
        transition: all 0.3s ease;
        font-size: 12px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .chart {
    flex: 1;
    background: #fff;
    border-radius: 0 0 6px 6px;
    padding: 16px;
    min-height: 300px;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .chart-toolbar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .chart-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}

// 加载动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
