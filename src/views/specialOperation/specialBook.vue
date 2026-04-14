/* * @Author: wangyang * @Date: 2023-03-21 11:34:46 * @Last Modified by: wangyang * @Last Modified
time: 2023-04-13 16:20:14 */
<script>
import {
  getContractorVisibleLogin,
  getSpecialWorkBookByPage,
} from '@/http/specialOperation/specialBook-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import ApprovalRecord from './components/approvalRecord.vue'
import BookInfo from './components/BookInfo.vue'
import FlowLog from './components/flowLog.vue'
import AcceptanceDetail from './components/recordDetail/acceptanceDetail.vue'
import CheckList from './components/workList/checkList.vue'
import GasAnalysisList from './components/workList/gasAnalysisList.vue'

import ImplementationMeasuresList from './components/workList/implementationMeasuresList.vue'
import {
  TicketStatusList,
  TicketTypeList,
  WorkLvList,
} from './config/constant'

export default {
  components: {
    OwnDeparmentTree,
    BookInfo,
    ApprovalRecord,
    ImplementationMeasuresList,
    GasAnalysisList,
    CheckList,
    AcceptanceDetail,
    FlowLog,
  },
  data() {
    return {
      TicketStatusList, // 作业票状态列表
      WorkLvList, // 作业等级列表
      TicketTypeList, // 作业票类型列表
      constructionUnitList: [], // 施工单位列表
      isLoading: false,
      showInfoDialog: false,
      showRecordDialog: false, // 审批记录的弹框
      showImplementationMeasuresDialog: false, // 安全措施落实弹窗
      showGasAnalysisDialog: false, // 气体分析弹窗
      showCheckDialog: false, // 巡检记录弹窗
      showAcceptanceDialog: false, // 验收记录弹窗
      showFlowLogDialog: false, // 流转日志
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      propData: {}, // 弹窗传参数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      nowTime: '', // 当前时间
    }
  },
  computed: {
    /* 翻译常量文字 */
    setConstant() {
      return function (value, constList) {
        let des = '-'
        for (const item of constList) {
          if (item.value == value) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.searchClick(true)
    this.getContractorVisibleLogin()
    this.nowTime = this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  },
  methods: {
    // 查询当前用户能看到的所有承包商
    getContractorVisibleLogin() {
      getContractorVisibleLogin().then(({ data }) => {
        if (data.success) {
          this.constructionUnitList = data.result || []
        }
      })
    },
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
      this.$refs.depTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getSpecialWorkBookByPage(this.searchData)
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
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        delete this.searchData.workUnitId
      }
      this.queryClick()
    },
    /* 点击查看 */
    checkClick(item) {
      this.propData = {
        sid: item.id,
      }
      this.showInfoDialog = true
    },
    /* 点击审批记录 */
    historyClick(item) {
      this.propData = {
        workTicketType: item.workTicketType,
        jobNumber: item.jobNumber,
        sid: item.id,
        approvalType: item.approvalType,
      }
      this.showRecordDialog = true
    },
    // 流转日志
    flowLogFn(item) {
      this.propData = {
        workTicketType: item.workTicketType,
        sid: item.id,
      }
      this.showFlowLogDialog = true
    },
    closeFlowLogDialogDialog() {
      this.showFlowLogDialog = false
    },
    // 记录列表查看
    viewData(item, str) {
      this.propData = {
        sid: item.id,
      }
      switch (str) {
        case '安全落实':
          this.showImplementationMeasuresDialog = true
          break
        case '气体分析':
          this.showGasAnalysisDialog = true
          break
        case '巡检记录':
          this.showCheckDialog = true
          break
        case '验收记录':
          this.showAcceptanceDialog = true
          break
      }
    },

    // 关闭验收弹窗
    closeAcceptanceDialog(e) {
      this.showAcceptanceDialog = e
    },
    /* 关闭弹窗事件 */
    closeDialogEvt() {
      this.showInfoDialog = false
    },
    /* 点击作废 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          this.delBook(item.row.id, item.row.workTicketType)
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <!-- 特殊作业台账 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      title="申请单位"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="作业编号">
        <el-input
          v-model="searchData.jobNumber"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item label="作业类型">
        <el-select
          v-model="searchData.workTicketType"
          style="width: 140px"
        >
          <el-option
            v-for="item in TicketTypeList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="作业内容">
        <el-input
          v-model="searchData.workInfo"
          clearable
        />
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
          class="reset"
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
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
        label="申请单位"
        align="center"
        prop="applyUnitName"
      />
      <el-table-column
        label="申请人"
        align="center"
        prop="applyUserName"
      />
      <el-table-column
        label="作业票编号"
        align="center"
        prop="jobNumber"
      />
      <el-table-column
        label="作业类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setConstant(scope.row.workTicketType, TicketTypeList) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="作业内容"
        align="center"
        prop="workInfo"
      />
      <el-table-column
        label="作业位置"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.workSite.appendPlace }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="施工单位"
        align="center"
        prop="workUnitName"
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="workStartDate"
        width="130"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="workEndDate"
        width="130"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="ticketStatus"
      >
        <template slot-scope="scope">
          <!-- <span v-if="nowTime > scope.row.workEndDate && (scope.row.ticketStatus == 0 || scope.row.ticketStatus == 1 || scope.row.ticketStatus == 2 || scope.row.ticketStatus == 3)"
            >已过期</span
          > -->
          <span>{{ setConstant(scope.row.ticketStatus, TicketStatusList) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="安全落实记录"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="viewData(scope.row, '安全落实')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="作业中气体分析记录"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="viewData(scope.row, '气体分析')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="巡检记录"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="viewData(scope.row, '巡检记录')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="验收记录"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="viewData(scope.row, '验收记录')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="checkClick(scope.row)"
          >
            详情
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-warning)"
            @click="historyClick(scope.row)"
          >
            审批记录
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="flowLogFn(scope.row)"
          >
            流转日志
          </el-button>
          <!-- <el-button style="color: var(--ky-danger)" type="text" size="mini" @click="delClick(scope)">作废</el-button> -->
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
      <!-- 详情 -->
      <el-dialog
        class="large-dialog"
        width="80%"
        title="作业详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <BookInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- 审批记录 -->
      <el-dialog
        class="normal-dialog"
        width="800px"
        title="审批记录"
        :visible.sync="showRecordDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <ApprovalRecord
          v-if="showRecordDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- 安全落实记录列表 -->
      <el-dialog
        class="normal-dialog"
        width="1000px"
        title="安全措施落实记录"
        :visible.sync="showImplementationMeasuresDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <ImplementationMeasuresList
          v-if="showImplementationMeasuresDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- 气体分析记录列表 -->
      <el-dialog
        class="normal-dialog"
        width="1000px"
        title="作业气体分析记录"
        :visible.sync="showGasAnalysisDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <GasAnalysisList
          v-if="showGasAnalysisDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- 巡检记录列表 -->
      <el-dialog
        class="normal-dialog"
        width="1000px"
        title="巡检记录"
        :visible.sync="showCheckDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <CheckList
          v-if="showCheckDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- 验收记录列表 -->
      <el-dialog
        class="normal-dialog"
        width="1000px"
        title="验收记录"
        :visible.sync="showAcceptanceDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <acceptanceDetail
          v-if="showAcceptanceDialog"
          v-bind="propData"
          @close="closeAcceptanceDialog"
        />
      </el-dialog>
      <!-- 流转日志 -->
      <el-dialog
        class="normal-dialog"
        title="流转日志"
        :visible.sync="showFlowLogDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <FlowLog
          v-if="showFlowLogDialog"
          v-bind="propData"
          @close="closeFlowLogDialogDialog"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.tab-box {
  display: flex;
  align-items: center;
  .tab-item {
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    margin: 0 15px 0 0;
    border-radius: 4px;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.2);
    user-select: none;
    cursor: pointer;
  }
  .active {
    background: #409eff;
    color: white;
  }
  .view-box {
    color: #41d3ea;
  }
}
::v-deep .el-dialog {
  width: 70% !important;
}
</style>
