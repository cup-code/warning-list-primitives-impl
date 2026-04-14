/* * @Author: yangjie 演练计划页面 * @Date: 2023-03-14 14:55:13 */
<script>
import { deleteDrillPlan, queryDrillPlan } from '@/http/contingency/drillPlan.js' // 演练计划接口路径
import { importDrillPlan } from '@/http/safeIn-api'
import { showFileWindow } from '@/utils/checkFile.js'
import { getAuthToken } from '@/utils/tab-session'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ContingencyPlanRecord from './dialog/contingencyPlanRecord'
import DrillPlanDetail from './dialog/drillPlanDetail'

export default {
  components: {
    OwnDeparmentTree,
    DrillPlanDetail,
    ContingencyPlanRecord,
  },
  data: () => ({
    cannot: false,
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      dutyDept: '',
      planType: '', // 预案类型
      drillName: '', // 计划名称
      flowCore: '', // 审批状态
      isPlanExecute: '', // 是否执行
      planCategory: '', // 计划分类
      showMore: false,
    },
    companyName: '', // 所属公司
    dutyDeptName: '', // 所属部门
    planTypeOptions: [], // 预案类型数据
    dataUploadParams: {
      header: {
        Authorization: getAuthToken(),
        clientChannel: 'WEB',
      },
      accept: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    },
  }),
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.companyName = userData.companyName
    this.dutyDeptName = userData.departmentName
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
      this.sForm.dutyDept = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      queryDrillPlan(this.sForm)
        .then((data) => {
          if (data.success) {
            // data.result.list?.forEach((item) => {
            //   item.companyName = this.companyName
            //   item.dutyDeptName = this.dutyDeptName
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
      if (method == 'record') {
        this.$refs.ContingencyPlanRecord.init(row, method)
      }
      else {
        this.$refs.DrillPlanDetail.init(row, method)
      }
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        dutyDept: '',
        planType: '', // 预案类型
        drillName: '', // 计划名称
        flowCore: '', // 审批状态
        isPlanExecute: '', // 是否执行
        planCategory: '', // 计划分类
        showMore: false,
      })
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
          return deleteDrillPlan(row.id)
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
    toggleMore() {
      this.sForm.showMore = !this.sForm.showMore
    },
    // 下载导入模板
    downloadDataImportTemplateClick() {
      this.$utils.download('/excel/getImportTemplate/DrillPlan', null)
    },
    // 上传前验证
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    // 上传
    uploadDataImportTemplateClick(data) {
      const params = {
        file: data.file,
      }
      importDrillPlan(params)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getDataList()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable">
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
        label-width="62px"
        @submit.native.prevent
      >
        <el-form-item label="预案类型">
          <el-select
            v-model="sForm.planType"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('planType')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划名称">
          <el-input
            v-model="sForm.drillName"
            placeholder="计划名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="sForm.showMore"
          label="审批状态"
        >
          <el-select
            v-model="sForm.flowCore"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('auditStatus')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictName"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="sForm.showMore"
          label="是否执行"
        >
          <el-select
            v-model="sForm.isPlanExecute"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in [
                { id: 1, name: '是', value: true },
                { id: 2, name: '否', value: false },
              ]"
              :key="item.id"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="sForm.showMore"
          label="计划分类"
        >
          <el-select
            v-model="sForm.planCategory"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('planCategory')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
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
          <el-button
            type="text"
            style="margin-left: 8px"
            @click="toggleMore"
          >
            {{ sForm.showMore == true ? '收起' : '高级筛选' }}
            <i :class="sForm.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('drill_plan_add')"
          type="primary"
          size="mini"
          icon="el-icon-plus"
          plain
          :disabled="cannot"
          @click="toDetailClick(null, 'add')"
        >
          新增
        </el-button>
        <el-dropdown style="margin: 0 10px">
          <el-button
            type="success"
            icon="el-icon-upload2"
            plain
          >
            导入
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <el-button
                type="success"
                icon="el-icon-download"
                plain
                @click="downloadDataImportTemplateClick"
              >
                下载数据模板
              </el-button>
            </el-dropdown-item>

            <el-dropdown-item>
              <el-upload
                ref="fileUpload"
                action="#"
                name="file"
                :headers="dataUploadParams.header"
                :limit="1"
                :accept="dataUploadParams.accept.toString()"
                :http-request="uploadDataImportTemplateClick"
                :before-upload="onBeforeUpload"
                :show-file-list="false"
                :auto-upload="true"
              >
                <el-button
                  type="success"
                  icon="el-icon-upload2"
                  plain
                >
                  导入模板数据
                </el-button>
              </el-upload>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :border="false"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="所属公司"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="计划名称"
          prop="drillName"
          align="center"
        />
        <el-table-column
          label="参演对象"
          prop="drillObject"
          align="center"
        />
        <el-table-column
          label="演练时间"
          prop="drillTime"
          align="center"
        />
        <el-table-column
          label="预案类型"
          prop="planType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('planType', scope.row.planType) }}
          </template>
        </el-table-column>

        <!-- <el-table-column label="演练依据" prop="drillItem" align="center">
        <template slot-scope="scope"> {{ $dictUtils.getDictLabel('drillAccording', scope.row.drillItem) }}</template>
      </el-table-column> -->
        <el-table-column
          label="演练依据"
          prop="drillItem"
          align="center"
        />

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
          label="负责人"
          prop="dutyPersonName"
          align="center"
        />
        <el-table-column
          label="负责部门"
          prop="dutyDeptName"
          align="center"
        />
        <el-table-column
          label="附件"
          align="center"
          prop="docPath"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.docPath"
              type="text"
              @click="showFileWindow(scope.row.docPath)"
            >
              查看
            </el-button>
            <el-tag v-else>
              无
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="演练状态"
          prop="isPlanExecute"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.isPlanExecute ? '已演练' : '未演练' }}
          </template>
        </el-table-column>
        <el-table-column
          label="审批状态"
          prop="flowCore"
          align="center"
        />
        <el-table-column
          label="操作"
          min-width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('drill_plan_turn')"
              type="text"
              @click="toDetailClick(scope.row, 'record')"
            >
              流转记录
            </el-button>
            <el-button
              v-if="hasBtnPermission('drill_plan_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <el-button
              v-if="
                hasBtnPermission('drill_plan_modify')
                  && !scope.row.isShow
                  && scope.row.flowCore !== '审核通过'
              "
              type="text"
              :disabled="cannot"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <!-- <el-button v-if="hasBtnPermission('drill_plan_audit') && scope.row.isShow" @click="toDetailClick(scope.row, 'check')" type="text">审核</el-button> -->
            <el-button
              v-if="hasBtnPermission('drill_plan_delete') && !scope.row.isShow"
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              :disabled="cannot"
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

    <!-- 新增、编辑弹框 -->
    <Drill-plan-detail
      slot="dialog"
      ref="DrillPlanDetail"
      @refreshList="searchFn"
    />
    <!-- 流转记录 -->
    <contingency-plan-record
      slot="dialog"
      ref="ContingencyPlanRecord"
      @refreshList="searchFn"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
