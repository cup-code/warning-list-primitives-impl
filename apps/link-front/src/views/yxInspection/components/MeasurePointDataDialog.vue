<script>
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'
import {
  getPlaceBindIoHistoryTrend,
  getPlaceBindIoRealTrend,
} from '@/http/inspection/yx-inspection-api'

export default {
  name: 'MeasurePointDataDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    bindId: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance()

    // ── Real-time state ──────────────────────────────────────────────
    const realData = ref(null)
    const realLoaded = ref(false) // 是否完成过至少一次请求（区分「加载中」与「无数据」）
    const realError = ref(false)

    // 受控 visible：以 computed get/set 桥接父级 :visible.sync，避免直接改 prop
    const dialogVisible = computed({
      get: () => props.visible,
      set: v => emit('update:visible', v),
    })

    let pollTimer = null
    let realPending = false // guard against overlapping requests

    function stopPolling() {
      if (pollTimer !== null) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    async function fetchRealTrend() {
      if (!props.bindId || realPending)
        return
      realPending = true
      try {
        const res = await getPlaceBindIoRealTrend(props.bindId)
        realData.value = res && res.data && res.data.result ? res.data.result : null
        realError.value = false
      }
      catch (e) {
        realError.value = true
        realData.value = null
      }
      finally {
        realPending = false
        realLoaded.value = true
      }
    }

    function startPolling() {
      stopPolling()
      fetchRealTrend()
      pollTimer = setInterval(fetchRealTrend, 5000)
    }

    // ── History state ────────────────────────────────────────────────
    const now = Date.now()
    const dateRange = ref([new Date(now - 3600 * 1000), new Date(now)])
    const historyLoading = ref(false)
    const historyData = ref(null) // null = not fetched yet, [] = empty result
    const historyChartOption = ref(null)

    function buildChartOption(rows) {
      const xData = rows.map(r => r.eventDate || r.receivedDate || '')
      const yData = rows.map((r) => {
        const v = Number.parseFloat(r.value)
        return Number.isFinite(v) ? v : null
      })
      return {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
        },
        grid: { left: '8%', right: '5%', bottom: '12%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            rotate: 30,
            fontSize: 11,
            formatter: (val) => {
              if (!val)
                return ''
              // show last 8 chars (HH:mm:ss or date tail)
              return String(val).slice(-8)
            },
          },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [
          {
            type: 'line',
            data: yData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { color: '#4A90D9', width: 2 },
            itemStyle: { color: '#4A90D9' },
            connectNulls: false,
          },
        ],
      }
    }

    async function fetchHistoryTrend() {
      if (!props.bindId) {
        instance
        && instance.proxy.$message
        && instance.proxy.$message.warning('请先选择测点')
        return
      }
      if (!dateRange.value || dateRange.value.length < 2) {
        instance
        && instance.proxy.$message
        && instance.proxy.$message.warning('请选择时间范围')
        return
      }
      const startDate = new Date(dateRange.value[0]).getTime()
      const endDate = new Date(dateRange.value[1]).getTime()
      historyLoading.value = true
      historyData.value = null
      historyChartOption.value = null
      try {
        const res = await getPlaceBindIoHistoryTrend(props.bindId, {
          startDate,
          endDate,
        })
        const rows = res && res.data && res.data.result ? res.data.result : []
        historyData.value = rows
        if (rows.length > 0) {
          historyChartOption.value = buildChartOption(rows)
        }
      }
      catch (e) {
        historyData.value = []
        instance
        && instance.proxy.$message
        && instance.proxy.$message.error('历史数据加载失败')
      }
      finally {
        historyLoading.value = false
      }
    }

    // ── Dialog lifecycle ─────────────────────────────────────────────
    function handleClose() {
      stopPolling()
      realData.value = null
      realError.value = false
      historyData.value = null
      historyChartOption.value = null
      emit('update:visible', false)
      emit('close')
    }

    watch(
      () => props.visible,
      (val) => {
        if (val && props.bindId) {
          realLoaded.value = false
          startPolling()
        }
        else if (!val) {
          stopPolling()
        }
      },
    )

    watch(
      () => props.bindId,
      (val) => {
        if (props.visible && val) {
          startPolling()
        }
      },
    )

    onBeforeUnmount(() => {
      stopPolling()
    })

    return {
      realData,
      realLoaded,
      realError,
      dialogVisible,
      dateRange,
      historyLoading,
      historyData,
      historyChartOption,
      handleClose,
      fetchHistoryTrend,
    }
  },
}
</script>

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="测点数据"
    append-to-body
    width="980px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- ── Real-time section ── -->
    <div class="mpd-section">
      <div class="mpd-section-title">
        实时数据
      </div>
      <div v-if="!realLoaded" class="mpd-empty">
        加载中…
      </div>
      <div v-else-if="realError || !realData" class="mpd-empty">
        暂无有效数据
      </div>
      <div v-else class="mpd-realtime-grid">
        <div class="mpd-realtime-row">
          <span class="mpd-label">测点名称</span>
          <span class="mpd-value">{{ realData.name || "—" }}</span>
        </div>
        <div class="mpd-realtime-row">
          <span class="mpd-label">当前值</span>
          <span
            v-if="
              realData.quality != null
                && realData.quality !== ''
                && String(realData.quality) !== '0'
            "
            class="mpd-value mpd-invalid"
          >数据无效</span>
          <span v-else class="mpd-value mpd-highlight">
            {{
              typeof realData.value === "number"
                ? realData.value.toFixed(2)
                : Number(realData.value).toFixed(2)
            }}
            <span v-if="realData.unit" class="mpd-unit">{{ realData.unit }}</span>
          </span>
        </div>
        <div class="mpd-realtime-row">
          <span class="mpd-label">类型</span>
          <span class="mpd-value">{{
            $dictUtils.getDictLabel("output_type", realData.type) || "—"
          }}</span>
        </div>
        <div class="mpd-realtime-row">
          <span class="mpd-label">事件时间</span>
          <span class="mpd-value">{{ realData.eventDate || "—" }}</span>
        </div>
        <div v-if="realData.level || realData.msg" class="mpd-realtime-row mpd-alarm-row">
          <span class="mpd-label">报警</span>
          <span class="mpd-value mpd-alarm">
            <span v-if="realData.level">级别：{{ realData.level }}</span>
            <span v-if="realData.msg"> {{ realData.msg }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ── History section ── -->
    <div class="mpd-section mpd-history-section">
      <div class="mpd-section-title">
        历史趋势
      </div>
      <div class="mpd-history-toolbar">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="small"
          style="width: 360px"
        />
        <el-button
          type="primary"
          size="small"
          :loading="historyLoading"
          style="margin-left: 8px"
          @click="fetchHistoryTrend"
        >
          查询
        </el-button>
      </div>

      <div v-if="historyData === null" class="mpd-empty">
        请点击查询以查看历史趋势
      </div>
      <div v-else-if="historyData.length === 0" class="mpd-empty">
        该时间段暂无数据
      </div>
      <div v-else class="mpd-chart-container">
        <v-chart class="mpd-chart" :options="historyChartOption" autoresize />
      </div>
    </div>

    <span slot="footer">
      <el-button size="small" @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>
.mpd-section {
  margin-bottom: 20px;
}
.mpd-history-section {
  margin-top: 4px;
}
.mpd-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}
.mpd-realtime-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mpd-realtime-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mpd-label {
  min-width: 80px;
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}
.mpd-value {
  font-size: 13px;
  color: #303133;
}
.mpd-highlight {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}
.mpd-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}
.mpd-invalid {
  color: #f56c6c;
  font-weight: 600;
}
.mpd-alarm-row {
  margin-top: 4px;
}
.mpd-alarm {
  color: #e6a23c;
  font-size: 13px;
}
.mpd-history-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.mpd-chart-container {
  width: 100%;
  height: 300px;
}
.mpd-empty {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}
.mpd-chart {
  width: 100%;
  height: 100%;
}
</style>
