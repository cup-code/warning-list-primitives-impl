/* * @Author: xiaorui 双预防部门运行情况统计 * @Date: 2023-05-19 10:02:50 * @Last Modified by:
xiaorui * @Last Modified time: 2024-01-11 17:40:27 */
<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import { getDepartmentDefenseCountFn } from '@/http/defense/defenseCount-api'
import DepartmentCountDetail from './dialog/departmentCountDetail'

export default {
  components: {
    DepartmentCountDetail,
  },
  data() {
    const currentYear = new Date().getFullYear()
    return {
      isLoading: false,
      year: '',
      month: '',
      yearOption: [
        {
          value: currentYear - 2,
          label: currentYear - 2,
        },
        {
          value: currentYear - 1,
          label: currentYear - 1,
        },
        {
          value: currentYear,
          label: currentYear,
        },
      ],
      monthOption: [
        {
          value: '01',
          label: '1月',
        },
        {
          value: '02',
          label: '2月',
        },
        {
          value: '03',
          label: '3月',
        },
        {
          value: '04',
          label: '4月',
        },
        {
          value: '05',
          label: '5月',
        },
        {
          value: '06',
          label: '6月',
        },
        {
          value: '07',
          label: '7月',
        },
        {
          value: '08',
          label: '8月',
        },
        {
          value: '09',
          label: '9月',
        },
        {
          value: '10',
          label: '10月',
        },
        {
          value: '11',
          label: '11月',
        },
        {
          value: '12',
          label: '12月',
        },
      ],
      searchData: {
        startDate: '',
        endDate: '',
      },
      tableData: [],
    }
  },
  created() {
    const currentYear = new Date().getFullYear()
    if (currentYear === 2023) {
      this.yearOption = this.yearOption.slice(2)
    }
    else if (currentYear === 2024) {
      this.yearOption = this.yearOption.slice(1)
    }
    this.queryClick()
  },
  methods: {
    queryClick() {
      if (this.year && this.month) {
        this.searchData.startDate = `${this.year}-${this.month}-01`
        this.searchData.endDate = this.getNextMonth(this.searchData.startDate)
      }
      else if (this.year && !this.month) {
        this.searchData.startDate = `${this.year}-01-01`
        this.searchData.endDate = `${this.year + 1}-01-01`
      }
      else if (!this.year && !this.month) {
        this.searchData.startDate = `${this.yearOption[0].value}-01-01`
        this.searchData.endDate = `${this.yearOption[this.yearOption.length - 1].value + 1}-01-01`
      }
      this.isLoading = true
      getDepartmentDefenseCountFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result || []
          }
          else {
            this.$message.warning(data.message || '获取数据失败')
          }
        })
        .catch(() => {
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    getNextMonth(v) {
      // 获取上个月份
      const currentDate = new Date(v)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
      return this.moment(nextMonth).format('YYYY-MM-DD')
    },
    exportClick() {
      const wb = XLSX.utils.table_to_book(document.querySelector('#countTable'), {
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
          `双预防部门运行情况${this.searchData.startDate}至${this.searchData.endDate}统计.xlsx`,
        )
      }
      catch (e) {
        if (typeof console !== 'undefined')
          console.log(e, wbout)
      }
      return wbout
    },
    viewDetail(row, type) {
      this.$refs.departmentCountDetail.init(
        row.departId,
        this.searchData.startDate,
        this.searchData.endDate,
        type,
      )
    },
  },
}
</script>

<template>
  <TreeTable
    ref="treeTable"
    v-loading="isLoading"
    :isShowLeft="false"
    class="departmentCount"
  >
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      label-width="50px"
    >
      <el-form-item label="年份">
        <el-radio-group v-model="year">
          <el-radio-button label="">
            全部
          </el-radio-button>
          <el-radio-button
            v-for="item in yearOption"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="月份">
        <el-radio-group
          v-model="month"
          :disabled="!year"
        >
          <el-radio-button label="">
            全部
          </el-radio-button>
          <el-radio-button
            v-for="item in monthOption"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
        <el-button
          type="success"
          plain
          icon="el-icon-upload2"
          @click="exportClick"
        >
          excel导出
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      id="countTable"
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
    >
      <el-table-column
        label="所属公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="部门"
        align="center"
        prop="departName"
      />
      <el-table-column
        label="隐患情况"
        align="center"
      >
        <el-table-column
          label="隐患数"
          align="center"
          prop="hiddenTroubleStatistica.hiddenTroubleCount"
        />
        <el-table-column
          label="整改数"
          align="center"
          prop="hiddenTroubleStatistica.hiddenTroubleRectificationCount"
        />
        <el-table-column
          label="整改率"
          align="center"
          prop="hiddenTroubleStatistica.hiddenTroubleRectificationRate"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="viewDetail(scope.row, 1)"
            >
              {{
                `${Number(scope.row.hiddenTroubleStatistica.hiddenTroubleRectificationRate).toFixed(
                  2,
                )}%`
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="风险巡查情况"
        align="center"
      >
        <el-table-column
          label="任务数"
          align="center"
          prop="riskControlStatistical.riskControlTaskCount"
        />
        <el-table-column
          label="执行数"
          align="center"
          prop="riskControlStatistical.riskControlTaskExecuteCount"
        />
        <el-table-column
          label="执行率"
          align="center"
          prop="riskControlStatistical.riskControlTaskExecuteRate"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="viewDetail(scope.row, 2)"
            >
              {{
                `${Number(scope.row.riskControlStatistical.riskControlTaskExecuteRate).toFixed(2)}%`
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="安全检查情况"
        align="center"
      >
        <el-table-column
          label="任务数"
          align="center"
          prop="safeCheckStatistical.safeCheckTaskCount"
        />
        <el-table-column
          label="执行数"
          align="center"
          prop="safeCheckStatistical.safeCheckTaskExecuteCount"
        />
        <el-table-column
          label="执行率"
          align="center"
          prop="safeCheckStatistical.safeCheckTaskExecuteRate"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="viewDetail(scope.row, 3)"
            >
              {{
                `${Number(scope.row.safeCheckStatistical.safeCheckTaskExecuteRate).toFixed(2)}%`
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="随手拍"
        align="center"
      >
        <el-table-column
          label="安全类上报数"
          align="center"
          prop="takePhotosStatistical.takePhotosCount"
        />
        <el-table-column
          label="隐患整改数"
          align="center"
          prop="takePhotosStatistical.takePhotosHiddenTroubleCount"
        />
        <el-table-column
          label="安全类的确认隐患率"
          align="center"
          prop="takePhotosStatistical.takePhotosHiddenTroubleRate"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="viewDetail(scope.row, 4)"
            >
              {{
                `${Number(scope.row.takePhotosStatistical.takePhotosHiddenTroubleRate).toFixed(2)}%`
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <department-count-detail
      slot="dialog"
      ref="departmentCountDetail"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
.departmentCount ::v-deep {
  .bg-header {
    padding: 18px 8px 3px !important;
  }
}
</style>
