<script>
import {
  delMajorRubbish,
  getMajorRubbish,
  saveMajorRubbish,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'

export default {
  components: {
    AllDepartmentTree,
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
      title: '新增危险废物产生概况',
      dialog: false,
      editLoading: false,
      editable: true,
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
      userData: {},
    }
  },
  async created() {
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const { data } = await getMajorRubbish(this.form)
      this.loading = false
      if (data.code == 200) {
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
      this.getDataList()
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
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    // 新增
    addFn() {
      this.editable = true
      this.editForm = {}
      this.title = '新增危险废物产生概况'
      this.dialog = true
    },
    // 查看
    seeFn(v) {
      this.editable = false
      this.title = '查看危险废物产生概况'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
    },
    // 编辑
    editFn(v) {
      this.editable = true
      this.title = '编辑危险废物产生概况'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除${v.rubbishName}么?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          delMajorRubbish(v.id)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editForm.year = +this.editForm.year
        this.editForm.lastYearReality = +this.editForm.lastYearReality
        this.editForm.departmentId = this.userData.departTypeDepartId
        this.editLoading = true
        saveMajorRubbish(this.editForm).then(({ data }) => {
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
  },
}
</script>

<template>
  <div class="wasteOut-majorHazard">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <AllDepartmentTree
        slot="tree"
        ref="companyTree"
        :hasResponsible="false"
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
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="年份"
              label-width="40px"
            >
              <el-date-picker
                v-model="form.year"
                style="width: 100%"
                type="year"
                placeholder="年份"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="废物名称">
              <el-input
                v-model="form.queryKey"
                placeholder="废物名称"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="8"
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
          <!-- <el-button icon="el-icon-upload2" plain>导入</el-button> -->
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
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="年份"
            prop="year"
            align="center"
          />
          <el-table-column
            label="废物名称"
            prop="rubbishName"
            align="center"
          />
          <el-table-column
            label="废物代码"
            prop="rubbishCode"
            align="center"
          />
          <el-table-column
            label="形态"
            prop="shape"
            align="center"
          />
          <el-table-column
            label="危险特性"
            prop="hazardCharacter"
            align="center"
          />
          <el-table-column
            label="本年度计划产生量"
            prop="thisYearPlan"
            align="center"
            width="120"
          />
          <el-table-column
            label="本年度实际产生量"
            prop="thisYearReality"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.thisYearReality > scope.row.thisYearPlan"
                style="color: #f56c6c"
              >{{ scope.row.thisYearReality }}</span>
              <span
                v-else-if="scope.row.thisYearReality / scope.row.thisYearPlan >= 0.8"
                style="color: #e6a23c"
              >{{ scope.row.thisYearReality }}</span>
              <span v-else>{{ scope.row.thisYearReality }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="上年度实际产生量"
            prop="lastYearReality"
            align="center"
            width="120"
          />
          <el-table-column
            label="计量单位"
            prop="calculateUnit"
            align="center"
          />
          <el-table-column
            label="来源及产生工序"
            prop="sourceProcedure"
            align="center"
            width="110"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-warning)"
                @click="editFn(scope.row)"
              >
                修改
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
      width="50%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="130px"
        size="mini"
        :disabled="!editable"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="年份"
              prop="year"
              :rules="{
                required: true,
                message: '年份不能为空',
                trigger: 'blur',
              }"
            >
              <el-date-picker
                v-model="editForm.year"
                style="width: 100%"
                type="year"
                placeholder="年份"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物名称"
              prop="rubbishName"
              :rules="{
                required: true,
                message: '废物名称不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.rubbishName"
                placeholder="废物名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="废物代码"
              prop="rubbishCode"
              :rules="{
                required: true,
                message: '废物代码不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.rubbishCode"
                placeholder="废物代码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="形态"
              prop="shape"
              :rules="{
                required: true,
                message: '形态不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.shape"
                placeholder="形态"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="危险特性"
              prop="hazardCharacter"
              :rules="{
                required: true,
                message: '危险特性不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.hazardCharacter"
                placeholder="危险特性"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="本年度计划产生量"
              prop="thisYearPlan"
              :rules="{
                required: true,
                message: '本年度计划产生量不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.thisYearPlan"
                placeholder="本年度计划产生量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="上年度实际产生量"
              prop="lastYearReality"
              :rules="{
                required: true,
                message: '上年度实际产生量不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.lastYearReality"
                placeholder="上年度实际产生量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="计量单位"
              prop="calculateUnit"
              :rules="{
                required: true,
                message: '计量单位不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.calculateUnit"
                placeholder="计量单位"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="来源及产生工序"
              prop="sourceProcedure"
              :rules="{
                required: true,
                message: '来源及产生工序不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.sourceProcedure"
                placeholder="来源及产生工序"
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
.wasteOut-majorHazard {
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
      height: 100% !important;
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
    border-bottom: 1px solid #e8e8e8;
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
