<script>
import FlowChart from '@/components/SelfFlowChart/FlowChart'
import UserSelect from '@/components/userSelect'
import {
  getFlowableFormHistoryTaskFormData,
  getFlowableProcessQueryProcessStatus,
  getFlowableTaskHistoricTaskList,
} from '@/http/safe-production/flowable-api'
import FlowStep from '@/views/flowable/components/FlowStep'
import FlowTimeLine from '@/views/flowable/components/FlowTimeLine'

import PreviewForm from '@/views/flowable/form/GenerateFlowableForm'

const _import = require(`@/router/import-${process.env.NODE_ENV}`)
export default {
  components: {
    UserSelect,
    PreviewForm,
    FlowStep,
    FlowTimeLine,
    FlowChart,
  },
  data() {
    return {
      form: null,
      formType: '',
      formUrl: '',
      selectedTab: 'frist',
      historicTaskList: [],
      procDefId: '',
      code: '1',
      procInsId: '',
      readOnly: false,
      procDefKey: '',
      taskId: '',
      taskFormData: [],
      taskDefKey: '',
      status: '',
      title: '',
      businessId: '',
    }
  },
  watch: {
    selectedTab(val) {
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

    // 读取流程状态
    getFlowableProcessQueryProcessStatus({
      procInsId: this.procInsId,
      procDefId: this.procDefId,
    }).then(({ data }) => {
      this.code = data.code
    })

    getFlowableTaskHistoricTaskList(this.procInsId).then(({ data }) => {
      this.historicTaskList = data.historicTaskList
    })
  },
  methods: {
    init() {
      this.selectedTab = 'form-first'
      this.procDefId = this.$route.query.procDefId
      this.procDefKey = this.$route.query.procDefKey
      this.formType = this.$route.query.formType
      this.formUrl = this.$route.query.formUrl
      this.taskId = this.$route.query.taskId
      this.taskDefKey = this.$route.query.taskDefKey
      this.status = this.$route.query.status
      this.title = this.$route.query.formTitle
      this.businessId = this.$route.query.businessId
      this.procInsId = this.$route.query.procInsId
      this.formReadOnly = true
    },
  },
}
</script>

<template>
  <div class="taskFormDetail-task-flowable">
    <h4 style="text-align: center; font-size: 16px">
      {{ title }}
    </h4>
    <img
      v-if="code === 1"
      class="process-status-img"
      src="../../../assets/flowable/1.png"
    >
    <img
      v-if="code === 2"
      class="process-status-img"
      src="../../../assets/flowable/2.png"
    >
    <img
      v-if="code === 3"
      class="process-status-img"
      src="../../../assets/flowable/3.png"
    >
    <img
      v-if="code === 4"
      class="process-status-img"
      src="../../../assets/flowable/4.png"
    >
    <img
      v-if="code === 5"
      class="process-status-img"
      src="../../../assets/flowable/5.png"
    >
    <img
      v-if="code === 6"
      class="process-status-img"
      src="../../../assets/flowable/6.png"
    >

    <el-tabs
      v-model="selectedTab"
      type="border-card"
    >
      <el-tab-pane
        label="表单信息"
        name="form-first"
      >
        <component
          :is="form"
          v-if="formType === '2'"
          ref="form"
          :formReadOnly="formReadOnly"
          :class="formReadOnly ? 'readonly' : ''"
          :businessId="businessId"
        />

        <PreviewForm
          v-if="formType !== '2'"
          ref="form"
          :processDefinitionId="procDefId"
          :edit="false"
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
  </div>
</template>

<style lang="scss" scoped>
.taskFormDetail-task-flowable {
  position: relative;
  padding: 10px;
  box-sizing: border-box;
  .process-status-img {
    height: 180px;
    position: absolute;
    z-index: 1;
    top: 1px;
    right: 1px;
  }
  .el-card__header {
    font-size: 16px;
  }
}
</style>
