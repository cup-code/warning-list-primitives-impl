<script>
import { CriticalityByTypeDel, getCriticalityByTypeByPage } from '@/http/major-hazard/Anpi-chemical'
import CriticalityByTypeDia from './components/criticalityByTypeDia'

export default {
  name: 'criticalityByType',
  components: { CriticalityByTypeDia },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        key: '',
        harmCategory: '',
      },
      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getCriticalityByTypeByPage(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增危化品类别临界值'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑危化品类别临界值'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看危化品类别临界值'
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此危化品类别临界值' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        CriticalityByTypeDel(v.id)
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
    resetSearch() {
      this.searchData.pageNum = 1
      this.searchData.pageSize = 10
      this.searchData.key = ''
      this.searchData.harmCategory = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    :isShowLeft="false"
  >
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="关键词">
          <el-input
            v-model="searchData.key"
            placeholder="危害类别符号/危险性分类说明"
            clearable
          />
        </el-form-item>
        <el-form-item label="类别">
          <el-input
            v-model="searchData.harmCategory"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="searchFn"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            size="small"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        @click="changeFn('add')"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
      width=""
      :border="true"
      class="customer-table"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="危害类别"
        align="center"
        prop="harmCategory"
      />
      <el-table-column
        label="危害类别符号"
        align="center"
        prop="harmCharacter"
        min-width="150"
      />
      <el-table-column
        label="危害性分类及说明"
        align="center"
        prop="harmDesc"
        min-width="150"
      />
      <el-table-column
        label="临界值/t"
        align="center"
        prop="quantity"
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
            style="color: var(--ky-warning)"
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
      background
      style="padding-top: 10px"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleForm"
    >
      <CriticalityByTypeDia
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped></style>
