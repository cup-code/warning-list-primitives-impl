<script>
import { getSafeTargetByPage } from '@/http/orgDuty/orgDuty-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import AssessmentInfo from './components/AssessmentInfo.vue'
import { SAFE_EXAM_STATUS, SAFE_EXAM_TYPE } from './constant'

export default {
  components: {
    CompanyTree,
    AssessmentInfo,
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
      dialogTitle: '', // 弹窗标题
      showInfoDialog: false,
      contractorType: SAFE_EXAM_TYPE, // 考核类别
      contractorStatus: SAFE_EXAM_STATUS, // 考核状态
    }
  },
  computed: {
    /* 考核类型翻译 */
    setExamType() {
      return function (type) {
        let des = ''
        for (const item of this.contractorType) {
          if (item.value == type) {
            des = item.label
            break
          }
        }
        return des
      }
    },
    /* 考核状态翻译 */
    setStatu() {
      return function (type) {
        let des = ''
        for (const item of this.contractorStatus) {
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
    this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getSafeTargetByPage(this.searchData)
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
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 20,
      }
      this.$refs.companyTree.refreshTree()
    },
    /* 点击树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.searchClick()
    },
    /* 点击查看/修改 */
    editClick(info, editable) {
      if (editable) {
        this.dialogTitle = '生产目标考核'
      }
      else {
        this.dialogTitle = '查看生产目标考核'
      }
      this.propData = {
        info: JSON.parse(JSON.stringify(info)),
        editable,
      }
      this.showInfoDialog = true
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
      <el-form-item label="考核标准">
        <el-input
          v-model="searchData.checkTargets"
          placeholder="考核标准"
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
        label="公司名称"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="考核类别"
        align="center"
        prop="checkType"
      >
        <template slot-scope="scope">
          <span>{{ setExamType(scope.row.checkType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="考核对象"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.checkType ? scope.row.checkStaffName : scope.row.checkDepartmentName
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="考核标准"
        align="center"
        prop="checkTargets"
      />
      <el-table-column
        label="考核年份"
        align="center"
        prop="checkYear"
      />
      <el-table-column
        label="考核时间"
        align="center"
        prop="checkDate"
        width="130"
      />
      <el-table-column
        label="考核结果"
        align="center"
        prop="checkResult"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="checkStatus"
      >
        <template slot-scope="scope">
          <span>{{ setStatu(scope.row.checkStatus) }}</span>
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
            type="text"
            size="mini"
            @click="editClick(scope.row, false)"
          >
            查看考核
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="editClick(scope.row, true)"
          >
            考核
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
        <AssessmentInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
