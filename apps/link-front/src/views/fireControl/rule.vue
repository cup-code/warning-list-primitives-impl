<script>
import { getHkCameraList } from '@/http/hkAi-api'

export default {
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
      title: '新增规则',
      dialog: false,
      editLoading: false,
      editable: true,
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getHkCameraList(this.form)
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
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        companyId: this.form.companyId || '',
      }
      this.getDataList()
    },
    addFn() {
      this.editable = true
      this.editForm = {}
      this.title = '新增规则'
      this.dialog = true
    },
    delFn(row) {
      this.$confirm(`您确认要删除 ${row.camName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {})
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
      })
    },
  },
}
</script>

<template>
  <div class="rule-fireControl">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item
              label="规则名称"
              prop="name"
            >
              <el-input
                v-model="form.name"
                placeholder="规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="7"
            style="padding-left: 10px"
          >
            <el-form-item
              label="所属部门"
              prop="brand"
            >
              <el-select
                v-model="form.brand"
                placeholder="所属部门"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('videoType')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="10"
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
            label="规则名称"
            prop="a"
            align="center"
          />
          <el-table-column
            label="规则状态"
            prop="b"
            align="center"
          />
          <el-table-column
            label="触发类型"
            prop="c"
            align="center"
          />
          <el-table-column
            label="规则描述"
            prop="d"
            align="center"
          />
          <el-table-column
            label="所属部门"
            prop="e"
            align="center"
          />
          <el-table-column
            label="是否生成工单"
            prop="f"
            align="center"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button type="text">
                配置
              </el-button>
              <el-button
                type="text"
                style="color: var(--ky-warning)"
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
      width="70%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="85px"
        size="mini"
        :disabled="!editable"
      />

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
.rule-fireControl {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .leftCon {
    width: 200px;
    height: 100%;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
  }
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
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
