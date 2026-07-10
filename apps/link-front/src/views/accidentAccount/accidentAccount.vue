<script>
import { getAccidentAccount } from '@/http/accidentAccount/accidentAccount-api.js'
import { getAccTypeListAll } from '@/http/defense/accType-api'
import { accReportDel } from '@/http/emergency/accident-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import AccountInfo from './components/accountInfo.vue'
import { ACC_TYPE_LIST, STATUS_LIST } from './constant'

export default {
  components: {
    CompanyTree,
    AccountInfo,
  },
  data() {
    return {
      isLoading: false,
      STATUS_LIST, // 状态下拉列表
      ACC_TYPE_LIST, // 事故类别下拉列表
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
      evtTypeList: [], // 事件类型下拉列表
    }
  },
  computed: {
    // 事故类别翻译
    setAccType() {
      return function (type) {
        let des = ''
        for (const item of this.ACC_TYPE_LIST) {
          if (item.value == type) {
            des = item.name
            break
          }
        }
        return des
      }
    },
    setState() {
      return function (state) {
        let name = ''
        for (const item of this.STATUS_LIST) {
          if (item.value == state) {
            name = item.name
            break
          }
        }
        return name
      }
    },
  },
  created() {
    this.searchClick()
    // 获取事件类型列表
    getAccTypeListAll()
      .then((res) => {
        if (res.data.success) {
          this.evtTypeList = res.data.result
        }
        else {
          this.$message.warning(res.data.message || '获取事故类型列表失败')
        }
      })
      .catch((err) => {
        this.$message.error('获取事故类型列表出错', err)
      })
  },

  methods: {
    /* 点击搜索 */
    queryClick() {
      // 这里需要重置为第一页
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      getAccidentAccount(this.searchData)
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
      this.dialogTitle = '新增事故'
      this.propData = {
        editable: true,
        companyData,
        evtTypeList: this.evtTypeList,
      }
      this.showInfoDialog = true
    },
    // 点击查看修改
    editClick(infoId, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      if (editable) {
        this.dialogTitle = '处理事故'
      }
      else {
        this.dialogTitle = '查看事故'
      }
      this.propData = {
        infoId,
        companyData,
        evtTypeList: this.evtTypeList,
        editable,
      }
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
          accReportDel(item.row.id)
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
  <KyTreeTable v-loading="isLoading">
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
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.keyWords"
          placeholder="事件名称、事件内容"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchData.eventState"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in STATUS_LIST"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事件类型">
        <el-select
          v-model="searchData.eventTypeId"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in evtTypeList"
            :key="item.id"
            :label="item.accidentTypeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事故类别">
        <el-select
          v-model="searchData.incidentType"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in ACC_TYPE_LIST"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
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
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="所属公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="事故名称"
        align="center"
        prop="eventName"
      />
      <el-table-column
        label="事故内容"
        align="center"
        prop="content"
      />
      <el-table-column
        label="事件地点"
        align="center"
        prop="occurSite"
      />
      <el-table-column
        label="事故类别"
        align="center"
        prop="incidentType"
      >
        <template slot-scope="scope">
          <span>{{ setAccType(scope.row.incidentType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="eventState"
      >
        <template slot-scope="scope">
          <span>{{ setState(scope.row.eventState) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="时间"
        align="center"
        prop="occurTime"
        width="120"
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
            @click="editClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="editClick(scope.row.id, true)"
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
        <AccountInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>
