<script>
import {
  chemistryListDel,
  getChemistryListByPage,
  importChemistry,
} from '@/http/major-hazard/Anpi-chemical'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import ChemicalListDia from './components/chemicalListDia'
import { getAuthToken } from '@/utils/tab-session'

export default {
  name: 'dangerChemicalList',
  components: { CompanyTree, ChemicalListDia },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        queryKey: '',
        companyId: '',
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
      dataUploadParams: {
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
    // 导入
    // getImportTemplate() {
    //   this.$utils.download('/excel/getImportTemplate/HarmFactor','')
    // },
    // getImport(data) {
    //   var params = {
    //     file: data.file
    //   }
    //   this.isLoading = true
    //   InspectionRecordIMPORT(params, 'HarmFactor')
    //     .then(({ data }) => {
    //       if (data.success) {
    //         this.$message.success('导入成功')
    //         this.getTableData()
    //       } else {
    //         this.$message.warning(data.message || '导入失败')
    //       }
    //     })
    //     .catch((err) => {
    //       this.$message.error('导入出错', err)
    //     })
    //     .finally(() => {
    //       this.isLoading = false
    //     })
    // },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        this.searchData.companyId = ''
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
      getChemistryListByPage(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            this.tableData.forEach((data) => {
              data.isToxic ? (data.isToxicLabel = '是') : (data.isToxicLabel = '否')
              data.isDrug ? (data.isDrugLabel = '是') : (data.isDrugLabel = '否')
              data.isExplosive ? (data.isExplosiveLabel = '是') : (data.isExplosiveLabel = '否')
              data.isCountryControl
                ? (data.isCountryControlLabel = '是')
                : (data.isCountryControlLabel = '否')
              data.isEnterpriseControl
                ? (data.isEnterpriseControlLabel = '是')
                : (data.isEnterpriseControlLabel = '否')
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
          this.dialogTitle = '新增危化品清单'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑危化品清单'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看危化品清单'
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
      this.$confirm('您确认要删除此危化品清单' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        chemistryListDel(v.id)
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
      this.searchData.pageSize = 10
      this.searchData.queryKey = ''
      this.searchData.companyId = ''
      this.getTableData()
    },
    // 下载导入模板
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/Chemistry', null)
    },
    // 上传前验证
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    // 上传
    uploadDataImportTemplateClick(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      importChemistry(params)
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
        })
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="危化品名称/CAS号/CN号">
          <el-input
            v-model="searchData.queryKey"
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
            size="small"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
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
      <!--      <el-button @click="getImportTemplate" plain size="mini" icon="el-icon-download">模板下载</el-button> -->
      <!--      <el-upload -->
      <!--        style=" display: inline-flex;margin-left:10px " -->
      <!--        action="#" -->
      <!--        :headers="uploadLimit.header" -->
      <!--        :limit="1" -->
      <!--        :accept="uploadLimit.accept.toString()" -->
      <!--        :http-request="getImport" -->
      <!--        :show-file-list="false"> -->
      <!--        <el-button size="mini" type="primary" icon="el-icon-upload">Excel导入</el-button> -->
      <!--        <div slot="tip" class="el-upload__tip">只允许导入“xls”或“xlsx”格式文件！</div> -->
      <!--      </el-upload> -->
      <el-dropdown style="margin: 0 10px">
        <el-button
          type="success"
          icon="el-icon-upload2"
          plain
        >
          导入
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-button
              type="success"
              icon="el-icon-download"
              plain
              @click="downloadDataImportTemplateClick"
            >
              下载数据模板
            </el-button>
          </el-dropdown-item>

          <el-dropdown-item>
            <el-upload
              ref="fileUpload"
              action="#"
              name="file"
              :headers="dataUploadParams.header"
              :limit="1"
              :accept="dataUploadParams.accept.toString()"
              :http-request="uploadDataImportTemplateClick"
              :before-upload="onBeforeUpload"
              :show-file-list="false"
              :auto-upload="true"
            >
              <el-button
                type="success"
                icon="el-icon-upload2"
                plain
              >
                导入模板数据
              </el-button>
            </el-upload>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
      :border="true"
      class="customer-table"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="危化品名称"
        align="center"
        prop="chemistryName"
      />
      <el-table-column
        label="CAS号"
        align="center"
        prop="cas"
        min-width="150"
      />
      <el-table-column
        label="CN号"
        align="center"
        prop="cn"
      />
      <el-table-column
        label="库存量"
        align="center"
        prop="stockNumber"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unit"
        min-width="180"
      />
      <el-table-column
        label="剧毒"
        align="center"
        prop="isToxicLabel"
        min-width="150"
      />
      <el-table-column
        label="易剧毒"
        align="center"
        prop="isDrugLabel"
      />
      <el-table-column
        label="易制爆"
        align="center"
        prop="isExplosiveLabel"
      />
      <el-table-column
        label="国家重点监控"
        align="center"
        prop="isCountryControlLabel"
        min-width="180"
      />
      <el-table-column
        label="企业重点监控"
        align="center"
        prop="isEnterpriseControlLabel"
        min-width="150"
      />
      <el-table-column
        label="汇总"
        align="center"
        prop="companyTotal"
      />
      <el-table-column
        label="公司内部门"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.departmentNames || []).join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remarks"
        min-width="180"
      />
      <el-table-column
        label="MSDS版本"
        align="center"
        prop="msdsVersion"
        min-width="180"
      />
      <el-table-column
        label="MSDS发布日期"
        align="center"
        prop="msdsDate"
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
            编辑
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

      width="700px"
      :visible.sync="visibleForm"
    >
      <ChemicalListDia
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
