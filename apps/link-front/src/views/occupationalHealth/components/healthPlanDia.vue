<script>
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import {
  addHealthyPlan,
  getHealthyPlanArrList,
  importFileByID,
  uploadFileList,
} from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'
import RichEditor from '@/views/common-ui/RichEditor.vue'

export default {
  name: 'healthPlanDia',
  components: { RichEditor, FileUpload, ImageSelect, SelectTree },
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    const editableFile = this.Method != 'view'
    return {
      editable: editableFile,
      isLoading: false,
      monitorReportList: [],
      planDateStatus: false,
      companyId: '',
      departList: [], // 所属部门list
      // WarningStatusList:[
      //   {label:'默认',value: 0 },
      //   {label:'预警',value: 1 },
      //   {label:'报警',value: 2 },
      // ],
      planStatusList: [
        { label: '填报', value: 0 },
        { label: '已执行', value: 1 },
        { label: '已过期', value: 2 },
      ],
      inputForm: {
        monitorReportId: '',
        projectName: '',
        programmeDate: '',
        planCategory: '',
        implementationUnit: '',
        implementationUnitName: '',
        filledNameBy: '',
        attendUnit: [],
        attendUnitNames: [],
        planStatus: '',
        planCompleteDate: '', // 计划完成时间
        improveTarget: '',
        statusSurvey: '', // 富文本
        reasonAnalysis: '',
        securityEvaluate: '',
        implementationSituation: '',
        improveEvaluate: '',
      },
      richText: [
        { text: '', textType: 'statusSurvey', label: '现状调查:' },
        {
          text: '',
          textType: 'reasonAnalysis',
          label: '原因分析以及改进意见:',
        },
        { text: '', textType: 'securityEvaluate', label: '安全性评价:' },
        {
          text: '',
          textType: 'implementationSituation',
          label: '措施实施情况:',
        },
        { text: '', textType: 'improveEvaluate', label: '改进效果评价:' },
      ],
      fileProp: {
        // 附件
        editable: editableFile,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      temporaryFiles: {},
    }
  },
  watch: {
    'fileProp.oldFileList': function (newVal, oldVal) {
      if (newVal.length > 0 && this.inputForm.planStatus != 2) {
        this.inputForm.planStatus = 1
      }
      else if (this.inputForm.planStatus != 2) {
        this.inputForm.planStatus = 0
      }
    },
  },
  mounted() {
    // 获取所属部门部门list：当前人公司的所有组织架构
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      this.departList = data.result || []
    })
    // 健康管理方案下拉列表
    getHealthyPlanArrList()
      .then(({ data }) => {
        if (data.success) {
          this.monitorReportList = data.result
        }
        else {
          this.$message.warning(data.message || '查询健康管理方案下拉列表失败')
        }
      })
      .catch((err) => {
        this.$message.error('查询健康管理方案下拉列表出错', err)
      })
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.companyId = this.$store.state.user.user.companyId
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
      this.getFileList(this.inputForm.id)
      this.richText.forEach((item) => {
        item.text = this.inputForm[item.textType]
      })
      if (this.inputForm.planWarningStatus != 0) {
        // 计划预警非默认状态，不可修改计划完成时间
        this.planDateStatus = true
      }
    }
    else {
      this.inputForm.filledNameBy = JSON.parse(sessionStorage.getItem('user')).fullName
      this.inputForm.filledBy = JSON.parse(sessionStorage.getItem('user')).id
      this.inputForm.id = getUUID(32) // 生成数据id
      // 新增数据设初始值
      this.inputForm.planStatus = 0
      this.inputForm.planWarningStatus = 0
    }
  },
  methods: {
    setApplyDepartment(id, title) {
      if (id) {
        this.inputForm.attendUnit = id.split(',')
        this.inputForm.attendUnitNames = title.split(',')
      }
      else {
        this.inputForm.attendUnit = []
        this.inputForm.attendUnitNames = []
      }
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'OCCUPATION_HEALTHY_PLAN').then(({ data }) => {
          if (data.success) {
            this.inputForm.uploadPhoto = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.uploadPhoto = ''
      }
    },
    /* 文件回调 */
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    /* 文件上传 */
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'occupationalHealth',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(uploadFileResult.data.message || '文件上传失败')
      }
    },
    // 删除文件
    delFile(e) {
      this.temporaryFiles.healthPlanDia.splice(e, 1)
    },
    // 获取文件回显信息
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.fileProp.oldFileList = getFileResult.data.result
      }
      else {
        this.$message.warning(getFileResult.data.message || '查询文件失败')
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.richText.forEach((item) => {
            this.inputForm[item.textType] = item.text
          })
          if (this.temporaryFiles != undefined) {
            this.uploadFile(
              'healthPlanDia',
              this.inputForm.id,
              this.temporaryFiles.healthPlanDia,
            )
          }
          addHealthyPlan(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="130px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="监测报告"
        prop="monitorReportId"
      >
        <el-select
          v-model="inputForm.monitorReportId"
          class="big-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in monitorReportList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="项目名称"
        prop="projectName"
        :rules="{
          required: true,
          message: '报告名称不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.projectName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="方案提出时间"
        prop="programmeDate"
        :rules="{
          required: true,
          message: '方案提出时间不能为空',
          trigger: 'change',
        }"
      >
        <el-date-picker
          v-model="inputForm.programmeDate"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="方案统筹"
        prop="planCategory"
      >
        <el-select
          v-model="inputForm.planCategory"
          class="small-row"
          placeholder="请选择"
          clearable
          multiple
          @change="$forceUpdate()"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('plan_Category')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="主要实施单位"
        prop="implementationUnit"
      >
        <SelectTree
          ref="officeTree"
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :value="inputForm.implementationUnit"
          :url="companyId ? `sysDepartment/companyDepartment/${companyId}` : ' '"
          :clearable="true"
          :accordion="true"
          @getValue="
            (id, title) => {
              ;(inputForm.implementationUnit = id), (inputForm.implementationUnitName = title)
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="填表人"
        prop="filledNameBy"
        :rules="{
          required: true,
          message: '填表人不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.filledNameBy"
          class="small-row"
          placeholder="请输入"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item
        label="参与单位"
        prop="attendUnit"
      >
        <SelectTree
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="departList"
          :value="inputForm.attendUnit ? inputForm.attendUnit.toString() : ''"
          :label="inputForm.attendUnitNames ? inputForm.attendUnitNames.toString() : ''"
          :clearable="true"
          :accordion="true"
          :showCheckbox="true"
          :checkStrictly="true"
          @getValue="setApplyDepartment"
        />
      </el-form-item>
      <el-form-item
        label="方案状态"
        prop="planStatus"
      >
        <el-select
          v-model="inputForm.planStatus"
          class="small-row"
          placeholder="数据保存后，平台自动判断"
          clearable
          disabled
        >
          <el-option
            v-for="item in planStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="计划完成时间"
        prop="planCompleteDate"
      >
        <el-date-picker
          v-model="inputForm.planCompleteDate"
          :disabled="planDateStatus"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="改进目标"
        prop="improveTarget"
      >
        <el-input
          v-model="inputForm.improveTarget"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
      <div
        v-for="(item, index) in richText"
        :key="index"
      >
        <el-form-item :label="item.label">
          <RichEditor
            v-model="item.text"
            :textType="item.textType"
            width="750px"
            height="150px"
            :editable="editable"
          />
        </el-form-item>
      </div>
      <el-form-item
        label="上传图片"
        prop="uploadPhoto"
      >
        <ImageSelect
          :disabled="Method === 'view'"
          :signUrl="inputForm.uploadPhoto ? filePrefix + inputForm.uploadPhoto : ''"
          width="100px"
          height="100px"
          @fileChange="fileChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="文档编号"
        prop="documentRef"
      >
        <el-input
          v-model="inputForm.documentRef"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="上传文件"
        prop="temporaryFiles"
        style="width: 650px"
      >
        <FileUpload
          v-bind="fileProp"
          fileType="healthPlanDia"
          @upload="uploadEvt"
          @delNewUpload="delFile"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.small-row {
  width: 250px;
}

.big-row {
  width: 650px;
}
</style>
