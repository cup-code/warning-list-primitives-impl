/* * @Author: xiaorui 随手拍清单 * @Date: 2023-05-09 17:34:59 * @Last Modified by: xiaorui * @Last
Modified time: 2023-12-06 14:05:21 */
<script>
import { delBookById, getFastReportListByPage } from '@/http/defense/shandong/safeCheck-api'
import { FAST_REPORT_BOOK } from '@/http/excel-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport.vue'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import HistoryLog from './components/HistoryLog.vue'
import SafeBookInfo from './components/SafeBookInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    SafeBookInfo,
    ExcelExport,
    HistoryLog,
  },
  data() {
    return {
      showInfoDialog: false,
      propData: {}, // 传递给弹窗的数据
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      // 状态下拉列表
      hiddenBookStatusList: [
        { label: '待审核', value: 0 },
        { label: '非隐患', value: -1 },
        { label: '待派发', value: 1 },
        { label: '待整改', value: 2 },
        { label: '待验收', value: 3 },
        { label: '待复查', value: 4 },
        { label: '已复查', value: 5 },
      ],
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        troubleSource: 3,
        troubleState: [],
        businessType: '', // 业务类型
        rectificationUserId: '', // 整改人id
        rectificationTimeStart: '', // 开始时间
        rectificationTimeEnd: '', // 结束时间
        troubleFindTimeStart: '', // 隐患发现起始日期
        troubleFindTimeEnd: '', // 隐患发现截止日期
      },
      tableData: [],
      total: 0,
      fromEvaluate: false, // 判断是否从评价管理页面跳转过来的，默认false
    }
  },
  created() {
    // 从评价管理过来的话，携带的参数
    this.fromEvaluate = this.$route.params.fromEvaluate || false
    this.searchData.deptId = this.$route.params.departmentId || ''
    this.searchData.rectificationTimeStart = this.$route.params.startDate || ''
    this.searchData.rectificationTimeEnd = this.$route.params.endDate || ''
    this.searchData.troubleFindTimeStart = this.$route.params.startDate || ''
    this.searchData.troubleFindTimeEnd = this.$route.params.endDate || ''
    this.backPageNum = this.$route.params.pageNum || 1 // 返回评价管理时，需要说明返回第几页
    if (this.fromEvaluate) {
      this.searchData.troubleState = 5
    }
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
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
        pageSize: 10,
      }
      this.searchClick()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getFastReportListByPage(this.searchData)
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
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: FAST_REPORT_BOOK,
        reqData: params,
      }
      this.showExportDialog = true
    },
    /* 点击部门树的item */
    treeNodeTap(v) {
      if (v.onlyTreeUse)
        return
      this.searchData.deptId = v.id
      this.queryClick()
    },
    /* 点击查看详情 */
    showInfoClick(troubleId) {
      this.propData = {
        troubleId,
      }
      this.showInfoDialog = true
    },
    // 点击查看流转日志
    showLogClick(troubleId) {
      this.$refs.historyLog.init(troubleId)
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
    dialogEvt() {
      this.showExportDialog = false
    },
    /* 删除台账 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          delBookById(item.row.id)
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
    // 从评价管理跳转过来的，需要展示返回按钮
    goBack() {
      this.$route.params.pageNum = this.backPageNum
      this.$router.back()
    },
  },
}
</script>

<template>
  <!-- 隐患台账 -->
  <TreeTable
    ref="treeTable"
    :isShowLeft="!fromEvaluate"
    :isShowSearch="!fromEvaluate"
  >
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="margin-bottom:0px;"
      type="search"
    >
      <el-form inline>
        <el-form-item label="关键字">
          <el-input
            v-model="searchData.fuzzyQuery"
            placeholder="隐患描述"
            clearable
          />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select
            v-model="searchData.businessType"
            clearable
            placeholder="全部"
            filterable
          >
            <el-option
              v-for="item in allDic.trouble_business_type"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="进度">
          <el-select
            v-model="searchData.troubleState"
            clearable
            placeholder="全部"
            filterable
            multiple
          >
            <el-option
              v-for="item in hiddenBookStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            :loading="isLoading"
            @click="queryClick"
          >
            查询
          </el-button>
          <el-button
            icon="el-icon-refresh-right"
            :loading="isLoading"
            @click="refreshClick"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard
      slot="auxiliary"
      customStyle="padding:0;margin-bottom:0px;"
    >
      <el-button
        v-if="hasBtnPermission('safe_book_export')"
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
      <el-button
        v-if="fromEvaluate"
        type="primary"
        plain
        @click="goBack"
      >
        返回
      </el-button>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <el-table
        v-loading="isLoading"
        height="100%"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        highlight-current-row
        :border="true"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          align="center"
          type="index"
          width="50"
          fixed="left"
        />
        <el-table-column
          label="公司"
          align="center"
          prop="troubleCompanyName"
          fixed="left"
        />
        <el-table-column
          label="所属部门"
          align="center"
          prop="troubleDeptName"
          fixed="left"
        />
        <el-table-column
          label="检查人"
          align="center"
          prop="checkUserFullName"
        />
        <el-table-column
          label="业务类型"
          align="center"
          prop="businessType"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabel('trouble_business_type', scope.row.businessType, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="隐患类型"
          align="center"
          prop="troubleType"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabelById('troubleType_yhlx', scope.row.troubleType, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="上报时间"
          align="center"
          prop="troubleFindTime"
          min-width="130"
        />
        <el-table-column
          label="整改进度"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.troubleState === -1"
              type="success"
            >
              审核非隐患
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 0"
              type="warning"
            >
              待审核
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 1"
              type="warning"
            >
              待派发
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 2"
              type="warning"
            >
              待整改
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 3"
              type="warning"
            >
              待验收
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 4"
              type="warning"
            >
              待复查
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 5"
              type="success"
            >
              已复查
            </el-tag>
            <el-tag
              v-if="props.row.troubleState === 6"
              type="danger"
            >
              逾期未整改
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="隐患现状描述"
          align="center"
          prop="troubleDesc"
          min-width="130"
        />
        <el-table-column
          label="整改措施"
          align="center"
          prop="rectificationOpinions"
        />
        <el-table-column
          label="隐患等级"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabel('hiddenDangerLevel', scope.row.troubleLevel, '')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="180"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('safe_book_view')"
              type="text"
              size="mini"
              @click="showInfoClick(scope.row.id)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="hasBtnPermission('safe_book_history')"
              type="text"
              size="mini"
              @click="showLogClick(scope.row.id)"
            >
              流转日志
            </el-button>
            <el-button
              v-if="hasBtnPermission('safe_book_delete') && !fromEvaluate"
              style="color: var(--ky-danger)"
              type="text"
              size="mini"
              @click="delClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
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
    </ECard>
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <div
          slot="title"
          class="dialog-header"
        >
          <div class="dialog-title">
            随手拍详情
          </div>
        </div>
        <SafeBookInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <!-- excel导出 -->
      <el-dialog
        class="normal-dialog"
        title="Excel导出"
        :visible.sync="showExportDialog"
        width="650px"
        append-to-body
        :close-on-click-modal="false"
      >
        <ExcelExport
          v-if="showExportDialog"
          v-bind="exportProp"
          @close="dialogEvt($event, 'export')"
        />
      </el-dialog>
      <history-log ref="historyLog" />
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.dialog-title {
  font-size: 20px;
  font-weight: bold;
}
</style>
