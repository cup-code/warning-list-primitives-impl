/* * @Author: xiaorui 制定目标责任页面 * @Date: 2023-04-20 10:12:34 * @Last Modified by: xiaorui *
@Last Modified time: 2023-12-18 14:32:19 */
<script>
import { FORMULATE_TARGET } from '@/http/excel-api'
import {
  deleteTargetFn,
  getTargetListByPageFn,
} from '@/http/safeProductionTarget/safe-production-target-api'
import { showFileWindow } from '@/utils/checkFile.js'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import FormulateTargetDialog from './dialog/formulateTargetDialog'

export default {
  components: {
    OwnDeparmentTree,
    FormulateTargetDialog,
    ExcelExport,
  },
  data: () => ({
    loading: false,
    companyId: '', // 登录用户所属公司id，用于查询左侧组织架构树
    signStatusList: [
      {
        label: '未签署',
        value: 0,
      },
      {
        label: '签署完成',
        value: 1,
      },
    ],
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      dutyDepartId: '',
      signUsername: '', // 签署人姓名
      targetLevel: '', // 层级
      signStatus: '', // 签署状态
    },
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    this.companyId = this.$store.state.user.user.companyId
    this.getDataList()
  },
  methods: {
    showFileWindow,
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.dutyDepartId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      getTargetListByPageFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .catch(() => {
          this.$message.error('查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 翻译安全责任目标
    getTargetList(targetList) {
      return targetList
        .map((item) => {
          return this.$dictUtils.getDictLabel('safe_duty_target', item.type) + item.value
        })
        .join('，')
    },
    // 新增、查看、修改弹框
    clickFn(method, id) {
      this.$refs.formulateTargetDialog.init(method, id)
    },
    // 删除
    deleteFn(id) {
      this.$confirm('您确认删除此条信息？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteTargetFn(id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.warning(data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    canEdit(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为下发人，并且签署状态为未签署时，可修改
      return row.initiatorId === currentUserId && row.signStatus === 0
    },
    canSign(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为签署人，并且签署状态为未签署时，可签署
      return row.signPeople.id === currentUserId && row.signStatus === 0
    },
    resetEvent() {
      this.$refs.sForm.resetFields()
      this.sForm.pageNum = 1
      this.getDataList()
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: FORMULATE_TARGET,
        reqData: params,
      }
      this.showExportDialog = true
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <el-form
      slot="search"
      ref="sForm"
      :inline="true"
      :model="sForm"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="targetLevel"
        label="层级"
      >
        <el-select
          v-model="sForm.targetLevel"
          placeholder="请选择"
          filterable
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('target_level')"
            :key="item.id"
            :label="item.dictName"
            :value="+item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="signStatus"
        label="签署状态"
      >
        <el-select
          v-model="sForm.signStatus"
          placeholder="请选择"
          filterable
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="item in signStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="signUsername"
        label="签署人员"
      >
        <el-input
          v-model="sForm.signUsername"
          placeholder="姓名"
          clearable
          style="width: 140px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="searchFn"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-left"
          :loading="loading"
          @click="resetEvent"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        icon="el-icon-plus"
        type="primary"
        plain
        @click="clickFn('add')"
      >
        新增
      </el-button>
      <el-button
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
    </div>
    <el-table
      slot="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="100%"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="下发单位"
        prop="initiatorDepName"
        align="center"
      />
      <el-table-column
        label="下发人员"
        prop="initiatorName"
        align="center"
      />
      <el-table-column
        label="层级"
        prop="targetLevel"
        align="center"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('target_level', scope.row.targetLevel) }}
        </template>
      </el-table-column>
      <el-table-column
        label="责任单位"
        prop="dutyDepartName"
        align="center"
      />
      <el-table-column
        label="安全责任目标"
        prop="examineUserName"
        align="center"
        min-width="160"
      >
        <template slot-scope="scope">
          <span>{{ getTargetList(scope.row.targetList) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="签署部门"
        prop="departmentName"
        align="center"
      />
      <el-table-column
        label="签署人员"
        prop="signPeople"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.signPeople.fullName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="签署状态"
        prop="signStatus"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.signStatus === 0 ? '未签署' : '签署完成' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="签署材料"
        prop="docPath"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showFileWindow(scope.row.docPath)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="clickFn('view', scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            v-if="canEdit(scope.row)"
            type="text"
            style="color: var(--ky-warning)"
            @click="clickFn('edit', scope.row.id)"
          >
            修改
          </el-button>
          <el-button
            v-if="canSign(scope.row)"
            type="text"
            style="color: var(--ky-warning)"
            @click="clickFn('sign', scope.row.id)"
          >
            签署
          </el-button>
          <el-button
            v-if="canEdit(scope.row)"
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteFn(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="sForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="sForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getDataList"
      @current-change="getDataList"
    />
    <formulate-target-dialog
      slot="dialog"
      ref="formulateTargetDialog"
      @refreshDataList="searchFn"
    />
    <!-- excel导出 -->
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
        @close="showExportDialog = false"
      />
    </el-dialog>
  </TreeTable>
</template>
