/* * @Author: yangjie 演练记录页面 * @Date: 2023-03-14 14:55:13 */
<script>
import { deleteDrillRecord, queryDrillRecord } from '@/http/contingency/drillRecord.js' // 演练记录接口路径
import { DRILL_RECORD } from '@/http/excel-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import DrillRecordDetail from './dialog/drillRecordDetail'

export default {
  components: {
    OwnDeparmentTree,
    DrillRecordDetail,
    ExcelExport,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sDate: '', // 时间
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      keyWords: '', // 关键字
      startTime: '', // 开始时间
      endTime: '', // 开始时间
    },
    companyName: '',
    pickerOptions: {
      shortcuts: [
        {
          text: '近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          },
        },
      ],
    },
    fromEvaluate: false, // 判断是否从评价管理页面跳转过来的，默认false
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.companyName = userData.companyName
    // 从评价管理过来的话，携带的参数
    this.fromEvaluate = this.$route.params.fromEvaluate || false
    this.sForm.departmentId = this.$route.params.departmentId || ''
    this.sForm.startTime = this.$route.params.startDate || ''
    this.sForm.endTime = this.$route.params.endDate || ''
    this.getDataList()
  },
  methods: {
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      const params = Object.assign({}, this.sForm)
      if (this.sDate) {
        params.startTime = this.sDate[0]
        params.endTime = this.sDate[1]
      }
      queryDrillRecord(params)
        .then((data) => {
          if (data.success) {
            // data.result.list?.forEach((item) => {
            //   item.companyName = this.companyName
            // })

            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 弹框回调
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 复核、查看、修改
    toDetailClick(row, method) {
      this.$refs.DrillRecordDetail.init(row, method)
    },
    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        keyWords: '', // 关键字
        startTime: '', // 开始时间
        endTime: '', // 开始时间
      })
      this.sDate = ''
      this.getDataList()
    },
    // 删除数据
    delFn(row) {
      this.$confirm('您确认要删除数据么', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return deleteDrillRecord(row.id)
        })
        .then((res) => {
          if (res.code == 200) {
            this.getDataList()
            this.$message.success(res.message || '删除成功')
          }
          else {
            this.$message.error(res.message || '删除失败!')
          }
        })
        .catch(() => {})
    },
    // 从评价管理跳转过来的，需要展示返回按钮
    goBack() {
      this.$router.back(-1)
    },
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: DRILL_RECORD,
        reqData: params,
      }
      this.showExportDialog = true
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="!fromEvaluate"
    :isShowSearch="!fromEvaluate"
  >
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 表单 -->
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="keyWords"
          label="关键字"
        >
          <el-input
            v-model="sForm.keyWords"
            placeholder="关键字"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="选择时间">
          <el-date-picker
            v-model="sDate"
            size="mini"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
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
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('drill_record_add') && !fromEvaluate"
          type="primary"
          size="mini"
          icon="el-icon-plus"
          plain
          @click="toDetailClick(null, 'add')"
        >
          新增
        </el-button>
        <el-button
          icon="el-icon-download"
          plain
          @click="exportClick"
        >
          导出
        </el-button>
        <el-button
          v-if="fromEvaluate"
          type="primary"
          plain
          @click="goBack"
        >
          返回
        </el-button>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :border="true"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="公司名称"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="演练时间"
          prop="drillTime"
          align="center"
        />
        <el-table-column
          label="演练状态"
          prop="drillState"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.drillState == 0 ? '未演练' : '已演练' }}
          </template>
        </el-table-column>
        <el-table-column
          label="演练方式"
          prop="drillWay"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('drillWay', scope.row.drillWay) }}
          </template>
        </el-table-column>
        <el-table-column
          label="演练计划"
          prop="drillPlanName"
          align="center"
        />
        <el-table-column
          label="应急预案"
          prop="drillItem"
          align="center"
        />
        <el-table-column
          label="人员数量"
          prop="personNumber"
          align="center"
        />
        <el-table-column
          label="演练内容"
          prop="drillContent"
          align="center"
          min-width="160"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <RichText :des="scope.row.drillContent" />
          </template>
        </el-table-column>

        <el-table-column
          label="演练地点"
          prop="drillSite"
          align="center"
        />
        <el-table-column
          label="操作"
          min-width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('drill_record_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <!-- <el-button v-if="hasBtnPermission('drill_record_rectify') && scope.row.isRectify && !fromEvaluate && scope.row.rectifyStatus != 2" @click="toDetailClick(scope.row, 'check')" type="text">整改</el-button> -->
            <el-button
              v-if="
                hasBtnPermission('drill_record_modify') && !scope.row.isRectify && !fromEvaluate
              "
              type="text"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <el-button
              v-if="
                hasBtnPermission('drill_record_delete') && !scope.row.isRectify && !fromEvaluate
              "
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 新增、编辑、查看弹框 -->
    <drill-record-detail
      slot="dialog"
      ref="DrillRecordDetail"
      @refreshList="searchFn"
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
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
