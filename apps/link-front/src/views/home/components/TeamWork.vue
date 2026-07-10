<script>
import { getTrainExamDetail } from '@/http/edu-api.js'
import { getMyTask } from '@/http/user-api.js'
import AccidentManageReportTodoAudit from '@/views/accidentManage/investigationReport/components/todoAudit.vue'
import AccidentManageProcessTodoAudit from '@/views/accidentManage/processReport/components/todoAudit.vue'
import ContingencyPlanAudit from '@/views/contingencyManage/dialog/homeContingencyPlanAudit'
import DrillPlanAudit from '@/views/contingencyManage/dialog/homeDrillPlanAudit'
import DrillRecordAudit from '@/views/contingencyManage/dialog/homeDrillRecordAudit'
import SafeRewardDetail from '@/views/rewardAssessment/safeReward/dialog/rewardDetailForm'
import ThreeViolation from '@/views/rewardAssessment/threeViolation/dialog/detailForm'

export default {
  components: {
    ContingencyPlanAudit,
    DrillPlanAudit,
    DrillRecordAudit,
    AccidentManageReportTodoAudit,
    AccidentManageProcessTodoAudit,
    ThreeViolation,
    SafeRewardDetail,
  },
  data() {
    return {
      isLoading: false, // 加载
      tableData: [], // 表格数据
      allDic: {}, // 字典数据
      propData: {}, // 弹窗绑定数据
      searchData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 20,
        taskType: [19, 22, 23, 100, 102, 103, 104, 105, 106, 110, 120, 201, 130, 202], // 19 考试任务, 22 培训计划审批，23 培训任务, 100 变更管理，102 内审计划审核, 103 内审发现项, 104 外审发现项, 105 管理评审计划审核 , 106 管理评审报告审核, 120 事故管理， 201 三违考核, 202 安全奖励
      },
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
    }
  },
  created() {
    this.searchClick(true)
  },
  methods: {
    searchClick() {
      this.isLoading = true
      getMyTask(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list || []
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    async deilWith(item) {
      // 点击处理，根据item.taskType判断类型
      switch (Number.parseInt(item.taskType)) {
        case 19: // 在线考试
          const { examResult } = await this.getExamDetail(item.businessId)
          if (!examResult) {
            this.$message.error('缺少考试结果')
            return
          }
          const canExam = examResult == '待考试' || examResult == '已过期'
          if (canExam) {
            // 先完成考试里对应的培训，才能参加考试
            const routeExamUrl = this.$router.resolve({
              path: `/courseAndTest/onlineExam/exam`,
              query: {
                examId: item.businessId,
                type: 1, // 1. 参加考试； 2. 查看试卷
              },
            })
            window.open(routeExamUrl.href, '_blank')
          }
          else {
            this.$message({
              message: '考试任务尚未开始(请先完成相关培训)',
              type: 'warning',
            })
          }

          break
        case 22:
          this.$router.push({
            name: 'trainPlan',
            params: {},
          })
          break
        case 23: // 在线培训
          const { trainMethod = '' } = await this.getExamDetail(item.businessId)
          if (!trainMethod) {
            this.$message.error('缺少培训方式')
            return
          }
          const canTrain = trainMethod.includes('线上')
          if (canTrain) {
            const routeTrainUrl = this.$router.resolve({
              path: `/courseAndTest/onlineTrain/train`,
              query: {
                taskId: item.businessId,
                trainTaskName: '',
              },
            })
            window.open(routeTrainUrl.href, '_blank')
          }
          else {
            this.$message({
              message: '线下培训，请扫码签到!',
              type: 'warning',
            })
          }

          break
        case 100:
          // 跳转至变更管理审批
          if (item.stepIndex == 1) {
            this.$router.push({
              name: 'changeManagement',
              params: {
                method: 'approve',
                applyId: item.mainId,
                contentId: item.businessId,
                todoTaskId: item.todoTaskId,
              },
            })
          }
          // 跳转至执行说明和执行附件
          if (item.stepIndex == 2) {
            const data = {
              applyId: item.mainId,
              contentId: item.businessId,
              taskId: item.todoTaskId,
              isShow: true,
            }
            this.$emit('changeFactData', data)
          }
          // 跳转至确认落实效果评估
          if (item.stepIndex == 3) {
            this.$router.push({
              name: 'changeManagement',
              params: {
                method: 'evaluate',
                applyId: item.mainId,
                contentId: item.businessId,
                todoTaskId: item.todoTaskId,
              },
            })
          }
          break
        case 102:
          this.$router.push({
            name: 'systemReviewInternalAuditPlanCheck',
            params: {},
          })
          break
        case 103:
          this.$router.push({
            name: 'systemReviewInternalAuditDiscovery',
            params: {},
          })
          break
        case 104:
          this.$router.push({
            name: 'systemReviewExternalAuditDiscovery',
            params: {},
          })
          break
        case 105:
          this.$router.push({
            name: 'systemReviewManagementAuditPlanCheck',
            params: {},
          })
          break
        case 106:
          this.$router.push({
            name: 'systemReviewManagementAuditReportCheck',
            params: {},
          })
          break
        // 应急管理代办
        case 110:
          // 跳转至 应急预案审核
          if (item.stepIndex == 1) {
            this.$refs.ContingencyPlanAudit.init(item, 'check')
          }
          // 跳转至 演练计划审核
          if (item.stepIndex == 2) {
            this.$refs.DrillPlanAudit.init(item, 'check')
          }
          // 跳转至 演练记录整改
          if (item.stepIndex == 3) {
            this.$refs.DrillRecordAudit.init(item, 'check')
          }
          break
        // 事故管理代办
        case 120:
          // 事故调查 审批
          if (item.stepIndex == 1) {
            this.$refs.accidentManageReportTodoAudit.visible = true
            this.$refs.accidentManageReportTodoAudit.page_type = 'audit'
            this.$refs.accidentManageReportTodoAudit.accidentId = item.mainId
            this.$refs.accidentManageReportTodoAudit.todoId = item.todoTaskId
          }
          // 事故处理 审批
          if (item.stepIndex == 2) {
            this.$refs.accidentManageProcessTodoAudit.visible = true
            this.$refs.accidentManageProcessTodoAudit.page_type = 'audit'
            this.$refs.accidentManageProcessTodoAudit.inputForm.handlingId = item.mainId
            this.$refs.accidentManageProcessTodoAudit.todoId = item.todoTaskId
            this.$refs.accidentManageProcessTodoAudit.fileProp.editable = false
          }
          break
        case 201:
          if (item.stepIndex == 1) {
            // 三违考核审批
            this.$refs.threeViolation.init('review', item.businessId)
          }
          else if (item.stepIndex == 2) {
            // 三违考核审批未通过，发起人重新编辑
            this.$refs.threeViolation.init('edit', item.businessId, 2)
          }
          break
        case 202:
          if (item.stepIndex == 1) {
            // 安全奖励审批
            this.$refs.safeRewardDetail.init('review', item.businessId)
          }
          else if (item.stepIndex == 2) {
            // 安全奖励审批未通过，发起人重新编辑
            this.$refs.safeRewardDetail.init('edit', item.businessId)
          }
          break
        case 130:
          this.$router.push({
            name: 'workReportList',
            params: {},
          })
          break
        default:
          console.log('无匹配code')
      }
    },
    circulation() {},
    async getExamDetail(taskId) {
      const { data } = await getTrainExamDetail(taskId)
      if (data.code === 200) {
        return data.result || {}
      }
      else {
        return {}
      }
    },
  },
}
</script>

<template>
  <div class="botton-box">
    <div>
      <div class="item-img" />
      <div class="item-header">
        <span>协同工作</span>
        <!-- <i>更多 >></i> -->
      </div>
    </div>
    <div class="work-table">
      <el-table
        v-loading="isLoading"
        :data="tableData"
        style="width: 100%"
        height="100%"
        highlight-current-row
      >
        <el-table-column
          prop="businessId"
          label="编号"
          width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="taskTypeName"
          label="任务类型"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="taskName"
          label="任务名称"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="distributor"
          label="下发人"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createdTime"
          label="下发时间"
          align="center"
          show-overflow-tooltip
        />
        <!-- <el-table-column prop="checkingTime" label="考核时间" align="center" show-overflow-tooltip /> -->
        <el-table-column
          label="操作"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            <!-- <el-button type="warning" size="small" @click="circulation(scope.row)">流转历史</el-button> -->
            <el-button
              type="success"
              size="mini"
              @click="deilWith(scope.row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      :current-page.sync="searchData.pageNum"
      :page-sizes="[20, 50, 100]"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="text-align: right; margin-top: 10px"
      @size-change="searchClick"
      @current-change="searchClick"
    />
    <!-- 应急预案 审核 -->
    <Contingency-plan-audit ref="ContingencyPlanAudit" @refreshList="searchClick" />
    <!-- 演练计划 审核 -->
    <Drill-plan-audit ref="DrillPlanAudit" @refreshList="searchClick" />
    <!-- 演练记录 整改 -->
    <Drill-record-audit ref="DrillRecordAudit" @refreshList="searchClick" />
    <!-- 事故管理-事故调查 审批 -->
    <AccidentManageReportTodoAudit
      ref="accidentManageReportTodoAudit"
      @refreshList="searchClick"
    />
    <!-- 事故管理-事故处理 审批 -->
    <AccidentManageProcessTodoAudit
      ref="accidentManageProcessTodoAudit"
      @refreshList="searchClick"
    />
    <!-- 三违考核审批 -->
    <three-violation
      ref="threeViolation"
      @refreshDataList="searchClick"
    />
    <!-- 安全奖励审批 -->
    <safe-reward-detail
      ref="safeRewardDetail"
      @refreshDataList="searchClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.item-img {
  width: 7px;
  height: 23px;
  background-color: rgba($color: #1195f9, $alpha: 0.8);
  border-radius: 20px;
  margin: 1px 3px 4px 3px;
  float: left;
}
.botton-box {
  width: 1631px;
  display: flex;
  flex-direction: column;
  .item-icon {
    float: left;
  }
}
.btn-box-item1 {
  float: left;
  width: 204px;
  height: 80px;
  font-size: 20px;
  background-image: url("~@/assets/team/全部bg.png");
  .box-item-title {
    .item-title1 {
      margin-left: 5px;
      float: left;
      color: white;
      margin-top: -5px;
    }
    .item-title2 {
      float: right;
      margin-right: 50px;
    }
  }
}
.btn-box-item2 {
  float: left;
  width: 204px;
  height: 80px;
  border: 1px solid rgba($color: #000000, $alpha: 0);
  font-size: 20px;
  background-image: url("~@/assets/team/待办icon.png");
  .box-item-title {
    .item-title1 {
      margin-top: -5px;
      float: left;
      color: white;
      margin-left: 5px;
    }
    .item-title2 {
      float: right;
      margin-right: 50px;
    }
  }
}
.btn-box-item3 {
  float: left;
  width: 204px;
  height: 80px;
  border: 1px solid rgba($color: #000000, $alpha: 0);
  font-size: 20px;
  background-image: url("~@/assets/team/完成icon.png");
  .box-item-title {
    .item-title1 {
      margin-top: -5px;
      float: left;
      color: white;
      margin-left: 5px;
    }
    .item-title2 {
      float: right;
      margin-right: 50px;
    }
  }
}
.work-table {
  flex: 1;
  overflow: hidden;
}
</style>
