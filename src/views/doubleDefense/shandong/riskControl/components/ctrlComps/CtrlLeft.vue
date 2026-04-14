<script>
import { EvaMethod, RiskLevel } from '@/views/doubleDefense/shandong/config/constant'

export default {
  props: {
    // 详情数据
    infoData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      RiskLevel, // 风险等级下拉列表
      EvaMethod, // 风险评价方法列表
    }
  },
  computed: {
    /* 设置风险等级文字及颜色 */
    setRiskLevel() {
      return function (riskLv) {
        const riskLvInt = Number.parseInt(riskLv)
        let param = {}
        for (const item of this.RiskLevel) {
          if (item.value == riskLvInt) {
            param = item
            break
          }
        }
        return param
      }
    },
    /* 设置评价方法 */
    setMethod() {
      return function (type) {
        let param = { nick: '-', showType: 'info' }
        for (const item of this.EvaMethod) {
          if (item.value == Number.parseInt(type)) {
            param = {
              nick: item.nick,
              showType: item.showType,
            }
            break
          }
        }
        return param
      }
    },
    currentUnitTypeLabel() {
      return this.$dictUtils.getDictLabelById('analysis_type', this.infoData.unitType)
    },
  },
}
</script>

<template>
  <div class="left-box">
    <el-alert
      title="风险辨识评价信息"
      style="margin: 0 0 10px 0"
      :closable="false"
    />
    <el-form
      label-width="90px"
      disabled
    >
      <el-form-item label="风险区域：">
        <span>{{
          `「${$dictUtils.getDictLabelById('riskArea_type', infoData.regionType, '-')}」`
        }}</span>
        <span>{{ infoData.regionName }}</span>
      </el-form-item>
      <el-form-item label="分析单元：">
        <span>{{ `「${currentUnitTypeLabel}」` }}</span>
        <span>{{ infoData.unitName }}</span>
      </el-form-item>
      <el-form-item label="责任部门：">
        {{ infoData.responsibilityDeptName }}
      </el-form-item>
      <el-form-item label="责任人：">
        {{ infoData.responsibilityUserName }}
      </el-form-item>
      <el-form-item
        v-if="currentUnitTypeLabel === '作业活动'"
        label="作业步骤："
      >
        {{ infoData.eventName }}
      </el-form-item>
      <el-form-item
        v-if="currentUnitTypeLabel === '作业活动'"
        label="危险源或潜在事件："
      >
        {{ infoData.eventDesc }}
      </el-form-item>
      <el-form-item
        v-if="currentUnitTypeLabel === '设备设施'"
        label="检查项目："
      >
        {{ infoData.eventName }}
      </el-form-item>
      <el-form-item
        v-if="currentUnitTypeLabel === '设备设施'"
        label="标准："
      >
        {{ infoData.eventDesc }}
      </el-form-item>
      <el-form-item label="可能事故：">
        {{ infoData.accidentType }}
      </el-form-item>
      <el-form-item label="风险等级：">
        <el-tag
          class="risk-tag"
          :type="setMethod(infoData.evaluationMethod).showType"
        >
          {{ setMethod(infoData.evaluationMethod).nick }}
        </el-tag>
        <span
          class="risk-des"
          :style="`background:${setRiskLevel(infoData.riskLevel).color}`"
        >{{ setRiskLevel(infoData.riskLevel).label }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.left-box {
  width: 300px;
  height: 100%;
  overflow-y: auto;
  .risk-tag {
    height: 25px;
    line-height: 25px;
    margin: 0 5px 0 0;
  }
  .risk-des {
    display: inline-block;
    height: 23px;
    line-height: 23px;
    padding: 0 6px;
    border-radius: 2px;
    background: #67c23a;
  }
}
</style>
