/* * @Author: xiaorui 巡检统计页面 * @Date: 2023-02-06 15:40:59 * @Last Modified by: xiaorui * @Last
Modified time: 2024-03-15 12:05:20 */
<script>
import { getInspectionRateFn } from '@/http/dev_new/inspection-api'

export default {
  data() {
    const currentYear = new Date().getFullYear()
    return {
      loading: false,
      yearOption: [
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
          value: 1,
          label: '1月',
        },
        {
          value: 2,
          label: '2月',
        },
        {
          value: 3,
          label: '3月',
        },
        {
          value: 4,
          label: '4月',
        },
        {
          value: 5,
          label: '5月',
        },
        {
          value: 6,
          label: '6月',
        },
        {
          value: 7,
          label: '7月',
        },
        {
          value: 8,
          label: '8月',
        },
        {
          value: 9,
          label: '9月',
        },
        {
          value: 10,
          label: '10月',
        },
        {
          value: 11,
          label: '11月',
        },
        {
          value: 12,
          label: '12月',
        },
      ],
      searchForm: {
        year: currentYear,
        month: '',
      },
      dataList: [],
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.loading = true
      getInspectionRateFn(this.searchForm).then(({ data }) => {
        this.loading = false
        if (data.success) {
          data.result.forEach((item) => {
            item.id = item.nodeId
          })
          this.dataList = this.setTreeData(data.result || [])
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      })
    },
    // 重置
    resetButton() {
      this.$refs.searchForm.resetFields()
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard
      id="searchBlock"
      type="search"
      customStyle="margin-bottom:10px"
    >
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="getDataList()"
        @submit.native.prevent
      >
        <el-form-item
          prop="year"
          label="年份"
        >
          <el-select v-model="searchForm.year">
            <el-option
              v-for="item in yearOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="month"
          label="月份"
        >
          <el-select
            v-model="searchForm.month"
            clearable
          >
            <el-option
              v-for="item in monthOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            @click="getDataList"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            size="small"
            icon="el-icon-refresh-right"
            @click="resetButton"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard customStyle="height: calc(100vh - 145px)">
      <vxe-table
        ref="xTree"
        resizable
        border="inner"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        auto-resize
        row-id="id"
        size="small"
        show-header-overflow
        show-overflow
        highlight-hover-row
        highlight-current-row
        :tree-config="{ reserve: true }"
        :loading="loading"
        :data="dataList"
      >
        <vxe-table-column
          title="组织架构"
          field="nodeName"
          tree-node
        />
        <vxe-table-column
          title="参加设备巡检台数"
          field="needInspectionCount"
          align="center"
        />
        <vxe-table-column
          title="巡检设备台数"
          field="inspectionCount"
          align="center"
        />
        <vxe-table-column
          title="巡检率"
          field="percentage"
          align="center"
        />
        <vxe-table-column
          title="维保任务总数"
          field="maintenanceTaskCount"
          align="center"
        />
        <vxe-table-column
          title="维保任务执行数"
          field="maintenanceTaskExecuteCount"
          align="center"
        />
        <vxe-table-column
          title="维保任务执行率"
          field="maintenancePercentage"
          align="center"
        />
        <vxe-table-column
          title="润滑任务总数"
          field="lubricateTaskCount"
          align="center"
        />
        <vxe-table-column
          title="润滑任务执行数"
          field="lubricateTaskExecuteCount"
          align="center"
        />
        <vxe-table-column
          title="润滑任务执行率"
          field="lubricatePercentage"
          align="center"
        />
      </vxe-table>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding: 10px;
  background: #f3f7f9;
}
::v-deep .vxe-table {
  background: #ffffff;
  padding: 10px;
}

.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
.head-search {
  width: 100%;
  padding: 5px 0 5px 10px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
</style>
