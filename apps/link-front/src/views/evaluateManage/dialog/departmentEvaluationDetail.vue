/* * @Author: xiaorui 部门负责人绩效考评台账复核、修改、查看弹框 * @Date: 2023-03-01 10:19:02 *
@Last Modified by: xiaorui * @Last Modified time: 2023-11-07 16:46:18 */
<script>
import {
  editDepartEvaluateDetailFn,
  getDepartEvaluateDetailFn,
  getDepartmentRulesFn,
  reviewDepartEvaluateDetailFn,
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
      departRules: {},
      inputForm: {
        id: '',
        userName: '',
        departmentName: '',
        departmentType: '',
        evaluationStart: '',
        evaluationCriteria: 0,
        deductedAmount: 0,
        cashAmount: 0,
        reviewComments: '', // 复核意见
      },
      itemScoreList: [],
    }
  },
  watch: {
    'inputForm.cashAmount': {
      handler(val) {
        this.inputForm.deductedAmount = this.inputForm.evaluationCriteria - val
      },
    },
  },
  created() {
    // 获取部门负责人考评规则
    this.getDepartmentRules()
  },
  methods: {
    getDepartmentRules() {
      getDepartmentRulesFn().then(({ data }) => {
        this.departRules = data.result || {}
      })
    },
    init(row, method) {
      this.visible = true
      this.method = method
      // 增加被扣除金额字段
      row.deductedAmount = row.evaluationCriteria - row.cashAmount
      this.inputForm = this.recover(this.inputForm, row)
      this.inputForm.evaluationStart = this.inputForm.evaluationStart
        ? this.moment(this.inputForm.evaluationStart).format('YYYY-MM')
        : ''
      this.getDepartEvaluateDetail(row.id)
    },
    getDepartEvaluateDetail(id) {
      getDepartEvaluateDetailFn(id).then(({ data }) => {
        this.itemScoreList = data.result
      })
    },
    timesChange(val, item) {
      const departRules = this.departRules
      switch (item.evaluationBusiness) {
        // 隐患排查与验证次数
        case 'HIDDEN_TROUBLE_TROUBLESHOOTING_AND_VERIFICATION':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val
                < departRules.hiddenDangerCheck.bigDepDangerSource
                + departRules.hiddenDangerCheck.bigDepDevice
                ? 0 - departRules.hiddenDangerCheck.bigDepScore
                : departRules.hiddenDangerCheck.bigDepScore
          }
          else {
            item.evaluationMoney
              = val
                < departRules.hiddenDangerCheck.smallDepDangerSource
                + departRules.hiddenDangerCheck.smallDepDevice
                ? 0 - departRules.hiddenDangerCheck.smallDepScore
                : departRules.hiddenDangerCheck.smallDepScore
          }
          break
        // 周会任务完成比例
        case 'WEEKLY_MEETING_TASKS_COMPLETED':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val
                < departRules.weeklyMeetingTaskRule.bigDepNum
                * (departRules.weeklyMeetingTaskRule.bigDepRate / 100)
                ? 0 - departRules.weeklyMeetingTaskRule.bigDepScore
                : departRules.weeklyMeetingTaskRule.bigDepScore
          }
          else {
            item.evaluationMoney
              = val
                < departRules.weeklyMeetingTaskRule.smallDepNum
                * (departRules.weeklyMeetingTaskRule.smallDepRate / 100)
                ? 0 - departRules.weeklyMeetingTaskRule.smallDepScore
                : departRules.weeklyMeetingTaskRule.smallDepScore
          }
          break
        // 周会参与
        case 'ATTEND_THE_WEEKLY_MEETING':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val < departRules.weeklyMeetingJoinRule.bigDepNum
                ? 0 - departRules.weeklyMeetingJoinRule.bigDepScore
                : departRules.weeklyMeetingJoinRule.bigDepScore
          }
          else {
            item.evaluationMoney
              = val < departRules.weeklyMeetingJoinRule.smallDepNum
                ? 0 - departRules.weeklyMeetingJoinRule.smallDepScore
                : departRules.weeklyMeetingJoinRule.smallDepScore
          }
          break
        // 三违考核
        case 'THREE_VIOLATIONS_COUNT':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val < departRules.threeViolationRule.bigDepNum
                ? 0 - departRules.threeViolationRule.bigDepScore
                : departRules.threeViolationRule.bigDepScore
          }
          else {
            item.evaluationMoney
              = val < departRules.threeViolationRule.smallDepNum
                ? 0 - departRules.threeViolationRule.smallDepScore
                : departRules.threeViolationRule.smallDepScore
          }
          break
        // 安全随手拍
        case 'SAFETY_FOLLOW_UP_COUNT':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val < departRules.instaShotRule.bigDepNum
                ? 0 - departRules.instaShotRule.bigDepScore
                : departRules.instaShotRule.bigDepScore
          }
          else {
            item.evaluationMoney
              = val < departRules.instaShotRule.smallDepNum
                ? 0 - departRules.instaShotRule.smallDepScore
                : departRules.instaShotRule.smallDepScore
          }
          break
        // 重复隐患数量（达到数量扣钱）
        case 'REPEATED_HIDDEN_DANGERS':
          if (this.inputForm.departmentType === 1) {
            item.evaluationMoney
              = val >= departRules.repeatHiddenDangerRule.bigDepNum
                ? 0 - departRules.repeatHiddenDangerRule.bigDepScore
                : departRules.repeatHiddenDangerRule.bigDepScore
          }
          else {
            item.evaluationMoney
              = val >= departRules.repeatHiddenDangerRule.smallDepNum
                ? 0 - departRules.repeatHiddenDangerRule.smallDepScore
                : departRules.repeatHiddenDangerRule.smallDepScore
          }
          break
        // '事故次数'
        case 'CAUSE_THE_ACCIDENT':
          if (val >= departRules.accidentManageRule.accidentNum) {
            this.inputForm.cashAmount = departRules.accidentManageRule.accidentScore
          }
          break
        // '政府处罚'
        case 'GOVERNMENT_PENALTY':
          if (val >= departRules.accidentManageRule.governmentNum) {
            this.inputForm.cashAmount = departRules.accidentManageRule.governmentScore
          }
          break
        default:
          break
      }
      // 如果安全事故大于等于规则设置的安全事故次数或者政府处罚大于规则设置的政府处罚次数，则总分为0
      if (
        item.evaluationItem === 'CAUSE_THE_ACCIDENT'
        && val >= departRules.accidentManageRule.accidentNum
      ) {
        this.inputForm.cashAmount = 0
      }
      else if (
        item.evaluationItem === 'GOVERNMENT_PENALTY'
        && val >= departRules.accidentManageRule.governmentNum
      ) {
        this.inputForm.cashAmount = 0
      }
      else {
        const accidentNum = (
          this.itemScoreList.find((item) => {
            return item.evaluationBusiness === 'CAUSE_THE_ACCIDENT'
          }) || {}
        ).times
        const governmentNum = (
          this.itemScoreList.find((item) => {
            return item.evaluationBusiness === 'GOVERNMENT_PENALTY'
          }) || {}
        ).times
        if (
          accidentNum >= departRules.accidentManageRule.accidentNum
          || governmentNum >= departRules.accidentManageRule.governmentNum
        ) {
          this.inputForm.cashAmount = 0
        }
        else {
          let evaluationMoney = 0
          this.itemScoreList.forEach((item) => {
            // 实际兑现金额只加为正数的
            if (item.evaluationMoney > 0) {
              evaluationMoney += item.evaluationMoney
            }
          })
          this.inputForm.cashAmount = evaluationMoney
        }
      }
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let params, funcFn
          if (this.method === 'edit') {
            funcFn = editDepartEvaluateDetailFn
            params = {
              id: this.inputForm.id,
              cashAmount: this.inputForm.cashAmount,
              businessInfo: this.itemScoreList,
            }
          }
          else if (this.method === 'review') {
            funcFn = reviewDepartEvaluateDetailFn
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
    title="部门负责人绩效考评核算"
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
            label="考评标准"
            prop="evaluationCriteria"
          >
            <el-input
              v-model="inputForm.evaluationCriteria"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="被扣除金额"
            prop="deductedAmount"
          >
            <el-input
              v-model="inputForm.deductedAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="实际兑现金额"
            prop="cashAmount"
          >
            <el-input
              v-model="inputForm.cashAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row
        v-for="item in itemScoreList"
        :key="item.evaluationBusiness"
      >
        <el-col :span="colWidth">
          <el-form-item :label="item.evaluationBusinessName">
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
            item.evaluationBusiness !== 'CAUSE_THE_ACCIDENT'
              && item.evaluationBusiness !== 'GOVERNMENT_PENALTY'
          "
          :span="colWidth"
        >
          <el-form-item label="考评金额">
            <el-input-number
              v-model="item.evaluationMoney"
              controls-position="right"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
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
