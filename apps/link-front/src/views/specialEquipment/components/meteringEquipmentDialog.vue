<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api.js'

import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { saveSpecialEquipmentFn } from '@/http/specialEquipment/management-api.js'
import { getSubordinateCompany } from '@/http/user-api.js'
import PickPeople from '@/views/common-ui/PickPeople'
import FileUpload from '../../common-ui/FileUpload.vue'

export default {
  components: { SelectTree, PickPeople, FileUpload },
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
    return {
      isLoading: false,
      showPeopleDialog: false,
      corporationList: [],
      departmentList: [],
      applianceNameList: [], // 器具名称列表
      jobList: [],
      // companyId: '',
      peopleProp: {}, // 选择人员参数
      inputForm: {
        companyId: '',
        companyName: '',
        departmentId: '',
        departmentName: '',
        utensilName: '',
        equipmentModel: '',
        factoryNumber: '',
        internalNumber: '',
        utensilMeasureScope: '',
        accuracyGrade: '',
        grade: '',
        manufacturingUnit: '',
        usePlace: '',
        submissionWay: null,
        verificationCycle: '',
        responsiblePerson: '',
        responsiblePersonName: '',
        submissionInstitution: '',
        certificateRequirements: '',
        lastVerificationDate: '',
        effectiveDate: '',
        remark: '',
        files: [],
      }, // 文件上传组件传参
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        editable: this.Method != 'view',
      },
      filesList: [], // 路径附件
      oldFiles: [], // 再次编辑时，需要记录之前上传的附件
      newFiles: [], // 再次编辑时，需要记录新上传的附件
    }
  },
  created() {
    this.applianceNameList = this.$dictUtils.getDictList('appliance_name')
    this.getSubordinateCompany()
    if (this.Method != 'add') {
      // this.companyId = this.$store.state.user.user.companyId
      this.getAllDepartByCompany(this.FromData.companyId)
      setTimeout(() => {
        this.inputForm = Object.assign({}, this.inputForm, this.FromData)
        if (this.inputForm.files && this.inputForm.files.length) {
          this.fileProp.oldFileList = this.inputForm.files.map((item) => {
            return {
              originalName: item,
              attachmentName: item,
              filePath: item,
            }
          })
        }
        this.oldFiles = cloneDeep(this.inputForm.files) || []
        this.newFiles = []
      }, 400)
    }
    else {
      setTimeout(() => {
        this.inputForm.companyId = this.$store.state.user.user.companyId
        this.inputForm.companyName = this.$store.state.user.user.companyName
        this.getAllDepartByCompany(this.inputForm.companyId)
      }, 500)
    }
  },
  methods: {
    // 获取公司列表
    getSubordinateCompany() {
      getSubordinateCompany()
        .then(({ data }) => {
          if (data.success) {
            this.corporationList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },

    // 通过公司查部门
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.departmentList = (data.result || []).filter((item) => {
              return item.departmentType === 'DEPARTMENT'
            })
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },

    // 获取公司id
    getApplicantCorporationName(value, name) {
      this.inputForm.companyId = value
      this.inputForm.companyName = name
      this.getAllDepartByCompany(this.inputForm.companyId)
    },

    // 获取部门id
    getApplicantDeptName(value) {
      this.inputForm.departmentId = value
      const currentDepart
        = this.departmentList.find((item) => {
          return item.id === value
        }) || {}
      this.inputForm.departmentName = currentDepart.departmentName
    },

    // 选择责任人员
    choosePeople() {
      this.peopleProp.oldPickList = this.inputForm.postUser || []
      this.peopleProp.listType = 'company'
      this.peopleProp.isSingle = true
      this.showPeopleDialog = true
    },
    // 选择责任人员之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.inputForm.responsiblePerson = params.data.id
        this.inputForm.responsiblePersonName = params.data.fullName
      }
      this.showPeopleDialog = false
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'METERING_EQUIPMENT').then(
          ({ data }) => {
            if (data.success) {
              this.$message.success('上传成功')
              this.newFiles.push(data.result)
            }
            else {
              this.$message.error(data.message || '上传失败')
            }
          },
        )
      }
      else {
        this.newFiles = []
      }
    },
    // 删除新上传的附件
    delNewFiles(index) {
      this.newFiles.splice(index, 1)
    },
    // 再次编辑的时候删除之前上传的附件
    delDocPath(index) {
      this.oldFiles.splice(index, 1)
    },

    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.files = this.oldFiles.concat(this.newFiles)
          saveSpecialEquipmentFn(this.inputForm)
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
  <div class="dialog-info">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="100px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="归属公司"
        prop="companyId"
        :rules="{
          required: true,
          message: '归属公司不能为空',
          trigger: 'blur',
        }"
      >
        <SelectTree
          class="small-row"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="corporationList"
          :value="inputForm.companyId"
          :label="inputForm.companyName"
          :clearable="true"
          :accordion="true"
          @getValue="
            (value, title) => {
              getApplicantCorporationName(value, title);
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="归属部门"
        prop="departmentId"
        :rules="{
          required: true,
          message: '归属部门不能为空',
          trigger: 'blur',
        }"
      >
        <el-select
          v-model="inputForm.departmentId"
          placeholder="请选择"
          filterable
          style="width: 100%"
          @change="getApplicantDeptName"
        >
          <el-option
            v-for="item in departmentList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="器具名称 "
        prop="utensilName"
        :rules="{
          required: true,
          message: '器具名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-select v-model="inputForm.utensilName" placeholder="请选择">
          <el-option
            v-for="item in applianceNameList"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规格型号 " prop="equipmentModel">
        <el-input v-model="inputForm.equipmentModel" class="small-row" />
      </el-form-item>
      <el-form-item label="出厂编号 " prop="factoryNumber">
        <el-input v-model="inputForm.factoryNumber" class="small-row" />
      </el-form-item>
      <el-form-item label="内部编号 " prop="internalNumber">
        <el-input v-model="inputForm.internalNumber" class="small-row" />
      </el-form-item>
      <el-form-item label="器具测量范围 " prop="utensilMeasureScope">
        <el-input v-model="inputForm.utensilMeasureScope" class="small-row" />
      </el-form-item>
      <el-form-item label="准确度等级 " prop="accuracyGrade">
        <el-input v-model="inputForm.accuracyGrade" class="small-row" />
      </el-form-item>
      <el-form-item label="等级 " prop="grade">
        <el-input v-model="inputForm.grade" class="small-row" />
      </el-form-item>
      <el-form-item label="制造单位 " prop="manufacturingUnit">
        <el-input v-model="inputForm.manufacturingUnit" class="small-row" />
      </el-form-item>
      <el-form-item label="使用地点 " prop="usePlace">
        <el-input v-model="inputForm.usePlace" class="small-row" />
      </el-form-item>
      <el-form-item label="检送方式 " prop="submissionWay">
        <el-radio-group v-model="inputForm.submissionWay">
          <el-radio :label="1">
            送检
          </el-radio>
          <el-radio :label="2">
            上门检
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="定检周期 " prop="verificationCycle">
        <el-input v-model="inputForm.verificationCycle" class="small-row" />
      </el-form-item>
      <el-form-item label="责任人" prop="responsiblePersonName">
        <el-input
          v-model="inputForm.responsiblePersonName"
          class="small-row"
          readonly
          @focus="choosePeople"
        />
      </el-form-item>
      <el-form-item label="检定机构 " prop="submissionInstitution">
        <el-input v-model="inputForm.submissionInstitution" class="small-row" />
      </el-form-item>
      <el-form-item label="证书要求 " prop="certificateRequirements">
        <el-input v-model="inputForm.certificateRequirements" class="small-row" />
      </el-form-item>
      <el-form-item label="上次检定日期" prop="lastVerificationDate">
        <el-date-picker
          v-model="inputForm.lastVerificationDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="有效期至" prop="effectiveDate">
        <el-date-picker
          v-model="inputForm.effectiveDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="申请附件">
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
          @delSucc="delDocPath"
          @delNewUpload="delNewFiles"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inputForm.remark"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick(false)">
        关闭
      </el-button>
      <el-button
        v-if="Method !== 'view'"
        v-noMoreClick
        type="primary"
        @click="doSubmitPersonneDialog()"
      >
        提交
      </el-button>
    </div>
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
  </div>
</template>

<style scoped>
.small-row {
  width: 192px;
}

.big-row {
  width: 500px;
}
</style>
