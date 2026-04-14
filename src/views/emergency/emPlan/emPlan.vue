<script>
import { getAccTypeListAll } from '@/http/defense/accType-api.js'
import { emPlanDel, emPlanGetByPage } from '@/http/emergency/emsource-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import FileItem from '@/views/common-ui/FileItem.vue'
import EmplanInfo from './EmPlanInfo.vue'

export default {
  components: {
    CompanyTree,
    EmplanInfo,
    FileItem,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      showInfoDialog: false,
      showFileDialog: false,
      dialogTitle: '', // 弹窗标题
      propData: {},
      accTypeList: [], // 事故类型
      checkFileId: '', // 查看文件列表的id
    }
  },
  computed: {
    setAccType() {
      return function (id) {
        let des = '--'
        for (const item of this.accTypeList) {
          if (item.id === id) {
            des = item.accidentTypeName
            break
          }
        }
        return des
      }
    },
  },
  created() {
    const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.planTypeList = allDic.emplan_type
    this.searchClick()
    // 获取所有事故类型，用于新增选择
    getAccTypeListAll()
      .then((res) => {
        if (res.data.success) {
          this.accTypeList = res.data.result
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
      emPlanGetByPage(this.searchData)
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
      this.dialogTitle = '新增应急预案'
      this.propData = { companyData, accTypeList: this.accTypeList }
      this.showInfoDialog = true
    },
    /* 点击编辑 */
    editClick(infoId) {
      const companyData = this.$refs.companyTree.getTreeData()
      this.dialogTitle = '编辑应急预案'
      this.propData = { infoId, companyData, accTypeList: this.accTypeList }
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
          emPlanDel(item.row.id)
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
        label="预案类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('emplan_type', scope.row.planType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="预案名称"
        align="center"
        prop="planName"
      />
      <el-table-column
        label="事故类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setAccType(scope.row.accidentType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否备案"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isFiling ? 'success' : 'danger'">
            {{
              scope.row.isFiling ? '是' : '否'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="备案号"
        align="center"
        prop="filingNumber"
      />
      <el-table-column
        label="附件"
        align="center"
      >
        <template slot-scope="scope">
          <el-button @click="showFileClick(scope.row.id)">
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
        width="950px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <EmplanInfo
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
