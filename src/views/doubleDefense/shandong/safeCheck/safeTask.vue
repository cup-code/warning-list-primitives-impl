<script>
import { getSafeCheckTaskByPage } from '@/http/defense/shandong/safeCheck-api.js'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { SafeTaskStatus } from '@/views/doubleDefense/shandong/config/constant.js'
import SafeTaskInfo from './components/SafeTaskInfo.vue'

export default {
  components: {
    OwnDeparmentTree,
    SafeTaskInfo,
  },
  data() {
    return {
      SafeTaskStatus, // 状态下拉列表
      showInfoDialog: false,
      checkTypeList: [], // 检查类型下拉列表
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      tableData: [],
      propData: {}, // 传递给弹窗的数据
      // isShowLeft: false // 是否显示左侧树，左侧显示的为公司树，当只有本级公司时，即数量=1时，不显示该树
    }
  },
  computed: {
    /* 翻译周期类型 */
    setDateType() {
      return function (type) {
        let des = '--'
        switch (Number.parseInt(type)) {
          case 1:
            des = '临时'
            break
          case 2:
            des = '周期'
            break
          default:
        }
        return des
      }
    },
    /* 翻译状态 */
    setStatus() {
      return function (status) {
        const statusInt = Number.parseInt(status)
        let des = '--'
        for (const item of this.SafeTaskStatus) {
          if (statusInt == item.value) {
            des = item.label
            break
          }
        }
        return des
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
      getSafeCheckTaskByPage(this.searchData)
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
    /* 点击查看详情 */
    checkInfoClick(taskInfo) {
      this.propData = {
        taskInfo,
      }
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <!-- 安全检查任务 -->
  <TreeTable>
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
          placeholder="任务名称"
        />
      </el-form-item>
      <el-form-item label="检查类型">
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
          v-model="searchData.checkTaskStatus"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in SafeTaskStatus"
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
      <!--      <el-table-column label="任务编号" align="center" prop="checkTaskCode" /> -->
      <el-table-column
        label="责任组织"
        align="center"
        prop="departmentName"
        min-width="200"
      />
      <el-table-column
        label="任务名称"
        align="center"
        prop="checkTaskName"
        min-width="200"
      />
      <el-table-column
        label="检查类型"
        align="center"
        min-width="150"
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
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="taskStartDateTime"
        min-width="130"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="taskEndDateTime"
        min-width="130"
      />
      <el-table-column
        label="周期类型"
        align="center"
        min-width="70"
      >
        <template slot-scope="scope">
          {{ setDateType(scope.row.frequencyType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        min-width="70"
      >
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.checkTaskStatus === -1
                ? 'warning'
                : scope.row.checkTaskStatus === 0
                  ? 'primary'
                  : scope.row.checkTaskStatus === 1
                    ? 'success'
                    : 'warning'
            "
          >
            {{ setStatus(scope.row.checkTaskStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasBtnPermission('safe_task_view')"
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, false)"
          >
            查看详情
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
        title="安全检查任务详情"
        class="large-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <SafeTaskInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="showInfoDialog = false"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
