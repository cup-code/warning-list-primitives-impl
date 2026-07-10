<!-- 特种设备周报模板列表页面 -->
<script>
import {
  deleteWeeklyReportTemplate,
  getWeeklyReportTemplatePaging,
  updateWeeklyReportTemplateStatus,
} from '@/http/specialEquipment/weeklyReport-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'

export default {
  name: 'weeklyReportTemplateList',
  components: {
    CompanyTree,
  },
  data() {
    return {
      isLoading: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        departmentId: '',
        templateTitle: '',
        reportWriter: '',
      },
      tableData: [],
      total: 0,
      companyTreeData: [],
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    /**
     * 树节点点击
     * @param data
     */
    treeNodeTap(data) {
      const me = this
      if (data) {
        me.queryForm.companyId = data.id
      }
      else {
        me.queryForm.companyId = ''
      }
      me.searchClick()
    },
    /**
     * 获取分页表格数据
     */
    getTableData() {
      const me = this
      me.isLoading = true
      getWeeklyReportTemplatePaging(me.queryForm)
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.tableData = res.result.list
            me.total = res.result.total
            return
          }
          me.$message.warning(r.message || '获取列表数据失败')
        })
        .catch((e) => {
          me.$message.error(`数据查询异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
        })
    },
    /**
     * 查询按钮点击
     */
    searchClick() {
      this.queryForm.pageNum = 1
      this.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      const me = this
      me.$refs.queryForm.resetFields()
      me.$refs.companyTree.refreshTree()
    },
    /**
     * 编辑按钮单击（含新增、修改、查看）
     * @param rowData 行数据对象
     * @param opType 操作类别
     */
    editClick(rowData, opType) {
      const me = this
      me.companyTreeData = me.$refs.companyTree.getTreeData()
      me.$router.push({
        name: 'specialEquipmentWeeklyReportTemplateDetail',
        params: {
          companyTreeData: JSON.stringify(me.companyTreeData),
          dataRecord: rowData || null,
          opType,
        },
      })
    },
    /**
     * 删除按钮单击
     * @param id 主键
     */
    deleteClick(id) {
      const me = this
      me.$confirm(`您确定要删除本条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          me.isLoading = true
          deleteWeeklyReportTemplate(id)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                me.getTableData()
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`数据删除异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        })
        .catch(e => me.$message.info('已取消'))
    },
    /**
     * 填报人格式化
     */
    reportWriterFormatter(row, column, cellValue, index) {
      let val = ''
      if (Array.isArray(cellValue) && cellValue.length > 0) {
        cellValue.forEach((v, i) => {
          if (i === 0) {
            val += v.fullName
          }
          else {
            val += `,${v.fullName}`
          }
        })
      }
      return val
    },
    /**
     * 切换周报模板状态
     * @param id 记录唯一编号
     * @param status 状态值
     */
    switchTemplateStatus(id, status) {
      const me = this
      me.$confirm(`您确定要${status === 0 ? '启用' : '停用'}该模板？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          me.isLoading = true
          updateWeeklyReportTemplateStatus(id, status)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                me.getTableData()
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`数据更新异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        })
        .catch(e => me.$message.info('已取消'))
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    class="specialEquipmentContainer"
  >
    <CompanyTree
      slot="tree"
      ref="companyTree"
      title="公司架构"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="queryForm"
      label-width="50px"
      :inline="true"
      :model="queryForm"
    >
      <el-form-item
        prop="templateTitle"
        label="标题"
      >
        <el-input
          v-model="queryForm.templateTitle"
          placeholder=""
          clearable
        />
      </el-form-item>

      <el-form-item
        prop="reportWriter"
        label="填报人"
      >
        <el-input
          v-model="queryForm.reportWriter"
          placeholder=""
          clearable
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="isLoading"
          @click="searchClick"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-right"
          @click="searchReset()"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div
      v-if="hasBtnPermission('weekly_report_template_add')"
      slot="auxiliary"
    >
      <el-button
        icon="el-icon-plus"
        type="primary"
        plain
        @click="editClick(null, 'add')"
      >
        新增
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      slot="table"
      ref="specialEquipmentTable"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="100%"
      row-key="id"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        label="所属部门"
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
        :formatter="reportWriterFormatter"
      />
      <el-table-column
        label="编制人"
        align="center"
        prop="createdName"
      />
      <el-table-column
        label="编制时间"
        align="center"
        prop="createdTime"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="templateStatus"
      >
        <template #default="scope">
          <el-tag
            v-if="scope.row.templateStatus === 0"
            type="success"
            size="medium"
          >
            启用
          </el-tag>
          <el-tag
            v-if="scope.row.templateStatus === 1"
            type="danger"
            size="medium"
          >
            停用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
        fixed="right"
        prop="templateStatus"
      >
        <template #default="scope">
          <el-button
            v-if="hasBtnPermission('weekly_report_template_view')"
            type="text"
            @click="editClick(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('weekly_report_template_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('weekly_report_template_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteClick(scope.row.id)"
          >
            删除
          </el-button>
          <el-button
            v-if="scope.row.templateStatus === 0 && hasBtnPermission('weekly_report_template_stop')"
            type="text"
            style="color: var(--ky-danger)"
            @click="switchTemplateStatus(scope.row.id, 1)"
          >
            停用
          </el-button>
          <el-button
            v-if="scope.row.templateStatus === 1 && hasBtnPermission('weekly_report_template_stop')"
            type="text"
            style="color: var(--ky-success)"
            @click="switchTemplateStatus(scope.row.id, 0)"
          >
            启用
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="queryForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="queryForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
  </TreeTable>
</template>
