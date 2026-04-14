<script>
import {
  addAlertRule,
  changeRuleState,
  deleteAlertRule,
  getAlertRuleList,
} from '@/http/rule/rule-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  name: 'terminalRule',
  components: {
    OwnDeparmentTree,
  },
  data() {
    return {
      form: {
        page: 1,
        pageSize: 10,
      },
      loading: false,
      data: [],
      total: 0,
      dialog: false,
      editForm: {},
      editLoading: false,
      // 触发方式列表
      typeList: [
        { name: '任一满足', value: 'ANY' },
        { name: '全部满足', value: 'ALL' },
      ],
      stateList: [
        { dictName: '停用', dictCode: 'NOT_ACTIVE' },
        { dictName: '启用', dictCode: 'ACTIVATED' },
      ],
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  created() {
    const params = this.$route.params
    if (JSON.stringify(params) !== '{}') {
      Object.assign(this.form, params)
    }
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getAlertRuleList(this.form)
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
        page: 1,
        pageSize: 10,
      }
      this.getDataList()
    },
    pageSizeFn(v) {
      this.form.page = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.page = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
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
      if (!this.form.departmentId) {
        this.$message.error('请在左侧部门树选择部门')
        return
      }
      this.editForm = {}
      this.dialog = true
    },
    // 新建规则 提交按钮
    addDoFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        const params = JSON.parse(JSON.stringify(this.editForm))
        if (params.generateRepair) {
          params.generateRepair = true
        }
        else {
          params.generateRepair = false
          delete params.priorityLevel
        }
        const data = { ...params, departmentId: this.form.departmentId }
        addAlertRule(data)
          .then(({ data }) => {
            this.editLoading = false
            const msg = data.message
            if (data.success) {
              this.$message.success('添加成功')
              this.getDataList()
              this.dialog = false
            }
            else {
              this.$message.error(msg || '添加失败')
            }
          })
          .catch((err) => {
            this.editLoading = false
            this.$message.error('添加失败')
          })
      })
    },
    // 启用/停用 按钮
    ableFn(v, flag) {
      let str = '启用'
      if (flag === 'NOT_ACTIVE') {
        str = '停用'
      }
      changeRuleState(v.id, flag)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || `${str}成功`)
            this.getDataList()
          }
          else {
            this.$message.error(data.message || `${str}失败`)
          }
        })
        .catch((err) => {
          this.$message.error(`${str}失败`)
        })
    },
    // 删除规则
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteAlertRule(v.id)
            .then(({ data }) => {
              this.loading = false
              if (data.success === true) {
                this.$message.success(data.message || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 配置规则
    toDetail(v) {
      // this.$router.push({
      //     path: `/detail/ruleAnqi/${v.id}`
      // })
      this.$router.push({
        name: 'ruleAnqiDetail',
        params: {
          id: v.id,
          ...this.form,
        },
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
  <div class="terminalRule-majorHazard">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <OwnDeparmentTree
        slot="tree"
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
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item label="规则名称">
              <el-input
                v-model="form.name"
                placeholder="规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="规则状态">
              <el-select
                v-model="form.state"
                placeholder="规则状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in stateList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="触发类型">
              <el-select
                v-model="form.triggerType"
                placeholder="触发类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
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
            label="规则名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="规则状态"
            prop="state"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.state === 'NOT_ACTIVE'"
                size="mini"
                type="danger"
              >
                停用
              </el-tag>
              <el-tag
                v-if="scope.row.state === 'ACTIVATED'"
                size="mini"
                type="success"
              >
                启用
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="触发类型"
            prop="triggerType"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.triggerType === 'ANY'"
                size="mini"
              >
                任一满足
              </el-tag>
              <el-tag
                v-if="scope.row.triggerType === 'ALL'"
                size="mini"
              >
                全部满足
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="规则描述"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="创建人"
            prop="createdBy"
            align="center"
          />
          <el-table-column
            label="创建时间"
            prop="createdTime"
            align="center"
            width="100"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="250"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="toDetail(scope.row)"
              >
                配置
              </el-button>
              <el-button
                v-if="scope.row.state === 'NOT_ACTIVE'"
                size="mini"
                type="success"
                @click="ableFn(scope.row, 'ACTIVATED')"
              >
                启用
              </el-button>
              <el-button
                v-if="scope.row.state === 'ACTIVATED'"
                size="mini"
                type="warning"
                @click="ableFn(scope.row, 'NOT_ACTIVE')"
              >
                停用
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.page"
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
      title="新增规则"
      :visible.sync="dialog"
      width="50%"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="70px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="规则名称"
              prop="name"
              :rules="{
                required: true,
                message: '规则名称不能为空',
                trigger: 'blur',
              }"
            >
              <el-input
                v-model="editForm.name"
                placeholder="规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="规则描述"
              prop="remarks"
            >
              <el-input
                v-model="editForm.remarks"
                type="textarea"
                :rows="6"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="触发方式"
              prop="triggerType"
              :rules="{
                required: true,
                message: '请选择触发方式',
                trigger: 'blur',
              }"
            >
              <el-select
                v-model="editForm.triggerType"
                placeholder="请选择"
                size="mini"
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="editLoading"
          @click="addDoFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.terminalRule-majorHazard {
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
