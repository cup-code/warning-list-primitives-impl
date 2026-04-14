/* * @Author: xiaorui 设备详情里的数据测点部分 * @Date: 2022-06-29 10:19:00 * @Last Modified by:
xiaorui * @Last Modified time: 2022-12-28 17:45:30 */
<script>
import PointSelect from '@/components/PointSelect/index'
import {
  addDataPointFn,
  deleteDataPointFn,
  getDataPointFn,
} from '@/http/dev_new/manage-api'
import PointHistoryChart from './pointHistoryChart'
import PointRealtimeChart from './pointRealtimeChart'

export default {
  name: 'DataPoint',
  components: {
    PointSelect,
    PointRealtimeChart,
    PointHistoryChart,
  },
  props: {
    did: String,
    method: String,
  },
  data: () => ({
    loading: false,
    pointList: [],
  }),
  created() {
    // 如果有设备id，先获取设备的技术参数
    if (this.did !== 'null') {
      this.getDataPoint()
    }
  },
  methods: {
    // 绑定测点
    addPoint() {
      if (this.did === 'null') {
        this.$message.error('请先保存设备信息')
        return
      }
      this.$refs.pointSelect.init()
    },
    // 获取测点列表
    getDataPoint() {
      this.loading = true
      getDataPointFn(this.did).then(({ data }) => {
        this.loading = false
        if (data.result && data.result.length) {
          data.result.forEach((item) => {
            // 列表回显的时候需要用code字段
            item.code = item.ioCode
            // 查趋势图的时候需要用返回的id，也就是设备-测点绑定关系id
            item.bandId = item.id
            // 绑定点位的时候需要用测点id，在绑定点位弹框，为了公用组件，统一用的测点id
            item.id = item.ioId
          })
        }
        this.pointList = data.result || []
      })
    },
    // 查看实时趋势
    toRealtimeChart(row) {
      this.$refs.pointRealtimeChart.init(row.bandId, row.name)
    },
    // 查看历史趋势
    toHistoryChart(row) {
      this.$refs.pointHistoryChart.init(row.bandId, row.name)
    },
    // 删除测点
    deletePoint(id) {
      deleteDataPointFn(id).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '删除成功')
          this.getDataPoint()
        }
        else {
          this.$message.error(data.message || '删除失败')
        }
      })
    },
    // 保存测点到后台
    doSubmit(list) {
      this.loading = true
      const params = list.map((item) => {
        return {
          deviceId: item.deviceId,
          ioId: item.id,
        }
      })
      addDataPointFn(this.did, params).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.getDataPoint()
          this.$message.success(data.message || '保存成功')
        }
        else {
          this.$message.error(data.message || '保存失败')
        }
      })
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="point-param">
    <el-row>
      <el-col :span="6">
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="addPoint"
        >
          绑定点位
        </el-button>
      </el-col>
      <el-col
        :span="18"
        class="btnArea"
      >
        <!-- <el-button type="primary" @click="doSubmit" :loading="loading" :disabled="method==='view'">保存</el-button> -->
        <el-button @click="backFn">
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="pointList"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50"
      />
      <el-table-column
        prop="deviceName"
        align="center"
        label="终端名称"
      />
      <el-table-column
        prop="name"
        align="center"
        label="测点名称"
      />
      <el-table-column
        prop="code"
        align="center"
        label="测点编码"
      />
      <el-table-column
        prop="value"
        align="center"
        label="测点值"
      />
      <el-table-column
        prop="varType"
        align="center"
        label="测点类型"
      >
        <template slot-scope="props">
          <span>{{ $dictUtils.getDictLabel('output_type', props.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toRealtimeChart(scope.row)"
          >
            实时趋势
          </el-button>
          <el-button
            type="text"
            @click="toHistoryChart(scope.row)"
          >
            历史趋势
          </el-button>
          <el-button
            style="color: var(--ky-danger)"
            type="text"
            :disabled="method === 'view'"
            @click="deletePoint(scope.row.bandId)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <point-select
      ref="pointSelect"
      :selectData="pointList"
      @doSubmit="doSubmit"
    />
    <point-realtime-chart ref="pointRealtimeChart" />
    <point-history-chart ref="pointHistoryChart" />
  </div>
</template>

<style lang="scss" scoped>
.point-param {
  padding: 0 20px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
