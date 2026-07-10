<script>
import { getHygieneThree, removeHygieneThree } from '@/http/occupationalHealth/sanitation-api'
import { showFileWindow } from '@/utils/checkFile.js'
import SanitationDialog from './components/sanitationDialog'

export default {
  name: 'Sanitation',
  components: { SanitationDialog },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        projectName: '',
        buildUnit: '',
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
    showFileWindow,
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getHygieneThree(this.searchData)
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
          this.dialogTitle = '新增职业健康三同时'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑职业健康三同时'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看职业健康三同时'
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
      this.$confirm('您确认要删除此职业健康三同时' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeHygieneThree(v.id)
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
      this.searchData.projectName = ''
      this.searchData.buildUnit = ''
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
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        size="mini"
        label-width="100"
      >
        <el-row>
          <el-form-item label="三同时项目名称">
            <el-input
              v-model="searchData.projectName"
              placeholder="请输入名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="建设单位">
            <el-input
              v-model="searchData.buildUnit"
              placeholder="请输入建设单位"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <EButton
              type="primary"
              btnIcon="el-icon-search"
              @click="searchFn"
            >
              查询
            </EButton>
            <EButton
              class="reset"
              btnIcon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </EButton>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('sanitation_add')"
          type="primary"
          size="mini"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
        :border="false"
        class="customer-table"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />0
        <el-table-column
          label="项目名称1"
          align="center"
          prop="projectName"
        />
        <el-table-column
          label="项目建设单位"
          align="center"
          prop="buildUnit"
          min-width="150"
        />
        <el-table-column
          label="项目启动时间"
          align="center"
          prop="projectStartDate"
        />
        <el-table-column
          label="申报时间"
          align="center"
          prop="declareDate"
        />
        <!--      <el-table-column label='预评价' align='center' prop='lubricatePoints' /> -->
        <!--      <el-table-column label='职业病防护设施设计专篇' align='center' prop='greaseListContent' min-width='150' /> -->
        <!--      <el-table-column label='控制效果评价' align='center' prop='lubricateCycle' min-width='150' /> -->
        <!--      <el-table-column label='现状评价' align='center' prop='apartLastLubricate' min-width='180' /> -->
        <el-table-column
          label="负责人"
          align="center"
          prop="dutyPersonName"
          min-width="180"
        />
        <el-table-column
          label="操作"
          min-width="160"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('sanitation_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('sanitation_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('sanitation_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleForm"
    >
      <SanitationDialog
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
