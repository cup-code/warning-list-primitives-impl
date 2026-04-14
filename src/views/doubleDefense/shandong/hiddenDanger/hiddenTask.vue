<script>
import {
  getTaskCountByUnitTypeFn,
  hiddenDangerCheckSinglePerson,
  hiddenDangerCheckTaskByPage,
} from '@/http/defense/shandong/hidden-api.js'
import { getAnalyseUnitAll } from '@/http/defense/shandong/riskControl-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { CtrlCycleArr, TroubleResult } from '@/views/doubleDefense/shandong/config/constant'

export default {
  components: {
    OwnDeparmentTree,
  },
  data() {
    return {
      isLoading: false,
      unitList: [], // 所属分析单元列表
      tableData: [],
      total: 0,
      TroubleResult, // 排查结果列表
      CtrlCycleArr, // 管控周期列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
        analysisUnitId: '',
        analysisUnitType: '',
        eventName: '',
        departmentId: '',
      },
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
  },
  created() {
    // 判断是否展示左侧树
    // getSubordinateCompany().then(({data}) => {
    //   this.isShowLeft = data.result.length !== 1
    // })
    this.getTaskCountByUnitType(true)
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.getTaskCountByUnitType()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.sForm.resetFields()
      this.searchData.pageNum = 1
      this.getTaskCountByUnitType()
    },
    /* 点击搜索 */
    searchClick(isReqParams) {
      this.isLoading = true
      hiddenDangerCheckTaskByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.analysisUnitType = this.searchData.analysisUnitType
            })
            this.tableData = res.data.result.list
            this.total = res.data.result.total
            this.$nextTick(() => {
              this.$refs.table.doLayout()
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
    getTaskCountByUnitType(isReqParams) {
      getTaskCountByUnitTypeFn(this.searchData).then(({ data }) => {
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
    rowSwitch(val, taskId) {
      const singlePerson = Number(val)
      hiddenDangerCheckSinglePerson(singlePerson, taskId).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '执行成功')
        }
        else {
          this.$message.warning(data.message || '执行失败')
        }
      })
    },
  },
}
</script>

<template>
  <!-- 隐患排查任务 -->
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
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
        label="作业步骤/检查项目"
        prop="eventName"
      >
        <el-input
          v-model="searchData.eventName"
          clearable
        />
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
    <div slot="auxiliary">
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
           {{ $dictUtils.getDictLabelById('analysis_type', scope.row.analysisUnitType) }}
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
      <el-table-column
        label="管控措施类别"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('measure_main', scope.row.controlMeasuresMainType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="管控措施"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.controlMeasuresDesc" />
        </template>
      </el-table-column>
      <el-table-column
        label="隐患排查内容"
        prop="checkContent"
        align="center"
        min-width="150"
      />
      <el-table-column
        label="周期"
        align="center"
      >
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
        align="center"
        prop="controlResponsible"
      />
      <el-table-column
        label="是否一人排查即可"
        prop="singlePerson"
        align="center"
        min-width="130"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.singlePerson"
            @change="rowSwitch($event, scope.row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="最近排查时间"
        align="center"
        width="130"
      >
        <template slot-scope="scope">
          {{ scope.row.recentCheckTime ? scope.row.recentCheckTime : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="最近排查结果"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.recentTroubleResult == '0'"
            type="success"
          >
            正常
          </el-tag>
          <el-tag
            v-if="scope.row.recentTroubleResult == '1'"
            type="danger"
          >
            存在隐患
          </el-tag>
          <el-tag
            v-if="scope.row.recentTroubleResult == '-1'"
            type="warning"
          >
            暂未排查
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
  </TreeTable>
</template>
