<script>
import {
  analyseUnitDel,
  getAnalyseUnitByPage,
  getRiskAreaAll,
} from '@/http/defense/shandong/riskControl-api.js'
import DeptTree from '@/views/common-ui/OwnDeparmentTree.vue'
import UnitInfo from './components/UnitInfo.vue'

export default {
  components: {
    DeptTree,
    UnitInfo,
  },
  data() {
    return {
      isLoading: false,
      // 查询条件
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      allDic: {}, // 字典数据
      propData: {}, // 弹窗绑定数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      showInfoDialog: false, // 是否显示编辑弹窗
      dialogTitle: '', // 弹窗标题
      riskAreaList: [], // 风险区域列表
      showMore: false,
      importantList: [
        {
          label: '否',
          value: 0,
        },
        {
          label: '重大',
          value: 1,
        },
        {
          label: '重要',
          value: 2,
        },
      ],
    }
  },
  computed: {
    setRiskAreaDes() {
      return function (id) {
        let des = '--'
        for (const item of this.riskAreaList) {
          if (item.id == id) {
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
    this.searchClick(true)
  },
  mounted() {},
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
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
      }
      this.$refs.deptTree.refreshTree()
    },
    /* 查询表格数据 */
    searchClick(isReqParams) {
      this.isLoading = true
      getAnalyseUnitByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.discernDate = this.moment(item.discernDate).format('YYYY-MM-DD')
            })
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
    /* 请求租户下所有用户列表和风险区域列表 */
    async getParamsData() {
      this.isLoading = true
      const areaRes = await getRiskAreaAll()
      this.riskAreaList = areaRes.data.result
      this.isLoading = false
    },
    /* 点击左侧树的item */
    treeNodeTap(data) {
      if (data) {
        if (data.onlyTreeUse)
          return
        this.searchData.deptId = data.id
      }
      else {
        delete this.searchData.deptId
      }
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {
      this.showDialog('新增风险分析单元', true)
    },
    /* 点击查看/编辑 */
    editClick(info, editable) {
      this.showDialog('风险分析单元详情', editable, info)
    },
    /* 展示弹窗 */
    showDialog(title, editable, info) {
      this.dialogTitle = title
      this.propData.info = info
      this.propData.editable = editable
      this.propData.riskAreaList = this.riskAreaList
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
          analyseUnitDel(item.row.id)
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
  <!-- 风险分析单元 -->
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <DeptTree
      slot="tree"
      ref="deptTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="名称">
        <el-input
          v-model="searchData.fuzzyName"
          placeholder="名称"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select
          v-model="searchData.unitType"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in allDic.analysis_type"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="风险区域">
        <el-select
          v-model="searchData.regionId"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in riskAreaList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <template v-if="showMore">
        <el-form-item
          label="是否重要"
          prop="important"
        >
          <el-select
            v-model="searchData.important"
            placeholder="全部"
            clearable
            filterable
          >
            <el-option
              v-for="item in importantList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>
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
        v-if="hasBtnPermission('analyse_unit_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="addClick"
      >
        新增
      </el-button>
    </div>
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
        label="责任组织"
        prop="responsibilityDeptName"
        align="center"
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
        label="识别日期"
        prop="discernDate"
        align="center"
        min-width="150"
      />
      <el-table-column
        label="风险分析单元名称"
        prop="unitName"
        align="center"
        min-width="150"
      />
      <el-table-column
        label="是否重要"
        prop="important"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.important === 0">否</span>
          <span v-if="scope.row.important === 1">重大</span>
          <span v-if="scope.row.important === 2">重要</span>
        </template>
      </el-table-column>
      <el-table-column
        label="来源"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_source', scope.row.source, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
        align="center"
      />
      <el-table-column
        label="类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险区域"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setRiskAreaDes(scope.row.regionId) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('analyse_unit_view')"
            type="text"
            @click="editClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('analyse_unit_modify')"
            type="text"
            @click="editClick(scope.row, true)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('analyse_unit_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="delClick(scope)"
          >
            删除
          </el-button>
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
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="800px"
        :close-on-click-modal="false"
      >
        <UnitInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
