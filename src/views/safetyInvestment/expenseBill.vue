<script>
import { delSafetyCost, getSafetyCost } from '@/http/safetyInvestment/safety-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import ExpenseBillInfo from './components/expenseBillInfo.vue'

export default {
  components: {
    CompanyTree,
    ExpenseBillInfo,
  },
  data() {
    return {
      isLoading: false, // 加载
      searchData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 20,
      },
      allDic: {}, // 字典数据
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick(true)
  },

  methods: {
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getSafetyCost(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
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
      this.dialogTitle = '新增安全资金投入记录'
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
        this.dialogTitle = '修改安全资金投入记录'
      }
      else {
        this.dialogTitle = '查看安全资金投入记录'
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
          delSafetyCost(item.row.id)
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
      <el-form-item label="年份">
        <el-date-picker
          v-model="searchData.costYear"
          type="year"
          value-format="yyyy"
          format="yyyy"
        />
      </el-form-item>
      <el-form-item label="费用内容">
        <el-input
          v-model="searchData.costDetails"
          placeholder="费用内容"
        />
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
          新增
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
        label="公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="年份"
        align="center"
        prop="costYear"
      />
      <el-table-column
        label="物料描述"
        align="center"
        prop="costDetails"
      />
      <el-table-column
        label="数量"
        align="center"
        prop="costAmount"
      />
      <el-table-column
        label="凭证类"
        align="center"
        prop="voucherType"
      />
      <el-table-column
        label="投入资金（元）"
        align="center"
        prop="investmentFunds"
      />
      <el-table-column
        label="使用对象"
        align="center"
        prop="usingObjectsName"
      />
      <el-table-column
        label="过账日期"
        align="center"
        prop="postingDate"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
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
        <ExpenseBillInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
