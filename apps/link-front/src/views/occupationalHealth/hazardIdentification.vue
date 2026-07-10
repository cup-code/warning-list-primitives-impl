<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  getHygieneIdentification,
  InspectionRecordIMPORT,
  removeHygieneIdentification,
} from '@/http/occupationalHealth/sanitation-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import HazardIDialog from './components/hazardIDialog'

export default {
  name: 'hazardIdentification',
  components: { OwnDeparmentTree, HazardIDialog, ExcelExport },
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
        projectName: '',
        workContent: '',
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
      getHygieneIdentification(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            this.tableData.forEach((data) => {
              const harmFactorList = []
              this.$dictUtils.getDictList('occupational_hazards').forEach((item) => {
                if (data.harmFactor && data.harmFactor.includes(item.id)) {
                  harmFactorList.push(item.dictName)
                }
              })
              data.harmFactorName = harmFactorList.toString()
              const fullNameList = []
              data.contactPerson.forEach((item) => {
                if (item.fullName) {
                  fullNameList.push(item.fullName)
                }
              })
              data.fullName = fullNameList.toString()
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
          this.dialogTitle = '新增职业危害因素辨识'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑职业危害因素辨识'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看职业危害因素辨识'
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
  <KyTreeTable v-loading="isLoading">
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
            label="接触职业病危害因素"
            prop="harmFactor"
          >
            <el-select
              v-model="searchData.harmFactor"
              multiple
              class="small-row"
              placeholder="请选择"
              clearable
              @change="$forceUpdate()"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('occupational_hazards')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="接触人员">
            <el-input
              v-model="searchData.contactUserName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="岗位">
            <el-input
              v-model="searchData.postName"
              placeholder="请输入"
              clearable
              @input="change($event)"
            />
          </el-form-item>
          <el-form-item
            v-if="isShow"
            label="工作内容"
          >
            <el-input
              v-model="searchData.workContent"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item
            v-if="isShow"
            label="辨识年份"
            prop="identifyDate"
          >
            <el-date-picker
              v-model="searchData.identifyDate"
              class="small-row"
              style="width: 192px"
              type="year"
              value-format="yyyy"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item>
            <EButton
              type="primary"
              btnIcon="el-icon-search"
              @click="searchFn"
            >
              查询
            </EButton>
            <EButton
              class="reset"
              btnIcon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </EButton>
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
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('hazard_identification_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </EButton>
        <EButton
          v-if="hasBtnPermission('hazard_identification_derive')"
          type="primary"
          @click="getExport"
        >
          Excel导出
        </EButton>
        <EButton
          v-if="hasBtnPermission('hazard_identification_template')"
          plain
          size="mini"
          btnIcon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </EButton>
        <el-upload
          v-if="hasBtnPermission('hazard_identification_import')"
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
        :border="false"
        class="customer-table"
      >
        <!--      <el-table-column type='index' width='50' align='center' label='序号' /> -->
        <el-table-column
          label="职业危害因素辨识编号"
          align="center"
          prop="identifyRef"
          min-width="150"
        />
        <el-table-column
          label="接触职业危害因素名称"
          align="center"
          prop="harmFactorName"
          min-width="150"
        />
        <el-table-column
          label="辨识日期"
          align="center"
          prop="identifyDate"
        />
        <el-table-column
          label="岗位"
          align="center"
          prop="postName"
        />
        <el-table-column
          label="本岗位总人数"
          align="center"
          prop="postPersonTotal"
          min-width="150"
        />
        <el-table-column
          label="工作安排"
          align="center"
          prop="workArrange"
          min-width="150"
        />
        <el-table-column
          label="主要工作内容"
          align="center"
          prop="workContent"
          min-width="150"
        />
        <el-table-column
          label="接触危害的主要地点、接触时间估算"
          prop="contactPlaceTime"
          align="center"
          min-width="180"
        />
        <el-table-column
          label="接触人员"
          align="center"
          prop="fullName"
          min-width="180"
        />
        <el-table-column
          label="操作"
          min-width="160"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('hazard_identification_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('hazard_identification_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('hazard_identification_delete')"
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
      <HazardIDialog
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
  </KyTreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
