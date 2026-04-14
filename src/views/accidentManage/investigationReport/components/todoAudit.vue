<!-- 首页事故管理-事故报告-待办审批，防止后期业务冲突，保留原始审批列表进入审批的逻辑，遂基于reportDialog拷贝出来 -->
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  accidentDetails,
  queryAccidentNumber,
  queryByAccidentNumber,
  reportApprovalNew,
} from '@/http/accidentManage/investigation'
import { getDictList } from '@/http/anji-report/dict-data' // 获取数据字典
import { getAllUsersByCompany } from '@/http/safe-production/depart-manage-api'
import FileUpload from '@/views/common-ui/FileUpload'

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
      },
      numIdOptions: [], // 事故编号选项
      userOptions: [], // 人员
      reasonTypeOptions: [], // 事故类型
      accidentList: [], // 事故调查数组
      showAudit: false, // 调查报告详情 需要查看审批人的情况
      accidentApprovalList: [], // 多审批信息
      accidentId: '',
      todoId: '',
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
      this.getAccidentDetail({ accidentId: this.accidentId })
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
    },
  },
  mounted() {
    this.getOptions()
    this.getDict()
  },
  methods: {
    closeDialog() {
      this.detailForm = {}
      this.page_type = ''
      this.$refs.inputForm.resetFields()
      this.tableData = []
    },
    uploadEvt(fileList, field) {},

    // 删除附件
    delDocPath(idx, field) {},
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
      const res = await accidentDetails(data) // 普通详情接口
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
        } = this.accidentList[0] || {}
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
      if (flag == 'refuse') {
        // 拒绝
        this.auditForm.approvalStatus = '审批拒绝'
      }
      else if (flag == 'submit') {
        // 通过
        this.auditForm.approvalStatus = '审批通过'
      }
      this.auditForm.id = this.accidentId
      this.auditForm.todoId = this.todoId
      this.loading = true
      const res = await reportApprovalNew(this.auditForm)
      this.loading = false
      if (res.success) {
        this.$emit('refreshList')
        this.visible = false
        this.$message.success(res.message || '审批成功')
      }
      else {
        this.$message.warning(res.message || '审批失败')
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
    title="事故调查报告审批"
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
      label-width="120px"
      :disabled="true"
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
                  <el-input v-model="detailForm.accidentName" />
                </el-form-item>
              </el-col>
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
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="发生单位">
                  <el-input v-model="detailForm.occurringUnit" />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="发生地点">
                  <el-input v-model="detailForm.placeOfOccurrence" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="发生部位">
                  <el-input v-model="detailForm.locationOfOccurrence" />
                </el-form-item>
              </el-col>
              <el-col :span="colWidth">
                <el-form-item label="事故发生时间">
                  <el-input v-model="detailForm.timeOfAccident" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="受伤人员">
                  <el-input v-model="detailForm.nameOfTheInjuredPerson" />
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
                  <el-form-item
                    label="事故报告名称"
                    prop="accidentReportName"
                  >
                    <el-input
                      v-model="singleItem.accidentReportName"
                      @input="$event => (inputForm.accidentReportName = $event)"
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
                  <el-form-item
                    class="define-item"
                    label="事故类型"
                  >
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
                    <el-input v-model="singleItem.locationOfTheFirstInvestigation" />
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
                  <el-form-item
                    class="define-item"
                    label="事故性质"
                  >
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
                :disabled="true"
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
                    :disabled="true"
                    @upload="uploadEvt"
                    @delSucc="delDocPath"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="colWidth">
                <el-form-item label="调查报告文档编号">
                  <el-input v-model="singleItem.surveyReportDocumentNumber" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item
              label="审批类型"
              prop="approvalType"
            >
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
    <el-card class="box-card">
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
            @submit.native.prevent
          >
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
@mixin requiredFlag {
  content: '*';
  color: #f03d3d;
  margin-right: 4px;
}
.define-item ::v-deep {
  .el-form-item__label::before {
    @include requiredFlag;
  }
}
.normal-dialog .dialog-footer {
  justify-content: center !important;
}
</style>
