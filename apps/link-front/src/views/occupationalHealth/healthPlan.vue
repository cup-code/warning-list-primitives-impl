<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { HEALTH_PLAN } from '@/http/excel-api'
import {
  getHealthyPlan,
  importFileByID,
  InspectionRecordIMPORT,
  removeHealthyPlan,
} from '@/http/occupationalHealth/sanitation-api'
import { showFileWindow } from '@/utils/checkFile.js'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import HealthPlanDia from './components/healthPlanDia'
import { getAuthToken } from '@/utils/tab-session'

export default {
  name: 'healthPlan',
  components: { HealthPlanDia, ExcelExport, SelectTree },
  data() {
    return {
      isLoading: false,
      total: 0,
      companyId: '',
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
        programmeDate: '',
        implementationUnit: '',
        filledNameBy: '',
      },
      tableData: [],
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
    this.companyId = this.$store.state.user.user.companyId
  },
  methods: {
    showFileWindow,
    // 导出
    getExport() {
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: HEALTH_PLAN,
        reqData: params,
      }
      this.showExportDialog = true
    },
    dialogEvt() {
      this.showExportDialog = false
    },
    // 导入
    getImportTemplate() {
      this.$utils.download('/excel/getImportTemplate/HealthyPlan', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'HealthyPlan')
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
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    async getTableData() {
      this.isLoading = true
      const { data } = await getHealthyPlan(this.searchData)
      if (data.code != 200) {
        this.$message.warning(data.message || '获取列表数据失败')
      }
      else {
        this.total = data.result.total
        this.tableData = data.result.list || []
        for (const dataItem of this.tableData) {
          const planCategoryList = []
          this.$dictUtils.getDictList('plan_Category').forEach((item) => {
            if (dataItem.planCategory && dataItem.planCategory.includes(item.id)) {
              planCategoryList.push(item.dictName)
            }
          })
          dataItem.planCategoryName = planCategoryList.toString()
          dataItem.attendName = dataItem.attendUnitNames ? dataItem.attendUnitNames.toString() : ''

          importFileByID(dataItem.id).then((res) => {
            if (res.data.success) {
              this.$set(dataItem, 'fileList', res.data.result)
            }
          })
        }
      }
      // await getPlanAlarm()  // 定时器任务，开发环境测试使用
      this.isLoading = false
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增健康管理方案'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑健康管理方案'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看健康管理方案'
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
      this.$confirm('您确认要删除此健康管理方案' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeHealthyPlan(v.id)
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
      this.searchData.programmeDate = ''
      this.searchData.implementationUnit = ''
      this.searchData.filledNameBy = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    :isShowLeft="false"
  >
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        label-width="100"
        size="mini"
      >
        <el-row>
          <el-form-item
            label="方案日期"
            prop="programmeDate"
          >
            <el-date-picker
              v-model="searchData.programmeDate"
              class="small-row"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item
            label="主要实施单位"
            prop="implementationUnit"
          >
            <SelectTree
              class="special-style"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :value="searchData.implementationUnit"
              :url="companyId ? `sysDepartment/companyDepartment/${companyId}` : ' '"
              :clearable="true"
              :accordion="true"
              @getValue="
                id => {
                  searchData.implementationUnit = id
                }
              "
            />
          </el-form-item>
          <el-form-item
            label="制定人"
            prop="filledNameBy"
          >
            <el-input
              v-model="searchData.filledNameBy"
              class="special-style"
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
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('health_plan_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </EButton>
        <EButton
          v-if="hasBtnPermission('health_plan_derive')"
          type="primary"
          @click="getExport"
        >
          Excel导出
        </EButton>
        <EButton
          v-if="hasBtnPermission('health_plan_template')"
          plain
          size="mini"
          btnIcon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </EButton>
        <el-upload
          v-if="hasBtnPermission('health_plan_import')"
          ref="fileUpload"
          style="display: inline-flex; margin-left: 10px"
          action="#"
          :headers="uploadLimit.header"
          :limit="1"
          :accept="uploadLimit.accept.toString()"
          :http-request="getImport"
          :show-file-list="false"
        >
          <EButton
            size="mini"
            type="primary"
            btnIcon="el-icon-upload"
          >
            Excel导入
          </EButton>
          <div
            slot="tip"
            class="el-upload__tip ml-1"
          >
            只允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
        :border="false"
        class="customer-table"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="项目名称"
          align="center"
          prop="projectName"
          min-width="250"
        />
        <el-table-column
          label="方案提出时间"
          align="center"
          prop="programmeDate"
          min-width="150"
        />
        <el-table-column
          label="主要实施单位"
          align="center"
          prop="implementationUnitName"
          min-width="150"
        />
        <el-table-column
          label="参与单位"
          align="center"
          prop="attendName"
          min-width="150"
        />
        <el-table-column
          label="制定人"
          align="center"
          prop="filledNameBy"
          min-width="150"
        />
        <el-table-column
          label="方案范畴"
          align="center"
          prop="planCategoryName"
          min-width="150"
        />
        <el-table-column
          label="改进目标"
          align="center"
          prop="improveTarget"
          min-width="150"
        />
        <el-table-column
          label="方案附件"
          align="center"
          min-width="150"
        >
          <template slot-scope="scope">
            <div
              v-for="item in scope.row.fileList"
              :key="item.id"
            >
              <span
                style="color: #11c8e5; cursor: pointer"
                @click="showFileWindow(item.urlPath)"
              >{{ item.originalName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="160"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('health_plan_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('health_plan_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('health_plan_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="1000px"
      :visible.sync="visibleForm"
    >
      <HealthPlanDia
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
