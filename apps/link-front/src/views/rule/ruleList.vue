<script>
import {
  addAlertRule,
  changeRuleState,
  deleteAlertRule,
  getAlertRuleList,
} from '@/http/rule/rule-api'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    total: 0,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    drawer: false,
    form: {},
    rules: {},
    submitLoading: false,
    drawer_sh: false,
    // 规则状态列表
    stateList: [
      { name: '启用', id: 'ACTIVATED' },
      { name: '停用', id: 'NOT_ACTIVE' },
    ],
    options: [], // 查询条件
    sFormCopy: null, // sForm的原始数据
    // 触发方式列表
    typeList: [
      { name: '任一满足', value: 'ANY' },
      { name: '全部满足', value: 'ALL' },
    ],
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getAlertRuleList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result || []
            this.total = resD.total
          }
          else {
            this.$message.error(msg || '查询规则失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询规则失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 搜索
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    searchDoFn() {
      this.drawer_sh = false

      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
      // 生成搜索条件数据
      this.genOpts()
    },
    // 新建规则
    addFn() {
      this.form = {}
      this.drawer = true
    },
    // 新建规则 提交按钮
    addDoFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        addAlertRule(this.form)
          .then((res) => {
            this.submitLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success('添加成功')
              this.getDataList()
              this.drawer = false
            }
            else {
              this.$message.error(msg || '添加失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
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
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || `${str}成功`)
            this.getDataList()
            this.drawer = false
          }
          else {
            this.$message.error(msg || `${str}失败`)
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
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
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
      this.$router.push({
        path: `/detail/rule/${v.id}`,
      })
    },

    // 生成搜索条件数据
    genOpts() {
      const opts = []
      let temp
      let key
      let val
      Object.entries(this.sForm).forEach((item) => {
        temp = {}
        key = item[0]
        val = `${item[1]}`
        if (key !== 'page' && key !== 'pageSize' && val) {
          temp.name = val
          temp.type = key

          let i, list, len, cur
          if (key === 'state') {
            // 规则状态
            list = this.stateList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.id == val) {
                temp.name = cur.name
                break
              }
            }
          }
          opts.push(temp)
        }
      })
      // 页面展示查询条件需要的 list
      this.options = opts

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },
    // 查询抽屉的 关闭
    dCloseFn() {
      this.sForm = JSON.parse(JSON.stringify(this.sFormCopy))
    },
    // 移除筛选条件
    removeFn(v) {
      const opts = this.options
      const idx = opts.indexOf(v)
      this.options.splice(idx, 1)

      let key, val
      Object.keys(this.sForm).forEach((key) => {
        if (v.type === key) {
          this.sForm[key] = ''
        }
      })

      // 根据新生成的sForm, 重新请求数据
      this.sForm.page = 1
      this.sForm.pageSize = 10
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="rule-rule">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新建规则
        </el-button>
      </el-col>
      <el-col
        :span="12"
        class="cdns-con"
      >
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag
              v-for="item in options"
              :key="item.name"
              type="danger"
              size="small"
              closable
              @close="removeFn(item)"
            >
              {{ item.name }}
            </el-tag>
          </transition-group>
        </div>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="searchFn"
        >
          查询
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="connection-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
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
            <template slot-scope="props">
              <el-tag
                v-if="props.row.state === 'NOT_ACTIVE'"
                size="mini"
                type="danger"
              >
                停用
              </el-tag>
              <el-tag
                v-if="props.row.state === 'ACTIVATED'"
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
            <template slot-scope="props">
              <el-tag
                v-if="props.row.triggerType === 'ANY'"
                size="mini"
              >
                任一满足
              </el-tag>
              <el-tag
                v-if="props.row.triggerType === 'ALL'"
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
            label="操作"
            width="250"
            align="center"
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
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-col :span="24">
        <el-pagination
          v-if="pageFlag"
          style="text-align: right"
          :current-page="sForm.page"
          :page-size="sForm.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="pageCurFn"
        />
      </el-col>
    </el-row>

    <!-- 添加 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        添加规则
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="规则名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="规则描述"
            prop="remarks"
          >
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="6"
            />
          </el-form-item>
          <el-form-item
            label="触发方式"
            prop="triggerType"
          >
            <el-select
              v-model="form.triggerType"
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
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="addDoFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 查询 抽屉 -->
    <el-drawer
      :visible.sync="drawer_sh"
      :with-header="false"
      @close="dCloseFn"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        查询
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="sForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="规则名称"
            prop="name"
          >
            <el-input v-model="sForm.name" />
          </el-form-item>
          <el-form-item
            label="规则状态"
            prop="state"
          >
            <el-select
              v-model="sForm.state"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in stateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="searchDoFn"
          >
            查询
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.rule-rule {
  position: relative;
  padding: 10px;
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
  .mid-con {
    padding: 2vh 0;
    .connection-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
