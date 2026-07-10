/* * @Author: xiaorui * @Date: 2022-07-14 11:56:35 新的维保计划页面 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-31 11:23:29 */
<script>
import {
  changeMaintenancePlanStateFn,
  deleteMaintenancePlanFn,
  getPlanListByPageFn,
} from '@/http/dev_new/maintenance-api'
import { MAINTENCE_PLAN } from '@/http/excel-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
    ExcelExport,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        planName: '',
      },
      tableData: [],
      total: 0,
      cycleOptions: [
        {
          label: '时',
          value: 'HOUR',
        },
        {
          label: '天',
          value: 'DAY',
        },
        {
          label: '周',
          value: 'WEEK',
        },
        {
          label: '月',
          value: 'MONTH',
        },
        {
          label: '年',
          value: 'YEAR',
        },
      ],
      stateOptions: [
        {
          label: '待发布',
          value: '1',
        },
        {
          label: '已发布',
          value: '2',
        },
        {
          label: '已停用',
          value: '3',
        },
      ],
      moreButton: [
        {
          type: 'text',
          props: 'publish',
          btnIcon: 'el-icon-s-promotion',
          size: 'mini',
          text: '发布',
          disabled: false,
        },
        {
          type: 'text',
          props: 'stop',
          icon: 'stop',
          size: 'mini',
          text: '停用',
          disabled: false,
        },
        {
          type: 'text',
          props: 'delete',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          disabled: false,
        },
      ],
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
    }
  },
  computed: {
    getMoreButton() {
      return function (scope) {
        return this.moreButton.filter((item) => {
          return (
            (['1', '3'].includes(scope.planState) && item.props === 'publish')
            || (scope.planState === '2' && item.props === 'stop')
            || item.props === 'delete'
          )
        })
      }
    },
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getPlanListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
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
      this.searchData.departmentId = data.id
      this.getTableData()
    },
    // 点击查询按钮
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    /* 点击添加维保计划 */
    addClick() {
      this.$router.push({
        name: 'maintenancePlanDetail',
        params: {
          id: '',
          method: 'add',
        },
      })
    },
    // 编辑维保计划
    editPlan(v) {
      this.$router.push({
        name: 'maintenancePlanDetail',
        params: {
          id: v.id,
          method: 'edit',
        },
      })
    },
    // 查看维保计划
    viewPlan(v) {
      this.$router.push({
        name: 'maintenancePlanDetail',
        params: {
          id: v.id,
          method: 'view',
        },
      })
    },
    // 发布计划
    changeState(planId, planState) {
      changeMaintenancePlanStateFn(planId, planState).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '状态切换成功')
          this.getTableData()
        }
        else {
          this.$message.error(data.message || '状态切换失败')
        }
      })
    },
    /* 点击删除维保计划 */
    delPlan(item) {
      this.$confirm(`您确定要删除计划-${item.planName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteMaintenancePlanFn(item.id)
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
    /* 点击导出维保计划 */
    exportClick() {
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: MAINTENCE_PLAN,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 导出弹窗关闭
    dialogEvt() {
      this.showExportDialog = false
    },
    getLabel(val, list) {
      return this[list].find((item) => {
        return item.value === val
      }).label
    },
    resetSearch() {
      this.searchData.planName = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        inline
        label-width="100"
        :model="searchData"
        @submit.native.prevent
      >
        <el-form-item
          prop="assetDeviceName"
          label="计划名称"
        >
          <el-input
            v-model="searchData.planName"
            placeholder="计划名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
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
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <!-- excel导出 -->
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('maintenance_plan_add')"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
        <el-button
          class="export-excel"
          icon="el-icon-upload2"
          @click="exportClick"
        >
          导出计划
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="92%"
      >
        <el-table-column
          label="计划名称"
          align="center"
          prop="planName"
          min-width="180"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="editPlan(scope.row)"
            >{{ scope.row.planName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="部门车间"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="设备"
          align="center"
          prop="deviceNameList"
          min-width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.deviceNameList.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="执行人"
          align="center"
          prop="executeUsernameList"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.executeUsernameList.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="周期"
          align="center"
          prop="cycleValue"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="cycleFiled"
        >
          <template slot-scope="scope">
            <span>{{ getLabel(scope.row.cycleFiled, 'cycleOptions') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="开始时间"
          align="center"
          prop="planStartDate"
          min-width="150"
        />
        <el-table-column
          label="结束时间"
          align="center"
          prop="planEndDate"
          min-width="150"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="planState"
        >
          <template slot-scope="scope">
            <span>{{ getLabel(scope.row.planState, 'stateOptions') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="right"
          width="210"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="viewPlan(scope.row)"
            >
              查看
            </EButton>
            <EButton
              v-if="hasBtnPermission('maintenance_plan_modify')"
              icon="edit"
              type="text"
              @click="editPlan(scope.row)"
            >
              编辑
            </EButton>
            <EMoreButton
              icon="more"
              text="更多"
              :list="getMoreButton(scope.row)"
              @publish="changeState(scope.row.id, '2')"
              @stop="changeState(scope.row.id, '3')"
              @delete="delFn(scope.row)"
            />
            <!-- <EButton
              btnIcon="el-icon-s-promotion"
              @click="changeState(scope.row.id, '2')"
              type="text"
              v-if="scope.row.planState === '1' || scope.row.planState === '3'"
            >
              发布
            </EButton>
            <EButton icon="stop" @click="changeState(scope.row.id, '3')" type="text" v-if="scope.row.planState === '2'">停用</EButton>
            <EButton icon="delete" type="text" @click="delPlan(scope.row)" v-if="hasBtnPermission('maintenance_plan_delete')"> 删除 </EButton> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>

    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="dialogEvt($event, 'export')"
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
