<script>
import { getAuthToken } from '@/utils/tab-session'
import {
  getThirdBook,
  importFileByID,
  InspectionRecordIMPORT,
  removeThirdBook,
} from '@/http/occupationalHealth/sanitation-api'
import { showFileWindow } from '@/utils/checkFile.js'
import AccountDialog from './components/accountDialog'

export default {
  name: 'unitManagementAccount',
  components: { AccountDialog },
  data() {
    return {
      isLoading: false,
      total: 0,
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
  created() {
    this.getTableData()
  },
  methods: {
    showFileWindow,
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    async getTableData() {
      this.isLoading = true
      const { data } = await getThirdBook(this.searchData)
      if (data.code != 200) {
        this.$message.warning(data.message || '获取列表数据失败')
      }
      else {
        this.total = data.result.total
        this.tableData = data.result.list || []
        this.tableData.forEach((data) => {
          this.$dictUtils.getDictList('unit_type').forEach((item) => {
            if (item.id == data.unitType) {
              data.unitTypeName = item.dictName
            }
          })
          importFileByID(data.id).then((res) => {
            if (res.data.success) {
              this.$set(data, 'fileList', res.data.result)
            }
          })
        })
      }
      this.isLoading = false
    },
    // 导入
    getImportTemplate() {
      this.$utils.download('/excel/getImportTemplate/ThirdBook', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'ThirdBook')
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
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增修改单位'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑修改单位'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看修改单位'
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
      this.$confirm('您确认要删除此单位台账' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeThirdBook(v.id)
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
      this.searchData.unitName = ''
      this.searchData.unitType = ''
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
        size="mini"
        label-width="100"
      >
        <el-row>
          <el-form-item
            label="单位名称"
            prop="unitName"
          >
            <el-input
              v-model="searchData.unitName"
              placeholder="请输入单位名称"
              class="special-style"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="单位类型"
            prop="unitType"
          >
            <el-select
              v-model="searchData.unitType"
              class="small-row"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('unit_type')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
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
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('unit_managemen_account_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </EButton>
        <EButton
          v-if="hasBtnPermission('unit_managemen_account_template')"
          plain
          size="mini"
          btnIcon="el-icon-download"
          @click="getImportTemplate"
        >
          模板下载
        </EButton>
        <el-upload
          v-if="hasBtnPermission('unit_managemen_account_import')"
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
          label="检测单位名称"
          align="center"
          prop="unitName"
          min-width="250"
        />
        <el-table-column
          label="安全负责人"
          align="center"
          prop="legalPerson"
          min-width="150"
        />
        <el-table-column
          label="联系人"
          align="center"
          prop="legalPerson"
          min-width="150"
        />
        <el-table-column
          label="联系电话"
          align="center"
          prop="legalPersonPhone"
          min-width="150"
        />
        <el-table-column
          label="社会统一信用代码"
          align="center"
          prop="societyCode"
          min-width="150"
        />
        <el-table-column
          label="单位类型"
          align="center"
          prop="unitTypeName"
          min-width="150"
        />
        <el-table-column
          label="合同有效期"
          align="center"
          prop="contractEndDate"
          min-width="150"
        />
        <el-table-column
          label="合同附件"
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
              v-if="hasBtnPermission('unit_managemen_account_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('unit_managemen_account_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('unit_managemen_account_delete')"
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
      <AccountDialog
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
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
