<script>
import { safeTargetSave } from '@/http/orgDuty/orgDuty-api.js'
import { commonFileGetByEntityId } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import { SAFE_EXAM_STATUS, SAFE_EXAM_TYPE } from '../constant'

export default {
  components: {
    FileUpload,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      // 编辑的数据
      changeData: { checkDate: '', checkYear: '' },
      // 文件上传组件传参
      fileProp: {
        editable: this.editable,
        accept: ['application/pdf'],
        noticMsg: 'pdf',
        oldFileList: [], // 展示的文件列表
        fileLimit: 2, // 最大文件上传数量
      },
      examStatusList: SAFE_EXAM_STATUS, // 考核状态列表
      examTypeList: SAFE_EXAM_TYPE, // 考核类型列表
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      if (this.info.id) {
        this.changeData = {
          checkDate: this.info.checkDate ? this.info.checkDate : '',
          checkDepartmentId: this.info.checkDepartmentId,
          checkDepartmentName: this.info.checkDepartmentName,
          checkResult: this.info.checkResult,
          checkStaffId: this.info.checkStaffId,
          checkStaffName: this.info.checkStaffName,
          checkStatus: this.info.checkStatus,
          checkTargets: this.info.checkTargets,
          checkType: this.info.checkType,
          checkYear: this.info.checkYear ? `${this.info.checkYear}` : '',
          companyId: this.info.companyId,
          companyName: this.info.companyName,
          files: [],
          id: this.info.id,
          remark: this.info.remark,
        }
        this.getFileList(this.changeData.id)
      }
    },
    /* 下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 获取文件列表 */
    getFileList(id) {
      this.isLoading = true
      commonFileGetByEntityId(id)
        .then((res) => {
          if (res.data.success) {
            this.fileProp.oldFileList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取文件列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取文件列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.infoForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          safeTargetSave(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
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
  <div v-loading="isLoading">
    <el-form
      ref="infoForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司名称"
        prop="companyId"
      >
        <el-select
          v-model="changeData.companyName"
          clearable
          style="width: 250px"
          disabled
        >
          <el-option
            v-for="item in []"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考核类别">
        <el-radio-group
          v-model="changeData.checkType"
          style="width: 250px"
          disabled
        >
          <el-radio
            v-for="(item, index) in examTypeList"
            :key="index"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="考核部门">
        <el-select
          v-model="changeData.checkDepartmentName"
          clearable
          style="width: 250px"
          disabled
        >
          <!-- <el-option v-for="item in allDic.inspectionDepartment" :key="item.id" :label="item.dictName" :value="item.id" /> -->
          <el-option
            v-for="item in []"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="changeData.checkType == 1"
        label="考核人"
      >
        <el-select
          v-model="changeData.checkStaffName"
          clearable
          style="width: 250px"
          disabled
        >
          <!-- <el-option v-for="item in allDic.inspectionDepartment_personnel" :key="item.id" :label="item.dictName" :value="item.id" /> -->
          <el-option
            v-for="item in []"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考核标准">
        <el-input
          v-model="changeData.checkTargets"
          style="width: 250px"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="考核年份"
        prop="checkYear"
        :rules="[{ required: true, message: '请选择考核年份', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.checkYear"
          type="year"
          placeholder="请选择考核年份"
          style="width: 250px"
          value-format="yyyy"
          format="yyyy"
        />
      </el-form-item>
      <el-form-item
        label="考核时间"
        prop="checkDate"
        :rules="[{ required: true, message: '请选择考核时间', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.checkDate"
          type="date"
          placeholder="请选择考核时间"
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item
        label="考核状态"
        prop="checkStatus"
        :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
      >
        <el-radio-group
          v-model="changeData.checkStatus"
          style="width: 250px"
        >
          <el-radio
            v-for="(item, index) in examStatusList"
            :key="index"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="考核结果"
        prop="checkResult"
        :rules="[{ required: true, message: '请填写', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.checkResult"
          style="width: 630px"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          style="width: 630px"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        prop="files"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>
