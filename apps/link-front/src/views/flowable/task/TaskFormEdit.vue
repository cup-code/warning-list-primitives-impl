<script>
import FlowChart from '@/components/SelfFlowChart/FlowChart'
import UserSelect from '@/components/userSelect'
import UserSelectDialog from '@/components/userSelect/UserSelectDialog'
import {
  extensionFlowCopySave,
  flowableProcessStop,
  flowableTaskAudit,
  flowableTaskBack,
  flowableTaskBackNodes,
  flowableTaskDelegate,
  flowableTaskStart,
  flowableTaskTransfer,
  getFlowableFormHistoryTaskFormData,
  getFlowableTaskHistoricTaskList,
  getTaskDefExtensionByDefIdAndTaskId,
} from '@/http/safe-production/flowable-api'
import FlowStep from '@/views/flowable/components/FlowStep'
import FlowTimeLine from '@/views/flowable/components/FlowTimeLine'
import TaskBackNodes from '@/views/flowable/components/TaskBackNodes'

import PreviewForm from '@/views/flowable/form/GenerateFlowableForm'

const _import = require(`@/router/import-${process.env.NODE_ENV}`)
export default {
  components: {
    UserSelect,
    UserSelectDialog,
    PreviewForm,
    TaskBackNodes,
    FlowStep,
    FlowTimeLine,
    FlowChart,
  },
  data() {
    return {
      form: null,
      formType: '',
      formUrl: '',
      taskSelectedTab: 'frist',
      historicTaskList: [],
      procDefId: '',
      procInsId: '',
      formReadOnly: false,
      procDefKey: '',
      taskId: '',
      taskFormData: [],
      taskDefKey: '',
      status: '',
      title: '',
      businessId: '',
      buttons: [],
      isCC: false,
      isAssign: false,
      printObj: {
        id: 'printForm',
        popTitle: '',
        extraCss: '',
        extraHead: '<meta http-equiv="Content-Language" content="zh-cn"/>',
      },
      auditForm: {
        message: '',
        type: '',
        status: '',
        userIds: null,
        assignee: null,
      },
    }
  },
  watch: {
    isAssign(val) {
      if (!val) {
        this.assignee = null
      }
    },
    taskSelectedTab(val) {
      if (val === 'form-third') {
        if (this.procInsId) {
          this.$refs.chart1.init()
        }
        else {
          this.$refs.chart2.init()
        }
      }
    },
  },
  mounted() {
    this.init()
    // 读取流程表单
    if (this.formType === '2') {
      if (this.formUrl === '/404') {
        this.form = null
        this.$message.info('没有关联流程表单!')
      }
      else {
        this.form = _import(`modules${this.formUrl}`)
      }
    }
    else {
      // 读取流程表单
      if (this.formUrl === '/404') {
        this.$refs.form.createForm('')
      }
      else {
        this.$refs.form.createForm(this.formUrl)
      }

      getFlowableFormHistoryTaskFormData({
        processInstanceId: this.procInsId,
        procDefId: this.procDefId,
        taskDefKey: this.taskDefKey,
      }).then(({ data }) => {
        this.taskFormData = data.taskFormData
      })
    }
    // 读取按钮配置
    if (this.status === 'start') {
      this.buttons = [{ code: '_flow_start', name: '启动', isHide: '0' }]
    }
    else if (this.procDefKey && this.taskDefKey) {
      // 读取按钮
      getTaskDefExtensionByDefIdAndTaskId({
        processDefId: this.procDefKey,
        taskDefId: this.taskDefKey,
      }).then(({ data }) => {
        if (data.success) {
          this.buttons = data.taskDefExtension.flowButtonList
        }
      })
    }
    // 读取历史任务列表
    getFlowableTaskHistoricTaskList(this.procInsId).then(({ data }) => {
      this.historicTaskList = data.historicTaskList
    })
  },
  methods: {
    init() {
      this.taskSelectedTab = 'form-first'
      this.procDefId = this.$route.query.procDefId
      this.procDefKey = this.$route.query.procDefKey
      this.formType = this.$route.query.formType
      this.formUrl = this.$route.query.formUrl
      this.taskId = this.$route.query.taskId
      this.taskDefKey = this.$route.query.taskDefKey
      this.status = this.$route.query.status
      this.title = this.$route.query.formTitle
      this.printObj.popTitle = this.title
      this.businessId = this.$route.query.businessId
      this.procInsId = this.$route.query.procInsId
      this.formReadOnly
        = this.$route.query.formReadOnly !== undefined
          && this.$route.query.formReadOnly !== 'false'
          && this.$route.query.formReadOnly !== false
      this.isCC = false
      this.isAssign = false
      this.auditForm.assignee = null
      this.auditForm.userIds = null
      this.auditForm.message = ''
    },
    cc(data) {
      if (this.isCC && this.auditForm.userIds) {
        this.$refs.auditForm.validate((valid) => {
          if (valid) {
            extensionFlowCopySave({
              userIds: this.auditForm.userIds,
              procDefId: this.procDefId,
              procInsId: data.procInsId,
              procDefName: '',
              procInsName: this.title,
              taskName: '',
            })
          }
        })
      }
    },
    // 暂存草稿
    save() {},
    // 启动流程
    start(vars) {
      if (this.formType === '2') {
        // 外置表单
        this.$refs.form.saveForm((businessTable, businessId) => {
          flowableTaskStart({
            procDefKey: this.procDefKey,
            businessTable,
            businessId,
            ...vars,
            title: this.title,
            assignee: this.auditForm.assignee,
          }).then(({ data }) => {
            if (data.success) {
              this.$message.success(data.msg)
              this.$store.dispatch('tagsView/delView', {
                fullPath: this.$route.fullPath,
              })
              this.$router.push('/flowable/task/TodoList')
              this.cc(data)
            }
          })
        })
      }
      else {
        // 动态表单
        this.$refs.form.submitStartFormData(
          {
            processDefinitionId: this.procDefId,
            ...vars,
            title: this.title,
            assignee: this.auditForm.assignee,
          },
          (data) => {
            if (data.success) {
              this.$store.dispatch('tagsView/delView', {
                fullPath: this.$route.fullPath,
              })
              this.$router.push('/flowable/task/TodoList')
              this.cc(data)
            }
          },
        )
      }
    },
    // 同意
    agree(vars) {
      this.commit(vars) // 同意
    },
    // 驳回
    reject() {
      this.$confirm(`确定驳回流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        flowableTaskBackNodes({
          taskId: this.taskId,
          ...this.auditForm,
        }).then(({ data }) => {
          const backNodes = data.backNodes
          if (backNodes.length > 0) {
            const backTaskDefKey = backNodes[backNodes.length - 1].taskDefKey
            this.back(backTaskDefKey)
          }
        })
      })
    },
    // 驳回到任意节点
    turnBack() {
      this.$refs.taskBackNodes.init(this.taskId)
    },
    // 回退到任意节点
    back(backTaskDefKey) {
      flowableTaskBack({
        taskId: this.taskId,
        backTaskDefKey,
        ...this.auditForm,
      }).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.msg)
          this.$store.dispatch('tagsView/delView', {
            fullPath: this.$route.fullPath,
          })
          this.$router.push('/flowable/task/TodoList')
          this.cc(data)
        }
      })
    },
    // 加签
    addMultiInstance() {},
    // 减签
    delMultiInstance() {},
    // 转办
    transfer() {
      this.$refs.transferUserSelectDialog.init()
    },
    selectUsersToTransferTask(user) {
      flowableTaskTransfer({
        taskId: this.taskId,
        userId: user[0].id,
      }).then(({ data }) => {
        this.$message.success(data.msg)
        this.$router.push('/flowable/task/TodoList')
      })
    },
    // 委托
    delegate() {
      this.$refs.delegateUserSelectDialog.init()
    },
    selectUsersToDelateTask(user) {
      flowableTaskDelegate({
        taskId: this.taskId,
        userId: user[0].id,
      }).then(({ data }) => {
        this.$message.success(data.msg)
        this.$router.push('/flowable/task/TodoList')
      })
    },
    // 终止
    stop() {
      this.$confirm(`确定终止流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        flowableProcessStop({
          id: this.procInsId,
          ...this.auditForm,
        }).then(({ data }) => {
          this.$message.success(data.msg)
          this.$router.push('/flowable/task/TodoList')
        })
      })
    },
    // 打印
    print() {},
    // 自定义按钮提交
    commit(vars) {
      if (this.formType === '2') {
        // 外置表单
        this.$refs.form.saveForm((businessTable, businessId) => {
          flowableTaskAudit({
            taskId: this.taskId,
            taskDefKey: this.taskDefKey,
            procInsId: this.procInsId,
            procDefId: this.procDefId,
            vars,
            comment: this.auditForm,
            assignee: this.auditForm.assignee,
          }).then(({ data }) => {
            if (data.success) {
              this.$message.success(data.msg)
              this.$store.dispatch('tagsView/delView', {
                fullPath: this.$route.fullPath,
              })
              this.$router.push('/flowable/task/TodoList')
              this.cc(data)
            }
          })
        })
      }
      else {
        // 动态表单
        this.$refs.form.submitTaskFormData(
          vars,
          this.procInsId,
          this.taskId,
          this.auditForm.assignee,
          this.auditForm,
          (data) => {
            if (data.success) {
              this.$store.dispatch('tagsView/delView', {
                fullPath: this.$route.fullPath,
              })
              this.$router.push('/flowable/task/TodoList')
              this.cc(data)
            }
          },
        )
      }
    },

    submit(currentBtn, buttons) {
      const vars = {} // 存储流程变量

      // 把当前操作对应的自定义按钮(以_flow_开头的是系统按钮，排除在外）的编码，存储为对应的流程变量，值设置为true，其余自定义按钮编码对应的流程变量值为false。
      buttons.forEach((btn) => {
        if (btn.code && !btn.code.startsWith('_flow_')) {
          vars[btn.code] = false
        }
      })
      if (currentBtn.code && !currentBtn.code.startsWith('_flow_')) {
        vars[currentBtn.code] = true
      }
      vars.title = this.title // 标题
      vars.assignee = this.auditForm.assignee // 指定的下一步骤处理人
      this.auditForm.type = currentBtn.code // 提交类型
      this.auditForm.status = currentBtn.name // 按钮文字
      switch (currentBtn.code) {
        case '_flow_start': // 自动流程
          this.start(vars)
          break
        case '_flow_save': // 保存草稿
          this.save()
          break
        case '_flow_agree': // 同意
          this.agree()
          break
        case '_flow_reject': // 驳回
          this.reject()
          break
        case '_flow_back': // 驳回到任意步骤
          this.turnBack()
          break
        case '_flow_add_multi_instance': // 加签
          this.addMultiInstance()
          break
        case '_flow_del_multi_instance': // 减签
          this.delMultiInstance()
          break
        case '_flow_transfer': // 转办
          this.transfer()
          break
        case '_flow_delegate': // 外派
          this.delegate()
          break
        case '_flow_stop': // 终止
          this.stop()
          break
        case '_flow_print': // 打印
          this.print()
          break
        default:
          this.commit(vars) // 自定义按钮提交
      }
    },
  },
}
</script>

<template>
  <div class="taskFormEdit-task-flowable">
    <h4 style="text-align: center; font-size: 16px">
      {{ title }}
    </h4>

    <el-tabs
      v-model="taskSelectedTab"
      type="border-card"
    >
      <el-tab-pane
        label="表单信息"
        name="form-first"
      >
        <component
          :is="form"
          v-if="formType === '2'"
          id="printForm"
          ref="form"
          :formReadOnly="formReadOnly"
          :class="formReadOnly ? 'readonly' : ''"
          :businessId="businessId"
        />

        <PreviewForm
          v-if="formType !== '2'"
          id="printForm"
          ref="form"
          :processDefinitionId="procDefId"
          :edit="true"
          :taskFormData="taskFormData"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="procInsId"
        label="流程信息"
        name="form-second"
      >
        <flow-time-line :historicTaskList="historicTaskList" />
      </el-tab-pane>

      <el-tab-pane
        label="流程图"
        name="form-third"
      >
        <el-card
          class="box-card"
          shadow="hover"
        >
          <div
            slot="header"
            class="clearfix"
          >
            <span>流程图</span>
          </div>
          <flow-chart
            v-if="procInsId"
            ref="chart1"
            :processInstanceId="procInsId"
          />
          <flow-chart
            v-if="!procInsId"
            ref="chart2"
            :processDefId="procDefId"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane
        v-if="procInsId"
        label="流转记录"
        name="form-forth"
      >
        <flow-step :historicTaskList="historicTaskList" />
      </el-tab-pane>
    </el-tabs>

    <el-card style="margin-top: 10px; margin-bottom: 66px">
      <el-form
        ref="auditForm"
        size="small"
        :model="auditForm"
        label-width="120px"
      >
        <el-col :span="16">
          <el-form-item
            v-if="!procInsId"
            label="流程标题"
            prop="title"
          >
            <el-input
              v-model="title"
              placeholder="请输入流程标题"
            />
          </el-form-item>
          <el-form-item
            v-if="taskId"
            label="审批信息"
            prop="message"
          >
            <el-input
              v-model="auditForm.message"
              type="textarea"
              :rows="3"
              placeholder="请输入审批意见"
            />
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item>
            <el-checkbox v-model="isCC">
              是否抄送
            </el-checkbox>
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item
            v-if="isCC"
            :rules="[{ required: true, message: '用户不能为空', trigger: 'blur' }]"
            prop="userIds"
            label="抄送给"
          >
            <user-select
              :value="auditForm.userIds"
              @getValue="
                value => {
                  auditForm.userIds = value
                }
              "
            >
              >
            </user-select>
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item>
            <el-checkbox v-model="isAssign">
              指定下一步处理者(不设置就使用默认处理人)
            </el-checkbox>
          </el-form-item>
        </el-col>

        <el-col :span="16">
          <el-form-item
            v-if="isAssign"
            :rules="[{ required: true, message: '用户不能为空', trigger: 'blur' }]"
            prop="assignee"
            label="指定"
          >
            <user-select
              :limit="1"
              :value="auditForm.assignee"
              @getValue="
                value => {
                  auditForm.assignee = value
                }
              "
            >
              >
            </user-select>
          </el-form-item>
        </el-col>
      </el-form>
    </el-card>

    <div class="FlowFormFooter">
      <template v-for="(button, index) in buttons">
        <template v-show="button.isHide === '0'">
          <el-button
            v-if="button.code !== '_flow_print'"
            :key="index"
            v-noMoreClick
            size="medium"
            type="primary"
            plain
            @click="submit(button, buttons)"
          >
            {{ button.name }}
          </el-button>
          <el-button
            v-if="button.code === '_flow_print'"
            :key="index"
            v-print="printObj"
            v-noMoreClick
            size="medium"
            type="primary"
            plain
            @click="submit(button, buttons)"
          >
            {{ button.name }}
          </el-button>
        </template>
      </template>
    </div>

    <task-back-nodes
      ref="taskBackNodes"
      @getBackTaskDefKey="back"
    />
    <user-select-dialog
      ref="transferUserSelectDialog"
      :limit="1"
      @doSubmit="selectUsersToTransferTask"
    />
    <user-select-dialog
      ref="delegateUserSelectDialog"
      :limit="1"
      @doSubmit="selectUsersToDelateTask"
    />
  </div>
</template>

<style lang="scss" scoped>
.taskFormEdit-task-flowable {
  position: relative;
  padding: 10px;
  box-sizing: border-box;
  .el-card__header {
    font-size: 16px;
  }
  .FlowFormFooter {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 210px;
    height: 66px;
    z-index: 999;
    background: #fff;
    -webkit-box-shadow: 0 -3px 5px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 -3px 5px 0 rgba(0, 0, 0, 0.12);
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-flow: row nowrap;
    flex-flow: row nowrap;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-transition: inline-block 0.3s, left 0.3s, width 0.3s, margin-left 0.3s, font-size 0.3s;
    transition: inline-block 0.3s, left 0.3s, width 0.3s, margin-left 0.3s, font-size 0.3s;
  }
}
// 在折叠左侧菜单情况下
.hideSidebar .FlowFormFooter {
  left: 54px;
}
</style>
