<script>
// import { getSubordinateCompany } from '@/http/user-api'
import {
  getRecordCountByUnitTypeFn,
  hiddenDangerCheckRecordByPage,
} from '@/http/defense/shandong/hidden-api.js'
import { getAnalyseUnitAll } from '@/http/defense/shandong/riskControl-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import {
  CtrlCycleArr,
  HiddenCheckType,
  TroubleResult,
} from '@/views/doubleDefense/shandong/config/constant'
import SafeBookInfo from '../safeCheck/components/SafeBookInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    SafeBookInfo,
  },
  data() {
    return {
      showMore: false,
      isLoading: false,
      unitList: [], // 所属分析单元列表
      tableData: [],
      total: 0,
      TroubleResult, // 排查结果列表
      CtrlCycleArr, // 管控周期列表
      HiddenCheckType, // 排查类型列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
        analysisUnitId: '',
        analysisUnitType: '',
        eventName: '',
        checkContent: '',
        troubleResult: '',
        departmentId: '',
        month: '',
      },
      showInfoDialog: false, // 隐患详情弹框是否显示
      propData: {}, // 传递给弹窗的数据
      // isShowLeft: false, // 是否显示左侧树，左侧显示的为公司树，当只有本级公司时，即数量=1时，不显示该树
      unitTypeOptions: [], // 单元类型；各个类型集合
      currentUnitTypeLabel: '', // 保存当前单元类型name，用于判断表格中文字描述
    }
  },
  computed: {
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
    /* 翻译管控周期 */
    setCycleDes() {
      return function (controlCycle, controlCycleUnit, controlFrequency) {
        let des = '-'
        const cycleType = Number.parseInt(controlCycleUnit)
        let cycleTypeDes = ''
        for (const item of CtrlCycleArr) {
          if (item.value == cycleType) {
            cycleTypeDes = item.label
            break
          }
        }
        des = `${controlCycle + cycleTypeDes + controlFrequency}次`
        return des
      }
    },
    /* 翻译排查结果 */
    setResult() {
      return function (result) {
        const resInt = Number.parseInt(result)
        let des = '-'
        for (const item of this.TroubleResult) {
          if (item.value == resInt) {
            des = item.label
            break
          }
        }
        return des
      }
    },
    /* 翻译排查类型 */
    setCheckType() {
      return function (type) {
        let des = '-'
        const typeInt = Number.parseInt(type)
        for (const item of this.HiddenCheckType) {
          if (item.value == typeInt) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  created() {
    // 判断是否展示左侧树
    // getSubordinateCompany().then(({data}) => {
    //   this.isShowLeft = data.result.length !== 1
    // })
    this.getRecordCountByUnitType(true)
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
      this.getRecordCountByUnitType()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.sForm.resetFields()
      this.searchData.pageNum = 1
      this.getRecordCountByUnitType()
    },
    searchClick(isReqParams) {
      this.isLoading = true
      hiddenDangerCheckRecordByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.analysisUnitType = this.searchData.analysisUnitType
            })
            this.tableData = res.data.result.list
            this.total = res.data.result.total
            this.$nextTick(() => {
              this.$refs.table?.doLayout()
            })
          }
          else {
            this.$message.warning(res.data.message || '获取表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表格数据出错', err)
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
    // 获取单元类型，各个类型的集合数据
    getRecordCountByUnitType(isReqParams) {
      getRecordCountByUnitTypeFn(this.searchData).then(({ data }) => {
        this.unitTypeOptions = data.result || []
        if (!data.result.length) {
          const analysisTypelist = this.$dictUtils.getDictList('analysis_type')
          this.unitTypeOptions = analysisTypelist.map((item) => {
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
    /* 获取其他参数 */
    async getParamsData() {
      this.isLoading = true
      const unitRes = await getAnalyseUnitAll()
      this.unitList = unitRes.data.result
      this.isLoading = false
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      this.searchData.departmentId = data.id
      this.queryClick()
    },
    /* 存在隐患时点击查看隐患详情 */
    showInfoClick(troubleId) {
      this.propData = {
        troubleId,
      }
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <!-- 隐患排查记录 -->
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="sForm"
      inline
      :model="searchData"
    >
      <el-form-item label="所属分析单元" prop="analysisUnitId">
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
      <el-form-item label="作业步骤/检查项目" prop="eventName">
        <el-input v-model="searchData.eventName" />
      </el-form-item>
      <template v-if="showMore">
        <el-form-item label="隐患排查内容" prop="checkContent">
          <el-input v-model="searchData.checkContent" placeholder="隐患排查内容" />
        </el-form-item>
        <el-form-item label="排查结果" prop="troubleResult">
          <el-select
            v-model="searchData.troubleResult"
            clearable
            placeholder="全部"
            filterable
          >
            <el-option
              v-for="item in TroubleResult"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排查月份" prop="month">
          <el-date-picker
            v-model="searchData.month"
            type="month"
            placeholder="选择月份"
            value-format="yyyy-MM"
          />
        </el-form-item>
      </template>
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
      <el-form-item v-if="!showMore">
        <el-button
          type="text"
          icon="el-icon-arrow-down"
          style="color: var(--ky-primary)"
          @click="showMoreClick(true)"
        >
          高级筛选
        </el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button
          type="text"
          icon="el-icon-arrow-up"
          style="color: var(--ky-primary)"
          @click="showMoreClick(false)"
        >
          收起
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-for="(item, index) in unitTypeOptions"
        :key="index"
        style="margin-top: 5px"
        plain
        :type="searchData.analysisUnitType === item.groupBy ? 'primary' : ''"
        @click="typeChange(item.groupBy)"
      >
        {{ $dictUtils.getDictLabelById("analysis_type", item.groupBy) }}
        {{ item.count }}
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      ref="table"
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
      />
      <el-table-column
        label="责任组织"
        prop="responsibilityDeptName"
        align="center"
      />
      <el-table-column
        label="所属分析单元"
        align="center"
        min-width="150"
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
           {{ $dictUtils.getDictLabelById("analysis_type", scope.row.analysisUnitType) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '作业活动'"
        label="作业步骤"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventName" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '设备设施'"
        label="检查项目"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventName" />
        </template>
      </el-table-column>
      <el-table-column label="管控措施" align="center">
        <template slot-scope="scope">
          <RichText :des="scope.row.controlMeasuresDesc" />
        </template>
      </el-table-column>
      <el-table-column
        label="隐患排查内容"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.checkContent" />
        </template>
      </el-table-column>
      <el-table-column
        label="排查类型"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{ setCheckType(scope.row.checkType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center">
        <template slot-scope="scope">
          <span>
            {{
              setCycleDes(
                scope.row.controlCycle,
                scope.row.controlCycleUnit,
                scope.row.controlFrequency,
              )
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="计划排查人"
        prop="plannedCheckUserNameList"
        align="center"
      >
        <template slot-scope="scope">
          {{ (scope.row.plannedCheckUserNameList || []).join("、") }}
        </template>
      </el-table-column>
      <el-table-column
        label="任务下发时间"
        prop="taskStartDateTime"
        align="center"
        min-width="130"
      />
      <el-table-column
        label="实际排查人"
        prop="actualCheckUseNameList"
        align="center"
      >
        <template slot-scope="scope">
          {{ (scope.row.actualCheckUseNameList || []).join("、") }}
        </template>
      </el-table-column>
      <el-table-column
        label="排查时间"
        align="center"
        min-width="130"
      >
        <template slot-scope="scope">
          {{ scope.row.checkTime ? scope.row.checkTime : "-" }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.taskStatus == 1" type="success">
            已排查
          </el-tag>
          <el-tag
            v-else-if="
              scope.row.taskStatus == 0
                && new Date(scope.row.taskEndDateTime).getTime() > new Date().getTime()
            "
            type="warning"
          >
            未排查
          </el-tag>
          <el-tag v-else type="danger">
            已过期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="排查结果"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.troubleResult == '0'" type="success">
            正常
          </el-tag>
          <el-tag
            v-else-if="scope.row.troubleResult == '1'"
            type="danger"
            style="cursor: pointer"
            @click="showInfoClick(scope.row.troubleId)"
          >
            存在隐患
          </el-tag>
          <el-tag v-else type="warning">
            未排查
          </el-tag>
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
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <div slot="title" class="dialog-header">
          <div class="dialog-title">
            隐患详情
          </div>
        </div>
        <SafeBookInfo v-if="showInfoDialog" v-bind="propData" />
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.dialog-title {
  font-size: 20px;
  font-weight: bold;
}
</style>
