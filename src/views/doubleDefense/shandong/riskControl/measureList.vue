<script>
import {
  getAnalyseUnitAll,
  getRiskCtrlMeasureByPage,
} from '@/http/defense/shandong/riskControl-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'

export default {
  components: {
    CompanyTree,
  },
  data() {
    return {
      isLoading: false,
      unitList: [], // 所有分析单元
      // 查询条件
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      allDic: {}, // 字典数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
    }
  },
  computed: {
    /* 翻译管控措施类型 */
    setCtrlType() {
      return function (type) {
        let des = '--'
        switch (Number.parseInt(type)) {
          case 1:
            des = '自动化监控'
            break
          case 2:
            des = '隐患排查'
            break
          default:
        }
        return des
      }
    },
    /* 翻译所属分析单元文字 */
    setUnitDes() {
      return function (unitId) {
        let des = '--'
        for (const item of this.unitList) {
          if (item.id == unitId) {
            des = item.name
            break
          }
        }
        return des
      }
    },
    /* 翻译管控措施类型 */
    setMeasureDes() {
      return function (mainId, minorId) {
        // 主类型字典表
        const mainList = this.allDic.measure_main ? this.allDic.measure_main : []
        let mainName = ''
        // 拿到次类型dictCode
        let minorCode = ''
        for (const item of mainList) {
          if (item.id === mainId) {
            minorCode = item.dictCode
            mainName = item.dictName
            break
          }
        }
        // 次类型字典表
        const minorList = this.allDic[minorCode] ? this.allDic[minorCode] : []
        let minorName = ''
        for (const item of minorList) {
          if (item.id === minorId) {
            minorName = item.dictName
            break
          }
        }
        return `${mainName}-${minorName}`
      }
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick(true)
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
        pageSize: 20,
      }
      this.$refs.companyTree.refreshTree()
    },
    /* 查询表格数据 */
    searchClick(isReqParams) {
      this.isLoading = true
      getRiskCtrlMeasureByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
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
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.queryClick()
    },
  },
}
</script>

<template>
  <!-- 风险事件管理 -->
  <TreeTable>
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
      <el-form-item label="所属分析单元">
        <el-select
          v-model="searchData.analysisUnit"
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
      <el-form-item label="风险事件">
        <el-input
          v-model="searchData.fuzzyName"
          placeholder="风险事件"
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
      <!-- <el-form-item>
        <el-button type="success" size="mini" icon="el-icon-upload2">Excel导出</el-button>
      </el-form-item> -->
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
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
        width="50"
      />
      <el-table-column
        label="分析单元类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="所属分析单元"
        prop="analysisUnit"
        align="center"
      />
      <el-table-column
        label="风险事件"
        prop="eventName"
        align="center"
      />
      <el-table-column
        label="管控方式"
        align="center"
      >
        <template slot-scope="scope">
          {{ setCtrlType(scope.row.controlType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="管控措施"
        prop="controlMeasuresDesc"
        align="center"
      />
      <el-table-column
        label="管控措施分类"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            setMeasureDes(scope.row.controlMeasuresMainType, scope.row.controlMeasuresMinorType)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="隐患排查内容">
        <template slot-scope="scope">
          <RichText :des="scope.row.checkContent" />
        </template>
      </el-table-column>
      <el-table-column label="排查依据">
        <template slot-scope="scope">
          <RichText :des="scope.row.checkBasic" />
        </template>
      </el-table-column>
    </el-table>
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
  </TreeTable>
</template>
