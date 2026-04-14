<script>
import { chemistryIntoDel, getChemistryIntoByPage } from '@/http/major-hazard/ChemicalIntoBook-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import intoFrom from '@/views/majorHazard/components/ChemicalIntoBookFrom'

export default {
  name: 'dangerChemicalIntoBook',
  components: { CompanyTree, IntoFrom: intoFrom },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        inNo: '',
        chemicalName: '',
        transportUnit: '',
        salesCompanyName: '',
        transportCompanyName: '',
      },
      tableData: [],
      visibleFrom: false,
      dialogTitle: '',
      dialogMethod: '',
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
      this.searchFn()
    },
    // 搜索
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表单数据
    getTableData() {
      this.isLoading = true
      getChemistryIntoByPage(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.getStorageName(data.result.list)
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
    // 获取仓库名称
    async getStorageName(tableliData) {
      const depRes = await getDepartListSimple() // 部门表
      const depList = depRes.data.result || []
      depList.map((item) => {
        tableliData.forEach((data) => {
          if (item.id == data.storageName) {
            data.storageRealName = item.departmentName
          }
        })
      })
      this.tableData = tableliData
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleFrom = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增危化品入库台账'
          this.fromData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑危化品入库台账'
          this.fromData = infoData
          break
        case 'view':
          this.dialogTitle = '查看危化品入库台账'
          this.fromData = infoData
          break
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此入库台账' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        chemistryIntoDel(v.id)
          .then(({ data }) => {
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.$message.error('删除失败')
          })
          .finally(() => {
            this.isLoading = false
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
  <TreeTable v-loading="isLoading">
    <!-- 危化品入库台账 -->
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
        <el-form-item label="入库编号">
          <el-input
            v-model="searchData.inNo"
            placeholder="请输入入库编号"
            clearable
          />
        </el-form-item>
        <el-form-item label="化学品名称">
          <el-input
            v-model="searchData.chemicalName"
            placeholder="请输入化学品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="起运单位">
          <el-input
            v-model="searchData.transportUnit"
            placeholder="请输入起运单位"
            clearable
          />
        </el-form-item>
        <el-form-item label="销售单位名称">
          <el-input
            v-model="searchData.salesCompanyName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item label="运输单位名称">
          <el-input
            v-model="searchData.transportCompanyName"
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
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="changeFn('add')"
          >
            新增
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
        label="单位名称"
        align="center"
        prop="companyName"
        min-width="150"
      />
      <el-table-column
        label="入库编号"
        align="center"
        prop="inNo"
        min-width="150"
      />
      <el-table-column
        label="仓库名称"
        align="center"
        prop="storageRealName"
        min-width="150"
      />
      <el-table-column
        label="化学品名称"
        align="center"
        prop="chemicalName"
        min-width="150"
      />
      <el-table-column
        label="入库数量"
        align="center"
        prop="inQuantity"
        min-width="100"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unit"
        min-width="50"
      />
      <el-table-column
        label="起运数量"
        align="center"
        prop="transportQuantity"
        min-width="100"
      />
      <el-table-column
        label="起运单位"
        align="center"
        prop="transportUnit"
        min-width="50"
      />
      <el-table-column
        label="销售单位名称"
        align="center"
        prop="salesCompanyName"
        min-width="150"
      />
      <el-table-column
        label="运输单位名称"
        align="center"
        prop="transportCompanyName"
        min-width="150"
      />
      <el-table-column
        label="入库日期"
        align="center"
        prop="inDate"
        min-width="150"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        min-width="50"
      />
      <el-table-column
        label="登记时间"
        align="center"
        prop="createTime"
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
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleFrom"
    >
      <intoFrom
        v-if="visibleFrom"
        :method="dialogMethod"
        :fromData="fromData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped lang="scss"></style>
