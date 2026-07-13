<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  deleteSafeBudgetById,
  getSafeBudgetPage,
  importBudget,
  saveSafeBudget,
} from '@/http/safeIn-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import { getAuthToken } from '@/utils/tab-session'

export default {
  components: {
    CompanyTree,
    SelectTree,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      data: [],
      total: 0,

      editForm: {},
      editRules: {},
      title: '新增安全投入预算',
      dialog: false,
      editLoading: false,
      editable: true,
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
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
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getSafeBudgetPage(this.form)
      this.loading = false
      if (data.code == 200) {
        ;(data.result.list || []).forEach((item) => {
          item.budgetYear = `${item.budgetYear}`
        })
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
      }
      this.$refs.companyTree.refreshTree()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data && data.onlyTreeUse)
        return
      if (data) {
        this.form.companyId = data.id
      }
      else {
        delete this.form.companyId
      }
      this.getDataList()
    },
    comChange(id, name) {
      this.editForm.companyId = id
      this.editForm.companyName = name
    },
    addFn() {
      this.editable = true
      this.editForm = {
        budgetYear: '',
      }
      this.title = '新增安全投入预算'
      this.dialog = true
    },
    editFn(v) {
      this.editable = true
      this.editForm = JSON.parse(JSON.stringify(v))
      this.editForm.calculateProportionShow = v.calculateProportion
        ? v.calculateProportion * 100
        : ''
      this.title = '编辑安全投入预算'
      this.dialog = true
    },
    delFn(v) {
      this.$confirm(`您确认要删除此条预算么?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteSafeBudgetById(v.id)
            .then(({ data }) => {
              if (data.code === 200) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        this.editForm.calculateProportion = this.editForm.calculateProportionShow / 100
        saveSafeBudget(this.editForm)
          .then(({ data }) => {
            this.editLoading = false
            if (data.code === 200) {
              this.$message.success(data.message || '保存成功')
              this.dialog = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '保存失败')
            }
          })
          .catch((err) => {
            this.editLoading = false
          })
      })
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
    // 下载导入模板
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/safetyInvestmentBudgetImport', null)
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
      importBudget(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getDataList()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
    },
  },
}
</script>

<template>
  <div class="budget-safeIn">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <CompanyTree
        slot="tree"
        ref="companyTree"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="0px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item label="">
              <el-date-picker
                v-model="form.budgetYear"
                placeholder="年份"
                style="width: 100%"
                type="year"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 功能区域 -->
        <div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
          </el-button>
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
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="年份"
            prop="budgetYear"
            align="center"
          />
          <el-table-column
            label="制定日期"
            prop="submissionDate"
            align="center"
          />
          <el-table-column
            label="归属公司"
            prop="companyName"
            align="center"
          />
          <el-table-column
            label="预算费用(单位:元)"
            prop="d"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.calculateProportion">{{
                scope.row.lastYearTurnover * scope.row.calculateProportion * 10000
              }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="editFn(scope.row)"
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

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        size="mini"
        :disabled="!editable"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="归属公司"
              prop="companyId"
              :rules="{
                required: true,
                message: '归属公司不能为空',
                trigger: 'blur',
              }"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'companyName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                url="sysCompany/getSubordinateCompany"
                :value="editForm.companyId"
                :clearable="true"
                :accordion="true"
                @getValue="comChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="预算年份"
              prop="budgetYear"
              :rules="{
                required: true,
                message: '预算年份不能为空',
                trigger: 'blur',
              }"
            >
              <el-date-picker
                v-model="editForm.budgetYear"
                placeholder="预算年份"
                style="width: 100%"
                type="year"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="公司编码"
              prop="companyCode"
              :rules="{
                required: true,
                message: '公司编码不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.companyCode"
                placeholder="公司编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计算比例"
              prop="calculateProportionShow"
            >
              <el-input-number
                v-model="editForm.calculateProportionShow"
                controls-position="right"
                :min="0"
                style="width: 70%"
              />
              %
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="上一年营业收入"
              prop="lastYearTurnover"
            >
              <el-input-number
                v-model="editForm.lastYearTurnover"
                controls-position="right"
                :min="0"
                style="width: 70%"
              />
              (万元)
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="提交人员"
              prop="author"
            >
              <el-input v-model="editForm.author" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="提交日期"
              prop="submissionDate"
            >
              <el-date-picker
                v-model="editForm.submissionDate"
                placeholder="提交日期"
                style="width: 100%"
                type="date"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
            >
              <el-input
                v-model="editForm.remarks"
                type="textarea"
                :rows="6"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          {{ editable ? '取消' : '关闭' }}
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.budget-safeIn {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree {
      height: 100%;
    }
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
