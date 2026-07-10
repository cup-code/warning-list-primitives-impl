<script>
import {
  addAlertRule,
  changeRuleState,
  deleteAlertRule,
  getAlertRuleList,
} from '@/http/rule/rule-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
  },
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    total: 0,
    sForm: {
      page: 1,
      pageSize: 10,
      departmentId: '',
    },
    drawer: false,
    form: {},
    rules: {
      priorityLevel: [{ required: true, message: '请选择', trigger: 'blur' }],
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      triggerType: [{ required: true, message: '请选择触发方式', trigger: 'blur' }],
    },
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
    // 优先级别列表
    priorityList: [
      { name: '一般', value: 'ORDINARY' },
      { name: '报警', value: 'WARN' },
      { name: '紧急', value: 'URGENT' },
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
            this.tableData = resD.result.list || []
            this.total = resD.result.total
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
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录 部门名字 和 id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
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
      if (!this.sForm.departmentId) {
        this.$message.error('请在左侧部门树选择部门')
        return
      }
      this.form = {}
      this.drawer = true
    },
    // 新建规则 提交按钮
    addDoFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const params = JSON.parse(JSON.stringify(this.form))
        if (params.generateRepair) {
          params.generateRepair = true
        }
        else {
          params.generateRepair = false
          delete params.priorityLevel
        }
        const data = { ...params, departmentId: this.sForm.departmentId }
        addAlertRule(data)
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
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 按钮 -->
    <ECard
      slot="search"
      noneBottom
      style="padding: 14px 20px; display: flex"
    >
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="addFn"
      >
        新建规则
      </el-button>
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
    </ECard>

    <!-- 内容 -->
    <ECard slot="table">
      <el-table
        v-loading="loading"
        class="connection-table"
        :data="tableData"
        size="small"
        style="width: 100%; height: 100%; overflow: auto"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
          align="left"
        />
        <!-- <el-table-column label="是否生成工单" prop="generateRepair" align='center'>
                        <template slot-scope="props">
                            <el-tag size="mini" v-if="props.row.generateRepair" type="success">是</el-tag>
                            <el-tag size="mini" v-else type="danger">否</el-tag>
                        </template>
                    </el-table-column> -->
        <el-table-column
          label="操作"
          fixed="right"
          width="250"
          align="right"
        >
          <template slot-scope="scope">
            <EButton
              size="mini"
              icon="setting"
              type="text"
              @click="toDetail(scope.row)"
            >
              配置
            </EButton>
            <EButton
              v-if="scope.row.state === 'NOT_ACTIVE'"
              icon="using"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 'ACTIVATED')"
            >
              启用
            </EButton>
            <EButton
              v-if="scope.row.state === 'ACTIVATED'"
              icon="stop"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 'NOT_ACTIVE')"
            >
              停用
            </EButton>
            <EButton
              size="mini"
              icon="delete"
              type="text"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        background
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </ECard>

    <!-- 添加 抽屉 -->
    <el-drawer
      slot="dialog"
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
          <!-- <el-form-item label="生成工单" prop="generateRepair">
                        <el-switch v-model="form.generateRepair" />
                        <span style="padding-left: 10px; color: #606266;">报警后是否生成维修工单</span>
                    </el-form-item>
                    <el-form-item label="工单优先级" prop="priorityLevel" v-if="form.generateRepair">
                        <el-select v-model="form.priorityLevel" placeholder="请选择" size="mini" style="width: 100%;">
                            <el-option v-for="item in priorityList" :key="item.value" :label="item.name" :value="item.value">
                                <span>{{ item.name }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item> -->
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
      slot="dialog"
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
  </TreeTable>
</template>

<style lang="scss" scoped>
.cdns {
  display: flex;
  align-items: center;
  padding: 0 10px;
}
</style>
