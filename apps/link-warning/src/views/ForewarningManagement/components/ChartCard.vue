<script>
export default {
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    chartId: {
      type: String,
      required: true,
    },
  },
  emits: ['export-excel', 'export-image'],
}
</script>

<template>
  <div class="border border-gray-200 rounded-md bg-white">
    <div class="chart-header">
      <span class="chart-title">{{ title }}</span>
      <div class="flex gap-2">
        <EButton
          type="primary"
          size="mini"
          btnIcon="el-icon-download"
          @click="$emit('export-excel')"
        >
          Excel导出
        </EButton>
        <EButton
          type="success"
          size="mini"
          btnIcon="el-icon-picture-outline"
          @click="$emit('export-image')"
        >
          图片导出
        </EButton>
      </div>
    </div>
    <div :id="chartId" class="chart-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
}

.chart-content {
  flex: 1;
  box-sizing: border-box;
  padding: 10px 16px;
  min-height: 270px;
}
</style>
