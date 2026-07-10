<script>
// import { getSubordinateCompany } from '@/http/user-api'
import {
  getAnalyseUnitAll,
  getLevelCtrlByPage,
  getLevelCtrlCountByUnitTypeFn,
  getLevelCtrlExpand,
} from '@/http/defense/shandong/riskControl-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant'
import CtrlExpand from './components/ctrlComps/CtrlExpand.vue'
import CtrlInfo from './components/ctrlComps/CtrlInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    CtrlInfo,
    CtrlExpand,
  },
  data() {
    return {
      showMore: false,
      expandKeys: [], // 需要展开的keys列表
      unitList: [], // 分析单元列表
      expandProp: {}, // 展开行传参
      RiskLevel, // 风险等级下拉列表
      isLoading: false, // 全局loading
      expandLoading: false, // 展开行loading
      // 查询条件
      searchData: {
        pageNum: 1,
        pageSize: 10,
        analysisUnitId: '',
        analysisUnitType: '',
        departmentId: '',
        controlHierarchy: '',
        fuzzyName: '',
        riskLevel: '',
      },
      propData: {}, // 管控弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
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
    // 判断是否展示左侧树
    // getSubordinateCompany().then(({data}) => {
    //   this.isShowLeft = data.result.length !== 1
    // })
    this.getLevelCtrlCountByUnitType(true)
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
      this.getLevelCtrlCountByUnitType()
    },
    /* 点击重置 */
    refreshClick() {
      this.$refs.sForm.resetFields()
      this.searchData.pageNum = 1
      this.getLevelCtrlCountByUnitType()
    },
    /* 查询表格数据 */
    searchClick(isReqParams) {
      this.isLoading = true
      getLevelCtrlByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.analysisUnitType = this.searchData.analysisUnitType
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
          this.$message.warning('请求表格数据出错：', err)
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
    getLevelCtrlCountByUnitType(isReqParams) {
      getLevelCtrlCountByUnitTypeFn(this.searchData).then(({ data }) => {
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
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      this.searchData.departmentId = data.id
      this.queryClick()
    },
    /* 展开行回调 */
    expandEvt(row) {
      // 判断是否已展开
      let isExist = false
      for (const id of this.expandKeys) {
        if (id === row.id) {
          isExist = true
          break
        }
      }
      // 如果已展开就关闭，
      if (isExist) {
        this.expandKeys = []
      }
      // 否则展开,并请求数据
      else {
        this.expandKeys = []
        this.expandKeys.push(row.id)
        this.expandLoading = true
        this.expandProp.expandList = []
        // 请求展开数据
        getLevelCtrlExpand(row.id)
          .then((res) => {
            if (res.data.success) {
              this.expandProp.expandList = res.data.result
            }
            else {
              this.$message.warning(res.data.message || '获取展开数据失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取展开数据出错', err)
          })
          .finally(() => {
            this.expandLoading = false
          })
      }
    },
    /* 编辑/查看表格行 */
    editClick(infoId, editable) {
      this.propData = {
        infoId,
        editable,
      }
      this.showInfoDialog = true
    },
    /* 关闭弹窗回调 */
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
  <!-- 风险分级管控 -->
  <TreeTable ref="treeTable">
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
      <template v-if="showMore">
        <el-form-item
          label="管控层级"
          prop="controlHierarchy"
        >
          <el-select
            v-model="searchData.controlHierarchy"
            placeholder="全部"
            clearable
            filterable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('control_level')"
              v-if="item.dictCode != '5'"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button
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
      :expand-row-keys="expandKeys"
      row-key="id"
      :border="true"
      class="customer-table"
      @expand-change="expandEvt"
    >
      <!-- 展开行 -->
      <CtrlExpand
        v-bind="expandProp"
        :loading="expandLoading"
      />
      <!-- 表格内容 -->
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
      />
      <el-table-column
        label="所属分析单元"
        align="center"
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
        label="风险等级"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span
            class="risk-des"
            :style="`background:${setRiskLevel(scope.row.riskLevel).color}`"
          >{{ setRiskLevel(scope.row.riskLevel).label }}</span>
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
        label="管控层级"
        align="center"
      >
        <template slot-scope="scope">
          <span>
            {{ $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('level_control_view')"
            type="text"
            @click="editClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('level_control_edit')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row.id, true)"
          >
            管控
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
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        title="风险管控"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <CtrlInfo
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
