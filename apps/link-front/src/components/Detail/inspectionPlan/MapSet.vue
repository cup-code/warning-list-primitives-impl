/* * @Author: xiaorui 巡检计划中的路线设置 * @Date: 2022-05-12 10:04:33 * @Last Modified by: xiaorui
* @Last Modified time: 2022-08-05 14:26:30 */
<script>
import Sortable from 'sortablejs'
// import MapSetForm from './dialog/mapSetForm'
import {
  getInspectionPositionByDepartFn,
  getPlanInfoByIdFn,
  getPlanLineFn,
  savePlanLineFn,
} from '@/http/dev_new/inspection-api'

export default {
  // components: {
  //   MapSetForm
  // },
  props: {
    id: String,
    method: String,
  },
  data() {
    return {
      tableData: [],
      loading: false,
      planBaseInfo: {},
      pointList: [],
    }
  },
  mounted() {
    // 获取计划的路线信息
    // 获取计划的基础信息
    if (this.id !== 'null') {
      this.getLineInfo()
      this.getPlanInfoById()
      setTimeout(() => {
        this.rowDrop()
      }, 1000)
    }
  },
  methods: {
    // 查询巡检计划的基础信息
    getPlanInfoById() {
      getPlanInfoByIdFn(this.id).then(({ data }) => {
        this.planBaseInfo = data.result || {}
        // 通过部门id获取部门下的巡检点
        this.getInspectionPositionByDepart(this.planBaseInfo.departmentId)
      })
    },
    // 通过部门id获取部门下的巡检点
    getInspectionPositionByDepart(departmentId) {
      getInspectionPositionByDepartFn(departmentId).then(({ data }) => {
        this.pointList = data.result || []
      })
    },
    // 获取数据列表
    getLineInfo() {
      getPlanLineFn(this.id).then(({ data }) => {
        if (data.success) {
          this.tableData = data.result || []
        }
      })
    },
    // 地图选点
    // drawLine () {
    //   this.$refs.mapSetForm.init(this.id)
    // },
    // 添加巡检点
    addInspectionPoint() {
      if (this.id === 'null') {
        this.$message.error('请先保存计划基础信息')
        return
      }
      this.tableData.push({
        sortOrder: '',
        planPlaceId: '', // 巡检点id
      })
    },
    // 删除巡检点
    delFn(index) {
      this.tableData.splice(index, 1)
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(tbody, {
        handle: '.handle',
        animation: 150,
        onEnd: (_ref) => {
          const newIndex = _ref.newIndex
          const oldIndex = _ref.oldIndex
          const currRow = this.tableData.splice(oldIndex, 1)[0]
          this.tableData.splice(newIndex, 0, currRow)
        },
      })
    },
    // 保存线路
    savePlanLine() {
      const placeIdList = this.tableData.map((item) => {
        return item.planPlaceId
      })
      const params = {
        planId: this.id,
        placeIdList,
      }
      savePlanLineFn(params).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '保存成功')
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
  <div class="contentArea">
    <el-row class="mb-3">
      <el-col :span="14">
        <!-- <el-button type="primary" @click="drawLine" :disabled="method==='view'">地图选点</el-button> -->
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="addInspectionPoint"
        >
          添加巡检点
        </el-button>
      </el-col>
      <el-col
        :span="10"
        class="btnArea"
      >
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="savePlanLine"
        >
          保存
        </el-button>
        <el-button
          style="margin-left: 10px"
          @click="backFn"
        >
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableData"
      height="71vh"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      row-key="sortOrder"
    >
      <el-table-column
        prop="sortOrder"
        label="序号"
        width="50"
      >
        <template slot-scope="scope">
          {{ (scope.row.sortOrder = scope.$index + 1) }}
        </template>
      </el-table-column>
      <el-table-column
        width="50"
        align="center"
        label="拖动"
      >
        <i class="el-icon-rank handle" />
      </el-table-column>
      <el-table-column
        align="center"
        prop="planPlaceId"
        width="280"
        label="巡检点"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.planPlaceId"
            placeholder="请选择"
            style="width: 100%"
            filterable
            :disabled="method === 'view'"
          >
            <el-option
              v-for="item in pointList"
              :key="item.id"
              :label="item.placeName"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            style="color: red"
            type="text"
            :disabled="method === 'view'"
            @click="delFn(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <map-set-form @refreshDataList="getLineInfo" ref="mapSetForm" :lineInfo="tableData" :departmentId="planBaseInfo.departmentId"></map-set-form> -->
  </div>
</template>

<style lang="scss" scoped>
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.handle {
  cursor: pointer;
}
</style>
