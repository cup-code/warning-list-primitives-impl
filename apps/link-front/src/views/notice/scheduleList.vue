<script>
import { cron } from 'vue-cron'
import taskTime from '@/components/taskTimeSet'
import { getAllIoById, getDeviceListByPid } from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'
import {
  addSchedule,
  changeScheduleState,
  deleteSchedule,
  editSchedule,
  getScheduleList,
} from '@/http/notice/notice-api'
import { formatDate } from '@/utils'

export default {
  components: {
    Cron: cron,
    TaskTime: taskTime,
  },
  data() {
    return {
      loading: false,
      tableData: [],
      pageFlag: true,
      total: 0,
      sForm: {
        page: 1,
        pageSize: 10,
      },
      sFormCopy: null, // sForm的原始数据
      drawer: false,
      drawerTitle: '',
      drawerType: 0,
      form: {
        setType: 'self',
      },
      rules: {},
      submitLoading: false,
      drawer_sh: false,
      options: [],
      sDate: '',
      typeList: [
        { name: '终端写值', value: 'SetIoValue' },
        // {name: '终端命令', value: 'CommandInvocation'},
        // {name: '发送短信', value: 'SmsSend'},
        // {name: 'groovy脚本', value: 'GroovyScript'},
        // {name: '批量终端命令', value: 'BatchCommandInvocation'}
      ],
      setList: [
        { name: 'cron表达式', value: 'cron' },
        { name: '自定义', value: 'self' },
      ],
      cronDialog: false, // 控制cron表达式弹窗
      productList: [], // 产品列表
      deviceList: [], // 终端列表
      ioList: [], // 测点列表
    }
  },
  created() {
    this.getDataList()
    this.getProList() // 获取所有产品
  },
  methods: {
    formatDate,
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    getDataList() {
      this.loading = true
      getScheduleList(this.sForm)
        .then(({ data }) => {
          this.loading = false
          const msg = data.message
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.error(msg || '查询任务列表失败')
            this.tableData = []
            this.total = 0
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询任务列表失败')
        })
    },
    // 获取产品列表
    getProList() {
      getAllProduct().then(({ data }) => {
        if (data.success === true) {
          this.productList = data.result || []
        }
      })
    },
    // 根据产品id获取终端
    getDevList(pid) {
      // let params = {productId: pid};
      if (!pid)
        return
      getDeviceListByPid(pid).then(({ data }) => {
        if (data.success) {
          this.deviceList = data.result || []
        }
      })
    },
    // 根据终端id获取测点列表
    getIOsByDevId(id) {
      getAllIoById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.ioList = resD.result
        }
      })
    },
    // 产品change
    productFn(v) {
      // 0. 先清空上次所选
      this.deviceList = []
      this.ioList = []
      this.$set(this.form, 'deviceId', '') // 终端的
      this.form.deviceName = ''

      this.$set(this.form, 'setValueIoCode', '') // io的
      this.form.setValueIoId = ''
      this.form.setValueIoName = ''

      // 1. 请求该产品下的终端列表
      this.getDevList(v)
    },
    // 终端change
    devFn(v) {
      // 0. 先清空上次所选
      this.ioList = []
      this.$set(this.form, 'setValueIoCode', '') // io的
      this.form.setValueIoId = ''
      this.form.setValueIoName = ''

      // 1.  在form 中记录 终端名称
      let i
      let tar
      const list = this.deviceList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.id == v) {
          this.form.deviceName = tar.name
          break
        }
      }

      // 2. 请求该终端下的 测点列表
      this.getIOsByDevId(v)
    },
    // io列表 change
    ioFn(v) {
      // 在form 中记录 测点名称、测点id
      let i
      let tar
      const list = this.ioList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.code == v) {
          this.form.setValueIoName = tar.name
          this.form.setValueIoId = tar.id
          break
        }
      }
    },

    // 外部的 查询按钮
    searchFn() {
      this.drawer_sh = true

      // 记录sForm数据 到 sFormCopy
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))
    },
    // 抽屉的 查询按钮（确定按钮）
    searchDoFn() {
      this.drawer_sh = false
      this.sFormCopy = JSON.parse(JSON.stringify(this.sForm))

      // 生成搜索条件数据
      this.genOpts()
    },
    // 移除筛选条件
    removeFn(v) {
      const opts = this.options
      const idx = opts.indexOf(v)
      this.options.splice(idx, 1)

      Object.keys(this.sForm).forEach((k) => {
        if (v.type === k) {
          this.sForm[k] = ''
        }
      })
      this.getDataList()
    },
    // 查询抽屉的 关闭
    dCloseFn() {
      this.sForm = JSON.parse(JSON.stringify(this.sFormCopy))
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
        val = item[1]
        if (key !== 'page' && key !== 'pageSize' && val) {
          temp.type = key
          temp.name = val

          let i, list, len, cur
          if (key === 'jobType') {
            // 任务类型
            list = this.typeList
            len = list.length
            for (i = 0; i < len; i++) {
              cur = list[i]
              if (cur.value == val) {
                temp.name = cur.name
                break
              }
            }
          }
          opts.push(temp)
        }
      })
      this.options = opts
      this.getDataList()
    },

    // 新增任务
    addFn() {
      this.drawerTitle = '添加任务'
      this.form = {
        setType: 'self',
      }
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑任务
    editFn(v) {
      this.drawerTitle = '编辑任务'
      this.form = JSON.parse(JSON.stringify(v))
      this.form = Object.assign({}, this.form, {
        setType: 'self',
      })
      this.drawerType = 1
      this.drawer = true

      // 请求该产品下的终端列表
      v.productId && this.getDevList(v.productId)
      // 请求该终端下的 测点列表
      v.deviceId && this.getIOsByDevId(v.deviceId)
    },
    // 删除任务
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteSchedule(v.scheduledId)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success('删除成功')
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
    // 启动、停用任务
    ableFn(v, flag) {
      let str, state
      if (flag === 0) {
        str = '启用'
        state = 'Active'
      }
      else {
        str = '停用'
        state = 'Unsubmitted'
      }
      this.$confirm(`您确认要${str} ${v.name} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          changeScheduleState(v.scheduledId, state)
            .then((res) => {
              const resD = res.data
              const msg = resD.message

              if (resD.success === true) {
                this.$message.success(msg || `${str}成功`)
                this.getDataList()
              }
              else {
                this.$message.error(msg || `${str}失败`)
              }
            })
            .catch((err) => {
              this.$message.error(`${str}失败`)
            })
        })
        .catch(() => {})
    },
    // cron表达式的change事件
    changeCron(v) {
      console.log('cron的值: ', v)
      this.form.cronExpression = v
    },
    // 自定义计划的change事件
    changeSelf(v) {
      console.log('自己定义的cron值: ', v)
      this.form.cronExpression = v
    },
    // 打开设置cron的弹窗 按钮
    openDialogFn() {
      if (!this.form.setType) {
        this.$message.error('请先选择时间方式')
        return
      }
      this.cronDialog = true

      // cron 在自定义时间中 回显
      if (this.form.setType === 'self') {
        this.$nextTick(() => {
          this.$refs.taskTime.genVal(this.form.cronExpression)
        })
      }
    },

    // 选择时间
    dateChange(v) {
      const form = this.form
      if (v) {
        form.serveStartTime = v[0]
        form.serveEndTime = v[1]
      }
      else {
        delete form.serveStartTime
        delete form.serveEndTime
      }
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const params = JSON.parse(JSON.stringify(this.form))
        params.triggerType = 'CronTrigger' // 默认值

        // 添加
        if (this.drawerType === 0) {
          addSchedule(params)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false
              if (resD.success === true) {
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
        }
        // 编辑
        else {
          editSchedule(params)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false
              if (resD.success === true) {
                this.$message.success('编辑成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '编辑失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard
      slot="search"
      noneBottom
      style="display: flex; padding: 14px 20px"
    >
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="addFn"
      >
        添加任务
      </el-button>
      <div class="flex items-center px-2">
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
    <!-- 按钮 -->
    <!-- <el-row class="header">
      <el-col :span="12">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="addFn">添加任务</el-button>
      </el-col>
      <el-col :span="12" class="cdns-con">
        <div class="cdns">
          <transition-group name="toUp">
            <el-tag v-for="item in options" :key="item.name" type="danger" size="small" closable @close="removeFn(item)">{{ item.name }}</el-tag>
          </transition-group>
        </div>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchFn">查询</el-button>
      </el-col>
    </el-row> -->

    <!-- 内容 -->
    <!-- <el-row class="mid-con">
      <el-col :span="24"> -->

    <ECard slot="table">
      <el-table
        v-loading="loading"
        class="schedule-table"
        :data="tableData"
        size="small"
        style="width: 100%"
        height="74vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="任务名称"
          prop="name"
          align="center"
        />
        <el-table-column
          label="任务描述"
          prop="jobDesc"
          align="center"
        />
        <el-table-column
          label="cron表达式"
          prop="cronExpression"
          align="center"
        />
        <el-table-column
          label="任务类型"
          prop="jobType"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.jobType === 'SetIoValue'"
              size="mini"
              type="primary"
            >
              终端写值
            </el-tag>
            <!--                            <el-tag size="mini" type="primary" v-if="props.row.jobType === 'CommandInvocation'">终端命令</el-tag> -->
            <!--                            <el-tag size="mini" type="primary" v-if="props.row.jobType=== 'SmsSend'">发送短信</el-tag> -->
            <!--                            <el-tag size="mini" type="primary" v-if="props.row.jobType=== 'GroovyScript'">groovy脚本</el-tag> -->
            <!--                            <el-tag size="mini" type="primary" v-if="props.row.jobType=== 'BatchCommandInvocation'">批量终端命令</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column
          label="任务状态"
          prop="jobState"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.jobState === 'Active'"
              size="mini"
              type="success"
            >
              启用
            </el-tag>
            <el-tag
              v-if="props.row.jobState === 'Unsubmitted'"
              size="mini"
              type="danger"
            >
              停用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="220"
          align="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="edit"
              size="mini"
              type="text"
              @click="editFn(scope.row)"
            >
              编辑
            </EButton>
            <EButton
              v-if="scope.row.jobState === 'Unsubmitted'"
              icon="using"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 0)"
            >
              启用
            </EButton>
            <EButton
              v-if="scope.row.jobState === 'Active'"
              icon="stop"
              size="mini"
              type="text"
              @click="ableFn(scope.row, 1)"
            >
              停用
            </EButton>
            <EButton
              icon="delete"
              size="mini"
              type="text"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- </el-col>
    </el-row> -->

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right; background: #ffffff"
        :current-page="sForm.page"
        :page-sizes="[10, 20, 50]"
        background
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
    <!-- <el-row>
      <el-col :span="24">
        <el-pagination
          v-if="pageFlag"
          style="text-align: right; background: #ffffff; padding: 5px 0"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
          :current-page="sForm.page"
          :page-sizes="[10, 20, 50]"
          background
          :page-size="sForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </el-col>
    </el-row> -->
    <template slot="dialog">
      <!-- 添加或编辑 抽屉 -->
      <el-drawer
        :visible.sync="drawer"
        :with-header="false"
      >
        <div style="display: flex; flex-direction: column; overflow: hidden">
          <!-- 标题 -->
          <div class="drawer-title">
            {{ drawerTitle }}
          </div>

          <!-- 分割线 -->
          <el-divider />

          <!-- 内容 -->
          <div class="drawer-con">
            <el-form
              ref="form"
              :model="form"
              label-width="95px"
              :rules="rules"
              size="mini"
            >
              <el-form-item
                label="任务名称"
                prop="name"
              >
                <el-input v-model="form.name" />
              </el-form-item>
              <el-form-item
                label="任务描述"
                prop="jobDesc"
              >
                <el-input v-model="form.jobDesc" />
              </el-form-item>
              <el-form-item
                label="时间方式"
                prop="setType"
              >
                <el-select
                  v-model="form.setType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in setList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  >
                    <span>{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="cron表达式"
                prop="cronExpression"
              >
                <el-input
                  v-model="form.cronExpression"
                  disabled
                >
                  <el-button
                    slot="append"
                    icon="el-icon-setting"
                    @click="openDialogFn"
                  />
                </el-input>
              </el-form-item>

              <el-form-item
                label="任务类型"
                prop="jobType"
              >
                <el-select
                  v-model="form.jobType"
                  placeholder="请选择"
                  clearable
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

              <el-form-item
                v-if="form.jobType === 'SetIoValue'"
                label="产品列表"
                prop="productId"
              >
                <el-select
                  v-model="form.productId"
                  placeholder="请选择"
                  style="width: 100%"
                  @change="productFn"
                >
                  <el-option
                    v-for="item in productList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <span>{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.jobType === 'SetIoValue'"
                label="终端列表"
                prop="deviceId"
              >
                <el-select
                  v-model="form.deviceId"
                  placeholder="请选择"
                  style="width: 100%"
                  @change="devFn"
                >
                  <el-option
                    v-for="item in deviceList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <span>{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.jobType === 'SetIoValue'"
                label="选择测点"
                prop="setValueIoCode"
              >
                <el-select
                  v-model="form.setValueIoCode"
                  placeholder="请选择"
                  style="width: 100%"
                  @change="ioFn"
                >
                  <el-option
                    v-for="item in ioList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.code"
                  >
                    <span>{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.jobType === 'SetIoValue'"
                label="写入值"
                prop="setValue"
              >
                <el-input v-model="form.setValue" />
              </el-form-item>
            </el-form>

            <div class="drawer-con-btns">
              <el-button
                size="mini"
                type="primary"
                :loading="submitLoading"
                @click="submitFn"
              >
                提交
              </el-button>
            </div>
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
            label-width="70px"
            size="mini"
          >
            <el-form-item
              label="任务名称"
              prop="name"
            >
              <el-input v-model="sForm.name" />
            </el-form-item>
            <el-form-item
              label="任务类型"
              prop="jobType"
            >
              <el-select
                v-model="sForm.jobType"
                placeholder="请选择"
                clearable
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
              @click="searchDoFn"
            >
              查询
            </el-button>
          </div>
        </div>
      </el-drawer>

      <!-- cron表达式弹窗 -->
      <el-dialog
        :visible.sync="cronDialog"
        custom-class="cron-dialog"
        :show-close="false"
        width="50%"
        top="6vh"
      >
        <cron
          v-if="form.setType === 'cron'"
          @change="changeCron"
          @close="cronDialog = false"
        />
        <task-time
          v-if="form.setType === 'self'"
          ref="taskTime"
          @change="changeSelf"
          @close="cronDialog = false"
        />
      </el-dialog>
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  //   position: relative;
  //   padding: 10px;
  //   background: #f3f7f9;
  .header {
    background: #ffffff;
    padding: 10px;
  }
  .cdns-con {
    display: flex;
    justify-content: flex-end;
    .cdns {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-left: 10px;
      .el-tag {
        margin-right: 6px;
      }
    }
  }
  .mid-con {
    padding: 2vh 0;
    .schedule-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
