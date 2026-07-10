<script>
import {
  getAnalyseUnitAll,
  getEventCountByUnitTypeFn,
  getRiskEventByPage,
  riskEventDel,
} from '@/http/defense/shandong/riskControl-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant.js'
import EventInfo from './components/EventInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    EventInfo,
  },
  data() {
    return {
      isLoading: false,
      unitList: [], // 所有分析单元
      RiskLevel, // 风险等级下拉列表
      // 查询条件
      searchData: {
        pageNum: 1,
        pageSize: 10,
        analysisUnitId: '', // 分析单元id
        analysisUnitType: '', // 单元类型
        departmentId: '',
        fuzzyName: '',
        riskLevel: '',
      },
      allDic: {}, // 字典数据
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
      // isShowLeft: false, // 是否显示左侧树，左侧显示的为公司树，当只有本级公司时，即数量=1时，不显示该树
      unitTypeOptions: [], // 单元类型；各个类型集合
      currentUnitTypeLabel: '', // 保存当前单元类型name，用于判断表格中文字描述
    }
  },
  computed: {
    /* 设置风险等级文字及颜色 */
    setRiskLevel() {
      return function (riskLv) {
        const riskLvInt = Number.parseInt(riskLv)
        let param = {}
        for (const item of this.RiskLevel) {
          if (item.value == riskLvInt) {
            param = item
            break
          }
        }
        return param
      }
    },
    /* 设置所属分析单元文字 */
    setUnitDes() {
      return function (unitId) {
        let des = ''
        for (const item of this.unitList) {
          if (item.id == unitId) {
            des = item.name
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    // 判断是否展示左侧树
    // getSubordinateCompany().then(({data}) => {
    //   this.isShowLeft = data.result.length !== 1
    // })
    // 获取单元类型，各个类型的集合数据
    this.getEventCountByUnitType(true)
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.getEventCountByUnitType()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.sForm.resetFields()
      this.searchData.pageNum = 1
      this.getEventCountByUnitType()
    },
    /* 查询表格数据 */
    searchClick(isReqParams) {
      this.isLoading = true
      getRiskEventByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.analysisUnitType = this.searchData.analysisUnitType
              item.evaluationDetail = item.evaluationDetail ? JSON.parse(item.evaluationDetail) : {}
            })
            this.total = res.data.result.total
            this.tableData = res.data.result.list
            this.$nextTick(() => {
              this.$refs.table.doLayout()
            })
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求表格数据出错：', err)
        })
        .finally(() => {
          if (isReqParams === true) {
            this.getParamsData()
          }
          else {
            this.isLoading = false
          }
        })
    },
    /* 获取其他参数 */
    async getParamsData() {
      this.isLoading = true
      const unitRes = await getAnalyseUnitAll()
      this.unitList = unitRes.data.result
      this.isLoading = false
    },
    // 获取单元类型，各个类型的集合数据
    getEventCountByUnitType(isReqParams) {
      getEventCountByUnitTypeFn(this.searchData).then(({ data }) => {
        this.unitTypeOptions = data.result || []
        if (!data.result.length) {
          this.analysisTypelist = this.$dictUtils.getDictList('analysis_type')
          this.unitTypeOptions = this.analysisTypelist.map((item) => {
            return {
              groupBy: item.id,
              count: 0,
            }
          })
        }
        this.searchData.analysisUnitType
          = this.searchData.analysisUnitType || this.unitTypeOptions[0].groupBy
        this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
          'analysis_type',
          this.searchData.analysisUnitType,
        )
        this.searchClick(isReqParams)
      })
    },
    typeChange(type) {
      this.searchData.analysisUnitType = type
      this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
        'analysis_type',
        this.searchData.analysisUnitType,
      )
      this.searchClick()
    },
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      this.searchData.departmentId = data.id
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增风险事件管理'
      this.propData = {
        editable: true,
        unitList: this.unitList,
      }
      this.showInfoDialog = true
    },
    /* 点击查看/编辑 */
    editClick(infoId, editable) {
      this.dialogTitle = '风险事件管理详情'
      this.propData = {
        infoId,
        editable,
        unitList: this.unitList,
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
          riskEventDel(item.row.id)
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
  <!-- 风险事件管理 -->
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="margin-bottom:0"
    >
      <el-form
        ref="sForm"
        inline
        :model="searchData"
      >
        <el-form-item
          label="所属分析单元"
          prop="analysisUnitId"
        >
          <el-select
            v-model="searchData.analysisUnitId"
            placeholder="全部"
            clearable
            filterable
          >
            <el-option
              v-for="item in unitList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="关键字"
          prop="fuzzyName"
        >
          <el-input v-model="searchData.fuzzyName" />
        </el-form-item>
        <el-form-item
          label="风险等级"
          prop="riskLevel"
        >
          <el-select
            v-model="searchData.riskLevel"
            placeholder="全部"
            clearable
            filterable
          >
            <el-option
              v-for="item in RiskLevel"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
      </el-form>
    </ECard>
    <ECard slot="table">
      <div class="card-cell flex">
        <el-button
          v-if="hasBtnPermission('event_manage_add')"
          icon="el-icon-plus"
          type="primary"
          plain
          @click="addClick"
        >
          新增
        </el-button>
        <div>
          <el-button
            v-for="(item, index) in unitTypeOptions"
            :key="index"
            style="margin-top: 5px"
            plain
            :type="searchData.analysisUnitType === item.groupBy ? 'primary' : ''"
            @click="typeChange(item.groupBy)"
          >
            {{ $dictUtils.getDictLabelById('analysis_type', item.groupBy) }}
            {{ item.count }}
          </el-button>
        </div>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="isLoading"
        height="90%"
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        highlight-current-row
        :border="true"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="50"
        />
        <el-table-column
          label="责任组织"
          prop="responsibilityDeptName"
          align="center"
          min-width="100px"
        />
        <el-table-column
          label="所属分析单元"
          prop="analysisUnitId"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            {{ setUnitDes(scope.row.analysisUnitId) }}
          </template>
        </el-table-column>
        <el-table-column
          label="单元类型"
          prop="analysisUnitType"
          align="center"
        >
          <template slot-scope="scope">
             {{ $dictUtils.getDictLabelById('analysis_type', scope.row.analysisUnitType) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="currentUnitTypeLabel === '作业活动'"
          label="作业步骤"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.eventName" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="currentUnitTypeLabel === '设备设施'"
          label="检查项目"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.eventName" />
          </template>
        </el-table-column>
        <el-table-column
          label="风险等级"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span
              class="risk-des"
              :style="`background:${setRiskLevel(scope.row.riskLevel).color};`"
            >{{ setRiskLevel(scope.row.riskLevel).label }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="currentUnitTypeLabel === '作业活动'"
          label="危险源或潜在事件"
          align="center"
          min-width="130px"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.eventDesc" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="currentUnitTypeLabel === '设备设施'"
          label="标准"
          align="center"
          min-width="130px"
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.eventDesc" />
          </template>
        </el-table-column>
        <el-table-column
          label="L"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_l || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="E"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_e || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="C"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.lec_c || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="风险值"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.evaluationDetail.risk_val || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="可能导致的事故"
          prop="accidentType"
          align="center"
        />
        <el-table-column
          label="操作"
          width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('event_manage_view')"
              type="text"
              @click="editClick(scope.row.id, false)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('event_manage_modify')"
              type="text"
              @click="editClick(scope.row.id, true)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('event_manage_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="delClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页器 -->
    <el-pagination
      slot="page"
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
        class="large-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <EventInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.risk-des {
  padding: 4px 6px;
  border-radius: 2px;
  background: #67c23a;
}
</style>
