/* * @Author: xiaorui 安全员考评金额计算的弹框 * @Date: 2023-02-16 09:55:58 * @Last Modified by:
xiaorui * @Last Modified time: 2023-02-28 11:14:24 */
<script>
import { getAllByRankFn, saveSaferEvaluateAdjustFn } from '@/http/evaluate-manage/evaluate-api'
import { DepartmentTypeList } from '@/views/evaluateManage/config/constant'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      DepartmentTypeList,
      sForm: {
        date: '',
      },
      tableData: [],
    }
  },
  methods: {
    init() {
      this.visible = true
      const date = new Date()
      const year = date.getFullYear()
      const currentMonth
        = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
      this.sForm.date = `${year}-${currentMonth}`
      this.getAllByRank(this.sForm.date)
    },
    getAllByRank() {
      this.loading = true
      getAllByRankFn(this.sForm.date)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result
          }
          else {
            this.$message.warning(data.message || '获取列表失败')
          }
        })
        .catch(() => {
          this.$message.error('获取列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn() {
      this.getAllByRank()
    },
    doSubmit() {
      const params = this.tableData.map((item) => {
        return {
          id: item.id,
          evaluationCriteria: item.evaluationCriteria,
          incentiveCriteria: item.incentiveCriteria,
          cashAmount:
            item.evaluationCriteria && item.incentiveCriteria
              ? item.evaluationCriteria * (item.incentiveCriteria / 100)
              : 0,
        }
      })
      saveSaferEvaluateAdjustFn(params)
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
    },
    getLabel(val, list) {
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
  <el-dialog
    title="安全员绩效考评核算"
    :close-on-click-modal="false"
    width="1100px"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="sForm"
      :inline="true"
      :model="sForm"
      @submit.native.prevent
    >
      <el-form-item label="考核日期">
        <el-date-picker
          v-model="sForm.date"
          type="month"
          placeholder="选择月份"
          value-format="yyyy-MM"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="searchFn"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="部门"
        prop="departmentName"
        align="center"
      />
      <el-table-column
        label="部门类别"
        prop="departmentType"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          {{ getLabel(scope.row.departmentType, 'DepartmentTypeList') }}
        </template>
      </el-table-column>
      <el-table-column
        label="姓名"
        prop="userName"
        align="center"
        width="80"
      />
      <el-table-column
        label="日期"
        prop="evaluationStart"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          {{ scope.row.evaluationStart.slice(0, scope.row.evaluationStart.lastIndexOf('-')) }}
        </template>
      </el-table-column>
      <el-table-column
        label="考评分值"
        prop="totalScore"
        align="center"
        width="80"
      />
      <el-table-column
        label="排名"
        prop="rank"
        align="center"
        width="60"
      />
      <el-table-column
        label="考评标准(元)"
        prop="evaluationCriteria"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.evaluationCriteria"
            controls-position="right"
            style="width: 100px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="激励标准(%)"
        prop="incentiveCriteria"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.incentiveCriteria"
            controls-position="right"
            style="width: 100px"
          />%
        </template>
      </el-table-column>
      <el-table-column
        label="实际兑现金额"
        prop="cashAmount"
        align="center"
      >
        <template slot-scope="scope">
          {{
            scope.row.evaluationCriteria && scope.row.incentiveCriteria
              ? scope.row.evaluationCriteria * (scope.row.incentiveCriteria / 100)
              : 0
          }}
        </template>
      </el-table-column>
    </el-table>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
