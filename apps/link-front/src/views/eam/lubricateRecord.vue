<!-- 润滑记录页面 -->
<script>
import { getRecordTable } from '@/http/dev_new/lubricatePlan-api'
import { LUBRICATE_RECORD } from '@/http/excel-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
    ExcelExport,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        deviceNameOrCode: '',
        lubricatePosition: '',
        startDate: '', // 开始时间
        endDate: '', // 结束时间
      },
      tableData: [],
      timeValue: '', // 搜索条件中的起止时间
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      isDisabled: false,
      isShow: false,
      endDatePicker: this.processDate(),
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getRecordTable(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            // 数据字典，手动设置：润滑油脂名称、润滑方式
            data.result.list.forEach((item, index) => {
              this.tableData[index].lubricateTypeContent = this.$dictUtils.getDictLabelById(
                'lubricate_type',
                item.lubricateType,
              )
              const List = []
              item.lubricateGreaseList.forEach((item) => {
                List.push(this.$dictUtils.getDictLabelById('lubricate_grease', item))
              })
              this.tableData[index].greaseListContent = List.toString()
            })
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
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.departmentId = ''
      }
      this.getTableData()
    },
    /* 点击导出润滑记录 */
    exportClick() {
      if (!this.searchData.startDate || !this.searchData.endDate) {
        this.$message.warning('请选择润滑时间')
        return
      }
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: LUBRICATE_RECORD,
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
          if (self.searchData.startDate) {
            // 如果开始时间不为空，则结束时间大于开始时间
            return new Date(self.searchData.startDate).getTime() > time.getTime()
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
      if (this.searchData.startDate) {
        this.isDisabled = false
      }
    },
    // 获取创建结束时间
    getEndTime(e) {
      if (!this.searchData.startDate) {
        this.isDisabled = true
        this.$message.warning('请先选择开始时间')
      }
    },
    resetSearch() {
      this.searchData.deviceNameOrCode = ''
      this.searchData.lubricatePosition = ''
      this.searchData.startDate = ''
      this.searchData.endDate = ''
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
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <!-- 搜索栏 -->
      <el-form
        inline
        label-width="100"
      >
        <el-row>
          <el-form-item label="设备名称或编号">
            <el-input
              v-model="searchData.deviceNameOrCode"
              placeholder="名称或编号"
              clearable
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item label="润滑部位">
            <el-input
              v-model="searchData.lubricatePosition"
              placeholder="请输入润滑部位"
              clearable
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item
            label="润滑开始时间"
            prop="startDate"
          >
            <el-date-picker
              v-model="searchData.startDate"
              style="width: 170px"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="润滑开始时间"
              @change="getStartTime"
            />
          </el-form-item>
          <el-form-item
            v-if="isShow"
            label="润滑结束时间"
            prop="endDate"
          >
            <el-date-picker
              v-model="searchData.endDate"
              style="width: 170px"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="润滑结束时间"
              :disabled="isDisabled"
              :picker-options="endDatePicker"
              @focus="getEndTime"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
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
        </el-row>
      </el-form>
    </ECard>

    <ECard
      slot="table"
      style="height: 100%"
    >
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
        align="center"
        height="92%"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="公司"
          align="center"
          prop="companyName"
          min-width="150"
        />
        <el-table-column
          label="设备"
          align="center"
          prop="assetDeviceName"
        />
        <el-table-column
          label="设备编号"
          align="center"
          prop="assetDeviceCode"
        />
        <el-table-column
          label="部门车间"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="润滑部位"
          align="center"
          prop="lubricatePosition"
        />
        <el-table-column
          label="润滑点数"
          align="center"
          prop="lubricatePoints"
        />
        <el-table-column
          label="润滑油脂名称"
          align="center"
          prop="greaseListContent"
          min-width="150"
        />
        <el-table-column
          label="润滑时间"
          align="center"
          prop="lubricateTime"
          min-width="150"
        />
        <el-table-column
          label="润滑方式"
          align="center"
          prop="lubricateTypeContent"
        />
        <el-table-column
          label="润滑责任人"
          align="center"
          prop="responsibleUserName"
        />
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <!-- 分页器 -->
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        style="text-align: right"
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
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
