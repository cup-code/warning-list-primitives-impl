<script>
import { getQualificationByPage } from '@/http/relevantContractor/qualificationInfo-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import QuaInfo from './components/QuaInfo.vue'
import QuaReview from './components/QuaReview.vue'

export default {
  components: {
    CompanyTree,
    QuaInfo,
    QuaReview,
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
      dialogTitle: '', // 弹窗标题
      showInfoDialog: false, // 查看、修改、新增弹窗显示
      showInfoReview: false, // 审查弹窗
    }
  },
  computed: {
    /* 设置审核状态 */
    setCheckStatus() {
      return function (status) {
        let des = ''
        switch (Number.parseInt(status)) {
          case 0:
            des = '未通过'
            break
          case 1:
            des = '通过'
            break
          default:
            des = '待审核'
        }
        return des
      }
    },
  },
  created() {
    this.searchClick()
  },
  methods: {
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
      getQualificationByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
            this.tableData.auditingResult = Number.parseInt(this.tableData.auditingResult)
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
      this.dialogTitle = '新增人员资质'
      this.propData = {
        editable: true,
        companyData,
      }
      this.showInfoDialog = true
    },
    // 点击查看修改
    editClick(infoData, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      if (editable) {
        this.dialogTitle = '修改人员资质'
      }
      else {
        this.dialogTitle = '查看人员资质'
      }
      this.propData = {
        infoData: JSON.parse(JSON.stringify(infoData)),
        companyData,
        editable,
      }
      this.showInfoDialog = true
    },
    // 点击审查
    reviewClick(infoData) {
      this.propData = {
        infoData: JSON.parse(JSON.stringify(infoData)),
      }
      this.showInfoReview = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      this.showInfoReview = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
}
</script>

<template>
  <!-- 承包商人员资质 -->
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
      <el-form-item label="承包商">
        <el-input
          v-model="searchData.keyword"
          placeholder="承包商名称"
        />
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
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="承包商名称"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="人员名称"
        align="center"
        prop="fullName"
      />
      <el-table-column
        label="资质名称"
        align="center"
        prop="licenceName"
      />
      <el-table-column
        label="性别"
        align="center"
        prop="sex"
      />
      <el-table-column
        label="联系电话"
        align="center"
        prop="mobile"
      />
      <el-table-column
        label="审核状态"
        align="center"
        prop="auditingResult"
      >
        <template slot-scope="scope">
          {{ setCheckStatus(scope.row.auditingResult) }}
        </template>
      </el-table-column>
      <el-table-column
        label="审核时间"
        align="center"
        prop="createdTime"
        width="130"
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
          <template v-if="scope.row.auditingResult != 1">
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
              @click="reviewClick(scope.row, true)"
            >
              审查
            </el-button>
          </template>
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
    <!-- 新增修改查看弹窗 -->
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
        <QuaInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        title="人员资质审查"
        :visible.sync="showInfoReview"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <QuaReview
          v-if="showInfoReview"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
