<!-- @description：reportDialog 工伤管理基础信息 -->
<script>
import ExcelImport from '@edu/components/ExcelImport.vue'
import moment from 'moment'
import {
  accidentInformationByAccidentNumber,
  querWorkInjury,
  queryAccidentNumberIn,
  queryPersonnelDetails,
  qureyTree,
  saveInjuryOnTheJob,
} from '@/http/accidentManage/investigation'
import {
  certSafeManageExcelAnalysis,
  certSafeManageExcelError,
  certSafeManageExcelSave,
  importExcel,
  injuryOnTheJob,
} from '@/http/base-module/certificateManager-api.js'
import { upLoadImg } from '@/http/manage-api'
import { getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'
import Notice from '../notice.vue'

export default {
  name: 'reportDialog',
  components: {
    FileUpload,
    ExcelImport,
    Notice,
  },
  data() {
    return {
      // 导入传参
      showImportDialog: false,
      importProp: {
        templateFunc: injuryOnTheJob,
        analysisExcelFunc: certSafeManageExcelAnalysis,
        saveExcelFunc: certSafeManageExcelSave,
        errorExcelFunc: certSafeManageExcelError,
        confirmUpload: this.confirmUpload,
        showErrorBtn: false,
        showList: [{ label: '检查费', prop: 'inspectionFee' }],
      },
      treeData: [],
      defaultProps: {
        value: 'id',
        children: 'children',
        label: 'name',
      },
      page_type: '',
      colWidth: 12,
      visible: false,
      loading: false,
      dataRule: {
        accidentNumber: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
      showObj: {
        show1: true,
        show2: true,
        show3: true,
      },

      injuryMonth: '',
      inputForm: {
        id: null,
        accidentNumber: '',

        // 工伤管理基本信息
        party: '',
        company: '',
        departmentName: '',
        post: '',
        personInCharge: '',
        relationship: '',

        // 工伤认定
        injuryOnTheJobApplicationDate: '',
        injuryOnTheJobCertificateDate: '',
        startOfShutdownAndSalaryLeavePeriod: '',
        endOfShutdownAndSalaryLeavePeriod: '',
        daysOfWorkStoppageAndSalaryRetention: '',
        injuryLocation: '',
        identificationStatus: '',

        // 伤残鉴定
        permanentDisabilityApplicationDate: '',
        permanentDisabilityCertificateDate: '',
        accidentNature: '',
        appraisalStatus: '',
        // 工伤费用
        inspectionFee: '',
        treatmentFee: '',
        medicalExpenses: '',
        // 其他费用
        trafficExpense: '',
        incidental: '',
        nursing: '',
        // 保险费用
        claimFees: '',
        // 自费
        selfFunded: '',
        // 考核金额
        assessmentAmount: '',
        remarks: '',
        injuryOnTheJobEnclosure: '',
        permanentDisabilityEnclosure: '',
      },
      // 工伤认定上传附件参数
      injuryOnTheJobEnclosure: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
      },
      // 伤残鉴定附件参数
      permanentDisabilityEnclosure: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
      },
      tableData: [],
      detailForm: {},
      numIdOptions: [], // 事故编号选项
      userOptions: [], // 人员
      reasonTypeOptions: [], // 事故类型
      dateformat: 'YYYY-MM-DD',
      noticeVisible: false,
      personData: {},
      isDialog: {},
    }
  },
  computed: {
    // 工伤费用
    totalWorkInjuryExpenses() {
      this.inputForm.totalWorkInjuryExpenses
        = Number(this.inputForm.inspectionFee)
          + Number(this.inputForm.treatmentFee)
          + Number(this.inputForm.medicalExpenses)
      return this.inputForm.totalWorkInjuryExpenses
    },
    // 其他费用
    totalOtherExpenses() {
      this.inputForm.totalOtherExpenses
        = Number(this.inputForm.trafficExpense)
          + Number(this.inputForm.incidental)
          + Number(this.inputForm.nursing)
      return this.inputForm.totalOtherExpenses
    },
    // 保险费用
    totalInsuranceExpenses() {
      this.inputForm.totalInsuranceExpenses = Number(this.inputForm.claimFees)
      return this.inputForm.totalInsuranceExpenses
    },
    // 自费
    totalSelfExpenses() {
      this.inputForm.totalSelfExpenses = Number(this.inputForm.selfFunded)
      return this.inputForm.totalSelfExpenses
    },
    // 考核金额
    totalAssessmentAmountAndExpenses() {
      this.inputForm.totalAssessmentAmountAndExpenses = Number(this.inputForm.assessmentAmount)
      return this.inputForm.totalAssessmentAmountAndExpenses
    },
    totalExpenses() {
      this.inputForm.totalExpenses
        = this.totalWorkInjuryExpenses
          + this.totalOtherExpenses
          + this.totalInsuranceExpenses
          + this.totalSelfExpenses
          + this.totalAssessmentAmountAndExpenses
      return this.inputForm.totalExpenses
    },
  },
  watch: {
    'inputForm.accidentNumber': function (val) {
      if (
        val
        && (this.page_type == 'add' || this.page_type == 'edit' || this.page_type == 'look')
      ) {
        this.getBasicDetail(val)
      }
    },
    'inputForm.startOfShutdownAndSalaryLeavePeriod': function (val) {
      if (val) {
        this.getEndDate(val, this.injuryMonth)
      }
      else {
        this.clearEndDateAndWorkDate()
      }
    },
    visible(val) {
      if (val && this.page_type == 'add') {
        this.getNumId()
      }
    },
  },
  mounted() {
    this.getOptions()
    this.getTree()
  },
  methods: {
    async uploadFile(file) {
      const newsObj = new FormData()
      newsObj.append('file', file.file)
      const res = await importExcel(newsObj)
      if (res.data.success) {
        this.inputForm.assessmentAmount = res.data.result.assessmentAmount
        this.inputForm.claimFees = res.data.result.claimFees
        this.inputForm.incidental = res.data.result.incidental
        this.inputForm.inspectionFee = res.data.result.inspectionFee
        this.inputForm.medicalExpenses = res.data.result.medicalExpenses
        this.inputForm.nursing = res.data.result.nursing
        this.inputForm.selfFunded = res.data.result.selfFunded
        this.inputForm.trafficExpense = res.data.result.trafficExpense
        this.inputForm.treatmentFee = res.data.result.treatmentFee
      }
    },
    importClick() {
      injuryOnTheJob().then((res) => {
        if (!res.data)
          return
        const url = window.URL.createObjectURL(new Blob([res.data], { type: '.xlsx' }))
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.setAttribute('download', `工伤费用导入模板.xlsx`)
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
    },
    dialogEvt() {
      this.showImportDialog = false
    },
    // 推送通知书给当事人
    doNotice() {
      if (this.inputForm.party && this.inputForm.injuryLocation) {
        queryPersonnelDetails({
          id: this.inputForm.party,
          injuryLocation: this.inputForm.injuryLocation,
        }).then((res) => {
          if (res.success) {
            const data = res.result
            data.injuryLocation = this.inputForm.injuryLocation
            this.noticeVisible = true
            this.personData = data
          }
        })
      }
      else {
        this.$message.warning('当事人和伤害部位不能为空')
      }
    },
    // 数据回填
    init(data, flag) {
      this.page_type = flag
      if (data) {
        querWorkInjury({ id: data.id }).then((res) => {
          if (res.success) {
            this.inputForm = Object.assign(this.inputForm, res.result)
            // 上传文件回填
            if (res.result.injuryOnTheJobEnclosure) {
              this.injuryOnTheJobEnclosure.oldFileList = [
                {
                  originalName: res.result.injuryOnTheJobEnclosure,
                  attachmentName: res.result.injuryOnTheJobEnclosure,
                  filePath: res.result.injuryOnTheJobEnclosure,
                },
              ]
            }
            if (res.result.permanentDisabilityEnclosure) {
              this.permanentDisabilityEnclosure.oldFileList = [
                {
                  originalName: res.result.permanentDisabilityEnclosure,
                  attachmentName: res.result.permanentDisabilityEnclosure,
                  filePath: res.result.permanentDisabilityEnclosure,
                },
              ]
            }
          }
        })
      }
    },
    async getTree() {
      const res = await qureyTree()
      this.treeData = res.result
    },
    // 伤害部位-清除选中
    clearHandle() {
      this.inputForm.injuryLocation = ''
      this.clearSelected()
      this.clearEndDateAndWorkDate()
    },
    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    // 选择伤害部位
    handleNodeClick(node) {
      this.injuryMonth = node.suspensionAndSalaryRetentionPeriod
      this.inputForm.injuryLocation = node[this.defaultProps.label]
      if (!this.injuryMonth) {
        // 当前停工留薪分类月份为空
        this.clearEndDateAndWorkDate()
        return
      }
      this.getEndDate(this.inputForm.startOfShutdownAndSalaryLeavePeriod, this.injuryMonth)
    },
    // 清除 工伤认定 里的截至日期和停工留薪天数
    clearEndDateAndWorkDate() {
      this.inputForm.daysOfWorkStoppageAndSalaryRetention = '' // 停工留薪天数
      this.inputForm.endOfShutdownAndSalaryLeavePeriod = '' // 截至日期
    },
    getEndDate(date, months) {
      if (date && months) {
        const momDate = moment(date)
        const sliceDate = months.split('.')
        if (sliceDate.length > 1) {
          // 月份含小数, 前端已限制小数部分只能为 .5 ， 按15天计算
          const addedMonth = momDate.add(sliceDate[0], 'M')
          this.inputForm.endOfShutdownAndSalaryLeavePeriod = addedMonth
            .add(15, 'days')
            .format(this.dateformat)
          this.inputForm.daysOfWorkStoppageAndSalaryRetention = 15
        }
        else {
          const addedMonth = momDate.add(months, 'M')
          this.inputForm.endOfShutdownAndSalaryLeavePeriod = addedMonth.format(this.dateformat)
          this.inputForm.daysOfWorkStoppageAndSalaryRetention = addedMonth.diff(
            moment(date),
            'days',
          )
        }
      }
    },
    // 当事人选择
    changeParty() {
      const item = this.userOptions.find(item => item.id == this.inputForm.party)
      this.inputForm.company = item.companyName
      this.inputForm.departmentName = item.departTypeDepartName
      this.inputForm.post = item.postName
    },
    // 保存 提交
    async doSubmit() {
      if (this.page_type == 'look')
        return this.$message.warning('查看不能保存数据')
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.inputForm))
          this.loading = true
          const res = await saveInjuryOnTheJob(form)
          this.loading = false
          if (res.success) {
            this.visible = false
            this.$emit('getList')
            this.$message.success(res.message || '保存成功')
          }
          else {
            this.$message.warning(res.message || '保存失败')
          }
        }
        else {
          return false
        }
      })
    },

    closeDialog() {
      this.injuryOnTheJobEnclosure.oldFileList = [] // 重置上传附件
      this.permanentDisabilityEnclosure.oldFileList = [] // 重置上传附件
      Object.assign(this.inputForm, this.$options.data().inputForm)
      this.detailForm = {}
      this.page_type = ''
      this.$refs.inputForm.resetFields()
    },
    /* 文件上传回调 */
    uploadEvt(fileList, type) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm[type] = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm[type] = ''
      }
    },

    // 删除附件
    delDocPath(type) {
      this.inputForm[type] = ''
    },
    async getNumId() {
      this.loading = true
      const res = await queryAccidentNumberIn()
      this.loading = false
      if (res.success) {
        this.numIdOptions = res.result || []
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 获取事故上报详情 --基本信息
    async getBasicDetail(id) {
      this.loading = true
      const newsObj = new FormData()
      newsObj.append('id', id)
      const res = await accidentInformationByAccidentNumber(newsObj)
      this.loading = false
      if (res.success) {
        this.detailForm = JSON.parse(JSON.stringify(res.result[0])) || null
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 获取选项
    getOptions() {
      const companyId = this.$store.state.user.user.companyId
      Promise.all([getAllUsersByCompany(companyId)])
        .then((res) => {
          this.userOptions = res[0].data.result || []
        })
        .catch((err) => {
          this.$message.error('获取列表失败')
        })
    },
    closeNoticeDialog() {
      this.noticeVisible = false
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="page_type == 'add' ? '新增工伤' : page_type == 'edit' ? '修改工伤' : '查看工伤'"
      :close-on-click-modal="false"
      width="800px"

      :visible.sync="visible"
      class="normal-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        label-width="120px"
        :disabled="page_type == 'look'"
        @submit.native.prevent
      >
        <div class="cell">
          <div class="cell-title">
            选择事故基本情况
          </div>
          <div
            v-show="showObj.show1"
            class="cell-box"
          >
            <el-row>
              <el-col :span="colWidth">
                <el-form-item
                  label="事故编号"
                  prop="accidentNumber"
                >
                  <el-select
                    v-model="inputForm.accidentNumber"
                    style="width: 100%"
                    filterable
                  >
                    <el-option
                      v-for="item in numIdOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="事故名称">
                  <el-input
                    v-model="detailForm.accidentName"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="事故发生时间">
                  <el-input
                    v-model="detailForm.timeOfAccident"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="事故类型">
                  <el-input
                    v-model="detailForm.accidentType"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- <el-row>
            <el-col>
              <el-form-item label="事故性质">
                <el-input v-model="detailForm.accidentNature" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row> -->
          </div>
          <!-- <div class="show-box">
          <i :class="showObj.show1 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="showObj.show1 = !showObj.show1"></i>
        </div> -->
        </div>
        <div class="cell">
          <div class="cell-title">
            选择的事故调查报告
          </div>
          <div
            v-show="showObj.show2"
            class="cell-box"
          >
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="调查报告名称">
                  <el-input
                    v-model="detailForm.accidentReportName"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <div class="show-box">
          <i :class="showObj.show2 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="showObj.show2 = !showObj.show2"></i>
        </div> -->
        </div>
        <div class="cell">
          <div class="cell-title">
            选择的事故处理报告
          </div>
          <div
            v-show="showObj.show3"
            class="cell-box"
          >
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="处理报告名称">
                  <el-input
                    v-model="detailForm.report"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <div class="show-box">
          <i :class="showObj.show3 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="showObj.show3 = !showObj.show3"></i>
        </div> -->
        </div>
        <div class="cell">
          <div class="cell-title">
            工伤管理基本信息
          </div>
          <div
            v-show="showObj.show3"
            class="cell-box"
          >
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="当事人">
                  <el-select
                    v-model="inputForm.party"
                    style="width: 100%"
                    filterable
                    @change="changeParty"
                  >
                    <el-option
                      v-for="item in userOptions"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="公司">
                  <el-input
                    v-model="inputForm.company"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="部门">
                  <el-input
                    v-model="inputForm.departmentName"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="岗位">
                  <el-input
                    v-model="inputForm.post"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="负责人">
                  <el-select
                    v-model="inputForm.personInCharge"
                    style="width: 100%"
                    filterable
                  >
                    <el-option
                      v-for="item in userOptions"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="关系">
                  <el-select
                    v-model="inputForm.relationship"
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in $dictUtils.getDictList('relationship')"
                      :key="item.id"
                      :label="item.dictName"
                      :value="item.dictCode"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- <div class="show-box">
          <i :class="showObj.show3 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="showObj.show3 = !showObj.show3"></i>
        </div> -->
        </div>
        <div class="cell">
          <div class="cell-title">
            工伤认定
          </div>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="申请日期"
                prop="injuryOnTheJobApplicationDate"
              >
                <el-date-picker
                  v-model="inputForm.injuryOnTheJobApplicationDate"
                  style="width: 100%"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="colWidth">
              <el-form-item
                label="取认证书日期"
                prop="injuryOnTheJobCertificateDate"
              >
                <el-date-picker
                  v-model="inputForm.injuryOnTheJobCertificateDate"
                  style="width: 100%"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item label="开始日期">
                <el-date-picker
                  v-model="inputForm.startOfShutdownAndSalaryLeavePeriod"
                  style="width: 248px"
                  type="date"
                  start-placeholder="开始日期"
                  value-format="yyyy-MM-dd"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="colWidth">
              <el-form-item
                label="伤害部位"
                prop="injuryLocation"
              >
                <el-select
                  v-model="inputForm.injuryLocation"
                  style="width: 100%"
                  clearable
                  @clear="clearHandle"
                >
                  <el-option
                    :value="inputForm.injuryLocation"
                    :label="inputForm.injuryLocation"
                    class="options"
                  >
                    <el-tree
                      id="tree-option"
                      ref="selectTree"
                      :data="treeData"
                      :props="defaultProps"
                      :node-key="defaultProps.value"
                      @node-click="handleNodeClick"
                    />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item label="截至日期">
                <el-date-picker
                  v-model="inputForm.endOfShutdownAndSalaryLeavePeriod"
                  disabled
                  style="width: 248px"
                  type="date"
                  start-placeholder="截至日期"
                  value-format="yyyy-MM-dd"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="colWidth">
              <el-form-item label="停工留薪天数">
                <el-input
                  v-model="inputForm.daysOfWorkStoppageAndSalaryRetention"
                  disabled
                  type="number"
                >
                  <template slot="append">
                    天
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="认定状态"
                prop="identificationStatus"
              >
                <el-radio-group v-model="inputForm.identificationStatus">
                  <el-radio label="未认定">
                    未认定
                  </el-radio>
                  <el-radio label="已认定">
                    已认定
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item
                label="上传附件"
                style="width: 100%"
                prop="injuryOnTheJobEnclosure"
              >
                <FileUpload
                  v-if="visible"
                  v-bind="injuryOnTheJobEnclosure"
                  :disabled="page_type == 'look'"
                  @upload="uploadEvt($event, 'injuryOnTheJobEnclosure')"
                  @delSucc="delDocPath('injuryOnTheJobEnclosure')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-button
            style="margin-left: 40px"
            size="small"
            type="primary"
            @click="doNotice"
          >
            推送通知书给当事人
          </el-button>
        </div>
        <div class="cell">
          <div class="cell-title">
            伤残鉴定
          </div>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item
                label="申请日期"
                prop="permanentDisabilityApplicationDate"
              >
                <el-date-picker
                  v-model="inputForm.permanentDisabilityApplicationDate"
                  style="width: 100%"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="colWidth">
              <el-form-item
                label="取认日期"
                prop="permanentDisabilityCertificateDate"
              >
                <el-date-picker
                  v-model="inputForm.permanentDisabilityCertificateDate"
                  style="width: 100%"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="colWidth">
              <el-form-item label="事故性质">
                <el-select
                  v-model="inputForm.accidentNature"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('character_accident')"
                    :key="item.id"
                    :label="item.dictName"
                    :value="item.dictCode"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="colWidth">
              <el-form-item
                label="鉴定状态"
                prop="appraisalStatus"
              >
                <el-radio-group v-model="inputForm.appraisalStatus">
                  <el-radio label="未鉴定">
                    未鉴定
                  </el-radio>
                  <el-radio label="已鉴定">
                    已鉴定
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item
                label="上传附件"
                style="width: 100%"
                prop="permanentDisabilityEnclosure"
              >
                <FileUpload
                  v-if="visible"
                  v-bind="permanentDisabilityEnclosure"
                  :disabled="page_type == 'look'"
                  @upload="uploadEvt($event, 'permanentDisabilityEnclosure')"
                  @delSucc="delDocPath('permanentDisabilityEnclosure')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="cell">
          <div class="cell-title">
            相关费用
          </div>
          <div style="display: flex">
            <el-button
              style="margin-bottom: 10px; margin-right: 15px"
              size="small"
              type="primary"
              @click="importClick"
            >
              费用模板导出
            </el-button>
            <el-upload
              :show-file-list="false"
              :http-request="uploadFile"
              action=""
            >
              <el-button
                size="small"
                type="primary"
              >
                费用导入
              </el-button>
            </el-upload>
          </div>

          <div class="money-list">
            <div class="money-title">
              工伤费用
            </div>
            <el-form-item label="检查费">
              <el-input
                v-model="inputForm.inspectionFee"
                :min="0"
                type="number"
              />
            </el-form-item>
            <el-form-item label="治疗费">
              <el-input
                v-model="inputForm.treatmentFee"
                :min="0"
                type="number"
              />
            </el-form-item>
            <el-form-item label="药费">
              <el-input
                v-model="inputForm.medicalExpenses"
                :min="0"
                type="number"
              />
            </el-form-item>
            <span>小计：{{ totalWorkInjuryExpenses }}元</span>
          </div>
          <div class="money-list">
            <div class="money-title">
              其他费用
            </div>
            <el-form-item label="交通费">
              <el-input
                v-model="inputForm.trafficExpense"
                :min="0"
                type="number"
              />
            </el-form-item>
            <el-form-item label="杂费">
              <el-input
                v-model="inputForm.incidental"
                :min="0"
                type="number"
              />
            </el-form-item>
            <el-form-item label="护理">
              <el-input
                v-model="inputForm.nursing"
                :min="0"
                type="number"
              />
            </el-form-item>
            <span>小计：{{ totalOtherExpenses }}元</span>
          </div>
          <div class="money-list">
            <div class="money-title">
              保险费用
            </div>
            <el-form-item label="理赔费">
              <el-input
                v-model="inputForm.claimFees"
                :min="0"
                type="number"
              />
            </el-form-item>
            <span>小计：{{ totalInsuranceExpenses }}元</span>
          </div>
          <div class="money-list">
            <div class="money-title">
              自费
            </div>
            <el-form-item label="自费">
              <el-input
                v-model="inputForm.selfFunded"
                :min="0"
                type="number"
              />
            </el-form-item>
            <span>小计：{{ totalSelfExpenses }}元</span>
          </div>
          <div class="money-list">
            <div class="money-title">
              考核金额
            </div>
            <el-form-item label="考核金额">
              <el-input
                v-model="inputForm.assessmentAmount"
                :min="0"
                type="number"
              />
            </el-form-item>
            <span>小计：{{ totalAssessmentAmountAndExpenses }}元</span>
          </div>
          <div class="money-total">
            合计：{{ totalExpenses }}元
          </div>
        </div>

        <div class="remarks">
          <el-row>
            <el-col>
              <el-form-item
                label="备注"
                prop="remarks"
              >
                <el-input
                  v-model="inputForm.remarks"
                  type="textarea"
                  :rows="6"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <span
        v-show="page_type == 'add' || page_type == 'look' || page_type == 'edit'"
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >取消</el-button>
        <el-button
          v-show="page_type == 'add' || page_type == 'edit'"
          size="small"
          type="success"
          :loading="loading"
          @click="doSubmit"
        >保存</el-button>
      </span>
      <!-- <el-dialog class="normal-dialog" title="Excel导入" :visible.sync="showImportDialog" width="1000px" append-to-body :close-on-click-modal="false">
      <ExcelImport v-if="showImportDialog" v-bind="importProp" @close="dialogEvt" />
    </el-dialog> -->
    </el-dialog>
    <el-dialog
      v-if="noticeVisible"
      title="工伤职工停工留薪期确认通知书"
      class="normal-dialog"

      width="80%"
      :visible.sync="noticeVisible"
      @close="closeNoticeDialog"
    >
      <Notice
        :isDialog="true"
        :personData="personData"
        @close="closeNoticeDialog"
      />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.remarks {
  ::v-deep .el-form-item__label {
    width: 40px !important;
  }
  ::v-deep .el-form-item__content {
    margin-left: 40px !important;
  }
}
.money-list {
  display: flex;
  font-size: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  span {
    display: inline-block;
    flex: 1;
    text-align: right;
  }
  ::v-deep .el-form-item__label {
    width: 80px !important;
  }
  ::v-deep .el-form-item__content {
    margin-left: 80px !important;
  }
  ::v-deep .el-input__inner {
    width: 100px !important;
  }
  ::v-deep .el-form-item {
    margin-bottom: 0;
  }
  .money-title {
    width: 80px;
  }
  .money-title::before {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 10px;
    background-color: #409eff;
  }
}
.money-total {
  text-align: right;
  padding: 10px;
  font-size: 12px;
}
.cell {
  .cell-title {
    line-height: 30px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
  }
  .cell-title::before {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 10px;
    background-color: #409eff;
  }
  .show-box {
    text-align: center;
    i {
      width: 30px;
      height: 30px;
      font-size: 30px;
      cursor: pointer;
    }
  }
  .no-select {
    cursor: not-allowed;
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #c0c4cc;
    cursor: not-allowed;
  }
}
</style>
