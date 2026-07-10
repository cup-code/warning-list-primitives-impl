/* * @Author: xiaorui 巡检记录页面 * @Date: 2022-05-17 16:27:18 * @Last Modified by:
xiaorui * @Last Modified time: 2022-08-10 11:15:01 */
<script>
import { getInspectionRecordFn } from '@/http/dev_new/inspection-api'
import { INSPECTION_RECORD } from '@/http/excel-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
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
        taskName: '', // 任务名称
        departmentId: '', // 组织机构id
        postId: '', // 巡检岗位
        startDate: '', // 开始时间
        endDate: '', // 结束时间
        abnormal: null, // 是否异常
      },
      isShow: false,
      postList: [], // 岗位list
      timeValue: '', // 搜索条件中的起止时间
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
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
    getDataList() {
      // 查询计划
      this.loading = true
      getInspectionRecordFn(this.sForm).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.tableData = data.result.list || []
          this.total = data.result.total || 0
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      })
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录 部门名字 和 id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    /* 点击导出巡检记录 */
    exportClick() {
      if (!this.sForm.startDate || !this.sForm.endDate) {
        this.$message.warning('请选择巡检时间')
        return
      }
      const params = {}
      for (const key in this.sForm) {
        if (this.sForm[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: INSPECTION_RECORD,
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
    // 查看详情
    viewFn(id) {
      this.$router.push({
        path: `/detail/inspectionRecordDetail/${id}`,
      })
    },
    // 查询按钮
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },

    // 获取创建开始时间
    getStartTime(e) {
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
      this.sForm.taskName = ''
      this.sForm.postId = ''
      this.sForm.abnormal = ''
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
  <KyTreeTable ref="treeTable">
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
        <el-form-item prop="taskName" label="任务名称">
          <el-input
            v-model="sForm.taskName"
            placeholder="任务名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item prop="model" label="巡检岗位">
          <el-select
            v-model="sForm.postId"
            placeholder="请选择"
            filterable
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in postList"
              :key="item.id"
              :label="item.postName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="abnormal" label="结果">
          <el-select
            v-model="sForm.abnormal"
            placeholder="请选择"
            clearable
          >
            <el-option label="正常" :value="false" />
            <el-option label="异常" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="巡检开始时间"
          prop="startDate"
        >
          <el-date-picker
            v-model="sForm.startDate"
            style="width: 180px"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="开始时间"
            @change="getStartTime"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="巡检结束时间"
          prop="endDate"
        >
          <el-date-picker
            v-model="sForm.endDate"
            style="width: 180px"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="结束时间"
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
          导出计划
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        height="92%"
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
          label="任务名称"
          prop="taskName"
          align="center"
          min-width="200"
        >
          <template slot-scope="scope">
            <span class="check" @click="viewFn(scope.row.scheduleRecordId)">{{
              scope.row.taskName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="排班时间"
          align="center"
          min-width="200"
        >
          <template slot-scope="scope">
            {{ `${scope.row.scheduleStartTime}至${scope.row.scheduleEndTime}` }}
          </template>
        </el-table-column>
        <el-table-column
          label="所属部门"
          prop="departmentName"
          align="center"
        />

        <el-table-column
          label="巡检岗位"
          prop="postName"
          align="center"
        />
        <el-table-column
          label="责任人"
          prop="liableUserName"
          align="center"
        />
        <el-table-column
          label="巡检人"
          prop="executeUsersName"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ (scope.row.executeUsersName || []).join(",") }}
          </template>
        </el-table-column>
        <el-table-column
          label="开始时间"
          prop="executeStartTime"
          align="center"
          min-width="146"
        />
        <el-table-column
          label="结束时间"
          prop="executeEndTime"
          align="center"
          min-width="146"
        />
        <el-table-column
          label="结果"
          prop="abnormal"
          align="center"
        >
          <template slot-scope="props">
            <el-tag v-if="props.row.abnormal" type="danger">
              异常
            </el-tag>
            <el-tag v-if="!props.row.abnormal" type="success">
              正常
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
              type="text"
              @click="viewFn(scope.row.scheduleRecordId)"
            >
              查看详情
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
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.sForm {
  margin-bottom: 10px;
}
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
