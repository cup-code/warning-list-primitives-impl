<script>
import {
  getLaborPlanList,
  InspectionRecordIMPORT,
  removeHygieneIdentification,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import LaborPlanDialog from '../components/laborPlanDialog'
import { getAuthToken } from '@/utils/tab-session'

export default {
  components: {
    OwnDeparmentTree,
    LaborPlanDialog,
    ExcelExport,
  },
  data() {
    return {
      isLoading: false,
      isShow: false,
      total: 0,
      uploadLimit: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [],
      departmentList: [],
      jobList: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
    }
  },
  created() {
    this.getTableData()
    const companyId = this.$store.state.user.user.companyId
    const departmentId = this.$store.state.user.user.departmentId
    this.getAllDepartByCompany(companyId)
    this.getJobList(departmentId)
  },
  methods: {
    // 导出
    getExport() {
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: {
          key: 'HarmFactor',
          name: '职业危害因素辨识',
        },
        reqData: params,
      }
      this.showExportDialog = true
    },
    dialogEvt() {
      this.showExportDialog = false
    },
    // 导入
    getImportTemplate() {
      this.$utils.download('/excel/getImportTemplate/HarmFactor', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'HarmFactor')
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getTableData()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
        .finally(() => {
          this.isLoading = false
          this.$refs.fileUpload.clearFiles()
        })
    },
    // 通过公司查部门
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.departmentList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 获取部门下的岗位
    getJobList(departmentId) {
      getPostByDepartmentId(departmentId)
        .then(({ data }) => {
          if (data.success) {
            this.jobList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
        this.getJobList(this.searchData.departmentId)
      }
      else {
        this.searchData.departmentId = ''
      }
      this.searchFn()
    },
    forceUpdate(e) {
      if (e) {
        this.searchData.departmentId = e
        this.getJobList(e)
      }
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getLaborPlanList(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
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
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增劳保防护用品计划'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑劳保防护用品计划'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看劳保防护用品计划'
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此职业危害因数辨识' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeHygieneIdentification(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    resetSearch() {
      this.searchData.pageNum = 1
      this.searchData.planName = ''
      this.searchData.departmentId = ''
      this.searchData.postId = ''
      this.searchData.planStartDate = ''
      this.searchData.planEndDate = ''
      this.getTableData()
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
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="计划名称">
          <el-input
            v-model="searchData.planName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="部门"
          prop="departmentId"
        >
          <el-select
            v-model="searchData.departmentId"
            class="small-row"
            placeholder="请选择"
            clearable
            @change="forceUpdate"
          >
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select
            v-model="searchData.postId"
            class="small-row"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in jobList"
              :key="item.id"
              :label="item.postName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="计划开始时间"
          prop="planStartDate"
        >
          <el-date-picker
            v-model="searchData.planStartDate"
            class="small-row"
            style="width: 192px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="计划结束时间"
          prop="planEndDate"
        >
          <el-date-picker
            v-model="searchData.planEndDate"
            class="small-row"
            style="width: 192px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
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
          <el-button
            class="reset"
            size="small"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
          <el-button
            v-if="!isShow"
            type="text"
            icon="el-icon-arrow-down"
            @click="openUp"
          >
            高级筛选
          </el-button>
          <el-button
            v-else
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
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        @click="changeFn('add')"
      >
        新增
      </el-button>
      <!-- <el-button type='primary' @click='getExport'>Excel导出</el-button> -->
      <el-button
        plain
        size="mini"
        icon="el-icon-download"
        @click="getImportTemplate"
      >
        模板下载
      </el-button>
      <el-upload
        ref="fileUpload"
        style="display: inline-flex; margin-left: 10px"
        action="#"
        :headers="uploadLimit.header"
        :limit="1"
        :accept="uploadLimit.accept.toString()"
        :http-request="getImport"
        :show-file-list="false"
      >
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-upload"
        >
          Excel导入
        </el-button>
        <div
          slot="tip"
          class="el-upload__tip"
        >
          只允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      align="center"
      height="100%"
    >
      <!--      <el-table-column type='index' width='50' align='center' label='序号' /> -->
      <el-table-column
        label="劳保用品计划名称"
        align="center"
        prop="planName"
      />
      <el-table-column
        label="计划日期"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope" />
      </el-table-column>
      <el-table-column
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="岗位"
        align="center"
        prop="postName"
      />
      <el-table-column
        label="工作安排"
        align="center"
        prop="workArrange"
        min-width="150"
      />
      <el-table-column
        label="劳保种类及数量"
        align="center"
        min-width="180"
      >
        <template slot-scope="scope">
          <span
            v-for="(item, index) in scope.row.laborProtection"
            :key="index"
          >
            {{ item }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="编制日期"
        align="center"
      />
      <el-table-column
        label="计划状态"
        align="center"
        prop="planStatus"
      />
      <el-table-column
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            style="color: var(--ky-warning)"
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            修改
          </el-button>
          <el-button
            style="color: var(--ky-warning)"
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            发放
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      style="padding-top: 10px"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleForm"
    >
      <LaborPlanDialog
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
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

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
