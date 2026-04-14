<script>
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  certSafeManageDel,
  certSafeManageExcelAnalysis,
  certSafeManageExcelError,
  certSafeManageExcelHeaderData,
  certSafeManageExcelSave,
  certSafeManageExcelTemplate,
  certSafeManageSave,
  certSafeManageUpdate,
} from '@/http/base-module/certificateManager-api.js'
import { getLicenseByTypeId } from '@/http/base-module/staffCertificate-api.js'
import { getUserCertificate } from '@/http/contractor-api'
import { upLoadImg } from '@/http/manage-api'
import ExcelExport from '@/views/baseModule/certificateManager/components/ExcelExport.vue'
import ExcelImport from '@/views/common-ui/excelHandle/ExcelImport.vue'
import PickPeople from '@/views/common-ui/PickPeople'
import ContractorTree from './coms/ContractorTree.vue'

export default {
  components: {
    ContractorTree,
    SelectTree,
    PickPeople,
    ImageSelect,
    ExcelExport,
    ExcelImport,
  },
  data() {
    return {
      form: {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,

      editForm: {},
      editRules: {
        fullName: [{ required: true, message: '请选择人员', trigger: 'change' }],
        licenceType: [{ required: true, message: '请选择证照类型', trigger: 'change' }],
        licenceNumber: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择取证日期', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择证件有效期', trigger: 'change' }],
        nextReview: [{ required: true, message: '请选择复审日期', trigger: 'change' }],
        licenceName: [{ required: true, message: '请选择特种作业工种', trigger: 'change' }],
      },
      isAdd: true,
      title: '新增人员证照',
      dialog: false,
      editLoading: false,
      editable: true,
      showPeopleDialog: false,
      peopleProp: {}, // 选择人员组件传递信息
      showExportDialog: false, // excel导出弹窗开关
      // 导出传参
      exportProp: {
        reqData: {},
        pickList: [],
      },
      allDic: {},
      showImportDialog: false,
      // 导入传参
      importProp: {
        templateFunc: certSafeManageExcelTemplate,
        analysisExcelFunc: certSafeManageExcelAnalysis,
        saveExcelFunc: certSafeManageExcelSave,
        errorExcelFunc: certSafeManageExcelError,
        showList: [
          { label: '公司', prop: 'companyName' },
          { label: '承包商', prop: 'departmentName' },
          { label: '姓名', prop: 'fullName' },
          { label: '证照类型', prop: 'licenceTypeName' },
          { label: '证照名称', prop: 'licenceCateGoryName' },
          { label: '证照号码', prop: 'licenceNumber' },
          { label: '取证日期', prop: 'startTime' },
          { label: '证件有效期', prop: 'endTime' },
          { label: '下次复审日期', prop: 'nextReview' },
          { label: '颁证单位', prop: 'mechanism' },
          { label: '是否特种作业', prop: 'isSpecialJob' },
        ],
      },
      hideLeft: false,
      treeWidth: '240px',
      conWidth: 'calc(100% - 240px)',
      categoryNameEnum: [], // 列表页-证照名称
      categoryNameEnumOfEdit: [], // 新增编辑页-证照名称
      defaultSpan: 6,
      minWidth: 120,
    }
  },
  created() {
    this.getDataList()
    // 获取字典信息
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getPrefix()
    this.getHeader()
  },
  methods: {
    async getDataList() {
      const { data } = await getUserCertificate(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
      }
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        showMore: false,
      }
      this.getDataList()
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    treeNodeTap(data) {
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    addFn() {
      this.isAdd = true
      this.editable = true
      this.editForm = {}
      this.title = '新增人员证照'
      this.dialog = true
    },
    seeFn(v) {
      this.isAdd = false
      this.editable = false
      this.title = '查看人员证照'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
      this.getCategoryName(v.licenceType, 'edit')
    },
    editFn(v) {
      this.isAdd = false
      this.editable = true
      this.title = '编辑人员证照'
      this.dialog = true
      this.editForm = JSON.parse(JSON.stringify(v))
      this.getCategoryName(v.licenceType, 'edit')
    },
    delFn(v) {
      this.$confirm('您确认要删除吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          certSafeManageDel(v.id)
            .then(({ data }) => {
              if (data.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 保存
    saveFn() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        if (!this.editForm.userId) {
          this.$message.warning('请选择人员')
          return
        }
        this.editLoading = true
        const saveFunc = this.isAdd ? certSafeManageSave : certSafeManageUpdate
        saveFunc(this.editForm).then(({ data }) => {
          this.editLoading = false
          if (data.code === 200) {
            this.$message.success(data.message || '保存成功')
            this.dialog = false
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '保存失败')
          }
        })
      })
    },
    // 选择人员
    choosePeople() {
      this.peopleProp.oldPickData = {
        id: this.editForm.userId || '',
        fullName: this.editForm.fullName || '',
      }
      this.peopleProp.listType = 'contractor'
      this.peopleProp.isSingle = true
      this.showPeopleDialog = true
    },
    // 选择提醒人之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.editForm.companyId = params.data.companyId
        // this.editForm.userId = params.data.id
        // this.editForm.fullName = params.data.fullName
        this.$set(this.editForm, 'userId', params.data.id)
        this.$set(this.editForm, 'fullName', params.data.fullName)
        this.editForm.departmentId = params.data.departmentId
        this.editForm.departmentName = params.data.departmentName // 所属承包商
        this.editForm.postName = params.data.postName // 岗位
        this.editForm.age = params.data.age // 年龄
        this.editForm.status = params.data.status // 状态
        this.editForm.sex = params.data.sex // 性别
        this.editForm.mobile = params.data.mobile // 联系电话
        this.editForm.companyName = params.data.companyName // 公司
      }
      this.showPeopleDialog = false
    },
    // 有限时间改变事件
    effectFn(v) {
      // let now = +new Date();
      // let tar = +new Date(v);
      // let res = Math.floor(Math.abs(tar - now) / 86400000);
      // this.$set(this.editForm, 'remainingDays', res)
    },
    // 文件选择回调
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'COMPANY_BUSINESS_LICENSE_PATH').then(({ data }) => {
          if (data.success) {
            this.editForm.enclosure = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.editForm.enclosure = ''
      }
    },

    // 点击导出
    exportClick() {
      const params = {}
      for (const key in this.form) {
        if (this.form[key] && !['pageNum', 'pageSize', 'showMore'].includes(key)) {
          params[key] = this.form[key]
        }
      }
      params.type = 1
      this.exportProp.reqData = params
      this.showExportDialog = true
    },
    dialogEvt(isRefresh, type) {
      switch (type) {
        case 'import':
          this.showImportDialog = false
          break
        case 'export':
          this.showExportDialog = false
          break
        default:
      }
      if (isRefresh) {
        this.getDataList()
      }
    },
    renderState(code) {
      return (
        ((this.allDic || {}).zzzt || []).filter(
          ({ dictCode }) => String(dictCode) === String(code),
        )[0].dictName || ''
      )
    },
    // 获取表头
    getHeader() {
      certSafeManageExcelHeaderData()
        .then(({ data }) => {
          if (data.success) {
            const result = data.result
            this.exportProp.pickList = []
            Object.keys(result).forEach((key) => {
              const param = { label: result[key], value: key }
              this.exportProp.pickList.push(param)
            })
          }
          else {
            this.$message.warning(data.message || '获取表头失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表头出错', err)
        })
    },
    // 点击导入
    importClick() {
      this.showImportDialog = true
    },
    // 切换左侧菜单的收起与展现
    toggleLeftFn() {
      this.hideLeft = !this.hideLeft
      if (this.hideLeft) {
        this.treeWidth = '0%'
        this.conWidth = '100%'
      }
      else {
        this.treeWidth = '240px'
        this.conWidth = 'calc(100% - 240px)'
      }
    },
    openFn() {
      this.$nextTick(() => {
        this.$refs.editForm.clearValidate()
      })
    },
    handleLicenceType(id, optionsType) {
      if (optionsType === 'search') {
        // 列表页
        this.$set(this.form, 'licenceName', '')
        this.getCategoryName(id, optionsType)
      }
      else if (optionsType === 'edit') {
        // 新增编辑页
        this.$set(this.editForm, 'licenceName', '')
        this.getCategoryName(id, optionsType)
      }
    },
    getCategoryName(id, optionsType) {
      getLicenseByTypeId(id).then(({ data }) => {
        if (data.success) {
          const resList = data.result || []
          if (optionsType === 'search') {
            this.categoryNameEnum = resList
          }
          else if (optionsType === 'edit') {
            this.categoryNameEnumOfEdit = resList
          }
        }
        else {
          this.$message.error(data.message || '无数据')
          if (optionsType === 'search') {
            this.categoryNameEnum = []
          }
          else if (optionsType === 'edit') {
            this.categoryNameEnumOfEdit = []
          }
        }
      })
    },
  },
}
</script>

<template>
  <div class="pic-contractor">
    <div
      class="leftCon"
      :style="`width: ${treeWidth}`"
    >
      <ContractorTree
        ref="contrTree"
        @treeNodeTap="treeNodeTap"
      />
      <div
        class="toggle-btn"
        @click="toggleLeftFn"
      >
        {{ hideLeft ? '展开' : '隐藏' }}
      </div>
    </div>
    <div
      class="rightCon"
      :style="`width: ${conWidth}`"
    >
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="80px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="defaultSpan">
            <el-form-item label="关键字">
              <el-input
                v-model="form.condition"
                placeholder="姓名/证件号码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="defaultSpan">
            <el-form-item label="证照类型">
              <KyOptSelect
                v-model.trim="form.licenceType"
                :clearable="true"
                option="id"
                label="typeName"
                url="license/type/all"
                placeholder="请选择证照类型"
                @change="val => handleLicenceType(val, 'search')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="defaultSpan">
            <el-form-item label="证照名称">
              <KyOptSelect
                v-model.trim="form.licenceName"
                :clearable="true"
                option="id"
                label="categoryName"
                :localOptions="categoryNameEnum || []"
                placeholder="请选择证照名称"
                filterable
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="defaultSpan"
          >
            <el-form-item label="证照状态">
              <el-select
                v-model="form.state"
                placeholder="证照状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in allDic.zzzt || []"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="defaultSpan"
            style="margin-bottom: 18px"
            :style="{ paddingLeft: form.showMore ? '' : '10px' }"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <el-button
              icon="el-icon-refresh-right"
              @click="resetFn"
            >
              重置
            </el-button>
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 功能区域 -->
        <div>
          <el-button
            v-if="hasBtnPermission('contractor_pic_add')"
            type="primary"
            icon="el-icon-plus"
            plain
            @click="addFn"
          >
            新增
          </el-button>
          <el-button
            v-if="hasBtnPermission('contractor_pic_in')"
            icon="el-icon-upload2"
            plain
            @click="importClick"
          >
            导入
          </el-button>
          <el-button
            v-if="hasBtnPermission('contractor_pic_out')"
            icon="el-icon-download"
            plain
            @click="exportClick"
          >
            导出
          </el-button>
        </div>

        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          :border="true"
          class="customer-table"
        >
          <el-table-column
            label="所属承包商"
            prop="departmentName"
            align="center"
            :min-width="150"
            :show-overflow-tooltip="true"
            fixed="left"
          />
          <el-table-column
            label="姓名"
            prop="fullName"
            align="center"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="证照类型"
            prop="licenceTypeName"
            align="center"
            :min-width="minWidth"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="证照名称"
            prop="licenceCateGoryName"
            align="center"
            :min-width="minWidth"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="证照状态"
            align="center"
            prop="state"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ renderState(scope.row.state) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="证照号码"
            prop="licenceNumber"
            align="center"
            :min-width="minWidth"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="证件有效期"
            prop="endTime"
            align="center"
            width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="下次复审日期"
            prop="nextReview"
            align="center"
            width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="剩余天数"
            prop="remainingDays"
            align="center"
            width="100"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="联系电话"
            prop="mobile"
            align="center"
            width="100"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="颁证单位"
            prop="mechanism"
            align="center"
            :min-width="minWidth"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
            width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="创建人"
            prop="createdByName"
            align="center"
            :min-width="minWidth"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="创建时间"
            prop="createdTime"
            align="center"
            width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="操作"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                v-if="hasBtnPermission('contractor_pic_view')"
                type="text"
                @click="seeFn(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_pic_modify')"
                type="text"
                style="color: var(--ky-warning)"
                @click="editFn(scope.row)"
              >
                修改
              </el-button>
              <el-button
                v-if="hasBtnPermission('contractor_pic_delete')"
                type="text"
                style="color: var(--ky-danger)"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          :current-page.sync="form.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="form.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </div>
    </div>

    <!-- 新增、编辑 弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog"
      :title="title"
      :visible.sync="dialog"
      width="70%"
      @open="openFn"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="110px"
        size="mini"
        :disabled="!editable"
      >
        <!-- 人员信息 -->
        <el-divider content-position="left">
          人员信息
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="姓名"
              prop="fullName"
            >
              <el-input
                v-model="editForm.fullName"
                readonly
                :disabled="!isAdd"
                @focus="choosePeople"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司">
              <el-input
                v-model="editForm.companyName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属承包商">
              <el-input
                v-model="editForm.departmentName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-input
                v-model="editForm.postName"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input
                v-model="editForm.age"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员状态">
              <el-input
                v-model="editForm.userState"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-input
                v-model="editForm.sex"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input
                v-model="editForm.mobile"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 证照信息 -->
        <el-divider content-position="left">
          证照信息
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="证照类型"
              prop="licenceType"
            >
              <!-- <el-select v-model="editForm.licenceType" clearable placeholder="全部" style="width: 100%;">
                                <el-option v-for="item in allDic.zzlx" :key="item.id" :label="item.dictName" :value="item.dictCode" />
                            </el-select> -->
              <KyOptSelect
                v-model.trim="editForm.licenceType"
                class="small-box"
                :clearable="true"
                option="id"
                label="typeName"
                url="license/type/all"
                placeholder="请选择证照类型"
                @change="val => handleLicenceType(val, 'edit')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="证照名称"
              prop="licenceName"
            >
              <!-- <el-select v-model="editForm.licenceName" placeholder="证照类别" style="width: 100%;">
                                <el-option
                                    v-for="item in allDic.zzlb || []"
                                    :key="item.dictCode"
                                    :label="item.dictName"
                                    :value="item.dictCode"
                                />
                            </el-select> -->
              <KyOptSelect
                v-model.trim="editForm.licenceName"
                :clearable="true"
                option="id"
                label="categoryName"
                :localOptions="categoryNameEnumOfEdit || []"
                placeholder="请选择证照名称"
                filterable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="颁证单位"
              prop="mechanism"
            >
              <el-select
                v-model="editForm.mechanism"
                placeholder="颁证单位"
                style="width: 100%"
              >
                <el-option
                  v-for="item in allDic.bzdw || []"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="证照号码"
              prop="licenceNumber"
            >
              <el-input
                v-model="editForm.licenceNumber"
                placeholder="证照号码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="取证日期"
              prop="startTime"
            >
              <el-date-picker
                v-model="editForm.startTime"
                style="width: 100%"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="取证日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="证件有效期"
              prop="endTime"
            >
              <el-date-picker
                v-model="editForm.endTime"
                style="width: 100%"
                type="date"
                placeholder="证件有效期"
                value-format="yyyy-MM-dd"
                @change="effectFn"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="下次复审日期"
              prop="nextReview"
            >
              <el-date-picker
                v-model="editForm.nextReview"
                style="width: 100%"
                type="date"
                placeholder="复审日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="剩余时间"
              prop="remainingDays"
            >
              <el-input
                v-model="editForm.remainingDays"
                disabled
              >
                <template slot="suffix">
                  天
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否特种作业"
              prop="isSpecialJob"
              :rules="[{ required: editable, message: '请选择', trigger: 'blur' }]"
            >
              <el-radio-group v-model="editForm.isSpecialJob">
                <el-radio :label="true">
                  是
                </el-radio>
                <el-radio :label="false">
                  否
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
            >
              <el-input
                v-model="editForm.remarks"
                type="textarea"
                :rows="6"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="附件"
              prop="enclosure"
            >
              <ImageSelect
                v-if="dialog"
                :signUrl="editForm.enclosure ? filePrefix + editForm.enclosure : ''"
                width="100px"
                height="100px"
                :disabled="!editable"
                @fileChange="fileChangeEvt"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          {{ editable ? '取消' : '关闭' }}
        </el-button>
        <el-button
          v-show="editable"
          type="primary"
          :loading="editLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople
        v-if="showPeopleDialog"
        v-bind="peopleProp"
        @close="closePeopleEvt"
      />
    </el-dialog>

    <!-- excel导出 -->
    <el-dialog
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

    <el-dialog
      class="normal-dialog"
      title="Excel导入"
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
  </div>
</template>

<style lang="scss" scoped>
.pic-contractor {
  height: calc(100vh - 50px);
  background: #f3f7f9;
  display: flex;
  position: relative;
  .leftCon {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 10px;
    padding-right: 0px;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
    .toggle-btn {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 100%;
      cursor: pointer;
      user-select: none;
      background: rgba($color: #000000, $alpha: 0.1);
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      padding: 5px;
    }
  }
  .rightCon {
    position: absolute;
    top: 0;
    right: 0;
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .searchForm {
      margin-bottom: 10px;
      padding: 18px 8px 0 10px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .el-pagination {
        text-align: right;
        padding: 0;
        .el-pagination__sizes {
          margin-right: 0;
          .el-input {
            margin-right: 0;
          }
        }
      }
    }
  }
}

.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__body {
    padding-bottom: 24px;
    .el-divider {
      margin-bottom: 40px;
      .el-divider__text {
        padding: 0 6px;
        left: 50px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
