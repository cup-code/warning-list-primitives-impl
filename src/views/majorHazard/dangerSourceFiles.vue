<script>
import { deleteSourceFilesData, getTableData } from '@/http/major-hazard/dangerSourceFiles-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SourceFilesFrom from './components/sourceFilesFrom'

export default {
  name: 'dangerSourceFiles',
  components: { CompanyTree, SourceFilesFrom },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [],
      dialogTitle: '',
      visibleFrom: false,
      dialogEditable: true,
      fromData: {},
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /* 点击公司树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        this.searchData.companyId = ''
      }
      this.searchFn(true)
    },
    // 搜索
    searchFn(type) {
      if (!type) {
        this.searchData = {}
        this.searchData.pageSize = 10
      }
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表单数据
    getTableData() {
      this.isLoading = true
      getTableData(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list
            this.total = data.result.total
            this.$message.success('获取列表数据成功')
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据失败', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleFrom = true
      switch (type) {
        case 'add':
          this.dialogTitle = '新增重大危险源档案'
          this.fromData = {}
          this.dialogEditable = true
          break
        case 'edit':
          this.dialogTitle = '编辑重大危险源档案'
          this.fromData = infoData
          this.dialogEditable = true
          break
        case 'view':
          this.dialogTitle = '查看重大危险源档案'
          this.fromData = infoData
          this.dialogEditable = false

          break
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此重大危险源档案' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        deleteSourceFilesData(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleFrom = false
      if (isRefresh) {
        this.getTableData()
      }
    },
  },
}
</script>

<template>
  <!-- 重大危险源档案 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="所属年份">
          <el-date-picker
            v-model="searchData.year"
            clearable
            value-format="yyyy"
            type="year"
            placeholder="选择年"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="searchData.name"
            placeholder="名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="searchFn(true)"
          >
            查询
          </el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="changeFn('add')"
          >
            新增
          </el-button>
          <el-button
            type="info"
            icon="el-icon-refresh-right"
            @click="searchFn(false)"
          >
            重置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="所属公司"
        align="center"
        prop="companyName"
        min-width="150"
      />
      <el-table-column
        label="所属年份"
        align="center"
        prop="year"
        min-width="150"
      />
      <el-table-column
        label="名称"
        align="center"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleFrom"
    >
      <SourceFilesFrom
        v-if="visibleFrom"
        :editable="dialogEditable"
        :fromData="fromData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped lang="scss"></style>
