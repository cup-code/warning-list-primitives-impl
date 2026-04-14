<script>
import moment from 'moment'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  certSafeManageByPage,
  certSafeManageDel,
  certSafeManageExcelAnalysis,
  certSafeManageExcelError,
  certSafeManageExcelHeaderData,
  certSafeManageExcelSave,
  certSafeManageExcelTemplate,
} from '@/http/base-module/certificateManager-api.js'
// 评价管理跳转过来用的
import { getLicenseByTypeId } from '@/http/base-module/staffCertificate-api.js'
import { getSaferItemDetailFn } from '@/http/evaluate-manage/evaluate-api'
import { showFileWindow } from '@/utils/checkFile.js'
import ExcelImport from '@/views/common-ui/excelHandle/ExcelImport.vue'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import ExcelExport from './components/ExcelExport.vue'
import RecheckInfo from './components/RecheckInfo.vue'
import SafeInfo from './components/SafeInfo.vue'

export default {
  components: {
    ExcelImport,
    ExcelExport,
    SafeInfo,
    RecheckInfo,
    SelectTree,
    OwnDeparmentTree,
  },
  data() {
    return {
      allDic: {},
      isLoading: false,
      dialogTitle: '', // 弹窗标题
      infoPropData: {},
      showInfoDialog: false,
      recheckPropData: {},
      showRecheckInfoDialog: false,
      showImportDialog: false,
      showExportDialog: false,
      // 导入传参
      importProp: {
        templateFunc: certSafeManageExcelTemplate,
        analysisExcelFunc: certSafeManageExcelAnalysis,
        saveExcelFunc: certSafeManageExcelSave,
        errorExcelFunc: certSafeManageExcelError,
        showList: [
          { label: '公司', prop: 'companyName' },
          { label: '部门', prop: 'departmentName' },
          { label: '姓名', prop: 'fullName' },
          { label: '证照类型', prop: 'licenceTypeName' },
          { label: '证照名称', prop: 'licenceCateGoryName' },
          { label: '证照号码', prop: 'licenceNumber' },
          { label: '取证日期', prop: 'startTime' },
          { label: '证件有效期', prop: 'endTime' },
          { label: '下次审核日期', prop: 'nextReview' },
          { label: '颁证单位', prop: 'mechanism' },
          { label: '是否特种作业', prop: 'isSpecialJob' },
        ],
      },
      // 导出传参
      exportProp: {
        reqData: {},
        pickList: [],
      },
      // 状态下拉列表
      stateList: [
        { name: '正常', value: 0 },
        { name: '过期', value: 1 },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
      },
      tableData: [],
      total: 0,
      showMoreSearch: false,
      defaultSpan: 6,
      userStatusList: [
        {
          label: '禁用',
          value: '0',
        },
        {
          label: '在职',
          value: '1',
        },
        {
          label: '借调',
          value: '2',
        },
        {
          label: '离职',
          value: '3',
        },
        {
          label: '退休',
          value: '4',
        },
      ],
      minWidth: 120,
      fromEvaluate: false, // 判断是否从评价管理页面跳转过来的，默认false
      categoryNameEnum: [],
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD')
        }
        return date
      }
    },
  },
  created() {
    // 从首页消息列表跳转过来的时候会带id，精准查出目标数据
    if (this.$route.query.id) {
      this.searchData.id = this.$route.query.id
    }
    // 从评价管理过来携带的参数
    this.fromEvaluate = this.$route.params.fromEvaluate || false
    if (this.fromEvaluate) {
      // 从评价管理-过来，查询部门逾期未审核的证照
      this.searchData.departmentId = this.$route.params.departmentId
      this.searchData.startDate = this.$route.params.startDate
      this.searchData.endDate = this.$route.params.endDate
      this.searchData.businessType = 'FAILURE_TO_REVIEW_THE_WALL_ON_TIME'
      this.backPageNum = this.$route.params.pageNum || 1 // 需要说明返回第几页
    }
    this.searchClick()
    this.getHeader()
    this.getPrefix()
    // 获取字典信息
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
  },
  methods: {
    showFileWindow,
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 20,
      }
      // this.$refs['companyTree'].refreshTree()
      this.$refs.formSearch.resetFields()
      this.searchClick()
    },
    /* 搜索 */
    searchClick() {
      this.isLoading = true
      const func = this.fromEvaluate ? getSaferItemDetailFn : certSafeManageByPage
      func(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 获取表头 */
    getHeader() {
      certSafeManageExcelHeaderData()
        .then((res) => {
          if (res.data.success) {
            const result = res.data.result
            this.exportProp.pickList = []
            Object.keys(result).forEach((key) => {
              const param = { label: result[key], value: key }
              this.exportProp.pickList.push(param)
            })
          }
          else {
            this.$message.warning(res.data.message || '获取表头失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表头出错', err)
        })
    },
    /* 点击导入 */
    importClick() {
      this.showImportDialog = true
    },
    /* 点击导出 */
    exportClick() {
      this.exportProp.reqData = {}
      for (const key in this.searchData) {
        if (!['pageNum', 'pageSize'].includes(key)) {
          this.exportProp.reqData[key] = this.searchData[key]
        }
      }
      this.showExportDialog = true
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        delete this.searchData.departmentId
      }
      this.queryClick()
    },
    /* 弹窗关闭回调 */
    dialogEvt(isRefresh, type) {
      switch (type) {
        case 'info':
          this.showInfoDialog = false
          break
        case 'recheck':
          this.showRecheckInfoDialog = false
          break
        case 'import':
          this.showImportDialog = false
          break
        case 'export':
          this.showExportDialog = false
          break
        default:
      }
      if (isRefresh) {
        this.searchClick()
      }
    },
    /* 点击添加 */
    addClick() {
      this.dialogTitle = '新增证照'
      this.infoPropData = {
        editable: true,
      }
      this.showInfoDialog = true
    },
    /* 点击查看/修改 */
    changeClick(infoId, editable) {
      this.dialogTitle = '证照详情'
      this.infoPropData = {
        infoId,
        editable,
      }
      this.showInfoDialog = true
    },
    /* 点击复审 */
    recheckClick(infoId) {
      this.recheckPropData = {
        infoId,
        editable: true,
      }
      this.showRecheckInfoDialog = true
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          certSafeManageDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    // 切换更多搜索条件
    handleToggleMoreSearch() {
      this.showMoreSearch = !this.showMoreSearch
    },
    renderState(code) {
      return (
        ((this.allDic || {}).zzzt || []).filter(
          ({ dictCode }) => String(dictCode) === String(code),
        )[0].dictName || ''
      )
    },
    // 从评价管理跳转过来的，需要展示返回按钮
    goBack() {
      this.$route.params.pageNum = this.backPageNum
      this.$router.back()
    },
    handleLicenceType(id) {
      this.$set(this.searchData, 'licenceName', '')
      this.getCategoryName(id)
    },
    getCategoryName(id) {
      getLicenseByTypeId(id).then(({ data }) => {
        if (data.success) {
          const resList = data.result || []
          this.categoryNameEnum = resList
        }
        else {
          this.$message.error(data.message || '无数据')
          this.categoryNameEnum = []
        }
      })
    },
  },
}
</script>

<template>
  <KyTreeTable
    v-loading="isLoading"
    :isShowLeft="!fromEvaluate"
    :isShowSearch="!fromEvaluate"
  >
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="formSearch"
      label-width="80px"
    >
      <el-row>
        <el-col :span="defaultSpan">
          <el-form-item label="关键字">
            <el-input
              v-model="searchData.condition"
              placeholder="姓名/证件"
            />
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item label="证照类型">
            <KyOptSelect
              v-model.trim="searchData.licenceType"
              :clearable="true"
              option="id"
              label="typeName"
              url="license/type/all"
              @change="handleLicenceType"
            />
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item label="证照名称">
            <KyOptSelect
              v-model.trim="searchData.licenceName"
              :clearable="true"
              option="id"
              label="categoryName"
              :localOptions="categoryNameEnum || []"
              placeholder="请选择证照名称"
              filterable
            />
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item
            v-if="showMoreSearch"
            label="颁证单位"
          >
            <el-select
              v-model="searchData.mechanism"
              clearable
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.bzdw || []"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item
            v-if="showMoreSearch"
            label="人员状态"
          >
            <el-select
              v-model="searchData.userState"
              clearable
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in userStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item
            v-if="showMoreSearch"
            label="证照状态"
          >
            <el-select
              v-model="searchData.state"
              clearable
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.zzzt || []"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="defaultSpan">
          <el-form-item class="option-btn-group">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="queryClick"
            >
              查询
            </el-button>
            <el-button
              size="mini"
              icon="el-icon-refresh-right"
              @click="refreshClick"
            >
              重置
            </el-button>
            <a
              style="margin-left: 8px"
              @click="handleToggleMoreSearch"
            >
              {{ showMoreSearch == true ? '收起' : '高级筛选' }}
              <i :class="showMoreSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </a>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        v-if="!fromEvaluate"
        type="primary"
        size="mini"
        plain
        icon="el-icon-plus"
        @click="addClick"
      >
        新增
      </el-button>
      <el-button
        v-if="!fromEvaluate"
        type="success"
        size="mini"
        icon="el-icon-download"
        @click="importClick"
      >
        Excel导入
      </el-button>
      <el-button
        type="success"
        size="mini"
        icon="el-icon-upload2"
        @click="exportClick"
      >
        Excel导出
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
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      align="center"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
        fixed="left"
      />
      <el-table-column
        label="公司名称"
        align="center"
        prop="companyName"
        :min-width="minWidth"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="部门"
        align="center"
        prop="departmentName"
        :min-width="minWidth"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="姓名"
        align="center"
        prop="fullName"
        :min-width="minWidth"
      >
        <template slot-scope="scope">
          <span
            class="check"
            @click="changeClick(scope.row.id, false)"
          >
            {{ scope.row.fullName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="性别"
        align="center"
        prop="sex"
      />
      <el-table-column
        label="岗位"
        align="center"
        prop="postName"
        :min-width="minWidth"
      />
      <el-table-column
        label="证照类型"
        prop="licenceTypeName"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="证照名称"
        prop="licenceCateGoryName"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="颁证单位"
        prop="mechanism"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="取证日期"
        prop="startTime"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="证照号码"
        align="center"
        prop="licenceNumber"
      />
      <el-table-column
        label="下次复审日期"
        align="center"
        prop="nextReview"
        :min-width="minWidth"
      />
      <el-table-column
        label="剩余天数"
        align="center"
        prop="remainingDays"
      />
      <el-table-column
        label="电子证照"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.enclosure"
            type="text"
            @click="showFileWindow(scope.row.enclosure)"
          >
            查看
          </el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column
        label="人员状态"
        align="center"
        prop="userState"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.userState === '0'"
            type="danger"
          >
            禁用
          </el-tag>
          <el-tag
            v-if="scope.row.userState === '1'"
            type="success"
          >
            在职
          </el-tag>
          <el-tag
            v-if="scope.row.userState === '2'"
            type="warning"
          >
            借调
          </el-tag>
          <el-tag
            v-if="scope.row.userState === '3'"
            type="danger"
          >
            离职
          </el-tag>
          <el-tag
            v-if="scope.row.userState === '4'"
            type="danger"
          >
            退休
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="证照状态"
        align="center"
        prop="state"
      >
        <template slot-scope="scope">
          <span>{{ renderState(scope.row.state) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="changeClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-warning)"
            @click="changeClick(scope.row.id, true)"
          >
            修改
          </el-button>
          <!-- 过期才可以复审 -->
          <el-button
            v-if="scope.row.state !== 5"
            type="text"
            size="mini"
            @click="recheckClick(scope.row.id)"
          >
            复审
          </el-button>
          <el-button
            style="color: var(--ky-danger)"
            type="text"
            size="mini"
            @click="delClick(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="900px"
        top="5vh"
        append-to-body
        :close-on-click-modal="false"
      >
        <SafeInfo
          v-if="showInfoDialog"
          v-bind="infoPropData"
          @close="dialogEvt($event, 'info')"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        title="证照复审"
        :visible.sync="showRecheckInfoDialog"
        width="900px"
        append-to-body
        :close-on-click-modal="false"
      >
        <RecheckInfo
          v-if="showRecheckInfoDialog"
          v-bind="recheckPropData"
          @close="dialogEvt($event, 'recheck')"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        title="安全证照Excel导入"
        :visible.sync="showImportDialog"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
      >
        <ExcelImport
          v-if="showImportDialog"
          v-bind="importProp"
          @close="dialogEvt($event, 'import')"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        title="自定义Excel导出"
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
    </div>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.bot-table {
  width: 100%;
  height: 100%;
}
.input-style {
  display: flex !important;
  & ::v-deep .el-form-item__content {
    flex: 1;
  }
}
.option-btn-group ::v-deep .el-form-item__content {
  margin-left: 10px !important;
}
</style>
