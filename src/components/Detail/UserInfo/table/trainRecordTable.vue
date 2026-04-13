/* * @Author: xiaorui 一人一档中，培训记录 * @Date: 2023-08-23 10:20:34 * @Last Modified by: xiaorui
* @Last Modified time: 2023-12-25 17:15:11 */
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
        studyType: 1,
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
      label="任务来源分类"
      prop="sourceType"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="任务来源名称"
      prop="sourceName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="内容类型"
      prop="contentType"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="培训任务名称"
      prop="contentName"
      align="center"
      :min-width="minWidth"
    />
    <el-table-column
      label="关联考试任务名称"
      width="140"
      align="center"
      prop="examName"
    />
    <el-table-column
      label="任务时间"
      align="center"
    >
      <template slot-scope="scope">
        {{ `${scope.row.taskStartTime}至${scope.row.taskEndTime}` }}
      </template>
    </el-table-column>
    <el-table-column
      label="培训状态"
      align="center"
    >
      <template slot-scope="scope">
        <div v-html="rowRenderStatus(scope.row.trainStatus)" />
      </template>
    </el-table-column>
    <el-table-column
      label="计划时长(分)"
      width="140"
      align="center"
      prop="needLearnDuration"
    />
    <el-table-column
      label="已学习(分)"
      align="center"
      prop="passLearnDuration"
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
