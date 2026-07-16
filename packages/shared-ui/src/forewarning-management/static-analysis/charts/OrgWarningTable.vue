<script>
import html2canvas from 'html2canvas'
import { getCurrentInstance, ref } from 'vue'
import { orgWarningConfig } from '@link/warning-feature/static-analysis-config'
import ChartCard from '../../ChartCard.vue'

export default {
  name: 'OrgWarningTable',
  components: {
    ChartCard,
  },
  props: {
    host: {
      type: Object,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    searchForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['row-click', 'selection-change', 'export-success', 'export-error'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()

    // 导出状态
    const exporting = ref(false)
    const exportingImage = ref(false)
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
          type: 7, // 组织预警排名类型
        }

        await props.host.exportOrgWarning(params)

        emit('export-success', { type: 'excel', chart: 'orgWarning' })
        proxy.$message?.success('Excel导出成功')
      }
      catch (error) {
        console.error('导出Excel失败:', error)
        emit('export-error', { type: 'excel', chart: 'orgWarning', error })
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

        const chartElement = document.getElementById('orgWarningChart')
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
        link.download = `组织预警排名TOP10-${new Date().getTime()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        emit('export-success', { type: 'image', chart: 'orgWarning' })
        proxy.$message?.success('图片导出成功')
      }
      catch (error) {
        console.error('导出图片失败:', error)
        emit('export-error', { type: 'image', chart: 'orgWarning', error })
        proxy.$message?.error('导出图片失败，请稍后重试')
      }
      finally {
        exportingImage.value = false
        proxy.$closeLoading()
      }
    }

    // 行点击事件
    const handleRowClick = (row, column, event) => {
      emit('row-click', { row, column, event, chart: 'orgWarning' })
    }

    // 选择变化事件
    const handleSelectionChange = (selection) => {
      emit('selection-change', { selection, chart: 'orgWarning' })
    }

    return {
      orgWarningConfig,
      exporting,
      exportingImage,
      handleExportExcel,
      handleExportImage,
      handleRowClick,
      handleSelectionChange,
    }
  },
}
</script>

<template>
  <ChartCard
    title="组织预警排名TOP10"
    chartId="orgWarningChart"
    @export-excel="handleExportExcel"
    @export-image="handleExportImage"
  >
    <!-- 表格内容 -->
    <div id="orgWarningChart" class="org-warning-table">
      <CTable
        height="260px"
        :tableData="data"
        :list="orgWarningConfig"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      />
    </div>
  </ChartCard>
</template>

<style scoped lang="scss">
.org-warning-container {
  display: flex;
  flex-direction: column;

  .org-warning-table {
    flex: 1;
    padding: 16px;
    background: #fff;
    border-radius: 0 0 6px 6px;
  }
}
</style>
