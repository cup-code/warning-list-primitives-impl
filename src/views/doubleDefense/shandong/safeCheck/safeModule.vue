<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getSafeCheckModuleByPage, safeCheckModuleDel } from '@/http/defense/shandong/safeCheck-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import SafeModuleInfo from './components/SafeModuleInfo.vue'
import SafeModuleTree from './treeComps/SafeModuleTree.vue'

export default {
  components: {
    SelectTree,
    SafeModuleTree,
    SafeModuleInfo,
  },
  data() {
    return {
      allDic: {}, // 字典信息
      companyList: [], // 登录用户拥有的部门权限--公司级别的
      showInfoDialog: false, // 是否显示弹窗
      dialogTitle: '', // 弹窗标题
      isLoading: false,
      // 搜索数据
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      propData: {}, // 详情传递信息
      depList: [], // 部门列表
      tableData: [],
      total: 0,
    }
  },
  created() {
    this.searchClick()
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    getDepartListSimple().then(({ data }) => {
      if (data.result && data.result.length) {
        data.result = data.result.filter((item) => {
          return item.departmentType === 'COMPANY' || !item.departmentType
        })
      }
      this.companyList = data.result || []
    })
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
      this.$refs.moduleTree.refreshTree()
    },
    /* 查询表格数据 */
    searchClick() {
      this.isLoading = true
      getSafeCheckModuleByPage(this.searchData)
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
          this.getParams()
          this.isLoading = false
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
        this.searchData.checkContentType = data.id
      }
      else {
        delete this.searchData.checkContentType
      }
      this.queryClick()
    },
    /* 新增表格数据 */
    addInfoClick() {
      this.dialogTitle = '新增检查内容'
      const typeTree = this.$refs.moduleTree.getTreeData()
      this.propData = {
        editable: true,
        typeTree,
        info: {
          checkContentType: this.searchData.checkContentType || '',
        },
        depList: this.depList,
      }
      this.showInfoDialog = true
    },
    /* 查看或编辑表格数据 */
    checkInfoClick(info, editable) {
      this.dialogTitle = '检查内容详情'
      const typeTree = this.$refs.moduleTree.getTreeData()
      this.propData = {
        editable,
        typeTree,
        info,
        depList: this.depList,
      }
      this.showInfoDialog = true
    },
    /* 删除表格数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          safeCheckModuleDel(item.row.id)
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
  <!-- 检查内容库 -->
  <TreeTable>
    <!-- 左侧树 -->
    <SafeModuleTree
      slot="tree"
      ref="moduleTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <!-- <el-form-item label="所属公司" prop="departmentId">
        <SelectTree
          :props="{
              value: 'companyId',             // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children'    // 子级字段名
            }"
          :list="companyList"
          :value="searchData.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="(value) => { searchData.companyId = value }"/>
      </el-form-item> -->
      <el-form-item
        label="责任组织"
        prop="departmentId"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="depList"
          :value="searchData.departmentId"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              searchData.departmentId = value
            }
          "
        />
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="检查内容或依据"
        />
      </el-form-item>
      <el-form-item label="建议等级">
        <el-select
          v-model="searchData.recommendedLevel"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in allDic.suggest_level"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
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
      <!-- <el-form-item>
        <el-button type="success" size="mini" icon="el-icon-download">导入excel</el-button>
        <el-button type="success" size="mini" icon="el-icon-upload2">导出excel</el-button>
      </el-form-item> -->
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('safe_module_add')"
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
        label="责任组织"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="检查内容"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.checkContent" />
        </template>
      </el-table-column>
      <el-table-column
        label="检查依据"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="建议等级"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('safe_module_view')"
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('safe_module_modify')"
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, true)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('safe_module_delete')"
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
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="600"
        :close-on-click-modal="false"
      >
        <SafeModuleInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
