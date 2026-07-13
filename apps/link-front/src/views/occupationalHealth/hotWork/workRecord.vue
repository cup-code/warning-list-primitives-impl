<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  getSurveyApprovalList,
  InspectionRecordIMPORT,
  removeHygieneIdentification,
} from '@/http/occupationalHealth/sanitation-api'
// import HazardIDialog from './components/hazardIDialog'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
    // HazardIDialog,
    ExcelExport,
  },
  data() {
    return {
      isLoading: false,
      isShow: true,
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
        reportWriterDate: '',
        postId: '',
        personnel: '',
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
          key: 'TemperatureInvestigateRecord',
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
      this.$utils.download('/excel/getImportTemplate/TemperatureInvestigateRecord', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'TemperatureInvestigateRecord')
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
      getSurveyApprovalList(this.searchData)
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
          this.dialogTitle = '新增职业危害因数辨识'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑职业危害因数辨识'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看职业危害因数辨识'
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
      this.searchData.harmFactor = ''
      this.searchData.contactUserName = ''
      this.searchData.postName = ''
      this.searchData.workContent = ''
      this.searchData.identifyDate = ''
      this.searchData.departmentId = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
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
          <el-form-item
            label="时间"
            prop="reportWriterDate"
          >
            <el-date-picker
              v-model="searchData.reportWriterDate"
              class="small-row"
              style="width: 192px"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="岗位">
            <el-input
              v-model="searchData.postId"
              placeholder="请输入"
              clearable
              @input="change($event)"
            />
          </el-form-item>
          <el-form-item label="人员">
            <el-input
              v-model="searchData.personnel"
              placeholder="请输入"
              clearable
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
              size="mini"
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>
    <!-- <el-button type='primary' plain icon='el-icon-plus' @click="changeFn('add')">新增</el-button> -->
    <!-- <el-button @click="getImportTemplate" plain size="mini" icon="el-icon-download">模板下载</el-button> -->
    <!-- <el-upload
        style=" display: inline-flex;margin-left:10px "
        action="#"
        ref="fileUpload"
        :headers="uploadLimit.header"
        :limit="1"
        :accept="uploadLimit.accept.toString()"
        :http-request="getImport"
        :show-file-list="false">
          <el-button size="mini" type="primary" icon="el-icon-upload">Excel导入</el-button>
          <div slot="tip" class="el-upload__tip">只允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload> -->
    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          type="primary"
          @click="getExport"
        >
          Excel导出
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
      >
        <!--      <el-table-column type='index' width='50' align='center' label='序号' /> -->
        <el-table-column
          label="日期"
          align="center"
          prop="reportWriterDate"
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
          label="高温环境工作人员数量"
          align="center"
          prop="postLimit"
          min-width="150"
        />
        <el-table-column
          label="岗位最高温度"
          align="center"
          prop="postMaxTemperature"
        />
        <el-table-column
          label="高温环境平均每天持续小时"
          align="center"
          prop="avgHour"
          min-width="150"
        />
        <el-table-column
          label="当前已采取的降温措施"
          prop="temperatureMeasure"
          align="center"
          min-width="150"
        />
        <el-table-column
          label="人员"
          align="center"
        />
        <el-table-column
          label="是否需要发放高温津贴"
          align="center"
          min-width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.isGrantAllowance ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label='操作' min-width='160' align='center' fixed='right'>
        <template slot-scope='scope'>
          <el-button @click="changeFn('view',scope.row)" type='text'>查看</el-button>
          <el-button @click="changeFn('edit',scope.row)" style='color:var(--ky-warning);' type='text'>编辑</el-button>
          <el-button @click='delFn(scope.row)' type='text' style='color:var(--ky-danger);'>删除</el-button>
        </template>
      </el-table-column> -->
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
    <!-- <el-dialog
      slot='dialog'
      class='normal-dialog'
      :title='dialogTitle'
      :close-on-click-modal='false'

      width='900px'
      :visible.sync='visibleForm'>
      <HazardIDialog
        :Method='dialogMethod'
        :FromData='formData'
        v-if='visibleForm'
        @DialogClose='infoSuccEvt' />
    </el-dialog> -->
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
