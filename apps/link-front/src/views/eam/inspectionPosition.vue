/* * @Author: xiaorui 巡检点管理页面 * @Date: 2022-04-20 13:49:41 * @Last Modified by: xiaorui *
@Last Modified time: 2022-09-01 11:35:03 */
<!-- 巡检点管理页面 -->
<script>
import {
  deleteInspectionPositionFn,
  getInspectionPositionByPageFn,
} from '@/http/dev_new/inspection-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import InspectionPositionForm from './form/inspectionPositionForm'

export default {
  components: {
    OwnDeparmentTree,
    InspectionPositionForm,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
        departmentId: '',
      },
      tableData: [],
      total: 0,
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getInspectionPositionByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 点击查询按钮
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.departmentId = ''
      }
      this.getTableData()
    },
    // 添加巡检点
    addClick() {
      this.$refs.inspectionPositionForm.init('add', {
        id: '',
        departmentId: this.searchData.departmentId,
      })
    },
    // 编辑巡检点
    editFn(v) {
      this.$refs.inspectionPositionForm.init('edit', v)
    },
    // 查看巡检点
    viewFn(v) {
      this.$refs.inspectionPositionForm.init('view', v)
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除${item.placeName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteInspectionPositionFn(item.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功！')
                this.getTableData()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    resetSearch() {
      this.searchData.fuzzyQuery = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      type="search"
      customStyle="margin-bottom:0;"
    >
      <el-form
        inline
        label-width="100"
      >
        <el-row>
          <el-form-item label="关键字">
            <el-input
              v-model="searchData.fuzzyQuery"
              placeholder="点位名称、编号"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              class="reset"
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('inspection_position_add')"
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
        :data="tableData"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="巡检点名称"
          align="center"
          prop="placeName"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="viewFn(scope.row)"
            >{{ scope.row.placeName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="排序"
          align="center"
          prop="sortOrder"
        />
        <el-table-column
          label="编号"
          align="center"
          prop="placeCode"
        />
        <el-table-column
          label="所属部门"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="位置"
          align="center"
          prop="placePosition"
        />
        <el-table-column
          label="操作"
          align="right"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              type="text"
              icon="check"
              @click="viewFn(scope.row)"
            >
              查看
            </EButton>
            <EButton
              v-if="hasBtnPermission('inspection_position_modify')"
              type="text"
              icon="edit"
              @click="editFn(scope.row)"
            >
              编辑
            </EButton>
            <EButton
              v-if="hasBtnPermission('inspection_position_delete')"
              type="text"
              icon="delete"
              @click="delClick(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :disabled="isLoading"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        background
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @current-change="getTableData"
        @size-change="getTableData"
      />
    </ECard>

    <!-- 巡检地点的弹窗 -->
    <inspection-position-form
      slot="dialog"
      ref="inspectionPositionForm"
      @refreshDataList="getTableData"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
.search {
  margin-bottom: 10px;
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
