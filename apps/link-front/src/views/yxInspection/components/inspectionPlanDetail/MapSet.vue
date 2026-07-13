<script>
import Sortable from 'sortablejs'
import {
  getInspectionPlanById,
  getLineById,
  saveOrUpdateLine,
  queryInspectionPlaceByPage,
} from '@/http/inspection/yx-inspection-api'

export default {
  name: 'YxInspectionPlanMapSet',
  props: {
    id: String,
    method: String,
  },
  data() {
    return {
      loading: false,
      planInfo: {},
      tableData: [],
      pointList: [],
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        if (val && val !== 'null') {
          this.getPlanInfo()
          this.getLineInfo()
          this.$nextTick(() => {
            this.initSortable()
          })
        }
      },
    },
  },
  methods: {
    async getPlanInfo() {
      try {
        const { data } = await getInspectionPlanById(this.id)
        if (data.success && data.result) {
          this.planInfo = data.result
          this.getPointList(data.result.departmentId)
        }
      } catch (error) {
        console.error('获取计划信息失败', error)
      }
    },
    async getPointList(departmentId) {
      if (!departmentId) return
      try {
        const { data } = await queryInspectionPlaceByPage({
          pageNum: 1,
          pageSize: 100,
          departmentId,
        })
        if (data.success) {
          this.pointList = (data.result?.list || []).map(item => ({
            id: item.id,
            placeName: item.placeName,
            placeCode: item.placeCode,
          }))
        }
      } catch (error) {
        console.error('获取巡检点列表失败', error)
      }
    },
    async getLineInfo() {
      this.loading = true
      try {
        const { data } = await getLineById(this.planInfo.lineId || this.id)
        this.loading = false
        if (data.success && data.result) {
          const places = data.result.yxInspectionLinePlaces || []
          this.tableData = places.map(item => ({
            id: item.id,
            placeId: item.placeId,
            placeName: item.placeName,
            sortOrder: item.sortOrder,
          }))
        }
      } catch (error) {
        this.loading = false
      }
    },
    initSortable() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      if (tbody) {
        Sortable.create(tbody, {
          handle: '.handle',
          animation: 150,
          onEnd: ({ newIndex, oldIndex }) => {
            const currRow = this.tableData.splice(oldIndex, 1)[0]
            this.tableData.splice(newIndex, 0, currRow)
          },
        })
      }
    },
    addInspectionPoint() {
      if (!this.id || this.id === 'null') {
        this.$message.error('请先保存计划基础信息')
        return
      }
      this.tableData.push({
        placeId: '',
        sortOrder: this.tableData.length + 1,
      })
    },
    delFn(index) {
      this.tableData.splice(index, 1)
    },
    async savePlanLine() {
      if (!this.id || this.id === 'null') {
        this.$message.error('请先保存计划基础信息')
        return
      }
      const placeIdList = this.tableData.map(item => item.placeId).filter(id => id)
      if (placeIdList.length === 0) {
        this.$message.warning('请至少添加一个巡检点')
        return
      }
      this.loading = true
      try {
        const { data } = await saveOrUpdateLine({
          id: this.planInfo.lineId,
          lineName: this.planInfo.planName,
          placeIdList,
        })
        this.loading = false
        if (data.success) {
          this.$message.success(data.message || '保存成功')
          // 更新路线ID
          if (!this.planInfo.lineId) {
            this.planInfo.lineId = data.result
          }
        } else {
          this.$message.error(data.message || '保存失败')
        }
      } catch (error) {
        this.loading = false
        this.$message.error('保存失败')
      }
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="map-set">
    <el-row class="mb-3">
      <el-col :span="14">
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="addInspectionPoint"
        >
          添加巡检点
        </el-button>
      </el-col>
      <el-col :span="10" class="btnArea">
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="savePlanLine"
        >
          保存
        </el-button>
        <el-button style="margin-left: 10px" @click="backFn">
          返回
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      height="71vh"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      row-key="id"
      border
      size="small"
    >
      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column width="50" align="center" label="拖动">
        <i class="el-icon-rank handle" style="cursor: pointer" />
      </el-table-column>
      <el-table-column align="center" prop="placeId" min-width="280" label="巡检点">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.placeId"
            placeholder="请选择巡检点"
            style="width: 100%"
            filterable
            :disabled="method === 'view'"
          >
            <el-option
              v-for="item in pointList"
              :key="item.id"
              :label="`${item.placeName}(${item.placeCode})`"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            :disabled="method === 'view'"
            @click="delFn(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.map-set {
  height: 80vh;
  overflow: auto;
  padding: 0 20px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.mb-3 {
  margin-bottom: 16px;
}
.handle {
  cursor: pointer;
}
</style>