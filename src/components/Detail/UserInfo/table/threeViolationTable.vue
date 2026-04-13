/* * @Author: xiaorui 一人一档：三违考核记录 * @Date: 2023-12-25 17:34:36 * @Last Modified by:
xiaorui * @Last Modified time: 2023-12-25 17:40:56 */
<script>
import { getThreeViolationListByPageFn } from '@/http/rewardAssessment/reward'

export default {
  props: {
    id: String,
  },
  data() {
    return {
      loading: false,
      minWidth: 120,
      assessStatusList: [
        {
          label: '待编辑',
          value: 0,
        },
        {
          label: '待审批',
          value: 1,
        },
        {
          label: '拒绝',
          value: 2,
        },
        {
          label: '同意',
          value: 3,
        },
      ],
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
        examineUserId: this.id,
        isPage: false,
      }
      getThreeViolationListByPageFn(params).then(({ data }) => {
        this.loading = false
        this.tableData = data.result.list || []
      })
    },
    getLabel(list, val) {
      return (
        this[list].find((item) => {
          return item.value === val
        }) || {}
      ).label
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
      label="日期"
      prop="assessDate"
      align="center"
    />
    <el-table-column
      label="发起人"
      prop="initiatorUserName"
      align="center"
    />
    <el-table-column
      label="发起人部门"
      width="140"
      prop="initiatorDepName"
      align="center"
    />
    <el-table-column
      label="考核类型"
      prop="assessType"
      align="center"
    >
      <template slot-scope="scope">
        {{ $dictUtils.getDictLabel('assess_type', scope.row.assessType) }}
      </template>
    </el-table-column>
    <el-table-column
      label="考核类别"
      prop="assessCategory"
      align="center"
    >
      <template slot-scope="scope">
        {{ $dictUtils.getDictLabel('assess_category', scope.row.assessCategory) }}
      </template>
    </el-table-column>
    <el-table-column
      label="被考核单位"
      width="140"
      prop="examineDepartmentName"
      align="center"
    />
    <el-table-column
      label="被考核人姓名"
      width="140"
      prop="examineUserName"
      align="center"
    />
    <el-table-column
      label="考核级别"
      prop="assessLevel"
      align="center"
    >
      <template slot-scope="scope">
        {{ $dictUtils.getDictLabel('assess_level', scope.row.assessLevel) }}
      </template>
    </el-table-column>
    <el-table-column
      label="考核总金额"
      width="140"
      prop="assessTotalAmount"
      align="center"
    />
    <el-table-column
      label="事实描述"
      prop="factDes"
      align="center"
    />
    <el-table-column
      label="考核执行部门"
      width="140"
      prop="executeDepartmentName"
      align="center"
    />
    <el-table-column
      label="审批状态"
      prop="assessStatus"
      align="center"
    >
      <template slot-scope="scope">
        <span> {{ getLabel('assessStatusList', scope.row.assessStatus) }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="执行状态"
      prop="executed"
      align="center"
    >
      <template slot-scope="scope">
        <span>{{ scope.row.executed ? '已执行' : '待执行' }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>
