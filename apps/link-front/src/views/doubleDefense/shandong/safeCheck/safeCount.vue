<script>
export default {
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
    }
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
      this.$refs.contentTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {},
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.checkContentType = data.id
      }
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {},
    /* 点击查看/修改 */
    changeClick(item, editable) {},
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showEditDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
}
</script>

<template>
  <!-- 安全治理统计 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CheckContentTree
      slot="tree"
      ref="contentTree"
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
          placeholder="名称/编号"
        />
      </el-form-item>
      <el-form-item label="检查类型">
        <el-select
          v-model="searchData.recommendedLevel"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in levelList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchData.recommendedLevel"
          clearable
          placeholder="全部"
          filterable
        >
          <el-option
            v-for="item in levelList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="任务编号"
        align="center"
        prop="checkContent"
      />
      <el-table-column
        label="所属公司"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="任务名称"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="检查类型"
        align="center"
        prop="checkBasis"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="检查人员"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="周期类型"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="checkBasis"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="changeClick(scope.row, false)"
          >
            查看详情
          </el-button>
          <el-button
            type="text"
            size="mini"
          >
            导出PDF报告
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
      <!-- <el-dialog class="normal-dialog" title="检查内容详情" :visible.sync="showEditDialog" width="600" :close-on-click-modal="false">
        <CheckContentInfo v-if="showEditDialog" @close="closeDialogEvt" v-bind="propData" />
      </el-dialog> -->
    </div>
  </TreeTable>
</template>
