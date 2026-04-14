<script>
import { deviceGroupDel, getGroupByPage } from '@/http/dev/pointGroup-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import PointgroupInfo from './components/pointgroupInfo.vue'

export default {
  components: {
    CompanyTree,
    PointgroupInfo,
  },
  data() {
    return {
      isLoading: false, // 加载
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
    }
  },
  created() {
    this.searchClick()
  },

  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      getGroupByPage(this.searchData)
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
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增编辑测点组'
      const companyData = this.$refs.companyTree.getTreeData()
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
        this.dialogTitle = '编辑测点组'
      }
      else {
        this.dialogTitle = '查看测点组'
      }
      this.propData = {
        editable,
        companyData,
        info,
      }
      this.showInfoDialog = true
    },
    /* 点击公司树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.queryClick()
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
          deviceGroupDel(item.row.id)
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
    reset() {
      this.searchData.groupName = ''
    },
  },
}
</script>

<template>
  <KyTreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form inline>
        <el-form-item label="组名称">
          <el-input v-model="searchData.groupName" placeholder="测点组名称" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            size="mini"
            class="reset"
            icon="el-icon-search"
            @click="reset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          size="mini"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
      </div>

      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
      >
        <el-table-column
          label="测点组名称"
          align="center"
          prop="groupName"
        >
          <template slot-scope="scope">
            <span class="check" @click="editClick(scope.row, false)">{{
              scope.row.groupName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="left"
          prop="remarks"
        />
        <el-table-column
          label="序号"
          align="center"
          prop="sort"
        />
        <el-table-column
          label="操作"
          align="right"
          width="250"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              type="text"
              icon="check"
              size="mini"
              @click="editClick(scope.row, false)"
            >
              查看
            </EButton>
            <EButton
              type="text"
              icon="edit"
              size="mini"
              @click="editClick(scope.row, true)"
            >
              修改
            </EButton>
            <EButton
              type="text"
              icon="delete"
              size="mini"
              @click="delClick(scope)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->

    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        background
        @current-change="searchClick"
        @size-change="searchClick"
      />
    </ECard>

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
        <PointgroupInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
