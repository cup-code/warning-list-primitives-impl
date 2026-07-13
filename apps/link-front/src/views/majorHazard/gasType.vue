<script>
import { GasDel, getGasByPage } from '@/http/major-hazard/Anpi-chemical'
import GasTypeAddDia from './components/gasTypeAddDia'
import GasTypeDia from './components/gasTypeDia'

export default {
  name: 'gasType',
  components: { GasTypeDia, GasTypeAddDia },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        isPage: true,
        businessCategory: 2,
        toxicityName: '',
        toxicityCharacter: '',
      },
      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      isFlag: false, // 是否是新增毒性气体类别
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
      getGasByPage(this.searchData)
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
      this.isFlag = false
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增毒性气体类别校正系数'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑毒性气体类别校正系数'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看毒性气体类别校正系数'
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
      this.$confirm('您确认要删除此毒性气体类别校正系数' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        GasDel(v.id)
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
      this.searchData.businessCategory = 2
      this.searchData.toxicityName = ''
      this.searchData.toxicityCharacter = ''
      this.searchData.isPage = true
      this.getTableData()
    },
    // 新增毒性气体类别
    addType() {
      this.isFlag = true
      this.visibleForm = true
      this.dialogTitle = '新增毒性气体类别'
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
        <el-form-item label="毒性气体类别">
          <el-input
            v-model="searchData.toxicityName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item label="毒性气体类别符号">
          <el-input
            v-model="searchData.toxicityCharacter"
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
      <!-- <el-button type='primary' plain icon='el-icon-plus' @click="addType">新增毒性气体类别</el-button> -->
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
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
        label="毒性气体名称"
        align="center"
        prop="toxicityName"
      />
      <el-table-column
        label="β校正系数"
        align="center"
        prop="checkCoefficient"
        min-width="150"
      />
      <el-table-column
        label="类别符号"
        align="center"
        prop="toxicityCharacter"
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
      <GasTypeDia
        v-if="visibleForm && !isFlag"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
      <GasTypeAddDia
        v-if="visibleForm && isFlag"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped></style>
