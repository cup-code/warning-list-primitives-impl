/* * @Author: xiaorui 部门负责人考评规则管理 * @Date: 2023-02-14 15:08:13 * @Last Modified by:
xiaorui * @Last Modified time: 2023-11-07 15:37:11 */
<script>
import { getDepartmentRulesFn, saveDepartmentRulesFn } from '@/http/evaluate-manage/evaluate-api'
import { DepartmentTypeList } from '@/views/evaluateManage/config/constant'

export default {
  data() {
    return {
      isLoading: false, // 表单的加载动画
      submitLoading: false, // 提交按钮的加载动画
      DepartmentTypeList,
      bigDep: 1,
      smallDep: 2,
      inputForm: {
        // 事故与处理考评规则
        accidentManageRule: {
          accidentNum: 0,
          accidentScore: 0,
          governmentNum: 0,
          governmentScore: 0,
          scoreType: 3,
        },
        // 隐患排查与验证次数考评规则
        hiddenDangerCheck: {
          bigDepDangerSource: 0,
          bigDepDevice: 0,
          bigDepScore: 0,
          smallDepDangerSource: 0,
          smallDepDevice: 0,
          smallDepScore: 0,
          scoreType: 1,
        },
        // 周会任务考评规则
        weeklyMeetingTaskRule: {
          bigDepNum: 0,
          bigDepRate: 0,
          bigDepScore: 0,
          smallDepNum: 0,
          smallDepRate: 0,
          smallDepScore: 0,
          scoreType: 1,
        },
        // 安全随手拍考评规则
        instaShotRule: {
          bigDepNum: 0,
          bigDepScore: 0,
          smallDepNum: 0,
          smallDepScore: 0,
          scoreType: 1,
        },
        // 周会参会考评规则
        weeklyMeetingJoinRule: {
          bigDepNum: 0,
          bigDepScore: 0,
          smallDepNum: 0,
          smallDepScore: 0,
          scoreType: 1,
        },
        // 三违查处考评规则
        threeViolationRule: {
          bigDepNum: 0,
          bigDepScore: 0,
          smallDepNum: 0,
          smallDepScore: 0,
          scoreType: 1,
        },
        // 重复隐患数量考评规则
        repeatHiddenDangerRule: {
          bigDepNum: 0,
          bigDepScore: 0,
          smallDepNum: 0,
          smallDepScore: 0,
          scoreType: 2,
        },
        // 考核周期
        evaluationStartDay: 1, // 每月考核起始日
        evaluationEndDay: 1, // 每月考核截止日
      },
      dataRule: {},
    }
  },
  created() {
    this.getDepartmentRules()
  },
  methods: {
    getDepartmentRules() {
      this.isLoading = true
      getDepartmentRulesFn()
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
    submitEdit() {
      this.submitLoading = true
      saveDepartmentRulesFn(this.inputForm)
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
      label="考评分值设置"
      prop="accidentManageRule.accidentScore"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.accidentScore"
        controls-position="right"
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
      label="考评分值设置"
      prop="accidentManageRule.governmentScore"
    >
      <el-input-number
        v-model="inputForm.accidentManageRule.governmentScore"
        controls-position="right"
      />
    </el-form-item>
    <h3 class="title-box">
      隐患排查与验证次数考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="重要危险源隐患排查"
      prop="hiddenDangerCheck.bigDepDangerSource"
      label-width="150px"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.bigDepDangerSource"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="重要装备的安全联锁验证"
      prop="hiddenDangerCheck.bigDepDevice"
      label-width="150px"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.bigDepDevice"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="hiddenDangerCheck.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="重要危险源隐患排查"
      prop="hiddenDangerCheck.smallDepDangerSource"
      label-width="150px"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.smallDepDangerSource"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="重要装备的安全联锁验证"
      prop="hiddenDangerCheck.smallDepDevice"
      label-width="150px"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.smallDepDevice"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="hiddenDangerCheck.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.hiddenDangerCheck.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <h3 class="title-box">
      周会任务考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="考核任务量"
      prop="weeklyMeetingTaskRule.bigDepNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.bigDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="工作完成率"
      prop="weeklyMeetingTaskRule.bigDepRate"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.bigDepRate"
        controls-position="right"
        :min="0"
      />
      %
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="weeklyMeetingTaskRule.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="考核任务量"
      prop="weeklyMeetingTaskRule.smallDepNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.smallDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="工作完成率"
      prop="weeklyMeetingTaskRule.smallDepRate"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.smallDepRate"
        controls-position="right"
        :min="0"
      />
      %
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="weeklyMeetingTaskRule.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingTaskRule.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <h3 class="title-box">
      安全随手拍考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="instaShotRule.bigDepNum"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.bigDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="instaShotRule.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="instaShotRule.smallDepNum"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.smallDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="instaShotRule.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.instaShotRule.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <h3 class="title-box">
      周会参会考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="weeklyMeetingJoinRule.bigDepNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingJoinRule.bigDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="weeklyMeetingJoinRule.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingJoinRule.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="weeklyMeetingJoinRule.smallDepNum"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingJoinRule.smallDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="weeklyMeetingJoinRule.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.weeklyMeetingJoinRule.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <h3 class="title-box">
      三违查处考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="threeViolationRule.bigDepNum"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.bigDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="threeViolationRule.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="threeViolationRule.smallDepNum"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.smallDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="threeViolationRule.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.threeViolationRule.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <h3 class="title-box">
      重复隐患数量考评规则
    </h3>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="bigDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="repeatHiddenDangerRule.bigDepNum"
    >
      <el-input-number
        v-model="inputForm.repeatHiddenDangerRule.bigDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="repeatHiddenDangerRule.bigDepScore"
    >
      <el-input-number
        v-model="inputForm.repeatHiddenDangerRule.bigDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
    </el-form-item>
    <br>
    <el-form-item
      label="部门"
      label-width="50px"
    >
      <el-select
        v-model="smallDep"
        placeholder="请选择"
        disabled
        style="width: 80px"
      >
        <el-option
          v-for="item in DepartmentTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="次数"
      prop="repeatHiddenDangerRule.smallDepNum"
    >
      <el-input-number
        v-model="inputForm.repeatHiddenDangerRule.smallDepNum"
        controls-position="right"
        :min="0"
      />
    </el-form-item>
    <el-form-item
      label="考评标准"
      prop="repeatHiddenDangerRule.smallDepScore"
    >
      <el-input-number
        v-model="inputForm.repeatHiddenDangerRule.smallDepScore"
        controls-position="right"
        :min="0"
      />
      (元)
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
      v-if="hasBtnPermission('department_rules_save')"
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
