/* * @Author: xiaorui 目标责任书台账，已签署的 * @Date: 2023-04-25 17:16:12 * @Last Modified by:
xiaorui * @Last Modified time: 2023-06-09 15:33:32 */
<script>
import { FORMULATE_SIGNED_LIST } from '@/http/excel-api'
import { getSignedListByPageFn } from '@/http/safeProductionTarget/safe-production-target-api'
import { showFileWindow } from '@/utils/checkFile.js'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import SignDetailDialog from './dialog/signDetailDialog'

export default {
  components: {
    OwnDeparmentTree,
    SignDetailDialog,
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
      signType: '', // 签署类型
      startDate: '',
      endDate: '',
    },
    timeValue: '', // 搜索条件中的起止时间
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
      getSignedListByPageFn(this.sForm)
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
    // 获取起止时间
    getTimeValue(v) {
      if (v && v.length) {
        this.sForm.startDate = `${v[0]} 00:00:00`
        this.sForm.endDate = `${v[1]} 23:59:59`
      }
      else {
        this.sForm.startDate = ''
        this.sForm.endDate = ''
      }
    },
    // 查看
    clickFn(row) {
      this.$refs.signDetailDialog.init(row)
    },
    resetEvent() {
      this.$refs.sForm.resetFields()
      this.timeValue = []
      this.sForm.startDate = ''
      this.sForm.endDate = ''
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
        businessData: FORMULATE_SIGNED_LIST,
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
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="signUsername"
        label="签署人员"
      >
        <el-input
          v-model="sForm.signUsername"
          placeholder="姓名"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item
        prop="signType"
        label="签署类型"
      >
        <el-select
          v-model="sForm.signType"
          placeholder="请选择"
          filterable
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('target_sign_type')"
            :key="item.id"
            :label="item.dictName"
            :value="+item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker
          v-model="timeValue"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @change="getTimeValue"
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
        label="下发日期"
        prop="initiatorTime"
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
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="签署日期"
        prop="createdTime"
        align="center"
      />
      <el-table-column
        label="签署数量"
        prop="signUserNum"
        align="center"
      />
      <el-table-column
        label="提取考核基金(元)"
        prop="assessTotal"
        align="center"
      />
      <el-table-column
        label="提取比例"
        prop="assessRate"
        align="center"
      >
        <template slot-scope="scope">
          {{ `${scope.row.assessRate * 100}%` }}
        </template>
      </el-table-column>
      <el-table-column
        label="实际提取金额(元)"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.assessTotal * scope.row.assessRate }}
        </template>
      </el-table-column>
      <el-table-column
        label="签署类型"
        prop="signType"
        align="center"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('target_sign_type', scope.row.signType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="附件"
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
        label="签署状态"
        prop="signStatus"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.signStatus === 0 ? '未签署' : '签署完成' }}</span>
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
            @click="clickFn(scope.row)"
          >
            查看
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
    <sign-detail-dialog
      slot="dialog"
      ref="signDetailDialog"
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
