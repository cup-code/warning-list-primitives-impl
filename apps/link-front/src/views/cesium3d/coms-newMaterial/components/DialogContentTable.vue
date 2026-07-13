<script>
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant.js'
// import { RiskLevelList } from '../common/constant'
export default {
  name: 'RiskListTable',
  props: {
    tableData: {
      type: Array,
      default() {
        return []
      },
    },
    dialogTitleId: {
      type: String,
      default() {
        // 默认 ：
        return ''
      },
    },
  },
  data() {
    return {
      // 风险等级下拉列表
      RiskLevel,
    }
  },
  computed: {
    /* 设置风险等级样式 */
    setDangerLv() {
      return function (riskLv) {
        let name = ''
        let bgColor = ''
        for (const item of this.RiskLevel) {
          if (item.value == riskLv) {
            name = item.label
            bgColor = item.bgColor
          }
        }
        return {
          style: `padding:4px 6px;border-radius: 2px;background:${bgColor};`,
          name,
        }
      }
    },
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<template>
  <div style="height: 100%">
    <el-table
      :data="tableData"
      stripe
      :highlight-current-row="true"
      height="100%"
    >
      <el-table-column
        label="序号"
        type="index"
        align="center"
      />
      <el-table-column
        label="部门车间"
        prop="responsibilityDeptName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="负责人"
        prop="responsibilityUserName"
        align="center"
      />
      <el-table-column
        label="风险单元类型"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险单元名称"
        prop="unitName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险单元描述"
        prop="unitDesc"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险事件"
        prop="eventName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险事件描述"
        prop="eventDesc"
        align="center"
        min-width="100px"
      />

      <!--   safe-ticker  安全风险分级管控清单 ：包含以下数据 ,危害因素辨识排查清单:不包含一下数据 -->
      <template v-if="dialogTitleId === 'safe-ticker'">
        <el-table-column
          label="可能发生的事故"
          prop="accidentType"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="工程技术措施"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.controlMeasureMap['工程技术'] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="管理措施"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.controlMeasureMap['管理措施'] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="教育培训措施"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.controlMeasureMap['教育培训'] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="个人防护措施"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.controlMeasureMap['个人防护'] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="应急处置措施"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.controlMeasureMap['应急处置'] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="L"
          prop="evaluationDetail.lec_l"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_l || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="E"
          prop="evaluationDetail.lec_e"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_e || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="C"
          prop="evaluationDetail.lec_c"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_c || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="D"
          prop="evaluationDetail.risk_val"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.risk_val || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="风险等级"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <span :style="setDangerLv(scope.row.riskLevel).style">{{
              setDangerLv(scope.row.riskLevel).name
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="管控层级"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy) }}
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
