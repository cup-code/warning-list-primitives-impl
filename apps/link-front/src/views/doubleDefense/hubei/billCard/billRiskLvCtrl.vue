<script>
import {
  getCountByUnitTypeFn,
  riskLevelCtrlDetailByPage,
} from '@/http/defense/hubei/billCard-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { RiskLevelList } from '../common/constant'

export default {
  components: {
    OwnDeparmentTree,
  },
  data() {
    return {
      isLoading: false,
      RiskLevelList, // 风险等级下拉列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
        postName: '',
        responsibilityDepartment: '',
        riskLevel: '',
        riskUnitType: '',
      },
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      unitTypeOptions: [], // 单元类型；各个类型集合
      currentUnitTypeLabel: '', // 保存当前单元类型name，用于判断表格中文字描述
    }
  },
  computed: {
    /* 设置风险等级样式 */
    setDangerLv() {
      return function (riskLv) {
        let name = ''
        let bgColor = ''
        for (const item of this.RiskLevelList) {
          if (item.value == riskLv) {
            name = item.label
            bgColor = item.bgColor
          }
        }
        return {
          style: `padding:4px 6px;border-radius: 2px;background:${bgColor};`,
          name,
        }
      }
    },
  },
  created() {
    this.getCountByUnitType()
  },
  methods: {
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      this.searchData.responsibilityDepartment = data.id
      this.queryClick()
    },
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.getCountByUnitType()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.searchForm.resetFields()
      this.searchData.pageNum = 1
      this.getCountByUnitType()
    },
    /* 点击查询 */
    searchClick() {
      this.isLoading = true
      riskLevelCtrlDetailByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            if (res.data.result.list && res.data.result.list.length) {
              res.data.result.list.forEach((item) => {
                item.evaluationDetail = item.evaluationDetail
                  ? JSON.parse(item.evaluationDetail)
                  : {}
              })
            }
            this.tableData = res.data.result.list || []
            this.total = res.data.result.total
            this.$nextTick(() => {
              this.$refs.table.doLayout()
            })
          }
          else {
            this.$message.warning(res.data.message || '获取清单列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取清单列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 获取单元类型，各个类型的集合数据
    getCountByUnitType() {
      getCountByUnitTypeFn(this.searchData).then(({ data }) => {
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
        this.searchData.riskUnitType
          = this.searchData.riskUnitType || this.unitTypeOptions[0].groupBy
        this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
          'analysis_type',
          this.searchData.riskUnitType,
        )
        this.searchClick()
      })
    },
    typeChange(type) {
      this.searchData.riskUnitType = type
      this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
        'analysis_type',
        this.searchData.riskUnitType,
      )
      this.searchClick()
    },
  },
}
</script>

<template>
  <!-- 安全风险分级管控清单 -->
  <TreeTable>
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="searchForm"
      inline
      :model="searchData"
    >
      <el-form-item
        label="关键字"
        prop="fuzzyQuery"
      >
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="作业步骤/检查项目"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="区域"
        prop="postName"
      >
        <el-input
          v-model="searchData.postName"
          placeholder="请输入区域"
          clearable
        />
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
            v-for="item in RiskLevelList"
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
    <div slot="auxiliary">
      <el-button
        v-for="(item, index) in unitTypeOptions"
        :key="index"
        style="margin-top: 5px"
        plain
        :type="searchData.riskUnitType === item.groupBy ? 'primary' : ''"
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
      align="center"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        type="index"
        align="center"
      />
      <el-table-column
        label="责任组织"
        prop="responsibilityDeptName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="区域"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="负责人"
        prop="responsibilityUserName"
        align="center"
      />
      <el-table-column
        label="风险单元类型"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险单元名称"
        prop="unitName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险单元描述"
        prop="unitDesc"
        align="center"
        min-width="100px"
      />
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
        v-if="currentUnitTypeLabel === '作业活动'"
        label="危险源或潜在事件"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventDesc" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '设备设施'"
        label="标准"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventDesc" />
        </template>
      </el-table-column>
      <el-table-column
        label="可能发生的事故"
        prop="accidentType"
        align="center"
        min-width="120px"
      />
      <el-table-column
        label="工程技术措施"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.controlMeasureMap['工程技术'] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="管理措施"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.controlMeasureMap['管理措施'] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="教育培训措施"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.controlMeasureMap['教育培训'] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="个人防护措施"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.controlMeasureMap['个人防护'] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="应急处置措施"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.controlMeasureMap['应急处置'] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="L"
        prop="evaluationDetail.lec_l"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_l || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="E"
        prop="evaluationDetail.lec_e"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_e || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="C"
        prop="evaluationDetail.lec_c"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_c || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="D"
        prop="evaluationDetail.risk_val"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.risk_val || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险等级"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span :style="setDangerLv(scope.row.riskLevel).style">{{
            setDangerLv(scope.row.riskLevel).name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="管控层级"
        align="center"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy) }}
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
  </TreeTable>
</template>

<style lang="scss" scoped></style>
