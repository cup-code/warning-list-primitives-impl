/* * @Author: xiaorui 新的维保记录页面 * @Date: 2022-07-27 14:18:25 * @Last Modified by: xiaorui *
@Last Modified time: 2022-07-27 16:27:02 */
<script>
import { getMaintenanceRecordByPageFn } from '@/http/dev_new/maintenance-api'
import { MAINTBANCE_EXECUTE_RECORD } from '@/http/excel-api'
import DeviceTree from '@/views/common-ui/DeviceTree'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'

export default {
  components: {
    DeviceTree,
    ExcelExport,
  },
  data() {
    return {
      isLoading: false,
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '', // 部门id
        deviceId: '', // 设备id
        startDate: '', // 开始时间
        endDate: '', // 结束时间
        maintenanceContent: '', // 维保内容
        replaceParts: '', // 更换零件
      },
      timeValue: '', // 搜索条件中的起止时间
      tableData: [],
      total: 0,
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      isShow: false,
      isDisabled: false,
      endDatePicker: this.processDate(),
    }
  },
  created() {
    this.getPrefix()
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getMaintenanceRecordByPageFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 点击查询按钮
    searchFn() {
      this.sForm.pageNum = 1
      this.getTableData()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.nodeType === 'device') {
        this.sForm.deviceId = data.id
        this.sForm.departmentId = ''
      }
      else {
        this.sForm.departmentId = data.id
        this.sForm.deviceId = ''
      }
      this.getTableData()
    },
    /* 点击导出维保记录 */
    exportClick() {
      if (!this.sForm.startDate || !this.sForm.endDate) {
        this.$message.warning('请选择维保时间')
        return
      }
      const params = {}
      for (const key in this.sForm) {
        if (this.sForm[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: MAINTBANCE_EXECUTE_RECORD,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 导出弹窗关闭
    dialogEvt() {
      this.showExportDialog = false
    },

    //  校验结束时间不能大约开始时间
    processDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.sForm.startDate) {
            // 如果开始时间不为空，则结束时间大于开始时间
            return new Date(self.sForm.startDate).getTime() > time.getTime()
          }
        },
      }
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    // 获取创建开始时间
    getStartTime() {
      if (this.sForm.startDate) {
        this.isDisabled = false
      }
    },
    // 获取创建结束时间
    getEndTime(e) {
      if (!this.sForm.startDate) {
        this.isDisabled = true
        this.$message.warning('请先选择开始时间')
      }
    },
    resetSearch() {
      this.sForm.maintenanceContent = ''
      this.sForm.replaceParts = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.getPrefix()
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable
    ref="treeTable"
    v-loading="isLoading"
  >
    <DeviceTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        @submit.native.prevent
      >
        <el-form-item
          prop="taskName"
          label="维保内容"
        >
          <el-input
            v-model="sForm.maintenanceContent"
            placeholder="维保内容"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item
          prop="taskName"
          label="更换零件"
        >
          <el-input
            v-model="sForm.replaceParts"
            placeholder="更换零件"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item
          label="维保开始时间"
          prop="startDate"
        >
          <el-date-picker
            v-model="sForm.startDate"
            style="width: 180px"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="维保开始时间"
            @change="getStartTime"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="维保结束时间"
          prop="endDate"
        >
          <el-date-picker
            v-model="sForm.endDate"
            style="width: 180px"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="维保结束时间"
            :picker-options="endDatePicker"
            :disabled="isDisabled"
            @focus="getEndTime"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
            @click="searchFn"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            class="reset"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
        <el-form-item v-if="!isShow">
          <el-button
            type="text"
            icon="el-icon-arrow-down"
            @click="openUp"
          >
            高级筛选
          </el-button>
        </el-form-item>
        <el-form-item v-else>
          <el-button
            type="text"
            icon="el-icon-arrow-up"
            style="color: black"
            @click="putAway"
          >
            收起
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          class="export-excel"
          icon="el-icon-upload2"
          @click="exportClick"
        >
          导出计划
        </el-button>
      </div>
      <!-- 表格 -->
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="92%"
      >
        <el-table-column
          label="设备"
          align="center"
          prop="assetDeviceName"
        />
        <el-table-column
          label="部门车间"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="维保类型"
          align="center"
          prop="maintenanceType"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.maintenanceType === 'MINOR'">
              小修
            </el-tag>
            <el-tag
              v-if="props.row.maintenanceType === 'MEDIUM'"
              type="info"
            >
              中修
            </el-tag>
            <el-tag
              v-if="props.row.maintenanceType === 'ROUTINE'"
              type="success"
            >
              日常维保
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="维保内容"
          align="center"
          prop="maintenanceContent"
        />
        <el-table-column
          label="维保要求"
          align="center"
          prop="maintenanceRequirement"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.maintenanceRequirement" />
          </template>
        </el-table-column>
        <el-table-column
          label="照片"
          align="center"
          prop="photo"
          min-width="100"
        >
          <template slot-scope="props">
            <div style="display: flex; align-items: center; justify-content: center">
              <el-popover
                class="icon-pop"
                placement="right"
                trigger="hover"
              >
                <img
                  :src="filePrefix + props.row.photo"
                  style="height: 200px"
                >
                <img
                  v-if="props.row.photo"
                  slot="reference"
                  :src="filePrefix + props.row.photo"
                  style="height: 30px"
                >
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="维保记录(原因)"
          align="center"
          prop="maintenanceReasons"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.maintenanceReasons" />
          </template>
        </el-table-column>
        <el-table-column
          label="更换零件记录"
          align="center"
          prop="replaceParts"
          min-width="180"
        />
        <el-table-column
          label="执行人"
          align="center"
          prop="executeUsername"
        />
        <el-table-column
          label="执行时间"
          align="center"
          prop="executeTime"
          min-width="160"
        />
        <el-table-column
          label="常见故障现象"
          align="center"
          prop="commonFaults"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.commonFaults" />
          </template>
        </el-table-column>
        <el-table-column
          label="可能故障原因"
          align="center"
          prop="possibleCause"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.possibleCause" />
          </template>
        </el-table-column>
        <el-table-column
          label="故障处理方法"
          align="center"
          fixed="right"
          prop="disposalMethod"
          min-width="180"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.disposalMethod" />
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>

    <!-- excel导出 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="dialogEvt($event, 'export')"
      />
    </el-dialog>
  </TreeTable>
</template>

<style lang="scss" scoped>
.search {
  margin-bottom: 10px;
}
.auxiliary-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
