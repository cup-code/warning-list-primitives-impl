/* * @Author: xiaorui 指标对比分析页面：查询公司考核项目不同年份的数量对比数据 * @Date: 2023-03-17
15:31:14 * @Last Modified by: xiaorui * @Last Modified time: 2023-11-30 10:07:37 */
<script>
import FileSaver from 'file-saver'
import moment from 'moment'
import XLSX from 'xlsx'
import { getEvaluateYearStatisticsFn } from '@/http/evaluate-manage/evaluate-api'
import CompanyTree from '@/views/common-ui/CompanyTree'

export default {
  components: {
    CompanyTree,
  },
  data: () => ({
    loading: false,
    tableData: [],
    sForm: {
      companyId: '',
      itemCode: '',
    },
    yearsKeys: [], // 获取所有年份
  }),
  created() {
    this.getDataList()
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.table.doLayout()
    })
  },
  methods: {
    // 点击公司树的item
    treeNodeTap(v) {
      // 记录公司id
      this.sForm.companyId = v.id
      this.getDataList()
    },
    getDataList() {
      this.loading = true
      getEvaluateYearStatisticsFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result || []
            this.yearsKeys = Object.keys(this.tableData[0].allYearsData)
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .catch(() => {
          this.$message.error('查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetEvent() {
      this.sForm.itemCode = ''
      this.getDataList()
    },
    // 点击数据跳转其他业务
    toOtherBook(row, year) {
      const startDate = this.getStartTime(row.itemCode, year)
      const endDate = this.getEndTime(row.itemCode, year)
      let routerName // 路由name。判断跳转哪个业务
      // 如果是轻微伤事故2、轻伤事故1、火灾事故3，则跳转事故台账
      switch (row.itemCode) {
        case 1:
          routerName = 'machineAccount'
          break
        case 2:
          routerName = 'machineAccount'
          break
        case 3:
          routerName = 'machineAccount'
          break
        case 4:
          routerName = 'dangerBookList'
          break
        case 5:
          routerName = 'threeViolationList'
          break
        case 6:
          routerName = 'threeViolationList'
          break
        case 7:
          routerName = 'safeRewardList'
          break
        case 8:
          routerName = 'safeRewardList'
          break
        case 9:
          routerName = 'weeklyMeetingManagement'
          break
        case 10: // 安全培训
          routerName = 'trainTaskBook'
          break
        case 11: // 应急演练
          routerName = 'drillRecord'
          break
        case 12: // 周会任务
          routerName = 'weeklyMeetingTask'
          break
        case 13: // 变更管理
          routerName = 'changeApplicationList'
          break
        case 14: // 特殊作业台账
          routerName = 'specialWorkList'
          break
      }
      this.$router.push({
        name: routerName,
        params: {
          fromEvaluate: true,
          type: row.itemCode, // 项目类型
          typeName: row.itemName,
          departmentId: row.companyDepartId, // 公司所属部门id
          companyId: row.companyId,
          startDate, // 起始时间
          endDate, // 截止时间
        },
      })
    },
    getStartTime(code, year) {
      // console.log(code, year)
      let startDate
      // 如果是轻微伤事故、轻伤事故、火灾事故，则跳转事故台账，时间格式为YYYY-MM-DD HH:mm:ss
      switch (code) {
        case 1:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 2:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 3:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 4:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 5:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 6:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 7:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 8:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 9:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 10:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 11:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 12:
          startDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 13:
          startDate = moment(year).format('YYYY-MM-DD')
          break
        case 14:
          startDate = moment(year).format('YYYY-MM-DD')
          break
      }
      return startDate
    },
    getEndTime(code, year) {
      // console.log(code, year)
      year = `${Number(year) + 1}`
      let endDate
      // 如果是轻微伤事故、轻伤事故、火灾事故，则跳转事故台账，时间格式为YYYY-MM-DD HH:mm:ss
      switch (code) {
        case 1:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 2:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 3:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 4:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 5:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 6:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 7:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 8:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 9:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 10:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 11:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 12:
          endDate = moment(year).format('YYYY-MM-DD HH:mm:ss')
          break
        case 13:
          endDate = moment(year).format('YYYY-MM-DD')
          break
        case 14:
          endDate = moment(year).format('YYYY-MM-DD')
          break
      }
      return endDate
    },
    // 导出
    exportClick() {
      const wb = XLSX.utils.table_to_book(document.querySelector('#evaluateYearTable'), {
        raw: true, // 如果表格里有数字、日期这些、需要加上raw: true
      })
      /* 获取二进制字符串作为输出 */
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })
      try {
        FileSaver.saveAs(
          // Blob 对象表示一个不可变、原始数据的类文件对象。
          new Blob([wbout], { type: 'application/octet-stream' }),
          // 设置导出文件名称
          `指标对比分析.xlsx`,
        )
      }
      catch (e) {
        if (typeof console !== 'undefined')
          console.log(e, wbout)
      }
      return wbout
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <CompanyTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <el-form
      slot="search"
      ref="sForm"
      :inline="true"
      :model="sForm"
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="itemCode"
        label="项目"
      >
        <el-select
          v-model="sForm.itemCode"
          placeholder="请选择"
          filterable
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('evaluate_item')"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="getDataList"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-left"
          :loading="loading"
          @click="resetEvent"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('evaluate_year_statistics_export')"
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
    </div>
    <el-table
      id="evaluateYearTable"
      slot="table"
      ref="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="100%"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
        fixed
      />
      <el-table-column
        label="公司"
        prop="companyName"
        align="center"
        fixed
      />
      <el-table-column
        label="项目"
        prop="itemName"
        align="center"
        fixed
      />
      <el-table-column
        label="单位"
        prop="unit"
        align="center"
        fixed
      />
      <el-table-column
        v-for="(item, index) in yearsKeys"
        :key="index"
        :label="item"
        align="center"
      >
        <template slot-scope="scope">
          <!-- <span>{{scope.row.allYearsData[item]}}</span> -->
          <el-button
            type="text"
            @click="toOtherBook(scope.row, item)"
          >
            {{ scope.row.allYearsData[item] }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="较上年同期比"
        prop="YOY"
        align="center"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.change === 1"
            class="el-icon-top"
            style="color: #f56c6c"
          />
          <i
            v-if="scope.row.change === -1"
            class="el-icon-bottom"
            style="color: #67c23a"
          />
          {{ scope.row.YOY }}
        </template>
      </el-table-column>
    </el-table>
  </TreeTable>
</template>
