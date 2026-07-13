/* * @Author: xiaorui 安全员规则管理 * @Date: 2023-02-13 15:14:45 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-02 19:22:49 */
<script>
import { getSaferRulesFn, saveSaferRulesFn } from '@/http/evaluate-manage/evaluate-api'
import Guid from '@/utils/guid'

export default {
  data() {
    return {
      isLoading: false, // 表单的加载动画
      submitLoading: false, // 提交按钮的加载动画
      inputForm: {
        // 隐患数量考评规则
        hideeenDangerRule: [
          {
            id: Guid(),
            min: 0,
            max: 1,
            score: 0,
          },
        ],
        // 三违考核考评规则
        threeViolationRule: {
          num: 0,
          score: 0,
        },
        // 变更管理考评规则
        changeMangeRule: {
          num: 0,
          score: 0,
        },
        // 教育培训考评规则
        educationRule: {
          outPlanNum: 0,
          outPlanScore: 0,
          innerPlanCompleteNum: 0,
          innerPlanCompleteScore: 0,
          innerPlanUncompleteNum: 0,
          innerPlanUncompleteScore: 0,
        },
        // 安全随手拍考评规则
        instaShotRule: {
          num: 0,
          score: 0,
        },
        // 特种作业考评规则
        specialWorkRule: {
          num: 0,
          score: 0,
        },
        // 危险作业未审批考评规则
        dangerWorkRule: {
          num: 0,
          score: 0,
        },
        // 设备设施考评规则:
        deviceRule: {
          dailyInspectionNum: 0,
          dailyInspectionScore: 0,
          abnormalNum: 0,
          abnormalScore: 0,
        },
        // 周会任务考评规则
        weeklyMeetingRule: {
          unfinishedNum: 0,
          unfinishedScore: 0,
          finishedNum: 0,
          finishedScore: 0,
          postponedCompletionNum: 0,
          postponedCompletionScore: 0,
        },
        // 事故管理考评规则
        accidentManageRule: {
          accidentNum: 0,
          accidentScore: 0,
          governmentNum: 0,
          governmentScore: 0,
        },
        // 考核周期
        evaluationStartDay: 1, // 每月考核起始日
        evaluationEndDay: 1, // 每月考核截止日
      },
      dataRule: {},
    }
  },
  created() {
    this.getSaferRules()
  },
  methods: {
    getSaferRules() {
      this.isLoading = true
      getSaferRulesFn()
        .then(({ data }) => {
          if (data.success && data.result) {
            this.recover(this.inputForm, data.result)
          }
          else {
            this.$message.warning('未设置规则')
          }
        })
        .catch(() => {
          this.$message.error('查询失败')
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    addHideeenDangerRule() {
      this.inputForm.hideeenDangerRule.push({
        id: Guid(),
        min: this.inputForm.hideeenDangerRule[this.inputForm.hideeenDangerRule.length - 1].max + 1,
        max: this.inputForm.hideeenDangerRule[this.inputForm.hideeenDangerRule.length - 1].max + 2,
        score: 0,
      })
    },
    deleteHideeenDangerRule(index) {
      this.inputForm.hideeenDangerRule.splice(index, 1)
    },
    submitEdit() {
      this.submitLoading = true
      saveSaferRulesFn(this.inputForm)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '保存成功')
          }
          else {
            this.$message.warning(data.message || '保存失败')
          }
        })
        .catch(() => {
          this.$message.error('保存失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
  },
}
</script>

<template>
  <el-form
    ref="inputForm"
    v-loading="isLoading"
    :inline="true"
    :model="inputForm"
    :rules="dataRule"
    label-width="100px"
    style="padding-left: 20px"
    @submit.native.prevent
  >
    <h3 class="title-box">
      隐患数量考评规则
    </h3>
    <el-button
      v-if="hasBtnPermission('safer_rules_add')"
      type="primary"
      plain
      icon="el-icon-plus"
      style="margin: 0 0 10px 0"
      @click="addHideeenDangerRule"
    >
      添加规则
    </el-button>
    <div
      v-for="(item, index) in inputForm.hideeenDangerRule"
      :key="item.id"
      style="width: 800px"
    >
      <el-form-item label="隐患数量区间">
        <el-input-number
          v-model="item.min"
          controls-position="right"
        />
      </el-form-item>
      <span class="middle-span">--</span>
      <el-form-item style="margin-left: 10px">
        <el-input-number
          v-model="item.max"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <el-form-item label="考评分值设置">
        <el-input-number
          v-model="item.score"
          controls-position="right"
        />
      </el-form-item>
      <el-button
        v-if="hasBtnPermission('safer_rules_delete')"
        type="danger"
        :disabled="index < inputForm.hideeenDangerRule.length - 1 || index === 0"
        @click="deleteHideeenDangerRule(index)"
      >
        删除
      </el-button>
    </div>
    <h3 class="title-box">
      三违考核考评规则
    </h3>
    <el-form-item
      label="三违考核数量"
      prop="threeViolationRule.num"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.num"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="threeViolationRule.score"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.score"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <h3 class="title-box">
      变更管理考评规则
    </h3>
    <el-form-item
      label="变更评审完成数量"
      prop="changeMangeRule.num"
      label-width="120px"
    >
      <el-input-number
        v-model="inputForm.changeMangeRule.num"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="changeMangeRule.score"
    >
      <el-input-number
        v-model="inputForm.changeMangeRule.score"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <h3 class="title-box">
      教育培训考评规则
    </h3>
    <el-form-item
      label="计划外完成数量"
      prop="educationRule.outPlanNum"
      label-width="120px"
    >
      <el-input-number
        v-model="inputForm.educationRule.outPlanNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="educationRule.outPlanScore"
    >
      <el-input-number
        v-model="inputForm.educationRule.outPlanScore"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <br>
    <el-form-item
      label="计划内完成数量"
      prop="educationRule. innerPlanCompleteNum"
      label-width="120px"
    >
      <el-input-number
        v-model="inputForm.educationRule.innerPlanCompleteNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="educationRule.innerPlanCompleteScore"
    >
      <el-input-number
        v-model="inputForm.educationRule.innerPlanCompleteScore"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <br>
    <el-form-item
      label="计划内未完成数量"
      prop="educationRule.innerPlanUncompleteNum"
      label-width="120px"
    >
      <el-input-number
        v-model="inputForm.educationRule.innerPlanUncompleteNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="educationRule. innerPlanUncompleteScore"
    >
      <el-input-number
        v-model="inputForm.educationRule.innerPlanUncompleteScore"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <h3 class="title-box">
      安全随手拍考评规则
    </h3>
    <el-form-item
      label="回复完成整改"
      prop="instaShotRule.num"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.num"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="instaShotRule.score"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.score"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <h3 class="title-box">
      特种作业考评规则
    </h3>
    <el-form-item
      label="未按时复审上墙"
      prop="specialWorkRule.num"
    >
      <el-input-number
        v-model="inputForm.specialWorkRule.num"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="specialWorkRule.score"
    >
      <el-input-number
        v-model="inputForm.specialWorkRule.score"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <h3 class="title-box">
      危险作业未审批考评规则
    </h3>
    <el-form-item
      label="危险作业未审批"
      prop="dangerWorkRule.num"
    >
      <el-input-number
        v-model="inputForm.dangerWorkRule.num"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="dangerWorkRule.score"
    >
      <el-input-number
        v-model="inputForm.dangerWorkRule.score"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <h3 class="title-box">
      设备设施考评规则
    </h3>
    <!-- <el-form-item label="日常检查未执行" prop="deviceRule.dailyInspectionNum">
      <el-input-number v-model="inputForm.deviceRule.dailyInspectionNum" controls-position="right" :min="0"></el-input-number>
    </el-form-item>
    <el-form-item label="考评分值设置" prop="deviceRule.dailyInspectionScore">
      <el-input-number v-model="inputForm.deviceRule.dailyInspectionScore" controls-position="right" :max="0"></el-input-number>
    </el-form-item>
    <br/> -->
    <el-form-item
      label="运行异常未处理"
      prop="deviceRule.abnormalNum"
    >
      <el-input-number
        v-model="inputForm.deviceRule.abnormalNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="deviceRule.abnormalScore"
    >
      <el-input-number
        v-model="inputForm.deviceRule.abnormalScore"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <h3 class="title-box">
      周会任务考评规则
    </h3>
    <el-form-item
      label="未按时按量完成"
      prop="weeklyMeetingRule.unfinishedNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.unfinishedNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="weeklyMeetingRule.unfinishedScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.unfinishedScore"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <br>
    <el-form-item
      label="按时按量完成"
      prop="weeklyMeetingRule.finishedNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.finishedNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="weeklyMeetingRule.finishedScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.finishedScore"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <br>
    <el-form-item
      label="延期完成"
      prop="weeklyMeetingRule.postponedCompletionNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.postponedCompletionNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评分值设置"
      prop="weeklyMeetingRule.postponedCompletionScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingRule.postponedCompletionScore"
        controls-position="right"
        :max="0"
      />
    </el-form-item>
    <h3 class="title-box">
      事故管理考评规则
    </h3>
    <el-form-item
      label="发生事故次数"
      prop="accidentManageRule.accidentNum"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.accidentNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评总分值"
      prop="accidentManageRule.accidentScore"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.accidentScore"
        controls-position="right"
        disabled
      />
    </el-form-item>
    <br>
    <el-form-item
      label="政府处罚次数"
      prop="accidentManageRule.governmentNum"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.governmentNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评总分值"
      prop="accidentManageRule.governmentScore"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.governmentScore"
        controls-position="right"
        disabled
      />
    </el-form-item>
    <h3 class="title-box">
      考核周期
    </h3>
    <el-form-item
      label="考核日期 上月"
      prop="evaluationStartDay"
    >
      <el-input-number
        v-model="inputForm.evaluationStartDay"
        controls-position="right"
        :min="1"
      />
    </el-form-item>
    <span class="middle-span"> (号) 至当月</span>
    <el-form-item prop="evaluationEndDay">
      <el-input-number
        v-model="inputForm.evaluationEndDay"
        controls-position="right"
        :min="1"
      />
    </el-form-item>
    <span class="middle-span"> (号)</span>
    <el-row
      v-if="hasBtnPermission('safer_rules_modify')"
      style="text-align: right"
    >
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submitEdit"
        >
          保存并修改
        </el-button>
      </el-form-item>
    </el-row>
  </el-form>
</template>

<style lang="scss" scoped>
.title-box {
  width: 70%;
  text-indent: 2em;
  position: relative;
  background: #e6f7ff;
  line-height: 30px;
}
.title-box::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #409eff;
  position: absolute;
  left: 20px;
  top: 5px;
}
.middle-span {
  display: inline-block;
  margin-top: 7px;
}
</style>
