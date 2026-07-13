<script>
import { getContractorWorkBookByPage } from '@/http/specialOperation/specialBook-api.js'
import ApprovalRecord from '@/views/specialOperation/components/approvalRecord.vue'
import BookInfo from '@/views/specialOperation/components/BookInfo.vue'
import AcceptanceDetail from '@/views/specialOperation/components/recordDetail/acceptanceDetail.vue'
import CheckList from '@/views/specialOperation/components/workList/checkList.vue'
import GasAnalysisList from '@/views/specialOperation/components/workList/gasAnalysisList.vue'
import ImplementationMeasuresList from '@/views/specialOperation/components/workList/implementationMeasuresList.vue'
import { TicketStatusList, TicketTypeList } from '@/views/specialOperation/config/constant'
import ContractorTree from './coms/ContractorTree.vue'

export default {
  components: {
    ContractorTree,
    BookInfo,
    ApprovalRecord,
    ImplementationMeasuresList,
    GasAnalysisList,
    CheckList,
    AcceptanceDetail,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      TicketTypeList, // 作业票类型列表
      TicketStatusList, // 作业票状态列表
      nowTime: '', // 当前时间
      propData: {}, // 弹窗传参数据
      showInfoDialog: false,
      showRecordDialog: false, // 审批记录的弹框
      showImplementationMeasuresDialog: false, // 安全措施落实弹窗
      showGasAnalysisDialog: false, // 气体分析弹窗
      showCheckDialog: false, // 巡检记录弹窗
      showAcceptanceDialog: false, // 验收记录弹窗
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
    }
  },
  computed: {
    // 翻译常量文字
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
    this.getDataList()
    this.nowTime = this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  },
  methods: {
    async getDataList() {
      const { data } = await getContractorWorkBookByPage(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.$refs.contrTree.clearSel()
      this.getDataList()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data) {
        this.form.workUnitId = data.id
      }
      else {
        delete this.form.workUnitId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
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
    // 关闭弹窗事件
    closeDialogEvt() {
      this.showInfoDialog = false
    },
    // 关闭验收弹窗
    closeAcceptanceDialog(e) {
      this.showAcceptanceDialog = e
    },
    // 点击详情
    checkClick(item) {
      this.propData = {
        sid: item.id,
      }
      this.showInfoDialog = true
    },
    // 点击审批记录
    historyClick(item) {
      this.propData = {
        workTicketType: item.workTicketType,
        jobNumber: item.jobNumber,
        sid: item.id,
        approvalType: item.approvalType,
      }
      this.showRecordDialog = true
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
  },
}
</script>

<template>
  <div class="construction-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <ContractorTree
        ref="contrTree"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="作业编号">
              <el-input
                v-model="form.jobNumber"
                placeholder="作业编号"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="作业类型">
              <el-select
                v-model="form.workTicketType"
                placeholder="作业类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in TicketTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="作业内容">
              <el-input
                v-model="form.workInfo"
                placeholder="作业内容"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="8"
            style="padding-left: 10px; margin-bottom: 12px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 功能区域 -->
        <!-- <div>
                    <el-button type="primary" plain>导出</el-button>
                </div> -->
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="申请单位"
            prop="applyUnitName"
            align="center"
          />
          <el-table-column
            label="承包商"
            prop="workUnitName"
            align="center"
          />
          <el-table-column
            label="申请人"
            prop="applyUserName"
            align="center"
          />
          <el-table-column
            label="作业编号"
            prop="jobNumber"
            align="center"
          />
          <el-table-column
            label="作业类型"
            align="center"
            width="110"
          >
            <template slot-scope="scope">
              <span>{{ setConstant(scope.row.workTicketType, TicketTypeList) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="作业内容"
            prop="workInfo"
            align="center"
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
            label="作业开始时间"
            prop="workStartDate"
            align="center"
            width="200"
          />
          <el-table-column
            label="作业结束时间"
            prop="workEndDate"
            align="center"
            width="150"
          />
          <el-table-column
            label="状态"
            prop="ticketStatus"
            align="center"
          >
            <template slot-scope="scope">
              <span
                v-if="
                  nowTime > scope.row.workEndDate
                    && (scope.row.ticketStatus == 0
                      || scope.row.ticketStatus == 1
                      || scope.row.ticketStatus == 2
                      || scope.row.ticketStatus == 3)
                "
              >已过期</span>
              <span v-else>{{ setConstant(scope.row.ticketStatus, TicketStatusList) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="安全落实记录"
            align="center"
            width="110"
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
            width="130"
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
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="hasBtnPermission('contractor_construction_detail')"
                type="text"
                size="mini"
                @click="checkClick(scope.row)"
              >
                详情
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_construction_record')"
                type="text"
                size="mini"
                style="color: var(--ky-warning)"
                @click="historyClick(scope.row)"
              >
                审批记录
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <el-dialog
      class="large-dialog"
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
  </div>
</template>

<style lang="scss" scoped>
.construction-contractor {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
