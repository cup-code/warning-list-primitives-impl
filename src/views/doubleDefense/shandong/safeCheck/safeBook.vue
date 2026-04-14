<script>
import {
  delBookById,
  getEquipmentTroubleByPage,
  getSafeCheckAccountByPage,
  isRepeatTroubleFn,
} from '@/http/defense/shandong/safeCheck-api'
import { HIDDEN_TROUBLE_BOOK } from '@/http/excel-api'
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
    const currentYear = new Date().getFullYear()
    return {
      showMore: false,
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
        { label: '逾期未整改', value: 6 },
      ],
      isLoading: false,
      year: '', // 查询条件中所选的年份
      month: '', // 查询条件中所选的月份
      yearOption: [
        {
          value: currentYear - 2,
          label: currentYear - 2,
        },
        {
          value: currentYear - 1,
          label: currentYear - 1,
        },
        {
          value: currentYear,
          label: currentYear,
        },
      ],
      monthOption: [
        {
          value: '01',
          label: '1月',
        },
        {
          value: '02',
          label: '2月',
        },
        {
          value: '03',
          label: '3月',
        },
        {
          value: '04',
          label: '4月',
        },
        {
          value: '05',
          label: '5月',
        },
        {
          value: '06',
          label: '6月',
        },
        {
          value: '07',
          label: '7月',
        },
        {
          value: '08',
          label: '8月',
        },
        {
          value: '09',
          label: '9月',
        },
        {
          value: '10',
          label: '10月',
        },
        {
          value: '11',
          label: '11月',
        },
        {
          value: '12',
          label: '12月',
        },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        businessType: '', // 业务类型
        troubleType: '', // 隐患类型
        troubleLevel: '', // 隐患等级
        troubleSource: '', // 隐患来源
        IHandled: false, // 隐患池
        troubleState: '', // 整改进度
        rectificationUserId: '', // 整改人id
        rectificationTimeStart: '', // 整改开始时间
        rectificationTimeEnd: '', // 整改结束时间
        troubleFindTimeStart: '', // 隐患发现起始日期
        troubleFindTimeEnd: '', // 隐患发现截止日期
        isRepeat: false,
      },
      tableData: [],
      total: 0,
      fromEvaluate: false, // 判断是否从评价管理页面跳转过来的，默认false
    }
  },
  created() {
    // 从首页消息列表跳转过来的时候会带id，精准查出目标数据
    if (this.$route.query.id) {
      this.searchData.id = this.$route.query.id
    }
    // 从评价管理过来的话，携带的参数
    this.fromEvaluate = this.$route.params.fromEvaluate || false
    this.searchData.troubleFindTimeStart = this.$route.params.startDate || ''
    this.searchData.troubleFindTimeEnd = this.$route.params.endDate || ''
    this.isEquipment = this.$route.params.isEquipment || false // 评价管理：安全员设备设施
    this.backPageNum = this.$route.params.pageNum || 1 // 返回评价管理时，需要说明返回第几页
    if (this.fromEvaluate) {
      // 从评价管理-安全员考评台账过来的话，隐患数量只查询已复查的；设备设施只查询逾期未整改的
      if (!this.$route.params.isRepeat) {
        this.searchData.rectificationDeptId = this.$route.params.departmentId || ''
        this.searchData.rectificationTimeStart = this.$route.params.startDate || ''
        this.searchData.rectificationTimeEnd = this.$route.params.endDate || ''
        this.searchData.troubleState = this.isEquipment ? 6 : 5
        if (this.isEquipment) {
          this.searchData.checkPlanCategory = 3
        }
      }
      else {
        this.searchData.deptId = this.$route.params.departmentId || ''
        // 从评价管理-部门负责人考评台账过来的话，只查询重复的
        this.searchData.isRepeat = true
      }
    }
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick()
    // 设置年份列表
    const currentYear = new Date().getFullYear()
    if (currentYear === 2023) {
      this.yearOption = this.yearOption.slice(2)
    }
    else if (currentYear === 2024) {
      this.yearOption = this.yearOption.slice(1)
    }
  },
  methods: {
    /* 点击显示/隐藏更多 */
    showMoreClick(isShow) {
      this.showMore = isShow
      this.$nextTick(() => {
        this.$refs.treeTable.setTableHeight()
      })
    },
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.safeBookSform.resetFields()
      this.year = ''
      this.month = ''
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      if (!this.fromEvaluate) {
        if (this.year && this.month) {
          this.searchData.troubleFindTimeStart = `${this.year}-${this.month}-01`
          this.searchData.troubleFindTimeEnd = this.getNextMonth(
            this.searchData.troubleFindTimeStart,
          )
        }
        else if (this.year && !this.month) {
          this.searchData.troubleFindTimeStart = `${this.year}-01-01`
          this.searchData.troubleFindTimeEnd = `${this.year + 1}-01-01`
        }
        else if (!this.year) {
          this.searchData.troubleFindTimeStart = ''
          this.searchData.troubleFindTimeEnd = ''
        }
      }
      const func = this.isEquipment ? getEquipmentTroubleByPage : getSafeCheckAccountByPage
      func(this.searchData)
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
        businessData: HIDDEN_TROUBLE_BOOK,
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
    // 复核取消
    recheckCancel(id) {
      this.$refs[`node-${id}`].doClose()
    },
    // 复核提交
    recheckSubmit(id) {
      isRepeatTroubleFn(id).then(({ data }) => {
        if (data.success) {
          this.$refs[`node-${id}`].doClose()
          this.searchClick()
        }
        else {
          this.$message.warning(data.message || '复核失败')
        }
      })
    },
    getNextMonth(v) {
      // 获取上个月份
      const currentDate = new Date(v)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
      return this.moment(nextMonth).format('YYYY-MM-DD')
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
    class="safeBook"
  >
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      type="search"
      noneBottom
    >
      <el-form
        ref="safeBookSform"
        :model="searchData"
        label-width="60px"
      >
        <el-form-item
          v-if="showMore"
          label="业务类型"
          prop="businessType"
        >
          <el-radio-group v-model="searchData.businessType">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in allDic.trouble_business_type"
              :key="item.id"
              :label="+item.dictCode"
            >
              {{ item.dictName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="隐患类型"
          prop="troubleType"
        >
          <el-radio-group v-model="searchData.troubleType">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in allDic.troubleType_yhlx"
              :key="item.id"
              :label="item.id"
            >
              {{ item.dictName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="隐患等级"
          prop="troubleLevel"
        >
          <el-radio-group v-model="searchData.troubleLevel">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in allDic.hiddenDangerLevel"
              :key="item.id"
              :label="item.dictCode"
            >
              {{ item.dictName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="隐患来源"
          prop="troubleSource"
        >
          <el-radio-group v-model="searchData.troubleSource">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in allDic.sourceOfHiddenDanger"
              :key="item.id"
              :label="item.dictCode"
            >
              {{ item.dictName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="整改进度"
          prop="troubleState"
        >
          <el-radio-group v-model="searchData.troubleState">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in hiddenBookStatusList"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="年份"
        >
          <el-radio-group v-model="year">
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in yearOption"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="月份"
        >
          <el-radio-group
            v-model="month"
            :disabled="!year"
          >
            <el-radio-button label="">
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in monthOption"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="showMore"
          label="隐患池"
          prop="IHandled"
        >
          <el-radio-group v-model="searchData.IHandled">
            <el-radio-button :label="false">
              全部
            </el-radio-button>
            <el-radio-button :label="true">
              经办
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="关键字"
          prop="fuzzyQuery"
        >
          <el-input
            v-model="searchData.fuzzyQuery"
            placeholder="输入项目/部位/位置/描述/整改措施查询"
            style="width: 500px"
            clearable
          />
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            style="margin-left: 10px"
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
          <el-button
            v-if="!showMore"
            type="text"
            icon="el-icon-arrow-down"
            style="color: var(--ky-primary)"
            @click="showMoreClick(true)"
          >
            高级筛选
          </el-button>
          <el-button
            v-else
            type="text"
            icon="el-icon-arrow-up"
            style="color: var(--ky-primary)"
            @click="showMoreClick(false)"
          >
            收起
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
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
      </div>
      <el-table
        v-loading="isLoading"
        height="92%"
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
          label="检查级别"
          align="center"
          prop="controlHierarchy"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="检查项目"
          align="center"
          prop="checkItem"
        />
        <el-table-column
          label="检查人"
          align="center"
          prop="checkUserFullName"
        />
        <el-table-column
          label="所属编号"
          align="center"
          prop="businessCode"
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
          label="隐患部位"
          align="center"
          prop="troublePartName"
        />
        <el-table-column
          label="隐患位置"
          align="center"
          prop="troubleLocation"
        />
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
          label="是否重复"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.isRepeat"
              type="danger"
            >
              是
            </el-tag>
            <el-tag
              v-if="!props.row.isRepeat"
              type="success"
            >
              否
            </el-tag>
          </template>
        </el-table-column>
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
          label="整改期限"
          align="center"
          prop="rectificationTerm"
          min-width="130"
        />
        <el-table-column
          label="来源"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabel('sourceOfHiddenDanger', scope.row.troubleSource, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="整改时间"
          align="center"
          prop="rectificationTime"
          min-width="130"
        />
        <el-table-column
          label="整改情况描述"
          align="center"
          prop="rectificationSituation"
          min-width="130"
        />
        <el-table-column
          label="责任人"
          align="center"
          prop="rectificationUserFullName"
          min-width="130"
        />
        <el-table-column
          label="整改费用"
          align="center"
          prop="rectificationCost"
        />
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
              @click="showInfoClick(scope.row.id)"
            >
              查看详情
            </el-button>
            <el-popover
              v-if="
                hasBtnPermission('safe_book_recheck')
                  && scope.row.troubleState >= 1
                  && !scope.row.isRepeat
              "
              :ref="`node-${scope.row.id}`"
              placement="bottom-end"
              width="180"
            >
              <p>这是一个重复隐患吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button
                  type="text"
                  style="margin-right: 10px"
                  @click="recheckCancel(scope.row.id)"
                >
                  取消
                </el-button>
                <el-button
                  type="primary"
                  @click="recheckSubmit(scope.row.id)"
                >
                  确定
                </el-button>
              </div>
              <el-button
                v-if="
                  hasBtnPermission('safe_book_recheck')
                    && scope.row.troubleState >= 1
                    && !scope.row.isRepeat
                "
                slot="reference"
                type="text"
                style="margin: 0 10px"
              >
                复核
              </el-button>
            </el-popover>
            <el-button
              v-if="hasBtnPermission('safe_book_history')"
              type="text"
              @click="showLogClick(scope.row.id)"
            >
              流转日志
            </el-button>
            <el-button
              v-if="hasBtnPermission('safe_book_delete') && !fromEvaluate"
              style="color: var(--ky-danger)"
              type="text"
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
            隐患详情
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
.safeBook ::v-deep {
  .bg-header {
    // padding: 18px 8px !important;
  }
}
.safeBookSform ::v-deep {
  .el-form-item {
    margin-bottom: 3px;
  }
}
.dialog-title {
  font-size: 20px;
  font-weight: bold;
}
</style>
