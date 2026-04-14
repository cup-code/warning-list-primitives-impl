<script>
import { commonFileGetByEntityIdFn, uploadFileList } from '@/http/manage-api'
import {
  getAllPlanListByIdFn,
  saveInspectionRecordFn,
} from '@/http/specialEquipment/management-api'
import { recoverNotNull } from '@/utils/fmUtils'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    FileUpload,
  },
  props: {
    did: String, // 设备id
  },
  data() {
    return {
      isLoading: false,
      labelPosition: 'right',
      planList: [],
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: false,
        editable: false,
      },
      inputForm: {
        id: '',
        equipmentId: this.did,
        inspectionPlanId: '',
        inspectionDepartment: '',
        inspectionType: 1,
        inspectionDate: '',
        reportNumber: '',
        securityLevel: '',
      },
      inputFormRule: {
        inspectionDepartment: [
          { required: true, message: '检验机构/部门不能为空', trigger: 'blur' },
        ],
        inspectionType: [{ required: true, message: '检验类型不能为空', trigger: 'change' }],
        inspectionDate: [{ required: true, message: '检验时间不能为空', trigger: 'change' }],
        reportNumber: [{ required: true, message: '报告编号不能为空', trigger: 'change' }],
      },
      method: 'add',
      files: [],
      recordId: '',
    }
  },
  methods: {
    init(obj, method) {
      this.getAllPlanListById()
      this.method = method
      this.files = []
      this.fileProp.oldFileList = []
      this.fileProp.editable = method !== 'look'
      if (obj.id) {
        this.$nextTick(() => {
          this.$refs.inputForm.clearValidate()
        })
        recoverNotNull(this.inputForm, obj)
        this.commonFileGetByEntityId(obj.id)
      }
      else {
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.id = ''
          this.inputForm.equipmentId = this.did
        })
      }
    },
    // 获取计划列表
    getAllPlanListById() {
      getAllPlanListByIdFn(this.did).then(({ data }) => {
        this.planList = data.result || []
      })
    },
    planChange(val) {
      if (val) {
        const currentPlan
          = this.planList.find((item) => {
            return item.id === val
          }) || {}
        this.inputForm.inspectionDepartment = currentPlan.inspectionDepartment
        this.inputForm.inspectionType = currentPlan.inspectionType
      }
      else {
        this.inputForm.inspectionDepartment = ''
        this.inputForm.inspectionType = 1
      }
    },
    uploadEvt(fileList) {
      this.files = fileList
    },
    /* 文件上传 */
    uploadFile() {
      const upFileData = {
        files: this.files,
        entityId: this.recordId,
        businessName: 'special_equipment',
        categoryName: 'inspection_record',
      }
      this.isLoading = true
      uploadFileList(upFileData)
        .then(({ data }) => {
          if (data.success) {
            this.$emit('refreshData')
          }
          else {
            this.$message.warning(data.message || '文件上传失败')
          }
        })
        .catch((err) => {
          this.$message.error('文件上传出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 根据id获取附件信息
    commonFileGetByEntityId(id) {
      commonFileGetByEntityIdFn(id).then(({ data }) => {
        this.fileProp.oldFileList = (data.result || []).map((item) => {
          return {
            originalName: item.originalName,
            attachmentName: item.originalName,
            filePath: item.urlPath,
            id: item.id,
            entityId: item.entityId,
          }
        })
      })
    },
    // 保存检验记录
    saveClick() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          saveInspectionRecordFn(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.recordId = data.result
                if (this.files.length) {
                  this.uploadFile()
                }
                else {
                  this.$emit('refreshData')
                }
                this.fileProp.editable = false
                this.$message.success(data.message || '保存成功')
              }
              else {
                this.$message.warning(data.message || '保存失败')
              }
            })
            .catch((e) => {
              this.$message.error(`保存异常：${e}`)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div class="inputForm">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      :label-position="labelPosition"
      label-width="120px"
      :rules="inputFormRule"
      inline
      :disabled="method === 'look'"
    >
      <el-form-item
        label="关联计划"
        prop="inspectionPlanId"
      >
        <el-select
          v-model="inputForm.inspectionPlanId"
          placeholder="请选择"
          style="width: 170px"
          filterable
          clearable
          @change="planChange"
        >
          <el-option
            v-for="item in planList"
            :key="item.id"
            :label="item.planName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="检验机构/部门"
        prop="inspectionDepartment"
      >
        <el-input
          v-model="inputForm.inspectionDepartment"
          style="width: 170px"
        />
      </el-form-item>
      <el-form-item
        label="检验类型"
        prop="inspectionType"
      >
        <el-radio-group
          v-model="inputForm.inspectionType"
          style="width: 170px"
        >
          <el-radio
            :label="1"
            size="small"
          >
            内检
          </el-radio>
          <el-radio
            :label="2"
            size="small"
          >
            外检
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="检验时间"
        prop="inspectionDate"
      >
        <el-date-picker
          v-model="inputForm.inspectionDate"
          type="date"
          value-format="yyyy-MM-dd"
          style="width: 170px"
        />
      </el-form-item>
      <el-form-item
        label="报告编号"
        prop="reportNumber"
      >
        <el-input
          v-model="inputForm.reportNumber"
          style="width: 170px"
        />
      </el-form-item>
      <el-form-item
        label="状况评估等级"
        prop="securityLevel"
      >
        <el-input
          v-model="inputForm.securityLevel"
          style="width: 170px"
        />
      </el-form-item>
      <el-form-item
        label="报告附件"
        style="width: 500px"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
      <el-row>
        <el-col>
          <div style="text-align: right; margin-bottom: 10px">
            <el-button
              type="primary"
              size="medium"
              @click="saveClick"
            >
              保存
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
