<script>
import {
  addThirdBook,
  importFileByID,
  uploadFileList,
} from '@/http/occupationalHealth/sanitation-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'accountDialog',
  components: { FileUpload },
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
      isLoading: false,
      inputForm: {
        unitName: '',
        address: '',
        legalPerson: '',
        legalPersonPhone: '',
        societyCode: '',
        unitType: '',
        remarks: '',
        BusinessLicense: '',
        contractStartDate: '',
        contractEndDate: '',
      },
      fileProp: {
        // 附件
        BusinessLicense: {
          editable: editableFile,
          oldFileList: [], // 展示的文件列表
          fileLimit: 9, // 最大文件上传数量
        },
        Contract: {
          editable: editableFile,
          oldFileList: [], // 展示的文件列表
          fileLimit: 9, // 最大文件上传数量
        },
      },
      temporaryFiles: {},
    }
  },
  created() {
    if (this.Method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.FromData))
      this.getFileList(this.inputForm.id)
    }
    else {
      this.inputForm.id = getUUID(32) // 生成数据id
    }
  },
  methods: {
    /* 文件回调 */
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    /* 文件上传 */
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'ThirdBookDia',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(data.message || '文件上传失败')
      }
    },
    // 获取文件回显信息
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        getFileResult.data.result.forEach((fileTiem) => {
          if (fileTiem.categoryName == 'BusinessLicense') {
            this.fileProp.BusinessLicense.oldFileList.push(fileTiem)
          }
          if (fileTiem.categoryName == 'Contract') {
            this.fileProp.Contract.oldFileList.push(fileTiem)
          }
        })
        this.fileProp.oldFileList = getFileResult.data.result
      }
      else {
        this.$message.warning(data.message || '查询文件失败')
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          if (this.temporaryFiles != undefined) {
            this.uploadFile(
              'BusinessLicense',
              this.inputForm.id,
              this.temporaryFiles.BusinessLicense,
            )
            this.uploadFile('Contract', this.inputForm.id, this.temporaryFiles.Contract)
          }
          addThirdBook(this.inputForm)
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
      label-width="120px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="单位名称"
        prop="unitName"
        :rules="{
          required: true,
          message: '单位名称不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.unitName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="地址"
        prop="address"
        :rules="{ required: true, message: '地址不能为空', trigger: 'change' }"
      >
        <el-input
          v-model="inputForm.address"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="法人"
        prop="legalPerson"
      >
        <el-input
          v-model="inputForm.legalPerson"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="法人电话"
        prop="legalPersonPhone"
      >
        <el-input
          v-model="inputForm.legalPersonPhone"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="统一社会信用代码"
        prop="societyCode"
      >
        <el-input
          v-model="inputForm.societyCode"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="单位类型"
        prop="unitType"
      >
        <el-select
          v-model="inputForm.unitType"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('unit_type')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remarks"
      >
        <el-input
          v-model="inputForm.remarks"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
      <el-form-item
        label="营业执照"
        prop="temporaryFiles"
        style="width: 550px"
      >
        <FileUpload
          v-bind="fileProp.BusinessLicense"
          fileType="BusinessLicense"
          @upload="uploadEvt"
        />
      </el-form-item>
      <el-form-item
        label="合同开始时间"
        prop="contractStartDate"
      >
        <el-date-picker
          v-model="inputForm.contractStartDate"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="合同结束时间"
        prop="contractEndDate"
      >
        <el-date-picker
          v-model="inputForm.contractEndDate"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="合同相关资料"
        prop="temporaryFiles"
        style="width: 550px"
      >
        <FileUpload
          v-bind="fileProp.Contract"
          fileType="Contract"
          @upload="uploadEvt"
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
  width: 200px;
}

.big-row {
  width: 550px;
}
</style>
