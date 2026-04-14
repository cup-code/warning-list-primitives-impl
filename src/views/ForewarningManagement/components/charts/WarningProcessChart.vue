<script>
import html2canvas from 'html2canvas'
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { exportWarningProcess } from '@/http/videoWarning/warning-api'
import ChartCard from '../ChartCard.vue'

export default {
  name: 'WarningProcessChart',
  components: {
    ChartCard,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    colors: {
      type: Array,
      default: () => ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
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
      const chartDom = document.getElementById('warningProcessChart')
      if (!chartDom)
        return

      chartInstance.value = proxy.$echarts.init(chartDom)
      updateChart()

      // 添加点击事件
      chartInstance.value.on('click', (params) => {
        emit('chart-click', { params, chart: 'warningProcess' })
      })
    }

    const updateChart = () => {
      if (!chartInstance.value)
        return

      chartInstance.value.setOption({
        backgroundColor: '#fff',
        color: props.colors,
        grid: {
          top: '10%',
          left: '2%',
          right: '1%',
          bottom: '1%',
        },
        tooltip: {
          trigger: 'item',
          formatter(params) {
            const percentage
              = props.total === 0
                ? '0.00%'
                : `${((params.value / props.total) * 100).toFixed(2)}%`
            return `${params.name}<br/>数量: ${params.value}个<br/>占比: ${percentage}`
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#409EFF',
          borderWidth: 1,
          textStyle: {
            color: '#fff',
          },
        },
        legend: {
          orient: 'vertical',
          top: 'center',
          selectedMode: 'multiple',
          right: 0,
          itemWidth: 15,
          itemHeight: 15,
          textStyle: {
            align: 'left',
            verticalAlign: 'middle',
            fontSize: 12,
            rich: {
              name: {
                color: '#000',
                fontSize: 13,
              },
              value: {
                color: '#000',
                fontSize: 13,
              },
              rate: {
                color: '#000',
                fontSize: 13,
              },
            },
          },
          formatter: (name) => {
            if (props.data.length) {
              const item = props.data.find(item => item.name === name)
              return `{name|${name}}{value| ${((item.value / props.total) * 100).toFixed(
                2,
              )}% } {rate| ${item.value || 0}个}`
            }
          },
        },
        series: [
          {
            type: 'pie',
            center: ['26%', '50%'],
            radius: ['40%', '65%'],
            label: {
              show: false,
              position: 'center',
            },
            avoidLabelOverlap: false,
            emphasis: {
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold',
              },
              scale: true,
              scaleSize: 5,
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
            labelLine: {
              show: false,
            },
            legendHoverLink: true,
            data: props.data.map((item) => {
              return {
                value: item.value,
                name: item.name,
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#fff',
                },
              }
            }),
            showEmptyCircle: true,
            emptyCircleStyle: {
              color: 'lightgray',
              opacity: 0.3,
            },
            animation: true,
            animationDuration: 1000,
            animationEasing: 'elasticOut',
          },
        ],
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
          type: 4, // 预警处理状态类型
        }

        await exportWarningProcess(params)

        emit('export-success', { type: 'excel', chart: 'warningProcess' })
        proxy.$message?.success('Excel导出成功')
      }
      catch (error) {
        console.error('导出Excel失败:', error)
        emit('export-error', { type: 'excel', chart: 'warningProcess', error })
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

        const chartElement = document.getElementById('warningProcessChart')
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
        link.download = `预警处理状态-${new Date().getTime()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        emit('export-success', { type: 'image', chart: 'warningProcess' })
        proxy.$message?.success('图片导出成功')
      }
      catch (error) {
        console.error('导出图片失败:', error)
        emit('export-error', { type: 'image', chart: 'warningProcess', error })
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
      [() => props.data, () => props.total],
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
    title="预警处理状态"
    chartId="warningProcessChart"
    @export-excel="handleExportExcel"
    @export-image="handleExportImage"
  >
    <!-- 图表内容 -->
    <div
      id="warningProcessChart"
      class="flex-1 bg-white rounded-b-lg p-4 min-h-[300px] transition-opacity duration-300"
    />
  </ChartCard>
</template>

<style>
/* Tailwind doesn't have built-in Vue transitions, so we add these minimal styles */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}
.fade-enter,
.fade-leave-to {
  @apply opacity-0;
}
</style>
