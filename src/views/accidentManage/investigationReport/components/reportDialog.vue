<!-- @description：reportDialog 事故调查报告 -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  accidentDetails,
  accidentDetailsShenpi,
  getAccidentInvestigationDetails,
  queryAccidentNumber,
  queryByAccidentNumber,
  reportApproval,
  saveSurveyReport,
  temporaryStorageSurveyReport,
} from '@/http/accidentManage/investigation'
import { getDictList } from '@/http/anji-report/dict-data' // 获取数据字典
import { upLoadImg } from '@/http/manage-api'
import { getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'
// import { getUUID } from 'link-sdk'
export default {
  name: 'reportDialog',
  components: {
    FileUpload,
    TreeSelect,
  },
  data() {
    return {
      page_type: '',
      colWidth: 12,
      visible: false,
      content: '',
      loading: false,

      dataRule: {
        accidentReportName: [
          {
            required: true,
            message: '事故报告名称不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        accidentNumber: [
          {
            required: true,
            message: '事故编号不能为空',
            leaderNametrigger: 'blur',
          },
        ],
        approvalType: [
          {
            required: true,
            message: '请选择审批类型',
            trigger: 'change',
          },
        ],
      },
      fileProp: {
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      inputForm: {
        id: null,
        accidentIntroduction: '',
        accidentNature: '',
        accidentNumber: '',
        accidentReportName: '',
        accidentType: '',
        accidentTypeCode: '',
        approvalType: '',
        directEconomicLoss: '',
        enclosure: '',
        enclosureAddress: '',
        firstInvestigator: '',
        firstInvestigatorCode: '',
        firstRespondent: '',
        firstRespondentCode: '',
        locationOfTheFirstInvestigation: '',
        surveyReportDocumentNumber: '',
        timeOfFirstInvestigation: '',
      },
      tableData: [],
      detailForm: {},
      id: '', // 查看传递ID
      auditForm: {
        approvalOpinions: '',
        approvalStatus: '',
        relationId: '',
        circulationTime: '',
        handler: '',
      },
      numIdOptions: [], // 事故编号选项
      userOptions: [], // 人员
      reasonTypeOptions: [], // 事故类型
      accidentList: [], // 事故调查数组
      showAudit: false, // 调查报告详情 需要查看审批人的情况
      showMoreAuditDetails: false, // 外部页面进来查看多个审批详情信息标识符
      accidentApprovalList: [], // 多审批信息
    }
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
    page_type(val) {
      if (val == 'look' || val == 'edit') {
        this.getAccidentDetail({ accidentId: this.accidentId })
      }
      else if (val == 'audit' || val == 'audit_look') {
        this.getAccidentDetail({
          investigationId: this.accidentId,
          reportId: this.reportId,
          handlerId: this.handlerId,
          approvalNo: this.approvalNo,
        })
      }
    },
    visible(val) {
      // 判断上传附件是否可编辑
      if (val) {
        switch (this.page_type) {
          case 'add':
            this.fileProp.editable = true
            break
          case 'edit':
            this.fileProp.editable = true
            break
          case 'look':
            this.fileProp.editable = false
            break
          case 'audit':
            this.fileProp.editable = false
            break
          case 'audit_look':
            this.fileProp.editable = false
            break
        }
      }
      if (val && this.page_type == 'add') {
        this.getNumId()
        // 新增一条空调查报告
        this.accidentList = [
          {
            id: this.$getUUID(32),
            fileProp: {
              ...this.fileProp,
              oldFileList: [],
            },
          },
        ]
      }
    },
  },
  mounted() {
    this.getOptions()
    this.getDict()
  },
  methods: {
    // 保存 提交
    async doSubmit(flag) {
      if (this.page_type == 'look')
        return this.$message.warning('查看不能保存数据')
      this.$refs.inputForm.validate(async (valid) => {
        if (valid) {
          // 校验事故调查必填项
          const { accidentTypeCode, accidentNature } = this.accidentList[0] || {}
          if (!accidentTypeCode) {
            this.$message.warning('请选择事故类型!')
            return
          }
          else if (!accidentNature) {
            this.$message.warning('请选择事故性质!')
            return
          }
          // 删除新增时往accidentList里手动添加的id属性（添加目的是标识多个附件）
          if (this.page_type == 'add') {
            this.accidentList.forEach((item) => {
              delete item.id
            })
          }
          //
          const sendData = { ...this.inputForm, ...this.accidentList[0] }
          const form = JSON.parse(JSON.stringify(sendData))
          // 删除绑定的fileProp
          delete form.fileProp

          // 事故类型 获取事故类型id
          form.accidentType
            = this.reasonTypeOptions.find((item) => {
              return item.id == form.accidentTypeCode
            })?.text || ''

          // 获取-首次调查人员 转字符串
          if (typeof form.firstInvestigatorCode == 'string')
            form.firstInvestigatorCode = form.firstInvestigatorCode.split(',')
          form.firstInvestigator = form.firstInvestigatorCode
            ?.map((item) => {
              const temp = this.userOptions.find((x) => {
                return x.id == item
              })
              return temp?.fullName || ''
            })
            ?.join(',')

          // 首次调查人员id 转字符串
          form.firstInvestigatorCode = form.firstInvestigatorCode.join(',')
          // 获取-首次被调查人 转字符串
          if (typeof form.firstRespondentCode == 'string')
            form.firstRespondentCode = form.firstRespondentCode.split(',')
          form.firstRespondent = form.firstRespondentCode
            ?.map((item) => {
              const temp = this.userOptions.find((x) => {
                return x.id == item
              })
              return temp?.fullName || ''
            })
            ?.join(',')
          // 首次被调查人员id 转字符串
          form.firstRespondentCode = form.firstRespondentCode.join(',')

          // 受伤人员table数据
          form.detailsOfTheInjuredPerson = JSON.stringify(this.tableData)

          this.loading = true

          let res
          if (flag == 'save') {
            res = await temporaryStorageSurveyReport(form)
          }
          else {
            res = await saveSurveyReport(form)
          }

          this.loading = false
          if (res.success) {
            this.visible = false
            this.$emit('getList')
            this.$message.success('保存成功')
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
      this.detailForm = {}
      this.page_type = ''
      this.$refs.inputForm.resetFields()
      this.tableData = []
    },
    uploadEvt(fileList, field) {
      const curItem = this.accidentList.filter(item => item.id === field)[0]
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            curItem.enclosure = fileList[0].name
            curItem.enclosureAddress = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.delDocPath(0, field)
      }
    },

    // 删除附件
    delDocPath(idx, field) {
      const curItem = this.accidentList.filter(item => item.id === field)[0]
      curItem.enclosure = ''
      curItem.enclosureAddress = ''
    },
    async getNumId() {
      this.loading = true
      const res = await queryAccidentNumber()
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
      const res = await queryByAccidentNumber(id)
      this.loading = false
      if (res.success) {
        res.result.detailsOfTheInjuredPerson
        && (this.tableData = JSON.parse(res.result.detailsOfTheInjuredPerson))

        this.detailForm = JSON.parse(JSON.stringify(res.result)) || null
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 获取事故详情 --事故调查信息
    async getAccidentDetail(data) {
      this.loading = true
      let res
      if (this.handlerId) {
        res = await accidentDetailsShenpi(data)
      }
      else if (this.showMoreAuditDetails) {
        // 外部页面进来，查看多个审批详情
        res = await getAccidentInvestigationDetails(data)
      }
      else {
        res = await accidentDetails(data)
      }
      this.loading = false
      if (res.success) {
        const data = res.result
        this.detailForm = Object.assign({}, data.accidentInvestigationReport || {})

        // 改版： 一个上报可多次调查，accidentInvestigation改为数组
        // 同时还需兼容多审批信息接口返回的仍然是对象类型, 在这里转为数组类型
        if (data.accidentInvestigation && !Array.isArray(data.accidentInvestigation)) {
          data.accidentInvestigation = [data.accidentInvestigation]
        }

        if (data.accidentInvestigation?.length) {
          data.accidentInvestigation.forEach((item) => {
            // 处理调查人
            this.transformStrArr({
              data: item,
              attributeArr: ['firstInvestigatorCode', 'firstRespondentCode'],
              toArr: true,
            })
            // 处理附件
            item.fileProp = {
              ...this.fileProp,
              oldFileList: [],
            }
            if (item.enclosureAddress) {
              item.fileProp.oldFileList = [
                {
                  originalName: item.enclosure,
                  attachmentName: item.enclosure,
                  filePath: item.enclosureAddress,
                },
              ]
            }
          })
        }
        this.accidentList = data.accidentInvestigation || []
        // 用于在新增和编辑时校验
        const {
          accidentNumber,
          accidentReportName,
          approvalType,
        }
          = this.accidentList[0] || {}
        this.inputForm.accidentNumber = accidentNumber || ''
        this.inputForm.accidentReportName = accidentReportName || ''
        this.inputForm.approvalType = approvalType || ''
        // 审批信息
        if (data.accidentApproval) {
          Object.keys(this.auditForm).forEach((item) => {
            this.auditForm[item] = data.accidentApproval[item]
          })
        }
        else {
          // 多审批信息
          this.accidentApprovalList = data.accidentApprovalList || []
        }
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

    // 获取数据字典
    async getDict() {
      const reasonType = await getDictList('reasonType') // 事故类型字典
      this.reasonTypeOptions = reasonType.data || []
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
    // 处理 首次被调查人 和 首次调查人员 字符串与数组之间转换
    transformStrArr({
      data,
      attributeArr,
      toStr,
      toArr,
    }) {
      if (toStr) {
        attributeArr.forEach((item) => {
          data[item] = data[item] ? data[item].join(',') : []
        })
      }
      else if (toArr) {
        attributeArr.forEach((item) => {
          data[item] = data[item] ? data[item].split(',') : ''
        })
      }
    },
    handleApprovalType(val) {
      this.inputForm.approvalType = val
    },
  },
}
</script>

<template>
  <el-dialog
    :title="
      page_type == 'add'
        ? '新增调查报告'
        : page_type == 'edit'
          ? '修改调查报告'
          : page_type == 'look' || page_type == 'audit_look'
            ? '查看调查报告'
            : '审批调查报告'
    "
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
      :disabled="page_type == 'look' || page_type == 'audit' || page_type == 'audit_look'"
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
                <el-form-item label="事故名称">
                  <el-input v-model="detailForm.accidentName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="事故编号" prop="accidentNumber">
                  <el-select
                    v-model="inputForm.accidentNumber"
                    style="width: 100%"
                    filterable
                    :disabled="page_type == 'edit'"
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
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="发生单位">
                  <el-input v-model="detailForm.occurringUnit" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="发生地点">
                  <el-input v-model="detailForm.placeOfOccurrence" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="发生部位">
                  <el-input v-model="detailForm.locationOfOccurrence" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="事故发生时间">
                  <el-input v-model="detailForm.timeOfAccident" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="受伤人员">
                  <el-input
                    v-model="detailForm.nameOfTheInjuredPerson"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table
              v-if="tableData.length > 0"
              ref="table"
              v-loading="loading"
              :data="tableData"
              size="mini"
              height="200px"
              :header-cell-style="{ background: 'var(--ky-head-color)' }"
            >
              <el-table-column
                label="序号"
                type="index"
                width="50"
              />
              <el-table-column
                label="姓名"
                prop="name"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.name"
                    disabled
                    class="cell-input"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="公司"
                prop="company"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.company"
                    disabled
                    class="cell-input"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="所属组织"
                prop="organization"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.organization"
                    disabled
                    class="cell-input"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="岗位"
                prop="post"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.post"
                    disabled
                    class="cell-input"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="人员伤害情况"
                prop="injurySituation"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.injurySituation"
                    disabled
                    type="textarea"
                    class="cell-input"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>

      <!-- 事故调查数组 -->
      <el-card class="box-card">
        <div slot="header">
          <span class="box-card-title">事故调查报告</span>
        </div>
        <el-card
          v-for="singleItem in accidentList"
          :key="singleItem.id"
          class="card-item"
        >
          <div class="cell card-inner-item">
            <div class="cell-title">
              事故调查情况
            </div>
            <div class="cell-box">
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item label="事故报告名称" prop="accidentReportName">
                    <el-input
                      v-model="singleItem.accidentReportName"
                      @input="($event) => (inputForm.accidentReportName = $event)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item label="首次调查时间">
                    <el-date-picker
                      v-model="singleItem.timeOfFirstInvestigation"
                      type="datetime"
                      style="width: 100%"
                      value-format="yyyy-MM-dd HH:mm:ss"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item label="首次调查人员">
                    <el-select
                      v-model="singleItem.firstInvestigatorCode"
                      multiple
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
                  <el-form-item label="首次被调查人">
                    <el-select
                      v-model="singleItem.firstRespondentCode"
                      multiple
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
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item class="define-item" label="事故类型">
                    <el-select
                      v-model="singleItem.accidentTypeCode"
                      placeholder="请选择"
                      style="width: 100%"
                      filterable
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
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="colWidth">
                  <el-form-item label="直接经济损失">
                    <el-input v-model="singleItem.directEconomicLoss" />
                  </el-form-item>
                </el-col>
                <el-col :span="colWidth">
                  <el-form-item class="define-item" label="事故性质">
                    <el-select
                      v-model="singleItem.accidentNature"
                      style="width: 100%"
                      filterable
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
            </div>
          </div>
          <div class="cell card-inner-item">
            <div class="cell-title">
              事故简介
            </div>
            <div class="cell-box">
              <vue-editor
                v-model="singleItem.accidentIntroduction"
                :disabled="
                  page_type == 'look' || page_type == 'audit' || page_type == 'audit_look'
                "
                :class="page_type == 'add' || page_type == 'edit' ? '' : 'no-select'"
              />
            </div>
          </div>
          <div class="cell card-inner-item">
            <div class="cell-title">
              事故调查报告
            </div>
            <el-row>
              <el-col>
                <el-form-item
                  label="上传附件"
                  style="width: 100%"
                  prop="docPath"
                >
                  <FileUpload
                    v-if="visible"
                    :fileType="singleItem.id"
                    v-bind="singleItem.fileProp"
                    :disabled="page_type == 'look'"
                    @upload="uploadEvt"
                    @delSucc="delDocPath"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="调查报告文档编号">
                  <el-input
                    v-model="singleItem.surveyReportDocumentNumber"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="审批类型" prop="approvalType">
              <el-radio-group
                v-model="singleItem.approvalType"
                @input="handleApprovalType"
              >
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
          </div>
        </el-card>
      </el-card>
    </el-form>
    <!-- 事故调查报告审批 -->
    <el-card
      v-if="
        (page_type == 'audit' || page_type == 'audit_look' || showAudit)
          && !showMoreAuditDetails
      "
      class="box-card"
    >
      <div slot="header">
        <span class="box-card-title">事故调查报告审批</span>
      </div>
      <div class="cell">
        <div class="cell-box">
          <el-form
            ref="auditForm"
            v-loading="loading"
            :model="auditForm"
            label-width="120px"
            :disabled="page_type == 'audit_look' || showAudit"
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

    <!-- 事故调查报告审批数组 -->
    <el-card v-if="showMoreAuditDetails" class="box-card">
      <div slot="header">
        <span class="box-card-title">事故调查报告审批记录</span>
      </div>
      <el-card
        v-for="singleItem in accidentApprovalList"
        :key="singleItem.id"
        class="card-item"
      >
        <div class="cell card-inner-item">
          <div class="cell-box">
            <el-form label-width="120px" :disabled="true">
              <el-row>
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

    <span
      v-show="
        page_type == 'add'
          || page_type == 'look'
          || page_type == 'edit'
          || page_type == 'audit_look'
      "
      slot="footer"
      class="dialog-footer"
    >
      <el-button size="small" @click="visible = false">取消</el-button>
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
      >确定</el-button>
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
  </el-dialog>
</template>

<style scoped lang="scss">
.cell {
  margin-bottom: 10px;
  .cell-title {
    line-height: 30px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
  }
  .cell-title::before {
    display: inline-block;
    content: "";
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
@mixin requiredFlag {
  content: "*";
  color: #f03d3d;
  margin-right: 4px;
}
.define-item ::v-deep {
  .el-form-item__label::before {
    @include requiredFlag;
  }
}
</style>
