<script>
import { getSupplierByPage, supplierDel } from '@/http/Supplier/Supplier-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import SupplierInfo from './components/supplierInfo.vue'
import { ANALYSIS, STATUS_LIST } from './constant'

export default {
  components: {
    CompanyTree,
    SupplierInfo,
  },
  data() {
    return {
      isLoading: false, // 加载
      searchData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 20,
      },
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
      supplierTypeItem: ANALYSIS, // 供应商类型
      supplierStatuItem: STATUS_LIST, // 供应商状态
    }
  },
  computed: {
    supplierType() {
      return function (type) {
        let des = ''
        for (const item of this.supplierTypeItem) {
          if (item.value == type) {
            des = item.label
            break
          }
        }
        return des
      }
    },
    supplierStatu() {
      return function (type) {
        let des = ''
        for (const item of this.supplierStatuItem) {
          if (item.value == type) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick()
  },

  methods: {
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 20,
      }
      this.$refs.deptTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getSupplierByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
            // 进行考核对象的判断
            let key = ''
            for (key in this.tableData) {
              if (this.tableData[key].checkType == 0) {
                this.tableData[key].checkObjectName = this.tableData[key].checkDepartmentId
              }
              else if (this.tableData[key].checkType == 1) {
                this.tableData[key].checkObjectName = this.tableData[key].checkStaffId
              }
            }
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.searchClick()
    },
    /* 点击新增 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.dialogTitle = '新增供应商'
      this.propData = {
        editable: true,
        companyData,
      }
      this.showInfoDialog = true
    },
    // 点击查看修改
    editClick(info, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      if (editable) {
        this.dialogTitle = '修改供应商'
      }
      else {
        this.dialogTitle = '查看供应商'
      }
      this.propData = {
        info: JSON.parse(JSON.stringify(info)),
        companyData,
        editable,
      }
      // 给修改设置属性，在查看中传参false，让查看不能修改
      this.showInfoDialog = true
    },

    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          supplierDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
  /* 点击导入 */
  importClick() {
    this.showImportDialog = true
  },
  /* 点击导出 */
  exportClick() {
    this.exportProp.reqData = {}
    for (const key in this.searchData) {
      if (!['pageNum', 'pageSize'].includes(key)) {
        this.exportProp.reqData[key] = this.searchData[key]
      }
    }
    this.showExportDialog = true
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="名称">
        <el-input
          v-model="searchData.companyName"
          placeholder="供应商名称"
        />
      </el-form-item>
      <el-form-item label="供应商状态">
        <el-select
          v-model="searchData.supplierStatus"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in supplierStatuItem"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="searchClick"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="addClick"
        >
          新增供应商
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="供应商名称"
        align="center"
        prop="supplierName"
      />
      <el-table-column
        label="地址"
        align="center"
        prop="supplierAddress"
      />
      <el-table-column
        label="联系人"
        align="center"
        prop="supplierLegalPerson"
      />
      <el-table-column
        label="联系电话"
        align="center"
        prop="supplierLegalPersonPhone"
      />
      <el-table-column
        label="供应商类型"
        align="center"
        prop="supplierType"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('SupplierManagement_Type', scope.row.supplierType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="供应商状态"
        align="center"
        prop="supplierStatus"
      >
        <template slot-scope="scope">
          <span>{{ supplierStatu(scope.row.supplierStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdTime"
      />
      <el-table-column
        label="操作"
        align="center"
        width="250"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="editClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="editClick(scope.row, true)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delClick(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
      style="margin: 0 20px 0 0"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <SupplierInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
