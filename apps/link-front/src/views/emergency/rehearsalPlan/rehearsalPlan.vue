<script>
import moment from 'moment'
import { emRehearsalPlanByPage, emRehearsalPlanDel } from '@/http/emergency/rehearsal-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import FileItem from '@/views/common-ui/FileItem.vue'
import RehearsalPlanInfo from './RehearsalPlanInfo.vue'

export default {
  components: {
    CompanyTree,
    RehearsalPlanInfo,
    FileItem,
  },
  data() {
    return {
      planTypeList: [], // 预案类型下拉列表
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      showInfoDialog: false,
      showFileDialog: false,
      dialogTitle: '',
      propData: {},
      tableData: [],
      total: 0,
      checkFileId: '', // 查看文件id
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD')
        }
        return date
      }
    },
  },
  created() {
    const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.planTypeList = allDic.emplan_type
    this.searchClick()
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
        pageSize: 20,
      }
      this.$refs.companyTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      emRehearsalPlanByPage(this.searchData)
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
      this.queryClick()
    },
    /* 查看附件 */
    showFileClick(id) {
      this.checkFileId = id
      this.showFileDialog = true
    },
    /* 点击新增 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.dialogTitle = '新增演练计划'
      this.propData = { companyData }
      this.showInfoDialog = true
    },
    /* 点击编辑 */
    editClick(infoId) {
      const companyData = this.$refs.companyTree.getTreeData()
      this.dialogTitle = '编辑演练计划'
      this.propData = { infoId, companyData }
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
          emRehearsalPlanDel(item.row.id)
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
  <!-- 演练计划 -->
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
      <el-form-item label="预案类型">
        <el-select
          v-model="searchData.planType"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="item in planTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划名称">
        <el-input v-model="searchData.drillName" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
        </el-button>
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
        label="计划名称"
        align="center"
        prop="drillName"
      />
      <el-table-column
        label="参演对象"
        align="center"
        prop="drillObject"
      />
      <el-table-column
        label="演练时间"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.drillTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="预案类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('emplan_type', scope.row.planType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="演练项目"
        align="center"
        prop="drillItem"
      />
      <el-table-column
        label="演练方式"
        align="center"
        prop="drillWay"
      />
      <el-table-column
        label="组织人员"
        align="center"
        prop="organizePerson"
      />
      <el-table-column
        label="负责人"
        align="center"
        prop="dutyPersonName"
      />
      <el-table-column
        label="负责部门"
        align="center"
        prop="dutyDeptName"
      />
      <el-table-column
        label="附件"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="success"
            @click="showFileClick(scope.row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="editClick(scope.row.id)"
          >
            编辑
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
        <RehearsalPlanInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <el-dialog
        title="附件列表"
        :visible.sync="showFileDialog"
        width="300px"
        append-to-body
        :close-on-click-modal="false"
      >
        <FileItem
          v-if="showFileDialog"
          :checkFileId="checkFileId"
          @close="showFileDialog = false"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
