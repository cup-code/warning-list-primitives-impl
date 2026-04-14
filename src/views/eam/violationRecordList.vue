/* * @Author: xiaorui 巡检中的违规记录列表页面 * @Date: 2022-05-20 10:30:23 * @Last
Modified by: xiaorui * @Last Modified time: 2022-08-05 15:39:20 */
<script>
import { cloneDeep } from 'lodash'
import {
  getViolationAuditStateCountFn,
  getViolationRecordFn,
} from '@/http/dev_new/inspection-api'
import { INSPECTION_VIOLATTON } from '@/http/excel-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ViolationAuditForm from './form/violationAuditForm'

export default {
  components: {
    OwnDeparmentTree,
    ViolationAuditForm,
    ExcelExport,
  },
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        postId: '', // 违规岗位
        planName: '', // 计划名称
        startDate: '', // 违规开始时间
        endDate: '', // 违规结束时间
        violationType: '', // 违规类型.未按时做:NOT_ON_TIME;未做:NOT_DONE
      },
      postList: [], // 岗位list
      violationTypeList: [
        {
          label: '未按时做',
          value: 'NOT_ON_TIME',
          id: 1,
        },
        {
          label: '未做',
          value: 'NOT_DONE',
          id: 2,
        },
      ], // 违规类型list
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      isShow: false,
      statusOptions: [], // 状态集合
      isDisabled: false,
      endDatePicker: this.processDate(),
    }
  },
  created() {
    const companyId = this.$store.state.user.user.companyId
    getAllPostByCompanyFn(companyId).then(({ data }) => {
      this.postList = data.result || []
    })
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 审核
    auditFn(row) {
      this.$refs.violationAuditForm.init(row)
    },
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
      // 获取巡检违规记录列表的时候需要深拷贝，因为状态为全部的时候，调接口的时候需要删除状态的key
      // 获取状态列表
      const arr = [
        getViolationRecordFn(cloneDeep(this.sForm)),
        getViolationAuditStateCountFn(this.sForm),
      ]
      Promise.all(arr)
        .then((res) => {
          this.loading = false
          const recordList = res[0].data // 违规记录列表的数据
          const stateList = res[1].data // 状态列表的数据
          if (recordList.success) {
            this.tableData = recordList.result.list || []
            this.total = recordList.result.total
          }
          else {
            this.$message.error(recordList.message || '查询违规记录失败')
          }
          if (stateList.success) {
            let totalCount = 0
            stateList.result.forEach((item) => {
              item.label
                = item.auditResult === '1'
                  ? '待审核'
                  : item.auditResult === '2'
                    ? '误报'
                    : '确认违规'
              totalCount += item.count
            })
            this.statusOptions = [
              {
                auditResult: 'all',
                label: '全部',
                count: totalCount,
              },
            ].concat(stateList.result || [])
          }
          else {
            this.$message.error(stateList.message || '查询状态失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询失败')
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 点击状态tag
    statusChange(state) {
      this.sForm.auditResult = state === this.sForm.auditResult ? '' : state // 如果未选中则选中，如果已选中则置空
      this.searchFn()
    },
    getLabel(val, list) {
      return (
        this[list].find((item) => {
          return item.value === val
        }) || {}
      ).label
    },
    //  校验结束时间不能大约开始时间
    processDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.sForm.startDate) {
            // 如果开始时间不为空，则结束时间大于开始时间
            return new Date(self.sForm.startDate).getTime() > time.getTime()
          }
        },
      }
    },
    /* 点击导出巡检违规记录 */
    exportClick() {
      if (!this.sForm.startDate || !this.sForm.endDate) {
        this.$message.warning('请选择违规时间')
        return
      }
      const params = {}
      for (const key in this.sForm) {
        if (this.sForm[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: INSPECTION_VIOLATTON,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 导出弹窗关闭
    dialogEvt() {
      this.showExportDialog = false
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    // 获取创建开始时间
    getStartTime() {
      if (this.sForm.startDate) {
        this.isDisabled = false
      }
    },
    // 获取创建结束时间
    getEndTime(e) {
      if (!this.sForm.startDate) {
        this.isDisabled = true
        this.$message.warning('请先选择开始时间')
      }
    },
    resetEvent() {
      this.sForm.planName = ''
      this.sForm.postId = ''
      this.sForm.violationType = ''
      // this.timeValue = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.getDataList()
    },
    showAuditBtn(row) {
      const userId = this.$store.state.user.user.id
      return (
        row.auditResult === '1'
        && (row.violationAuditUserIdList || []).includes(userId)
      )
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />

    <ECard
      slot="search"
      customStyle="margin-bottom:0;"
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        @submit.native.prevent
      >
        <el-form-item prop="planName" label="违规计划">
          <el-input
            v-model="sForm.planName"
            placeholder="计划名称"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item prop="model" label="违规岗位">
          <el-select
            v-model="sForm.postId"
            placeholder="请选择"
            filterable
            clearable
          >
            <el-option
              v-for="item in postList"
              :key="item.id"
              :label="item.postName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="model" label="违规类型">
          <el-select
            v-model="sForm.violationType"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in violationTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="违规开始时间"
          prop="startDate"
        >
          <el-date-picker
            v-model="sForm.startDate"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="违规开始时间"
            @change="getStartTime"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="违规结束时间"
          prop="endDate"
        >
          <el-date-picker
            v-model="sForm.endDate"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="违规结束时间"
            :disabled="isDisabled"
            :picker-options="endDatePicker"
            @focus="getEndTime"
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
        </el-form-item>
        <el-form-item>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            :loading="loading"
            @click="resetEvent"
          >
            重置
          </el-button>
        </el-form-item>
        <el-form-item v-if="!isShow">
          <el-button
            type="text"
            icon="el-icon-arrow-down"
            @click="openUp"
          >
            高级筛选
          </el-button>
        </el-form-item>
        <el-form-item v-else>
          <el-button
            type="text"
            icon="el-icon-arrow-up"
            style="color: black"
            @click="putAway"
          >
            收起
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table" style="height: 100%">
      <div class="card-cell">
        <EButton
          class="export-excel"
          btnIcon="el-icon-upload2"
          @click="exportClick"
        >
          导出记录
        </EButton>
        <EButton
          v-for="(item, index) in statusOptions"
          :key="index"
          type="info"
          plain
          :effect="sForm.auditResult === item.auditResult ? 'dark' : 'plain'"
          @click="statusChange(item.auditResult)"
        >
          {{ item.label }}
          {{ item.count }}
        </EButton>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="92%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="违规计划"
          prop="planName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="所属部门"
          prop="departmentName"
          align="center"
        />
        <el-table-column
          label="违规岗位"
          prop="postName"
          align="center"
        />
        <el-table-column
          label="违规人员"
          prop="violationUserName"
          align="center"
        />
        <el-table-column
          label="违规时间"
          prop="violationTime"
          align="center"
          min-width="200"
        />
        <el-table-column
          label="违规班次"
          prop="taskName"
          align="center"
          min-width="200"
        />
        <el-table-column
          label="违规原因"
          prop="violationReasons"
          align="left"
          min-width="200"
        />
        <el-table-column
          label="违规类型"
          prop="violationType"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ getLabel(scope.row.violationType, "violationTypeList") }}
          </template>
        </el-table-column>
        <el-table-column
          label="审核结果"
          prop="auditResult"
          align="center"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.auditResult === '1'">
              待审核
            </el-tag>
            <el-tag v-if="props.row.auditResult === '2'" type="warning">
              误报
            </el-tag>
            <el-tag v-if="props.row.auditResult === '3'" type="danger">
              确认违规
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="处理意见"
          prop="handlingOpinions"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="操作"
          min-width="120"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="showAuditBtn(scope.row)"
              type="text"
              @click="auditFn(scope.row)"
            >
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
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

    <!-- 审核的弹框 -->
    <violation-audit-form
      slot="dialog"
      ref="violationAuditForm"
      @refreshDataList="getDataList"
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
        @close="dialogEvt($event, 'export')"
      />
    </el-dialog>
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm {
  margin-bottom: 10px;
}
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.tagStyle {
  cursor: pointer;
  border: 1px solid #11c8e5;
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  border-radius: 3px;
  margin-left: 5px;
  color: #11c8e5;
}
.tagStyle:hover {
  background: #11c8e5;
  color: #ffffff;
}
</style>
