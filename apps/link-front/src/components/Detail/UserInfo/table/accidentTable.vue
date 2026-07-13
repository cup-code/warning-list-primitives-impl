/* * @Author: xiaorui 一人一档中，事故工伤记录 * @Date: 2023-12-25 17:14:01 * @Last Modified by:
xiaorui * @Last Modified time: 2023-12-25 17:29:58 */
<script>
import { workInjuryManagement } from '@/http/accidentManage/investigation'

export default {
  props: {
    id: String,
  },
  data() {
    return {
      loading: false,
      minWidth: 120,
      tableData: [],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      const params = {
        party: this.id,
        isPage: false,
      }
      workInjuryManagement(params).then(({ result }) => {
        this.loading = false
        this.tableData = result.list || []
      })
    },
    delHtmlTag(str) {
      return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '')
    },
  },
}
</script>

<template>
  <el-table
    v-loading="loading"
    height="400"
    :data="tableData"
    :header-cell-style="{ background: 'var(--ky-head-color)' }"
    align="center"
    class="customer-table"
  >
    <el-table-column
      type="index"
      width="50"
      align="center"
      label="序号"
      fixed="left"
    />
    <el-table-column
      label="事故编号"
      prop="accidentNumber"
      align="center"
    />
    <el-table-column
      :show-overflow-tooltip="true"
      label="事故发生时间"
      prop="timeOfAccident"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="事故名称"
      prop="accidentName"
      align="center"
    />
    <el-table-column
      :show-overflow-tooltip="true"
      label="事故简述"
      prop="remarks"
      align="center"
    >
      <template slot-scope="scope">
        {{ delHtmlTag(scope.row.remarks) }}
      </template>
    </el-table-column>
    <el-table-column
      label="事故类型"
      prop="accidentType"
      align="center"
    />
    <el-table-column
      label="事故性质"
      prop="accidentNature"
      align="center"
    >
      <template slot-scope="scope">
        {{ $dictUtils.getDictLabel('character_accident', scope.row.accidentNature) }}
      </template>
    </el-table-column>
    <el-table-column
      label="当事人"
      prop="party"
      align="center"
    />
    <el-table-column
      label="负责人"
      prop="personInCharge"
      align="center"
    />
    <el-table-column
      label="工伤认定"
      prop="identificationStatus"
      align="center"
    />
    <el-table-column
      label="伤残鉴定"
      prop="appraisalStatus"
      align="center"
    />
    <el-table-column
      label="停工留薪期(天)"
      prop="daysOfWorkStoppageAndSalaryRetention"
      :min-width="minWidth"
      align="center"
    />
    <el-table-column
      label="费用合计(元)"
      prop="totalExpenses"
      align="center"
      width="110"
    />
  </el-table>
</template>
