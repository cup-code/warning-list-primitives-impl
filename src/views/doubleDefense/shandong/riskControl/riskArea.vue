<script>
import { getRiskAreaByPage, riskAreaDel } from '@/http/defense/shandong/riskControl-api.js'
import DeptTree from '@/views/common-ui/OwnDeparmentTree.vue'
import RiskAreaInfo from './components/RiskAreaInfo.vue'

export default {
  components: {
    DeptTree,
    RiskAreaInfo,
  },
  data() {
    return {
      riskList: [], // 风险区域下拉列表
      isLoading: false,
      searchData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 10,
      },
      showInfoDialog: false,
      dialogTitle: '',
      propData: {
        info: {},
      },
      tableData: [],
      total: 0,
      editable: false,
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.searchClick()
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
      this.$refs.deptTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getRiskAreaByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
            // console.log('taleData:',this.tableData);
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
      this.showDialog('新增风险区域', true)
    },
    // 新增 、修改 、查看
    editClick(info, editable) {
      this.editable = editable
      this.showDialog('风险区域详情', editable, info)
    },
    /* 展示弹窗 */
    showDialog(title, editable, info) {
      this.editable = editable
      this.dialogTitle = title
      this.propData.info = info || {}
      this.propData.editable = editable
      this.showInfoDialog = true
    },
    submitClick() {
      this.$refs.riskAreaInfo.submitClick()
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
          riskAreaDel(item.row.id)
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
  <!-- 风险区域 -->
  <TreeTable>
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
          v-model="searchData.regionType"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in allDic.riskArea_type"
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
        v-if="hasBtnPermission('risk_area_add')"
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
        align="center"
        type="index"
      />
      <el-table-column
        label="所属公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="责任组织"
        align="center"
        prop="responsibilityDeptName"
      />
      <el-table-column
        label="上级区域"
        align="center"
        prop="parentName"
      />
      <el-table-column
        label="风险区域名称"
        align="center"
        prop="regionName"
      />
      <el-table-column
        label="类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('riskArea_type', scope.row.regionType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('risk_area_view')"
            type="text"
            size="mini"
            @click="editClick(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('risk_area_modify')"
            type="text"
            size="mini"
            @click="editClick(scope.row, true)"
          >
            修改
          </el-button>
          <el-button
            v-if="hasBtnPermission('risk_area_delete')"
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
        v-max-dialog
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
        top="5vh"
      >
        <RiskAreaInfo
          v-if="showInfoDialog"
          v-bind="propData"
          ref="riskAreaInfo"
          @close="closeDialogEvt"
        />
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            size="medium"
            style="margin: 0 10px 0 0"
            type="primary"
            plain
            @click="showInfoDialog = false"
          >
            取消
          </el-button>
          <el-button
            v-if="editable"
            size="medium"
            type="primary"
            @click="submitClick"
          >
            确认保存
          </el-button>
        </div>
      </el-dialog>
    </div>
  </TreeTable>
</template>
