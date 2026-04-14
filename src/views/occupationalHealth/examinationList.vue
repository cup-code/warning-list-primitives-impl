<script>
import {
  getExaminationBook,
  InspectionRecordIMPORT,
  removeExaminationBook,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ExaDialog from './components/ExaDialog'
import { getAuthToken } from '@/utils/tab-session'

export default {
  name: 'examinationList',
  components: { OwnDeparmentTree, ExaDialog, ExcelExport },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        postName: '',
        userName: '',
        harmFactor: '',
        examinationNature: '',
      },
      natureList: [
        {
          label: '岗前',
          value: 1,
        },
        {
          label: '岗中',
          value: 2,
        },
        {
          label: '离岗',
          value: 3,
        },
      ],
      tableData: [],
      showMore: false,
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      jobList: [],
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
    }
  },
  computed: {
    setHarmFactor() {
      return function (val) {
        let msg = '--'
        const hazardsList = this.$dictUtils.getDictList('occupational_hazards')
        hazardsList.forEach((res) => {
          if (val == res.id) {
            msg = res.dictName
          }
        })
        return msg
      }
    },
  },
  created() {
    this.getTableData()
    const companyId = this.$store.state.user.user.companyId
    if (companyId) {
      this.getJobList(companyId)
    }
  },
  methods: {
    // 获取部门下的岗位
    getJobList(companyId) {
      getAllPostByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.jobList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
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
          key: 'ExaminationBook',
          name: '体检记录列表',
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
      this.$utils.download('/excel/getImportTemplate/ExaminationBook', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'ExaminationBook')
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
    /* 点击显示/隐藏更多 */
    showMoreClick(isShow) {
      this.showMore = isShow
      this.$nextTick(() => {
        this.$refs.treeTable.setTableHeight()
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
      this.searchFn()
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getExaminationBook(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            this.tableData.forEach((data) => {
              data.conclusion = data.examinationConclusion ? '合格' : '不合格'
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
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增体检记录列表项'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑体检记录列表项'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看体检记录列表项'
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
      this.$confirm('您确认要删除此体检记录列表项' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeExaminationBook(v.id)
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
      this.searchData.harmFactor = ''
      this.searchData.postName = ''
      this.searchData.departmentId = ''
      this.searchData.examinationNature = ''
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
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        size="mini"
        label-width="100"
      >
        <el-row>
          <el-form-item label="人员姓名">
            <el-input
              v-model="searchData.userName"
              placeholder="请输入名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="岗位名称">
            <el-select
              v-model="searchData.postName"
              class="small-row"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in jobList"
                :key="item.id"
                :label="item.postName"
                :value="item.postName"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="体检类型">
            <el-select
              v-model="searchData.harmFactor"
              class="small-row"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('occupational_hazards')"
                :key="item.id"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <template v-if="showMore">
            <el-form-item label="体检性质">
              <el-select
                v-model="searchData.examinationNature"
                class="small-row"
                placeholder="请选择"
                clearable
              >
                <el-option
                  v-for="item in natureList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
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
          <el-form-item v-if="!showMore">
            <el-button
              type="text"
              icon="el-icon-arrow-down"
              style="color: var(--ky-primary)"
              @click="showMoreClick(true)"
            >
              高级筛选
            </el-button>
          </el-form-item>
          <el-form-item v-else>
            <el-button
              type="text"
              icon="el-icon-arrow-up"
              style="color: var(--ky-primary)"
              @click="showMoreClick(false)"
            >
              收起
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('examination_list_add')"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
        <el-button
          v-if="hasBtnPermission('examination_list_derive')"
          type="primary"
          @click="getExport"
        >
          Excel导出
        </el-button>
        <el-button
          v-if="hasBtnPermission('examination_list_template')"
          plain
          size="mini"
          icon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </el-button>
        <el-upload
          v-if="hasBtnPermission('examination_list_import')"
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
        :border="true"
        class="customer-table"
      >
        <el-table-column
          label="体检档案编号"
          align="center"
          prop="medicalExaminationNo"
          min-width="120"
        />
        <el-table-column
          label="姓名"
          align="center"
          prop="userName"
        />
        <el-table-column
          label="性别"
          align="center"
          prop="sex"
          min-width="150"
        />
        <el-table-column
          label="年龄"
          align="center"
          prop="age"
        />
        <el-table-column
          label="体检日期"
          align="center"
          prop="examinationDate"
          min-width="150"
        />
        <el-table-column
          label="所属岗位"
          align="center"
          prop="postName"
        />
        <el-table-column
          label="体检类型"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ setHarmFactor(scope.row.harmFactor) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="体检状态"
          align="center"
          prop="occupationalDiseasesType"
          min-width="180"
        />
        <el-table-column
          label="体检性质"
          align="center"
          prop="examinationNature"
          min-width="80"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.examinationNature == 1
                ? '岗前'
                : scope.row.examinationNature == 2
                  ? '岗中'
                  : scope.row.examinationNature == 3
                    ? '离岗'
                    : '--'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="体检结果"
          align="center"
          prop="examinationResult"
          min-width="150"
        />
        <el-table-column
          label="体检结论"
          align="center"
          prop="examinationConclusion"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.examinationConclusion == 1
                ? '合格'
                : scope.row.examinationConclusion == 0
                  ? '不合格'
                  : '--'
            }}</span>
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
              v-if="hasBtnPermission('examination_list_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('examination_list_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('examination_list_delete')"
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

      width="900px"
      :visible.sync="visibleForm"
    >
      <ExaDialog
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
