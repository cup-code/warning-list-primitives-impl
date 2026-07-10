<!-- 润滑计划页面 -->
<script>
import { getPlanTable, removeLubricatePlanFn } from '@/http/dev_new/lubricatePlan-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import LubricatePlanFrom from './form/lubricatePlanFrom'

export default {
  components: {
    OwnDeparmentTree,
    LubricatePlanFrom,
  },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        deviceNameOrCode: '',
        lubricatePosition: '',
      },
      // 弹框
      dialogTitle: '',
      visibleFrom: false,
      dialogMethod: '',
      tableData: [],
      fromData: {},
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getPlanTable(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            // 数据字典，手动设置：润滑油脂名称、润滑方式
            data.result.list.forEach((item, index) => {
              this.tableData[index].lubricateTypeContent = this.$dictUtils.getDictLabelById(
                'lubricate_type',
                item.lubricateType,
              )
              const List = []
              item.lubricateGreaseList.forEach((item) => {
                List.push(this.$dictUtils.getDictLabelById('lubricate_grease', item))
              })
              this.tableData[index].greaseListContent = List.toString()
            })
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
      this.searchFn()
    },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleFrom = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增润滑计划'
          this.fromData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑润滑计划'
          this.fromData = infoData
          break
        case 'view':
          this.dialogTitle = '查看润滑计划'
          this.fromData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleFrom = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此润滑计划' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeLubricatePlanFn(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    getColor(v) {
      if (v <= 7) {
        return '#FF4F58'
      }
      else if (v > 7 && v <= 30) {
        return '#FF9900'
      }
    },
    resetSearch() {
      this.searchData.deviceNameOrCode = ''
      this.searchData.lubricatePosition = ''
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

    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        inline
        label-width="100"
      >
        <el-row>
          <el-form-item label="设备名称或编号">
            <el-input
              v-model="searchData.deviceNameOrCode"
              placeholder="名称或编号"
              clearable
            />
          </el-form-item>
          <el-form-item label="润滑部位">
            <el-input
              v-model="searchData.lubricatePosition"
              placeholder="请输入润滑部位"
              clearable
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

    <ECard
      slot="table"
      style="height: 100%"
    >
      <div class="card-cell">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
      </div>
      <!-- 表格 -->
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="公司"
          align="center"
          prop="companyName"
          min-width="150"
        />
        <el-table-column
          label="设备"
          align="center"
          prop="assetDeviceName"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="changeFn('view', scope.row)"
            >{{ scope.row.assetDeviceName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="设备编号"
          align="center"
          prop="assetDeviceCode"
        />
        <el-table-column
          label="部门车间"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="润滑部位"
          align="center"
          prop="lubricatePosition"
        />
        <el-table-column
          label="润滑点数"
          align="center"
          prop="lubricatePoints"
        />
        <el-table-column
          label="润滑油脂名称"
          align="center"
          prop="greaseListContent"
          min-width="150"
        />
        <el-table-column
          label="润滑周期（天）"
          align="center"
          prop="lubricateCycle"
          min-width="150"
        />
        <el-table-column
          label="距离上次润滑天数"
          align="center"
          prop="apartLastLubricate"
          min-width="180"
        />
        <el-table-column
          label="上次润滑时间"
          align="center"
          prop="lastLubricateTime"
          min-width="180"
        />
        <el-table-column
          label="距离下次润滑天数"
          align="center"
          prop="apartNextLubricate"
          min-width="180"
        >
          <template slot-scope="scope">
            <span
              :style="{
                background: getColor(scope.row.apartNextLubricate),
                display: 'block',
                textAlign: 'center',
              }"
            >
              {{ scope.row.apartNextLubricate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="下次润滑时间"
          align="center"
          prop="nextLubricateTime"
          min-width="180"
        />
        <el-table-column
          label="润滑方式"
          align="center"
          prop="lubricateTypeContent"
        />
        <el-table-column
          label="润滑标准"
          align="center"
          prop="lubricateStandard"
        />
        <el-table-column
          label="润滑责任人"
          align="center"
          prop="responsibleUserName"
        />
        <el-table-column
          label="操作"
          min-width="180"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </EButton>
            <EButton
              icon="edit"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </EButton>
            <EButton
              type="text"
              icon="delete"
              @click="delFn(scope.row)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <!-- 分页器 -->
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        style="text-align: right"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 搜索栏 -->

    <!-- 润滑计划表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleFrom"
    >
      <LubricatePlanFrom
        v-if="visibleFrom"
        :method="dialogMethod"
        :planData="fromData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
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
