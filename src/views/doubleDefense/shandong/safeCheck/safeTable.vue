<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getSafeCheckTableByPage, safeCheckTableDel } from '@/http/defense/shandong/safeCheck-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import SafeTableInfo from './components/SafeTableInfo.vue'
import SafeTableTree from './treeComps/SafeTableTree.vue'

export default {
  components: {
    SafeTableTree,
    SafeTableInfo,
    SelectTree,
  },
  data() {
    return {
      allDic: {}, // 字典信息
      depList: [], // 部门列表
      showInfoDialog: false, // 是否显示弹窗
      dialogTitle: '', // 弹窗标题
      isLoading: false,
      // 搜索数据
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      propData: {}, // 详情传递信息
      total: 0,
      tableData: [],
    }
  },
  computed: {
    /* 设置责任部门名称 */
    setDepDes() {
      return function (id) {
        let des = '--'
        for (const item of this.depList) {
          if (item.id == id) {
            des = item.departmentName
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.searchClick(true)
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
      }
      this.$refs.tableTree.refreshTree()
    },
    /* 查询表格数据 */
    searchClick(isReqParams) {
      this.isLoading = true
      getSafeCheckTableByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.warning('请求表格数据出错：', err)
        })
        .finally(() => {
          if (isReqParams === true) {
            this.getParams()
          }
          else {
            this.isLoading = false
          }
        })
    },
    /* 请求其他参数 */
    async getParams() {
      this.isLoading = true
      const depRes = await getDepartListSimple()
      this.depList = depRes.data.result
      this.isLoading = false
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.checkScheduleType = data.id
      }
      else {
        delete this.searchData.checkScheduleType
      }
      this.queryClick()
    },
    /* 查看或编辑表格数据 */
    checkInfoClick(data, editable) {
      const typeTree = this.$refs.tableTree.getTreeData()
      this.dialogTitle = '检查表详情'
      this.propData = {
        editable,
        infoId: data.id,
        typeTree,
        depList: this.depList,
      }
      this.showInfoDialog = true
    },
    /* 新增表格数据 */
    addInfoClick() {
      const typeTree = this.$refs.tableTree.getTreeData()
      this.dialogTitle = '新增检查表'
      this.propData = {
        editable: true,
        typeTree,
        depList: this.depList,
      }
      this.showInfoDialog = true
    },
    /* 删除检查表数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          safeCheckTableDel(item.row.id)
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
  <!-- 安全检查表 -->
  <TreeTable>
    <!-- 左侧树 -->
    <SafeTableTree
      slot="tree"
      ref="tableTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item
        label="责任组织"
        prop="responsibilityDepartment"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="depList"
          :value="searchData.responsibilityDepartment"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              searchData.responsibilityDepartment = value
            }
          "
        />
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="检查表名称"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          :loading="isLoading"
          @click="refreshClick"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          :loading="isLoading"
          @click="queryClick"
        >
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('safe_table_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="addInfoClick"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      v-loading="isLoading"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
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
        label="检查表名称"
        align="center"
        prop="checkScheduleName"
      />
      <el-table-column
        label="检查表类型"
        align="center"
        prop="checkScheduleType"
      />
      <el-table-column
        label="责任组织"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setDepDes(scope.row.responsibilityDepartment) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdTime"
        width="140"
      />
      <el-table-column
        label="创建人"
        align="center"
        prop="createdBy"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('safe_table_view')"
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('safe_table_modify')"
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, true)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('safe_table_delete')"
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delInfoClick(scope)"
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
        class="fixed-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="800px"
        append-to-body
        :close-on-click-modal="false"
      >
        <SafeTableInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
