/* * @Author: xiaorui 一人一档中，考试记录 * @Date: 2023-08-24 15:12:41 * @Last Modified by: xiaorui
* @Last Modified time: 2023-11-08 11:55:57 */
<script>
import { rowRenderStatus } from 'link-sdk'
import { getUserTrainRecordFn } from '@/http/safe-production/user-manage-api'

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
    rowRenderStatus,
    getDataList() {
      this.loading = true
      const params = {
        userId: this.id,
        studyType: 2,
        isPage: false,
      }
      getUserTrainRecordFn(params).then(({ data }) => {
        this.loading = false
        this.tableData = data.result.list || []
      })
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
      label="考试名称"
      prop="examName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="考试来源分类"
      prop="sourceType"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="考试来源名称"
      prop="sourceName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="关联培训任务名称"
      align="center"
      width="140"
      prop="contentName"
    />
    <el-table-column
      label="计划时间"
      align="center"
    >
      <template slot-scope="scope">
        {{ `${scope.row.taskStartTime}至${scope.row.taskEndTime}` }}
      </template>
    </el-table-column>
    <el-table-column
      label="时长(分)"
      width="140"
      align="center"
      prop="examTime"
    />
    <el-table-column
      label="满分"
      align="center"
      prop="totalScore"
    />
    <el-table-column
      label="及格分"
      align="center"
      prop="passScore"
    />
    <el-table-column
      label="得分"
      align="center"
      prop="userScore"
    />
    <el-table-column
      label="考试结果"
      align="center"
    >
      <template slot-scope="scope">
        <div v-html="rowRenderStatus(scope.row.examResult)" />
      </template>
    </el-table-column>
  </el-table>
</template>
