/* * @Author: xiaorui 目标配置页面 * @Date: 2023-04-27 10:04:21 * @Last Modified by: xiaorui * @Last
Modified time: 2023-06-15 15:15:24 */
<script>
import { TARGET_CONFIG_LIST } from '@/http/excel-api'
import {
  deleteTargetConfigFn,
  getTargetConfigListByPageFn,
} from '@/http/safeProductionTarget/safe-production-target-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import TargetConfigDialog from './dialog/targetConfigDialog'

export default {
  components: {
    OwnDeparmentTree,
    TargetConfigDialog,
    ExcelExport,
  },
  data: () => ({
    loading: false,
    companyId: '', // 登录用户所属公司id，用于查询左侧组织架构树
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      deptId: '',
      postName: '', // 岗位名称
    },
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    this.companyId = this.$store.state.user.user.companyId
    this.getDataList()
  },
  methods: {
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.deptId = v.id
      this.searchFn()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      getTargetConfigListByPageFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
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
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    getexamItemStr(list) {
      return (
        list.map((item, index) => {
          return `${index + 1}、${item.name}`
        }) || []
      ).join(';')
    },
    // 查看
    clickFn(method, row) {
      this.$refs.targetConfigDialog.init(method, row)
    },
    deleteFn(id) {
      this.$confirm('您确认删除此项目标配置？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteTargetConfigFn(id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    resetEvent() {
      this.$refs.sForm.resetFields()
      this.sForm.pageNum = 1
      this.getDataList()
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: TARGET_CONFIG_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
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
        prop="postName"
        label="岗位名称"
      >
        <el-input
          v-model="sForm.postName"
          placeholder="岗位"
          clearable
          style="width: 160px"
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
        icon="el-icon-plus"
        type="primary"
        plain
        @click="clickFn('add')"
      >
        新增
      </el-button>
      <el-button
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
    </div>
    <el-table
      slot="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="100%"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="所属公司"
        prop="companyName"
        align="center"
      />
      <el-table-column
        label="组织架构"
        prop="deptName"
        align="center"
      />
      <el-table-column
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="目标"
        prop="examItemList"
        align="center"
        min-width="160"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <RichText :des="getexamItemStr(scope.row.examItemList)" />
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
        align="center"
      />
      <el-table-column
        label="操作"
        min-width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="clickFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-warning)"
            @click="clickFn('edit', scope.row)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteFn(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="sForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="sForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getDataList"
      @current-change="getDataList"
    />
    <target-config-dialog
      slot="dialog"
      ref="targetConfigDialog"
      @refreshDataList="searchFn"
    />
    <!-- excel导出 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="showExportDialog = false"
      />
    </el-dialog>
  </TreeTable>
</template>
