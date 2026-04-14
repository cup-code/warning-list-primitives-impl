<script>
import {
  getSafeCheckPlanByPage,
  safeCheckPlanDel,
  safeCheckPlanDisable,
  safeCheckPlanEnable,
} from '@/http/defense/shandong/safeCheck-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { SafePlanStatus } from '@/views/doubleDefense/shandong/config/constant.js'
import SafePlanInfo from './components/SafePlanInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    SafePlanInfo,
  },
  data() {
    return {
      showMore: false,
      SafePlanStatus, // 状态下拉列表
      showInfoDialog: false,
      dialogTitle: '', // 弹窗标题
      checkTypeList: [], // 计划类型下拉列表
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [],
      propData: {}, // 传递给弹窗的数据
      // isShowLeft: false // 是否显示左侧树，左侧显示的为公司树，当只有本级公司时，即数量=1时，不显示该树
    }
  },
  computed: {
    /* 翻译状态描述 */
    setCheckStatus() {
      return function (status) {
        let params = {}
        for (const item of this.SafePlanStatus) {
          if (status == item.value) {
            params = {
              label: item.label,
              tag: item.tag,
            }
            break
          }
        }
        return params
      }
    },
  },
  created() {
    this.searchClick()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.checkTypeList = dicList.safeCheck_type
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
      getSafeCheckPlanByPage(this.searchData)
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
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      this.searchData.departmentId = data.id
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增安全检查计划'
      this.propData = { editable: true }
      this.showInfoDialog = true
    },
    /* 点击查看/修改 */
    changeClick(infoId, editable) {
      this.dialogTitle = '安全检查计划详情'
      this.propData = { editable, infoId }
      this.showInfoDialog = true
    },
    /* 点击切换状态 */
    changeStatusClick(id, isStart) {
      let statusFunc = safeCheckPlanDisable
      if (isStart) {
        statusFunc = safeCheckPlanEnable
      }
      this.isLoading = true
      statusFunc(id)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('状态切换成功')
            this.searchClick()
          }
          else {
            this.$message.warning(res.data.message || '状态切换失败')
          }
        })
        .catch((err) => {
          this.$message.error('状态切换出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
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
          safeCheckPlanDel(item.row.id)
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
    isFinish(planEndDateTime) {
      return new Date(planEndDateTime).getTime() < new Date().getTime()
    },
    /* 点击显示/隐藏更多 */
    showMoreClick(isShow) {
      this.showMore = isShow
      this.$nextTick(() => {
        this.$refs.treeTable.setTableHeight()
      })
    },
  },
}
</script>

<template>
  <!-- 安全检查计划 -->
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="计划类型">
        <el-select
          v-model="searchData.checkPlanType"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in checkTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchData.enabledState"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in SafePlanStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="showMore"
        prop="checkPlanCategory"
        label="检查专业"
      >
        <el-select
          v-model="searchData.checkPlanCategory"
          clearable
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('check_plan_category')"
            :key="item.id"
            :label="item.dictName"
            :value="+item.dictCode"
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
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('safe_plan_add')"
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
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="计划编号"
        align="center"
        prop="checkPlanCode"
        show-overflow-tooltip
      />
      <el-table-column
        label="责任组织"
        align="center"
        prop="departmentName"
        show-overflow-tooltip
        min-width="140"
      />
      <el-table-column
        label="计划名称"
        align="center"
        prop="checkPlanName"
      />
      <el-table-column
        label="检查专业"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('check_plan_category', scope.row.checkPlanCategory, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="计划类型"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('safeCheck_type', scope.row.checkPlanType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="检查人员"
        align="center"
        prop="checkUserFullName"
        show-overflow-tooltip
      />
      <el-table-column
        label="检查频次"
        align="center"
        prop="cycleRuleDesc"
        show-overflow-tooltip
        min-width="160"
      />
      <el-table-column
        label="周期类型"
        align="center"
        width="70px"
      >
        <template slot-scope="scope">
          <!-- 1临时 2周期 -->
          <span>{{ scope.row.frequencyType == 1 ? '临时' : '周期性' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdTime"
      />
      <el-table-column
        label="状态"
        align="center"
        width="60px"
      >
        <template slot-scope="scope">
          <!-- <el-tag :type="setCheckStatus(scope.row.enabledState).tag">{{ setCheckStatus(scope.row.enabledState).label }}</el-tag> -->
          <el-tag
            v-if="scope.row.enabledState && !isFinish(scope.row.planEndDateTime)"
            type="success"
          >
            启用
          </el-tag>
          <el-tag
            v-if="!scope.row.enabledState && !isFinish(scope.row.planEndDateTime)"
            type="danger"
          >
            停用
          </el-tag>
          <el-tag
            v-if="isFinish(scope.row.planEndDateTime)"
            type="danger"
          >
            已结束
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="220"
        fixed="right"
      >
        <template slot-scope="scope">
          <!-- 停用状态才可以修改、删除 -->
          <el-button
            v-if="hasBtnPermission('safe_plan_view')"
            type="text"
            size="mini"
            @click="changeClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="
              !scope.row.enabledState
                && hasBtnPermission('safe_plan_stop')
                && !isFinish(scope.row.planEndDateTime)
            "
            type="text"
            size="mini"
            @click="changeStatusClick(scope.row.id, true)"
          >
            启用
          </el-button>
          <el-button
            v-if="
              scope.row.enabledState
                && hasBtnPermission('safe_plan_stop')
                && !isFinish(scope.row.planEndDateTime)
            "
            type="text"
            size="mini"
            @click="changeStatusClick(scope.row.id, false)"
          >
            停用
          </el-button>
          <el-button
            v-if="
              !scope.row.enabledState
                && hasBtnPermission('safe_plan_modify')
                && !isFinish(scope.row.planEndDateTime)
            "
            type="text"
            size="mini"
            @click="changeClick(scope.row.id, true)"
          >
            修改
          </el-button>
          <!-- <el-button type="text" size="mini" @click="checkInfoClick(scope.row, true)">检查记录</el-button> -->
          <el-button
            v-if="!scope.row.enabledState && hasBtnPermission('safe_plan_delete')"
            type="text"
            size="mini"
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
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="fixed-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="950px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <SafePlanInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
