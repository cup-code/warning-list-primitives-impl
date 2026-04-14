<script>
import {
  getFactorTest,
  InspectionRecordIMPORT,
  removeFactorTest,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import DetectionDialog from './components/DetectionDialog'
import { getAuthToken } from '@/utils/tab-session'

export default {
  name: 'hazardDetection',
  components: { DetectionDialog, ExcelExport },
  data() {
    return {
      isLoading: false,
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
      departmentList: [], // 所属部门list
      postList: [],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        testingDate: '',
        testingPost: [],
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
    this.companyId = this.$store.state.user.user.companyId
    const departmentId = this.$store.state.user.user.departmentId
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departmentList = (data.result || []).filter((item) => {
        return item.departmentType === 'DEPARTMENT'
      })
    })
    // 获取当前登录人部门下的岗位
    this.getAllPostByCompany(departmentId)
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
          key: 'HarmTesting',
          name: '职业危害因素检测',
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
      this.$utils.download('/excel/getImportTemplate/HarmTesting', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'HarmTesting')
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
      const { data } = await getFactorTest(this.searchData)
      if (data.code != 200) {
        this.$message.warning(data.message || '获取列表数据失败')
      }
      else {
        this.total = data.result.total
        this.tableData = data.result.list || []
        // for (let dataItem of this.tableData) {
        //   let harmFactorList = []
        //   this.$dictUtils.getDictList('occupational_hazards').forEach((item) => {
        //     if (dataItem.harmFactor && dataItem.harmFactor.indexOf(item.id) != -1) {
        //       harmFactorList.push(item.dictName)
        //     }
        //   })

        //   dataItem.harmFactorName = harmFactorList.toString()
        //   dataItem.testingUnitName = dataItem.testingUnit ? dataItem.testingUnit.toString() : ''
        //   dataItem.testingResultName = dataItem.testingResult ? dataItem.testingResult.toString() : ''
        // }
      }
      this.isLoading = false
    },
    getDepartmentInfo(id) {
      this.searchData.testingPost = []
      if (id) {
        this.searchData.departmentId = id
        this.getAllPostByCompany(id)
      }
    },
    // 查询指定部门下的岗位
    getAllPostByCompany(departmentId) {
      getPostByDepartmentId(departmentId).then(({ data }) => {
        if (data.success) {
          this.postList = data.result || []
        }
        else {
          this.$message.error('获取岗位列表失败' || data.message)
        }
      })
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增职业危害因素检测'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑职业危害因素检测'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看职业危害因素检测'
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
      this.$confirm('您确认要删除此职业危害因素检测' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeFactorTest(v.id)
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
      this.searchData.testingDate = ''
      this.searchData.departmentId = ''
      this.searchData.testingPostName = ''
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
      >
        <el-row>
          <el-form-item
            label="检测日期"
            prop="testingDate"
          >
            <el-date-picker
              v-model="searchData.testingDate"
              class="small-row"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item
            label="部门名称"
            prop="departmentId"
          >
            <el-select
              v-model="searchData.departmentId"
              placeholder="请选择"
              :filterable="true"
              class="small-row"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="检测岗位"
            prop="testingPost"
          >
            <el-input
              v-model="searchData.testingPostName"
              class="small-row"
              placeholder="请输入"
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

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('hazard_detection_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </EButton>
        <EButton
          v-if="hasBtnPermission('hazard_detection_derive')"
          type="primary"
          @click="getExport"
        >
          Excel导出
        </EButton>
        <EButton
          v-if="hasBtnPermission('hazard_detection_template')"
          plain
          size="mini"
          btnIcon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </EButton>
        <el-upload
          v-if="hasBtnPermission('hazard_detection_import')"
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
          label="检测日期"
          align="center"
          prop="testingDate"
          min-width="100"
        />
        <el-table-column
          label="职业病危害因素名称"
          align="center"
          prop="harmFactor"
          min-width="120"
        >
          <template slot-scope="scope">
            <span>{{ setHarmFactor(scope.row.harmFactor) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="部门"
          align="center"
          prop="departmentName"
          min-width="150"
        />
        <el-table-column
          label="检测岗位"
          align="center"
          min-width="150"
        >
          <template slot-scope="scope">
            <span
              v-for="(v, i) in scope.row.testingPostNames"
              :key="i"
            >{{ v }}{{ i === scope.row.testingPostNames.length - 1 ? '' : '、' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="检测结果"
          align="center"
          prop="testingResult"
        >
          <template slot-scope="scope">
            <span
              v-if="setHarmFactor(scope.row.harmFactor) === '噪声' && scope.row.testingResult >= 80"
              class="result-box"
            >{{ scope.row.testingResult }}</span>
            <span
              v-else-if="
                setHarmFactor(scope.row.harmFactor) === '粉尘' && scope.row.testingResult >= 2
              "
              class="result-box"
            >{{ scope.row.testingResult }}</span>
            <span v-else>{{ scope.row.testingResult }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="单位"
          align="center"
          prop="testingUnit"
        />
        <el-table-column
          label="超标原因"
          align="center"
          prop="outReason"
          min-width="150"
        />
        <el-table-column
          label="处置措施"
          align="center"
          prop="handleMeasures"
          min-width="150"
        />
        <el-table-column
          label="操作"
          min-width="160"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('hazard_detection_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('hazard_detection_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('hazard_detection_delete')"
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
      <DetectionDialog
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
.result-box {
  display: inline-block;
  width: 100%;
  background: red;
}
</style>
