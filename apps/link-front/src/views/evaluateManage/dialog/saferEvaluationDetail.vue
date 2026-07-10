/* * @Author: xiaorui 安全员绩效考评台账复核、修改、查看弹框 * @Date: 2023-02-24 14:11:50 * @Last
Modified by: xiaorui * @Last Modified time: 2023-10-19 10:34:07 */
<script>
import {
  editSaferEvaluateDetailFn,
  getSaferEvaluateDetailFn,
  getSaferRulesFn,
  reviewSaferEvaluateDetailFn,
} from '@/http/evaluate-manage/evaluate-api'
import { DepartmentTypeList } from '@/views/evaluateManage/config/constant'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      dataRule: {
        reviewComments: [{ required: true, message: '复核意见不能为空', trigger: 'blur' }],
      },
      DepartmentTypeList,
      method: '',
      saferRules: {},
      inputForm: {
        id: '',
        userName: '',
        departmentName: '',
        departmentType: '',
        evaluationStart: '',
        totalScore: '',
        rank: '',
        remarks: '',
        reviewComments: '', // 复核意见
      },
      itemScoreList: [],
    }
  },
  created() {
    // 获取安全员考评规则
    this.getSaferRules()
  },
  methods: {
    getSaferRules() {
      getSaferRulesFn().then(({ data }) => {
        this.saferRules = data.result || {}
      })
    },
    init(row, method) {
      this.visible = true
      this.method = method
      this.inputForm = this.recover(this.inputForm, row)
      this.inputForm.evaluationStart = this.inputForm.evaluationStart
        ? this.moment(this.inputForm.evaluationStart).format('YYYY-MM')
        : ''
      this.getSaferEvaluateDetail(row.id)
    },
    getSaferEvaluateDetail(id) {
      getSaferEvaluateDetailFn(id).then(({ data }) => {
        this.itemScoreList = data.result
      })
    },
    timesChange(val, item) {
      const saferRules = this.saferRules
      switch (item.evaluationItem) {
        // 隐患排查
        case 'HIDDEN_DANGER_RECTIFICATION_COMPLETED':
          const obj = saferRules.hideeenDangerRule.find((item) => {
            return val >= item.min && val <= item.max
          })
          item.evaluationScore = obj.score
          break
        // 三违考核
        case 'THREE_VIOLATIONS':
          item.evaluationScore
            = val < saferRules.threeViolationRule.num
              ? 0
              : saferRules.threeViolationRule.score
                + Math.floor(
                  (val - saferRules.threeViolationRule.num) / saferRules.threeViolationRule.num,
                )
                * saferRules.threeViolationRule.score
          break
        // 变更管理
        case 'IV_NEW_REVIEW':
          item.evaluationScore
            = val < saferRules.changeMangeRule.num
              ? 0
              : saferRules.changeMangeRule.score
                + Math.floor(
                  (val - saferRules.changeMangeRule.num) / saferRules.changeMangeRule.num,
                )
                * saferRules.changeMangeRule.score
          break
        // 完成计划外培训
        case 'UNPLANNED_COMPLETION':
          item.evaluationScore
            = val < saferRules.educationRule.outPlanNum
              ? 0
              : saferRules.educationRule.outPlanScore
                + Math.floor(
                  (val - saferRules.educationRule.outPlanNum) / saferRules.educationRule.outPlanNum,
                )
                * saferRules.educationRule.outPlanScore
          break
        // 完成计划内培训
        case 'COMPLETED_WITHIN_THE_PLAN':
          item.evaluationScore
            = val < saferRules.educationRule.innerPlanCompleteNum
              ? 0
              : saferRules.educationRule.innerPlanCompleteScore
                + Math.floor(
                  (val - saferRules.educationRule.innerPlanCompleteNum)
                  / saferRules.educationRule.innerPlanCompleteNum,
                )
                * saferRules.educationRule.innerPlanCompleteScore
          break
        // 未完成计划内培训
        case 'NOT_COMPLETED_WITHIN_THE_PLAN':
          item.evaluationScore
            = val < saferRules.educationRule.innerPlanUncompleteNum
              ? 0
              : saferRules.educationRule.innerPlanUncompleteScore
                + Math.floor(
                  (val - saferRules.educationRule.innerPlanUncompleteNum)
                  / saferRules.educationRule.innerPlanUncompleteNum,
                )
                * saferRules.educationRule.innerPlanUncompleteScore
          break
        // 安全随手拍
        case 'REPLY_TO_COMPLETE_RECTIFICATION':
          item.evaluationScore
            = val < saferRules.instaShotRule.num
              ? 0
              : saferRules.instaShotRule.score
                + Math.floor((val - saferRules.instaShotRule.num) / saferRules.instaShotRule.num)
                * saferRules.instaShotRule.score
          break
        // 特种作业(未上墙)
        case 'FAILURE_TO_REVIEW_THE_WALL_ON_TIME':
          item.evaluationScore
            = val < saferRules.specialWorkRule.num
              ? 0
              : saferRules.specialWorkRule.score
                + Math.floor(
                  (val - saferRules.specialWorkRule.num) / saferRules.specialWorkRule.num,
                )
                * saferRules.specialWorkRule.score
          break
        // 危险作业未审批
        case 'HAZARDOUS_OPERATION_NOT_APPROVED':
          item.evaluationScore
            = val < saferRules.dangerWorkRule.num
              ? 0
              : saferRules.dangerWorkRule.score
                + Math.floor((val - saferRules.dangerWorkRule.num) / saferRules.dangerWorkRule.num)
                * saferRules.dangerWorkRule.score
          break
        // 环保设施未检查
        case 'NOT_COMPLETED_DAILY_INSPECTION':
          item.evaluationScore
            = val < saferRules.deviceRule.dailyInspectionNum
              ? 0
              : saferRules.deviceRule.dailyInspectionScore
                + Math.floor(
                  (val - saferRules.deviceRule.dailyInspectionNum)
                  / saferRules.deviceRule.dailyInspectionNum,
                )
                * saferRules.deviceRule.dailyInspectionScore
          break
        // 环保设施未执行
        case 'UNHANDLED_OPERATION_EXCEPTION':
          item.evaluationScore
            = val < saferRules.deviceRule.abnormalNum
              ? 0
              : saferRules.deviceRule.abnormalScore
                + Math.floor(
                  (val - saferRules.deviceRule.abnormalNum) / saferRules.deviceRule.abnormalNum,
                )
                * saferRules.deviceRule.abnormalScore
          break
        // 安全周会按时
        case 'COMPLETE_ON_TIME':
          item.evaluationScore
            = val < saferRules.weeklyMeetingRule.finishedNum
              ? 0
              : saferRules.weeklyMeetingRule.finishedScore
                + Math.floor(
                  (val - saferRules.weeklyMeetingRule.finishedNum)
                  / saferRules.weeklyMeetingRule.finishedNum,
                )
                * saferRules.weeklyMeetingRule.finishedScore
          break
        // 安全周会未按时
        case 'NOT_COMPLETED_ON_TIME':
          item.evaluationScore
            = val < saferRules.weeklyMeetingRule.unfinishedNum
              ? 0
              : saferRules.weeklyMeetingRule.unfinishedScore
                + Math.floor(
                  (val - saferRules.weeklyMeetingRule.unfinishedNum)
                  / saferRules.weeklyMeetingRule.unfinishedNum,
                )
                * saferRules.weeklyMeetingRule.unfinishedScore
          break
        // 安全周会延期
        case 'POSTPONED_COMPLETION':
          item.evaluationScore
            = val < saferRules.weeklyMeetingRule.postponedCompletionNum
              ? 0
              : saferRules.weeklyMeetingRule.postponedCompletionScore
                + Math.floor(
                  (val - saferRules.weeklyMeetingRule.postponedCompletionNum)
                  / saferRules.weeklyMeetingRule.postponedCompletionNum,
                )
                * saferRules.weeklyMeetingRule.postponedCompletionScore
          break
        // '事故次数'
        case 'ACCIDENT_FOR_SAFETYOFFICER':
          if (val >= saferRules.accidentManageRule.accidentNum) {
            this.inputForm.totalScore = saferRules.accidentManageRule.accidentScore
          }
          break
        // '政府处罚'
        case 'GOVERNMENT_PENALTY_SAFETYOFFICER':
          if (val >= saferRules.accidentManageRule.governmentNum) {
            this.inputForm.totalScore = saferRules.accidentManageRule.governmentScore
          }
          break
        default:
          break
      }
      // 如果安全事故大于等于规则设置的安全事故次数或者政府处罚大于规则设置的政府处罚次数，则总分为0
      if (
        item.evaluationItem === 'ACCIDENT_FOR_SAFETYOFFICER'
        && val >= saferRules.accidentManageRule.accidentNum
      ) {
        this.inputForm.totalScore = 0
      }
      else if (
        item.evaluationItem === 'GOVERNMENT_PENALTY_SAFETYOFFICER'
        && val >= saferRules.accidentManageRule.governmentNum
      ) {
        this.inputForm.totalScore = 0
      }
      else {
        const accidentNum = (
          this.itemScoreList.find((item) => {
            return item.evaluationItem === 'ACCIDENT_FOR_SAFETYOFFICER'
          }) || {}
        ).times
        const governmentNum = (
          this.itemScoreList.find((item) => {
            return item.evaluationItem === 'GOVERNMENT_PENALTY_SAFETYOFFICER'
          }) || {}
        ).times
        if (
          accidentNum >= saferRules.accidentManageRule.accidentNum
          || governmentNum >= saferRules.accidentManageRule.governmentNum
        ) {
          this.inputForm.totalScore = 0
        }
        else {
          let totalScore = 0
          this.itemScoreList.forEach((item) => {
            totalScore += item.evaluationScore
          })
          this.inputForm.totalScore = totalScore
        }
      }
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          if (this.method === 'edit') {
            funcFn = editSaferEvaluateDetailFn
            params = {
              id: this.inputForm.id,
              totalScore: this.inputForm.totalScore,
              itemScoreList: this.itemScoreList,
              remarks: this.inputForm.remarks,
            }
          }
          else if (this.method === 'review') {
            funcFn = reviewSaferEvaluateDetailFn
            params = {
              id: this.inputForm.id,
              reviewComments: this.inputForm.reviewComments,
            }
          }
          funcFn(params)
            .then(({ data }) => {
              if (data.success) {
                this.visible = false
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList')
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    title="安全员绩效考评核算"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="姓名"
            prop="userName"
          >
            <el-input
              v-model="inputForm.userName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="部门"
            prop="departmentName"
          >
            <el-input
              v-model="inputForm.departmentName"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="部门类别"
            prop="departmentType"
          >
            <el-select
              v-model="inputForm.departmentType"
              placeholder="请选择"
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="item in DepartmentTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="日期"
            prop="evaluationStart"
          >
            <el-input
              v-model="inputForm.evaluationStart"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="考评总分值"
            prop="totalScore"
          >
            <el-input
              v-model="inputForm.totalScore"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="排名"
            prop="rank"
          >
            <el-input
              v-model="inputForm.rank"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row
        v-for="item in itemScoreList"
        :key="item.evaluationItem"
      >
        <el-col :span="colWidth">
          <el-form-item :label="item.evaluationItemName">
            <el-input-number
              v-model="item.times"
              controls-position="right"
              :min="0"
              :disabled="method !== 'edit'"
              @change="timesChange($event, item)"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-show="
            item.evaluationItem !== 'ACCIDENT_FOR_SAFETYOFFICER'
              && item.evaluationItem !== 'GOVERNMENT_PENALTY_SAFETYOFFICER'
          "
          :span="colWidth"
        >
          <el-form-item label="考评分值">
            <el-input-number
              v-model="item.evaluationScore"
              controls-position="right"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        v-if="method === 'edit'"
        label="备注"
        prop="remarks"
      >
        <el-input
          v-model="inputForm.remarks"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
      <el-form-item
        v-if="method === 'review'"
        label="复核意见"
        prop="reviewComments"
      >
        <el-input
          v-model="inputForm.reviewComments"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
