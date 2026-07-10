<!-- @description：addProcess 新增修改处置报告  -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import EduTrainEditDialog from '@edu/pages/trainPlan/components/EditDialog.vue'
import SelectTree from '@/components/treeSelect/treeSelect'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  addApprovalList,
  getAccidentDetail,
  getAccidentDetailShenpi,
  queryAccidentNumber,
  queryByAccidentNumber,
  reportApproval,
  temporaryStorageHandleReport,
} from '@/http/accidentHandling/accidentHandling.js'
import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api.js'
import { upLoadImg } from '@/http/manage-api'
import {
  getAllUsersByTenant,
  getDepartListByTenantIdFn,
} from '@/http/safe-production/depart-manage-api'
import { getSubordinateCompany } from '@/http/user-api'
import FileUpload from '@/views/common-ui/FileUpload'
import DrillPlanDetail from '../../../contingencyManage/dialog/drillPlanDetail.vue'
import UnitInfo from '../../../doubleDefense/shandong/riskControl/components/UnitInfo.vue'
import SafePlanInfo from '../../../doubleDefense/shandong/safeCheck/components/SafePlanInfo.vue'
import OtherInfo from './otherInfo.vue'

export default {
  name: 'addAccident',
  components: {
    FileUpload,
    TreeSelect,
    UnitInfo,
    SafePlanInfo,
    OtherInfo,
    SelectTree,
    DrillPlanDetail,
    EduTrainEditDialog,
  },
  data() {
    return {
      page_type: '',
      hidden: false,
      isDisabled: true,
      accidentNumberList: [],
      tableData: [],
      departList: [],
      personList: [], // 人员列表
      personListShow: [], // 页面中展示的人员列表
      planreportList: [
        { label: '风险分析', value: '风险分析' },
        { label: '隐患排查计划', value: '隐患排查计划' },
        { label: '应急演练', value: '应急演练' },
        { label: '教育培训计划', value: '教育培训计划' },
        { label: '其他', value: '其他' },
      ],
      dataRule: {
        accidentNumber: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        enclosureAddress: [
          {
            required: true,
            message: '文档附件不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        approvalType: [
          {
            required: true,
            message: '审批类型不能为空',
            leaderNametrigger: 'blur',
          },
        ],
      },
      dialogTitle: '', // 弹窗标题
      showInfoDialog: false, // 是否显示编辑弹窗
      showInfoDialogSafe: false,
      showInfoDialogOther: false,
      showInfoDialogTrain: false,
      propData: {}, // 弹窗绑定数据
      loading: false,
      flag: true,
      flag_two: true,
      colWidth: 12,
      visible: false,
      accidentInvestigationReport: {},
      accidentInvestigation: [],
      handlerId: '',
      approvalNo: '', // 审批编号
      inputForm: {
        id: null,
        accidentNumber: '',
        approvalType: '',
        enclosure: '',
        enclosureAddress: '',
        penaltyMeasures: '',
        preventiveMeasure: '',
        processingReportDocumentNumber: '',
        report: '',
        // state:'',
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      penaltyMeasures: [
        {
          number: '1',
          personLiable: '',
          penaltyAmount: '',
          penaltyDescription: '',
        },
      ],
      preventiveMeasure: [
        {
          number: '1',
          measures: '',
          name: '',
          explain: '',
        },
      ],
      planreportIndex: '',
      auditForm: {
        approvalOpinions: '',
        approvalStatus: '',
        relationId: '',
        circulationTime: '',
        handler: '',
      },
      riskAreaList: [], // 风险区域列表
      accidentApprovalsOnly: [], // 审批信息, 只用于展示详情，不涉及编辑，从外部进来会给这个字段赋值。
    }
  },
  watch: {
    'inputForm.accidentNumber': function (val, _oldValue) {
      if (val) {
        this.queryByAccidentNumber(val)
      }
    },
    page_type(val) {
      if (val == 'find' || val == 'edit' || val == 'audit' || val == 'audit_look') {
        this.handlerId = this.inputForm.handlerId
        this.approvalNo = this.inputForm.approvalNo
        this.getAccidentDetail({
          handlingId: this.inputForm.handlingId,
          handlerId: this.inputForm.handlerId,
          approvalNo: this.inputForm.approvalNo,
        })
        this.isDisabled = false
      }
    },

    visible(val) {
      if (val && this.page_type == 'add') {
        this.queryAccidentNumber()
      }
    },
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    Promise.all([
      getDepartListByTenantIdFn(userData.tenantId),
      getAllUsersByTenant(userData.tenantId),
    ])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.personList = res[1].data.result || []
        this.filterUserList()
      })
      .catch((err) => {})
  },
  methods: {
    /* 请求租户下所有用户列表和风险区域列表 */
    async getParamsData() {
      const areaRes = await getRiskAreaAll()
      this.riskAreaList = areaRes.data.result
    },
    // 查询事故处理基本信息
    async getAccidentDetail(formdata) {
      let data
      // 通过是否传处理人handlerId字段，来判断是事故处理审批列表（单个审批报告）进来，还是其它地方（多个审批报告）进来。
      if (this.inputForm.handlerId) {
        // 包含单个审批报告
        data = await getAccidentDetailShenpi(formdata)
      }
      else {
        // 包含多个审批报告
        data = await getAccidentDetail(formdata)
      }
      if (!data.success) {
        this.$message.warning(data.message || '查询失败')
        return
      }
      if (data.result.accidentHandling) {
        Object.keys(this.inputForm).forEach((item) => {
          this.inputForm[item] = data.result.accidentHandling[item]
        })
        if (data.result.accidentHandling.enclosureAddress) {
          this.fileProp.oldFileList = [
            {
              originalName: data.result.accidentHandling.enclosure,
              attachmentName: data.result.accidentHandling.enclosure,
              filePath: data.result.accidentHandling.enclosureAddress,
            },
          ]
        }
        this.penaltyMeasures = data.result.accidentHandling.penaltyMeasures
          ? JSON.parse(data.result.accidentHandling.penaltyMeasures)
          : this.penaltyMeasures
        this.preventiveMeasure = data.result.accidentHandling.preventiveMeasure
          ? JSON.parse(data.result.accidentHandling.preventiveMeasure)
          : this.preventiveMeasure
      }
      // 追加反显所需责任人
      this.superadditionPerson()
      // 审批人信息，审批列表进来，展示单个审批报告，用于查询和编辑，取accidentApproval字段。其它地方进来，要展示多个审批报告，只用于查询，取accidentApprovals
      if (this.handlerId) {
        // 审批列表进来，包含单个审批报告。用于查询和编辑
        if (data.result.accidentApproval) {
          Object.keys(this.auditForm).forEach((item) => {
            this.auditForm[item] = data.result.accidentApproval[item]
          })
        }
      }
      else {
        // 其它地方进来，包含多个审批报告。只用于查询
        this.accidentApprovalsOnly = data.result.accidentApprovals || []
      }
    },
    getDataFX(data) {
      this.preventiveMeasure[this.planreportIndex].name = data
    },
    // 查询顶部的事故基本信息
    async queryByAccidentNumber(id) {
      const data = await queryByAccidentNumber({
        id,
      })
      // 改版： 一个上报可多次调查，accidentInvestigation改为数组
      if (!data.success) {
        this.$message.warning(data.message || '查询失败')
        return
      }
      if (data.result.accidentInvestigation?.length) {
        this.accidentInvestigation = data.result.accidentInvestigation || []
      }
      //
      // this.accidentInvestigation = data.result.accidentInvestigation || {}
      this.accidentInvestigationReport = data.result.accidentInvestigationReport || {}
      if (this.accidentInvestigationReport.detailsOfTheInjuredPerson) {
        this.tableData = JSON.parse(this.accidentInvestigationReport.detailsOfTheInjuredPerson)
      }
    },
    // 查询事故编号
    async queryAccidentNumber() {
      const data = await queryAccidentNumber()
      this.accidentNumberList = data.result
    },
    // 过滤人员列表，解决数据量过大时卡顿的问题
    filterUserList(val) {
      if (!val) {
        // 列表中展示的人员
        this.personListShow = this.personList.slice(0, 20)
        //
        this.superadditionPerson()
      }
      else {
        const result = this.personList.filter((item) => {
          return item.fullName.includes(val)
        }) // 存储符合条件的下拉选项
        this.personListShow = result.slice(0, 20) // 只取前10个
      }
    },
    // 如果之前设置了人员，需要把设置的人员信息加入展示列表中，为了回显
    superadditionPerson() {
      const reversePeopleList = []
      ;(this.penaltyMeasures || []).forEach((item) => {
        const { personLiable } = item
        this.personList.filter((currentValue, index) => {
          if (
            currentValue.id === personLiable
            && !this.personListShow.find(cur => cur.id === personLiable)
          ) {
            reversePeopleList.push(currentValue)
          }
        })
      })
      this.personListShow = [...this.personListShow, ...reversePeopleList]
    },
    // 附件
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.enclosureAddress = data.result
            this.inputForm.enclosure = fileList[0].name
            this.inputForm.report = fileList[0].name.split('.')[0]
            this.$refs.enclosureAddress.clearValidate()
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.enclosureAddress = ''
        this.inputForm.enclosure = ''
      }
    },
    // 删除附件
    delDocPath() {
      this.inputForm.enclosure = ''
      this.inputForm.enclosureAddress = ''
      this.inputForm.report = ''
    },
    getDepartmentId() {},
    async doSubmit(flag) {
      if (this.page_type == 'find')
        return this.$message.warning('查看不能保存数据')
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          const penaltyMeasures = this.penaltyMeasures.filter((item) => {
            if (item.personLiable || item.penaltyAmount || item.penaltyDescription) {
              return item
            }
          })
          const preventiveMeasure = this.preventiveMeasure.filter((item) => {
            if (item.measures || item.name || item.explain) {
              return item
            }
          })
          const form = JSON.parse(JSON.stringify(this.inputForm))
          form.penaltyMeasures = penaltyMeasures.length ? JSON.stringify(penaltyMeasures) : ''
          form.preventiveMeasure = preventiveMeasure.length ? JSON.stringify(preventiveMeasure) : ''
          this.loading = true
          let res
          if (flag == 'save') {
            res = await temporaryStorageHandleReport(form)
          }
          else {
            res = await addApprovalList(form)
          }
          this.loading = false
          if (res.success) {
            // if (flag == 'save') {
            //   this.inputForm.id = res.result.id
            //   this.inputForm.processingReportDocumentNumber = res.result.processingReportDocumentNumber
            //   this.isDisabled = false
            // }
            this.visible = false
            this.$emit('getList')

            this.$message.success(res.message || '保存成功')
          }
          else {
            this.$message.warning(res.message || '保存失败')
          }
        }
      })
    },
    addNormal(val, index) {
      this.planreportIndex = index
      if (val == '风险分析') {
        this.getParamsData()
        this.showDialog('新增风险分析单元', true)
      }
      else if (val == '隐患排查计划') {
        this.showDialog('新增隐患排查计划', true)
      }
      else if (val == '其他') {
        this.showDialog('其他处置措施任务', true)
      }
      else if (val == '应急演练') {
        this.$refs.DrillPlanDetail.init(null, 'add')
      }
      else if (val == '教育培训计划') {
        this.showDialog('新增培训计划', true)
      }
    },
    /* 展示弹窗 */

    async showDialog(title, editable, info) {
      this.dialogTitle = title
      if (title == '新增风险分析单元') {
        this.showInfoDialog = true
      }
      else if (title == '新增隐患排查计划') {
        const data = await getSubordinateCompany()
        const list = data.data.result
        const cloneData = JSON.parse(JSON.stringify(list)) // 对源数据深度克隆
        const companyData = cloneData.filter((father) => {
          // 循环所有项，并添加children属性
          const branchArr = cloneData.filter(child => father.id === child.parentId) // 返回每一项的子级数组
          // eslint-disable-next-line no-unused-expressions
          branchArr.length > 0 ? (father.childrenCompany = branchArr) : '' // 给父级添加一个children属性，并赋值
          return !father.parentId // 返回第一层
        })
        this.propData = { editable: true, companyData }
        this.showInfoDialogSafe = true
      }
      else if (title == '其他处置措施任务') {
        this.showInfoDialogOther = true
      }
      else if (title == '新增培训计划') {
        this.showInfoDialogTrain = true
      }
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      if (this.dialogTitle == '新增风险分析单元') {
        this.showInfoDialog = false
      }
      else if (this.dialogTitle == '新增隐患排查计划') {
        this.showInfoDialogSafe = false
      }
      else if (this.dialogTitle == '其他处置措施任务') {
        this.showInfoDialogOther = false
      }
      else if (this.dialogTitle == '新增培训计划') {
        this.showInfoDialogTrain = false
      }
    },
    // 表单添加一行
    addDomain() {
      const data = this.penaltyMeasures
      const len = this.penaltyMeasures.length - 1
      if (
        data[len].personLiable == ''
        && data[len].penaltyAmount == ''
        && data[len].penaltyDescription == ''
      ) {
        return this.$message.error('请先输入当前行')
      }
      this.penaltyMeasures.push({
        number: this.penaltyMeasures.length + 1,
        personLiable: '',
        penaltyAmount: '',
        penaltyDescription: '',
      })
      this.flags('report')
    },
    // 表单减少一行
    deleteDomain() {
      this.penaltyMeasures.pop()
      this.flags('report')
    },
    // 表单添加一行
    addPlanReport() {
      const data = this.preventiveMeasure
      const len = this.preventiveMeasure.length - 1
      if (data[len].measures == '' && data[len].name == '' && data[len].explain == '') {
        return this.$message.error('请先输入当前行')
      }
      this.preventiveMeasure.push({
        number: this.preventiveMeasure.length + 1,
        measures: '',
        name: '',
        explain: '',
      })

      this.flags('planreport')
    },
    // 表单减少一行
    deletePlanReport() {
      this.preventiveMeasure.pop()
      this.flags('planreport')
    },
    // 判断数组长度
    flags(data) {
      if (data === 'report') {
        if (this.penaltyMeasures.length < 2) {
          this.flag = true
        }
        else {
          // 先赋值为true再赋为false, 不然会没反应
          this.flag = true
          this.flag = false
        }
      }
      else {
        if (this.preventiveMeasure.length < 2) {
          this.flag_two = true
        }
        else {
          // 先赋值为true再赋为false, 不然会没反应
          this.flag_two = true
          this.flag_two = false
        }
      }
    },
    closeDialog() {
      this.fileProp.oldFileList = [] // 重置上传附件
      this.fileProp.editable = true
      Object.assign(this.inputForm, this.$options.data().inputForm)
      this.accidentInvestigationReport = {}
      this.accidentInvestigation = {}
      this.penaltyMeasures = this.$options.data().penaltyMeasures
      this.preventiveMeasure = this.$options.data().preventiveMeasure
      this.page_type = ''
      this.$refs.inputForm.resetFields()
      Object.assign(this.auditForm, this.$options.data().auditForm)
      Object.keys(this.inputForm).forEach((v) => {
        this.inputForm[v] = null
      })
      this.tableData = []
    },
    // 审核
    async auditSubmit(flag) {
      if (!this.auditForm.relationId)
        return this.$message.error('获取ID失败')
      if (flag == 'refuse') {
        // 拒绝
        this.auditForm.approvalStatus = '审批拒绝'
      }
      else if (flag == 'submit') {
        // 通过
        this.auditForm.approvalStatus = '审批通过'
      }
      this.auditForm.handlerId = this.handlerId
      this.auditForm.approvalNo = this.approvalNo
      this.loading = true
      const res = await reportApproval(this.auditForm)
      this.loading = false
      if (res.success) {
        this.visible = false
        this.$emit('getList')
        this.$message.success(res.message || '保存成功')
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
  },
}
</script>

<template>
  <el-dialog
    :title="
      page_type == 'add'
        ? '新增处置报告'
        : page_type == 'find' || page_type == 'audit_look'
          ? '查看处置报告'
          : '修改处置报告'
    "
    :close-on-click-modal="false"
    width="900px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="page_type == 'find' || page_type == 'audit' || page_type == 'audit_look'"
      @submit.native.prevent
    >
      <!-- 事故基本类型 -->
      <el-card class="box-card">
        <div slot="header">
          <span class="box-card-title">事故基本类型</span>
        </div>
        <div class="cell">
          <div class="cell-box">
            <el-row>
              <el-col :span="colWidth">
                <el-form-item
                  label="事故编号"
                  prop="accidentNumber"
                >
                  <el-select
                    v-model="inputForm.accidentNumber"
                    filterable
                    clearable
                    style="width: 100%"
                    :disabled="page_type == 'edit'"
                  >
                    <el-option
                      v-for="item in accidentNumberList"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item
                  label="事故名称"
                  prop="accidentName"
                >
                  <el-input
                    v-model="accidentInvestigationReport.accidentName"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item
                  label="发生单位"
                  prop="occurringUnit"
                >
                  <el-input
                    v-model="accidentInvestigationReport.occurringUnit"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item
                  label="发生部位"
                  prop="leaderPhone"
                >
                  <el-input
                    v-model="accidentInvestigationReport.locationOfOccurrence"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item
                  label="发生地点"
                  prop="placeOfOccurrence"
                >
                  <el-input
                    v-model="accidentInvestigationReport.placeOfOccurrence"
                    disabled
                  />
                </el-form-item>
              </el-col>

              <el-col :span="colWidth">
                <el-form-item label="事故发生时间">
                  <el-date-picker
                    v-model="accidentInvestigationReport.timeOfAccident"
                    type="datetime"
                    :disabled="true"
                    placeholder="选择日期时间"
                  />
                  <!-- <el-input :disabled="true" v-model="accidentInvestigationReport.timeOfAccident"></el-input> -->
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item
                  label="受伤人员"
                  prop="nameOfTheInjuredPerson"
                >
                  <el-select
                    v-model="accidentInvestigationReport.nameOfTheInjuredPerson"
                    filterable
                    clearable
                    :disabled="true"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in personListShow"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-table
                v-if="tableData.length > 0"
                :data="tableData"
                disabled
                style="width: 100%"
              >
                <el-table-column
                  prop="name"
                  label="姓名"
                  width="180"
                />
                <el-table-column
                  prop="company"
                  label="公司"
                  width="180"
                />
                <el-table-column
                  prop="organization"
                  label="所属组织"
                />
                <el-table-column
                  prop="post"
                  label="岗位"
                />
                <el-table-column
                  prop="injurySituation"
                  label="人员伤害情况"
                />
              </el-table>
            </el-row>
          </div>
        </div>
      </el-card>
      <!-- 事故调查报告列表 -->
      <el-card class="box-card">
        <div slot="header">
          <span class="box-card-title">事故调查报告列表</span>
        </div>
        <el-card
          v-for="singleItem in accidentInvestigation"
          :key="singleItem.id"
          class="card-item"
        >
          <div class="cell card-inner-item">
            <!-- <div class="cell-title">事故调查报告</div> -->
            <div class="cell-box">
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item
                    label="调查报告名称"
                    prop="accidentReportName"
                  >
                    <el-input
                      v-model="singleItem.accidentReportName"
                      :disabled="true"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item label="首次调查时间">
                    <el-date-picker
                      v-model="singleItem.timeOfFirstInvestigation"
                      :disabled="true"
                      type="datetime"
                      placeholder="选择日期时间"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item
                    label="事故性质"
                    prop="accidentNature"
                  >
                    <el-select
                      v-model="singleItem.accidentNature"
                      filterable
                      :disabled="true"
                      clearable
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
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item
                    label="首次调查人员"
                    prop="firstInvestigator"
                  >
                    <el-select
                      v-model="singleItem.firstInvestigator"
                      :disabled="true"
                      filterable
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in personListShow"
                        :key="item.id"
                        :label="item.fullName"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item
                    label="首次被调查人"
                    prop="firstRespondent"
                  >
                    <el-select
                      v-model="singleItem.firstRespondent"
                      filterable
                      :disabled="true"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in personListShow"
                        :key="item.id"
                        :label="item.fullName"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item
                    label="事故类型"
                    prop="accidentType"
                  >
                    <el-select
                      v-model="singleItem.accidentType"
                      filterable
                      :disabled="true"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in $dictUtils.getDictList('reasonType')"
                        :key="item.id"
                        :label="item.dictName"
                        :value="item.dictCode"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item label="首次调查地点">
                    <el-input
                      v-model="singleItem.locationOfTheFirstInvestigation"
                      :disabled="true"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-card>
      <!-- 事故处理 -->
      <el-card class="box-card">
        <div slot="header">
          <span class="box-card-title">事故处理</span>
        </div>
        <div class="cell">
          <div class="cell-title">
            事故处理报告处罚措施
          </div>
          <div class="cell-box">
            <div
              v-for="(item, index) in penaltyMeasures"
              :key="index"
              class="box"
            >
              <el-row class="box_row">
                <el-col :span="1">
                  <span>{{ index + 1 }}</span>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="责任人">
                    <el-select
                      v-model="item.personLiable"
                      filterable
                      style="width: 120px"
                      :filter-method="filterUserList"
                    >
                      <el-option
                        v-for="item1 in personListShow"
                        :key="item1.id"
                        :label="item1.fullName"
                        :value="item1.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item
                    label="处罚金额"
                    style="margin-left: 65px"
                  >
                    <el-input
                      v-model="item.penaltyAmount"
                      style="width: 80px"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item
                    label="处罚说明"
                    style="margin-left: 65px"
                  >
                    <el-input
                      v-model="item.penaltyDescription"
                      style="width: 200px"
                    />
                  </el-form-item>
                </el-col>
                <el-button
                  v-if="index == 0"
                  icon="el-icon-circle-plus-outline"
                  style="margin-left: 160px; border: 0px"
                  @click="addDomain"
                />
                <el-button
                  v-if="index != 0"
                  icon="el-icon-remove-outline"
                  style="margin-left: 160px; border: 0px"
                  :disabled="flag"
                  @click="deleteDomain"
                />
              </el-row>
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-title">
            事故处理报告纠正或预防措施
          </div>
          <div class="cell-box">
            <div
              v-for="(item, index) in preventiveMeasure"
              :key="item.key"
              class="box_two"
            >
              <el-row class="box_row">
                <el-col :span="1">
                  <span>{{ index + 1 }}</span>
                </el-col>
                <div style="display: flex">
                  <el-form-item label="纠正或预防措施">
                    <el-select
                      v-model="item.measures"
                      clearable
                      style="width: 120px"
                    >
                      <el-option
                        v-for="item1 in planreportList"
                        :key="item1.value"
                        :label="item1.label"
                        :value="item1.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="名称">
                    <el-input
                      v-model="item.name"
                      style="width: 180px"
                      :disabled="true"
                    />
                  </el-form-item>
                </div>
                <el-row>
                  <el-col :span="1">
&nbsp;
                  </el-col>
                  <el-col :span="17">
                    <el-form-item label="纠正或预防措施说明">
                      <el-input
                        v-model="item.explain"
                        style="width: 400px"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <div style="display: flex; margin-left: 45px">
                      <el-button
                        type="primary"
                        @click="addNormal(item.measures, index)"
                      >
                        新增
                      </el-button>
                      <el-button
                        v-if="index == 0"
                        icon="el-icon-circle-plus-outline"
                        style="margin-left: 30px; border: 0px"
                        @click="addPlanReport"
                      />
                      <el-button
                        v-if="index != 0"
                        icon="el-icon-remove-outline"
                        style="margin-left: 30px; border: 0px"
                        :disabled="flag_two"
                        @click="deletePlanReport"
                      />
                    </div>
                  </el-col>
                </el-row>
              </el-row>
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-title">
            事故处理报告
          </div>
          <div class="cell-box">
            <el-row>
              <el-col :span="24">
                <el-form-item
                  ref="enclosureAddress"
                  label="文档附件"
                  style="width: 100%"
                  prop="enclosureAddress"
                >
                  <FileUpload
                    v-if="visible"
                    v-bind="fileProp"
                    @upload="uploadEvt"
                    @delSucc="delDocPath"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="处理报告文档编号">
                  <el-input
                    v-model="inputForm.processingReportDocumentNumber"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item
                  label="处理报告名称"
                  prop="teamType"
                >
                  <el-input
                    v-model="inputForm.report"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item
                label="审批类型"
                prop="approvalType"
              >
                <el-radio-group v-model="inputForm.approvalType">
                  <el-radio label="1">
                    部门级
                  </el-radio>
                  <el-radio label="2">
                    工厂级
                  </el-radio>
                  <el-radio label="3">
                    集团级
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>
          </div>
        </div>
      </el-card>
      <!-- 事故处理报告审批（只有一个审批，是从事故处理审批列表进来的，可详情可编辑） -->
      <el-card
        v-if="page_type == 'audit' || page_type == 'audit_look'"
        class="box-card"
      >
        <div slot="header">
          <span class="box-card-title">事故处理报告审批</span>
        </div>
        <div class="cell">
          <div class="cell-box">
            <el-form
              ref="auditForm"
              v-loading="loading"
              :model="auditForm"
              label-width="120px"
              :disabled="page_type == 'audit_look'"
              @submit.native.prevent
            >
              <el-row v-show="page_type == 'audit_look'">
                <el-col :span="colWidth">
                  <el-form-item label="审批人">
                    <el-input v-model="auditForm.handler" />
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item label="审批时间">
                    <el-input v-model="auditForm.circulationTime" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="审批意见">
                    <el-input
                      v-model="auditForm.approvalOpinions"
                      type="textarea"
                      :rows="3"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>
      </el-card>
      <!-- 事故处理报告审批（多个审批，是从外部其它页面进来的，只用于详情展示） -->
      <el-card
        v-if="page_type == 'audit_look' && !handlerId"
        class="box-card"
      >
        <div slot="header">
          <span class="box-card-title">事故处理报告审批记录</span>
        </div>
        <el-card
          v-for="singleItem in accidentApprovalsOnly"
          :key="singleItem.id"
          class="card-item"
        >
          <div class="cell">
            <div class="cell-box">
              <el-form
                v-loading="loading"
                label-width="120px"
                :disabled="page_type == 'audit_look'"
              >
                <el-row v-show="page_type == 'audit_look'">
                  <el-col :span="colWidth">
                    <el-form-item label="审批人">
                      <el-input v-model="singleItem.handler" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="colWidth">
                    <el-form-item label="审批时间">
                      <el-input v-model="singleItem.circulationTime" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col>
                    <el-form-item label="审批意见">
                      <el-input
                        v-model="singleItem.approvalOpinions"
                        type="textarea"
                        :rows="3"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </el-card>
      </el-card>
    </el-form>
    <span
      v-show="
        page_type == 'add'
          || page_type == 'find'
          || page_type == 'edit'
          || page_type == 'audit_look'
      "
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-show="page_type == 'add' || page_type == 'edit'"
        size="small"
        type="success"
        :loading="loading"
        @click="doSubmit('save')"
      >暂存</el-button>
      <el-button
        v-show="page_type == 'add' || page_type == 'edit'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit('submit')"
      >提交</el-button>
    </span>
    <span
      v-show="page_type == 'audit'"
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        :loading="loading"
        @click="auditSubmit('refuse')"
      >审批拒绝</el-button>
      <el-button
        size="small"
        type="primary"
        :loading="loading"
        @click="auditSubmit('submit')"
      >审批通过</el-button>
    </span>
    <!-- 新增风险分析 -->
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialog"
      width="800px"
      :close-on-click-modal="false"
    >
      <UnitInfo
        v-if="showInfoDialog"
        :riskAreaList="riskAreaList"
        v-bind="propData"
        @close="closeDialogEvt"
        @getDataFX="getDataFX"
      />
    </el-dialog>
    <!-- 新增隐患排查计划 -->
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialogSafe"
      width="950px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <SafePlanInfo
        v-if="showInfoDialogSafe"
        v-bind="propData"
        @close="closeDialogEvt"
        @getDataFX="getDataFX"
      />
    </el-dialog>
    <!-- 新增其它 -->
    <el-dialog
      class="normal-dialog"
      append-to-body
      :title="dialogTitle"
      :visible.sync="showInfoDialogOther"
      width="950px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <OtherInfo
        v-if="showInfoDialogOther"
        v-bind="propData"
        :accidentName="accidentInvestigationReport.accidentName"
        :accidentNumber="inputForm.accidentNumber"
        @close="closeDialogEvt"
        @getDataFX="getDataFX"
      />
    </el-dialog>
    <!-- 新增演练计划 -->
    <Drill-plan-detail
      ref="DrillPlanDetail"
      @getDataFX="getDataFX"
    />
    <!-- 新增教育培训计划 -->
    <EduTrainEditDialog
      width="80%"
      :title="dialogTitle"
      :visible="showInfoDialogTrain"
      :disabled="false"
      :dataSource="{}"
      formStatus="edit"
      @handleClose="closeDialogEvt"
      @getDataFX="getDataFX"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
// .title {
//   width: 100%;
//   height: 56px;
//   display: flex;
//   align-items: center;
//   font-weight: bold;
//   font-size: 18px;
//   line-height: 24px;
//   color: #303133;
// }

// .title::before {
//   display: inline-block;
//   content: '';
//   margin: 0 10px 0 0;
//   width: 4px;
//   height: 24px;
//   background-color: #409eff;
// }

.theme-default .el-date-editor.el-input,
.theme-default .el-date-editor.el-input__inner {
  width: 267px !important;
}

.box {
  border: 1px solid #dcdfe6;
  height: 50px;
  margin-bottom: 5px;

  .box_row {
    padding-top: 10px;

    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}

.box_two {
  border: 1px solid #dcdfe6;
  height: 130px;
  margin-bottom: 5px;
  .box_row {
    padding-top: 10px;

    span {
      line-height: 30px;
      padding-left: 5px;
    }
  }
}

.normal-dialog .dialog-footer {
  justify-content: center !important;
}

.cell {
  .cell-title {
    line-height: 30px;
    border-bottom: 1px solid #ccc;
    margin: 7px 0 20px 0;
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
.box-card {
  margin-bottom: 26px;
}
.box-card-title {
  font-weight: bold;
}
.card-item {
  margin-bottom: 16px;
}
.card-inner-item {
  margin-bottom: 10px;
}
</style>
