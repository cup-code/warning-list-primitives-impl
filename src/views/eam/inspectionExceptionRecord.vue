/* * @Author: xiaorui 巡检异常记录页面 * @Date: 2022-05-18 09:32:00 * @Last Modified by:
xiaorui * @Last Modified time: 2022-08-16 17:47:19 */
<script>
import { cloneDeep } from 'lodash'
import {
  getAuditStateCountFn,
  getExceptionRecordFn,
} from '@/http/dev_new/inspection-api'
import { INSPECTION_EXCEPTION_RECORD } from '@/http/excel-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo'
import AuditForm from './form/auditForm'

export default {
  components: {
    OwnDeparmentTree,
    AuditForm,
    SafeBookInfo,
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
        inspectionType: '', // 巡检类型：日常巡检-1；专业点检-2；精密点检-3；辅助纪录-4
        planName: '', // 计划名称
        auditResult: '', // 审核结果.误报:0;问题:1;安全隐患:2;直接处理:3
        auditState: '', // 审核状态.待审核:0;处理中:1;已处理:2
        startDate: '', // 开始时间
        endDate: '', // 结束时间
      },
      typeList: [
        {
          label: '日常巡检',
          value: '1',
          id: 1,
        },
        {
          label: '专业点检',
          value: '2',
          id: 2,
        },
        {
          label: '精密点检',
          value: '3',
          id: 3,
        },
        {
          label: '辅助记录',
          value: '4',
          id: 4,
        },
      ], // 巡检类型list
      resultList: [
        {
          label: '误报',
          value: '0',
        },
        {
          label: '问题',
          value: '1',
        },
        {
          label: '安全隐患',
          value: '2',
        },
        {
          label: '直接处理',
          value: '3',
        },
      ],
      statusOptions: [], // 状态集合
      showInfoDialog: false, // 如果审核之后是问题或隐患，查看详情的弹框
      propData: {}, // 传递给详情页面的数据
      timeValue: '', // 搜索条件中的起止时间
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
      isShow: false,
      isDisabled: false,
      endDatePicker: this.processDate(),
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 查看
    viewFn(troubleId) {
      this.propData = {
        troubleId,
        isDevice: true,
      }
      this.showInfoDialog = true
    },
    // 审核
    auditFn(row) {
      this.$refs.auditForm.init(row)
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
      // 获取巡检异常记录列表的时候需要深拷贝，因为状态为全部的时候，调接口的时候需要删除状态的key
      // 获取状态列表
      const arr = [
        getExceptionRecordFn(cloneDeep(this.sForm)),
        getAuditStateCountFn(this.sForm),
      ]
      Promise.all(arr)
        .then((res) => {
          this.loading = false
          const recordList = res[0].data // 异常记录列表的数据
          const stateList = res[1].data // 状态列表的数据
          if (recordList.success) {
            this.tableData = recordList.result.list || []
            this.total = recordList.result.total
          }
          else {
            this.$message.error(recordList.message || '查询异常记录失败')
          }
          if (stateList.success) {
            let totalCount = 0
            stateList.result.forEach((item) => {
              item.label
                = item.auditState === '0'
                  ? '待审核'
                  : item.auditState === '1'
                    ? '处理中'
                    : '已处理'
              totalCount += item.count
            })
            this.statusOptions = [
              {
                auditState: 'all',
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
      this.sForm.auditState = state === this.sForm.auditState ? '' : state // 如果未选中则选中，如果已选中则置空
      this.searchFn()
    },
    getLabel(val, list) {
      return this[list].find((item) => {
        return item.value === val
      }).label
    },
    /* 点击导出巡检异常记录 */
    exportClick() {
      if (!this.sForm.startDate || !this.sForm.endDate) {
        this.$message.warning('请选择异常时间')
        return
      }
      const params = {}
      for (const key in this.sForm) {
        if (this.sForm[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: INSPECTION_EXCEPTION_RECORD,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 导出弹窗关闭
    dialogEvt() {
      this.showExportDialog = false
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
    // 重置按钮
    resetEvent() {
      this.sForm.planName = ''
      this.sForm.inspectionType = ''
      this.sForm.auditResult = ''
      this.timeValue = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.getDataList()
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
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <ECard
      slot="search"
      type="search"
      customStyle="margin-bottom:0;"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        @submit.native.prevent
      >
        <el-form-item prop="planName" label="计划名称">
          <el-input
            v-model="sForm.planName"
            placeholder="计划名称"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item prop="model" label="巡检类型">
          <el-select
            v-model="sForm.inspectionType"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="model" label="审核结果">
          <el-select
            v-model="sForm.auditResult"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in resultList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="异常开始时间"
          prop="startDate"
        >
          <el-date-picker
            v-model="sForm.startDate"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="异常开始时间"
            @change="getStartTime"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="异常结束时间"
          prop="endDate"
        >
          <el-date-picker
            v-model="sForm.endDate"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="异常结束时间"
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

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          class="export-excel"
          icon="el-icon-upload2"
          @click="exportClick"
        >
          导出记录
        </el-button>
        <EButton
          v-for="(item, index) in statusOptions"
          :key="index"
          size="mini"
          :effect="sForm.auditState === item.planState ? 'dark' : 'plain'"
          @click="statusChange(item.auditState)"
        >
          {{ item.label }}
          {{ item.count }}
        </EButton>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        height="calc(100vh - 280px)"
        :data="tableData"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="巡检基准"
          prop="inspectionBenchmark"
          align="center"
          min-width="220"
        />
        <el-table-column
          label="观察量"
          prop="executeResult"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="计划名称"
          prop="planName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="巡检班次"
          prop="taskName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="所属部门"
          prop="departmentName"
          align="center"
        />
        <el-table-column
          label="巡检类型"
          prop="inspectionType"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ getLabel(scope.row.inspectionType, "typeList") }}
          </template>
        </el-table-column>
        <el-table-column
          label="巡检岗位"
          prop="postName"
          align="center"
        />
        <el-table-column
          label="巡检人"
          prop="executeUsername"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="异常时间"
          prop="executeDate"
          align="center"
          min-width="220"
        />
        <el-table-column
          label="状态"
          prop="auditState"
          align="center"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.auditState === '0'">
              待审核
            </el-tag>
            <el-tag v-if="props.row.auditState === '1'" type="warning">
              处理中
            </el-tag>
            <el-tag v-if="props.row.auditState === '2'" type="success">
              已处理
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="审核结果"
          prop="auditResult"
          align="center"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.auditResult === '0'">
              误报
            </el-tag>
            <el-tag v-if="props.row.auditResult === '1'" type="warning">
              问题
            </el-tag>
            <el-tag v-if="props.row.auditResult === '2'" type="danger">
              安全隐患
            </el-tag>
            <el-tag v-if="props.row.auditResult === '3'">
              直接处理
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="120"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.auditResult === '1' || scope.row.auditResult === '2'"
              type="text"
              @click="viewFn(scope.row.troubleId)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="scope.row.auditState === '0'"
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
    <audit-form
      slot="dialog"
      ref="auditForm"
      @refreshDataList="getDataList"
    />
    <!-- 查看详情的弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
      >
        <div slot="title" class="dialog-header">
          <div class="dialog-title">
            异常详情
          </div>
        </div>
        <SafeBookInfo v-if="showInfoDialog" v-bind="propData" />
      </el-dialog>
    </div>
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
.dialog-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .dialog-title {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
