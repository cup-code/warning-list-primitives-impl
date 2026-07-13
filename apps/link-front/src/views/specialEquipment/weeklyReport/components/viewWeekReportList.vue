/* * @Author: xiaorui 查看本周周报情况弹框 * @Date: 2023-04-12 14:47:10 * @Last Modified by: xiaorui
* @Last Modified time: 2023-04-12 18:48:17 */
<script>
import { getWeekReportListByPageFn } from '@/http/specialEquipment/weeklyReport-api'

export default {
  data() {
    return {
      visible: false,
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        templateTitle: '',
        reportWriter: '',
      },
      total: 0,
      tableData: [],
    }
  },
  methods: {
    /* 查询表格数据 */
    searchClick() {
      this.isLoading = true
      getWeekReportListByPageFn(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.warning('请求表格数据出错：', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    init() {
      this.visible = true
      this.queryClick()
    },
  },
}
</script>

<template>
  <el-dialog
    title="本周填报情况"
    :close-on-click-modal="false"
    :append-to-body="true"

    :visible.sync="visible"
    class="normal-dialog"
    width="800px"
  >
    <!-- 搜索栏 -->
    <el-form
      inline
      label-width="80"
    >
      <el-form-item label="标题">
        <el-input
          v-model="searchData.templateTitle"
          placeholder="标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="填报人">
        <el-input
          v-model="searchData.reportWriter"
          placeholder="填报人"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="isLoading"
          @click="queryClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="标题"
        align="center"
        prop="templateTitle"
      />
      <el-table-column
        label="填报人"
        align="center"
        prop="reportWriter"
      >
        <template slot-scope="scope">
          {{ (scope.row.reportWriter || []).map(item => item.fullName).join('，') }}
        </template>
      </el-table-column>
      <el-table-column
        label="填报时间"
        align="center"
        prop="createdTime"
      />
      <el-table-column
        label="本周提交状态"
        align="center"
        prop="createdTime"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.createdTime"
            type="success"
          >
            已提交
          </el-tag>
          <el-tag
            v-else
            type="danger"
          >
            未提交
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      style="text-align: right"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
  </el-dialog>
</template>
