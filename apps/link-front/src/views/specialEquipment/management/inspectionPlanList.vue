<!-- 特种设备列表页 - 检验计划 -->
<script>
import { deletePlanByIdFn, getInspectionPlanPaging } from '@/http/specialEquipment/management-api'
import InspectionPlanForm from '@/views/specialEquipment/management/components/form/inspectionPlanForm.vue'

export default {
  components: { InspectionPlanForm },
  props: {
    did: String,
    method: String,
  },
  data() {
    return {
      isLoading: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        equipmentId: this.did,
      },
      tableData: [],
      total: 0,
      isShowDialog: false,
      dialogTitle: '',
    }
  },
  watch: {
    did: {
      immediate: true,
      handler(val) {
        if (val) {
          this.queryForm.equipmentId = val
        }
      },
    },
  },
  created() {
    if (this.queryForm.equipmentId) {
      this.getTableData()
    }
  },
  methods: {
    getTableData() {
      this.isLoading = true
      getInspectionPlanPaging(this.queryForm)
        .then(({ data }) => {
          this.tableData = data.result.list || []
          this.total = data.result.total || 0
          if (!data.success) {
            this.$message.warning(data.message || '获取列表失败')
          }
        })
        .catch((e) => {
          this.$message.error('获取列表失败')
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    refreshData() {
      this.isShowDialog = false
      this.queryForm.pageNum = 1
      this.getTableData()
    },
    /**
     * 编辑按钮单击（含新增、修改、查看）
     */
    editClick(rowData, opType) {
      this.isShowDialog = true
      this.$nextTick(() => {
        switch (opType) {
          case 'add':
            this.dialogTitle = '新增检验计划'
            this.$refs.inspectionPlanForm.init({}, opType)
            break
          case 'edit':
            this.dialogTitle = '修改检验计划'
            this.$refs.inspectionPlanForm.init(rowData, opType)
            break
          default:
            this.dialogTitle = '查看检验计划'
            this.$refs.inspectionPlanForm.init(rowData, opType)
        }
      })
    },
    deleteClick(id) {
      this.$confirm(`您确定要删除本条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deletePlanByIdFn(id)
          .then(({ data }) => {
            if (data.success) {
              this.$message.success(data.message || '删除成功')
              this.getTableData()
            }
            else {
              this.$message.warning(data.message || '删除失败')
            }
          })
          .catch((e) => {
            this.$message.error(`数据删除异常：${e}`)
          })
      })
    },
  },
}
</script>

<template>
  <div>
    <div class="special-equipment-title">
      检验计划
    </div>
    <div class="auxiliary-button">
      <el-button
        icon="el-icon-plus"
        type="primary"
        plain
        :disabled="method === 'look'"
        @click="editClick(null, 'add')"
      >
        新增检验计划
      </el-button>
    </div>
    <el-table
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="60vh"
      highlight-current-row
    >
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        label="检验机构/部门"
        align="center"
        prop="inspectionDepartment"
        min-width="120"
      />
      <el-table-column
        label="检验类型"
        align="center"
        prop="inspectionType"
        min-width="80"
      >
        <template #default="scope">
          <span>{{ scope.row.inspectionType === 1 ? '内检' : '外检' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="计划名称"
        align="center"
        prop="planName"
      />
      <el-table-column
        label="最近检验时间"
        align="center"
        prop="inspectionLastDate"
        min-width="120"
      />
      <el-table-column
        label="下次检验时间"
        align="center"
        prop="inspectionNextDate"
        min-width="120"
      />
      <el-table-column
        label="距离下次检验（天）"
        align="center"
        prop="remainingDays"
        min-width="150"
      />
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="editClick(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-warning)"
            :disabled="method === 'look'"
            @click="editClick(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            :disabled="method === 'look'"
            @click="deleteClick(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align: right"
      :current-page.sync="queryForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="queryForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 弹窗 -->
    <el-dialog
      class="normal-dialog"
      :title="dialogTitle"
      :visible.sync="isShowDialog"
      width="550px"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <InspectionPlanForm
        ref="inspectionPlanForm"
        :did="did"
        @refreshData="refreshData"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.auxiliary-button {
  margin-bottom: 10px;
}
</style>
