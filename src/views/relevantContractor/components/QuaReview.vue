<script>
import moment from 'moment'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { qualificationReview } from '@/http/relevantContractor/qualificationInfo-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    TreeSelect,
    FileUpload,
  },
  props: {
    // 详情数据
    infoData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      changeData: {},
      qualificationData: {},
      fileProp: {
        oldFileList: [],
        isDel: false,
        uploadDes: '',
        editable: false,
        noticMsg: 'excel/png/jpg/jpeg/pdf/word',
        fileLimit: 1, // 最大文件上传数量
      },
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.changeData = {
        departmentName: this.infoData.departmentName,
        fullName: this.infoData.fullName,
        mobile: this.infoData.mobile,
        auditingResult: this.infoData.auditingResult || 0,
        certName: this.infoData.licenceName,
        remark: this.infoData.remark || '',
      }
      this.fileProp.oldFileList = [
        {
          attachmentName: this.infoData.licenceName,
          filePath: this.infoData.enclosure,
        },
      ]
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.isLoading = true
      const params = {
        auditingDate: moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss'),
        auditingResult: this.changeData.auditingResult,
        remark: this.changeData.remark,
        certificateId: this.infoData.id,
      }
      if (this.infoData.auditingId) {
        params.id = this.infoData.auditingId
      }
      qualificationReview(params)
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
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
    >
      <el-form-item
        prop="departmentName"
        label="承包商名称"
      >
        <el-input
          v-model="changeData.departmentName"
          disabled
        />
      </el-form-item>
      <el-form-item
        prop="staffId"
        label="人员名称"
      >
        <el-input
          v-model="changeData.fullName"
          disabled
        />
      </el-form-item>
      <el-form-item
        prop="mobile"
        label="联系电话"
      >
        <el-input
          v-model="changeData.mobile"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="资质审核"
        prop="auditingResult"
        :rules="{ required: true, message: '请审核资质', trigger: 'change' }"
      >
        <el-radio-group v-model="changeData.auditingResult">
          <el-radio :label="1">
            通过
          </el-radio>
          <el-radio :label="0">
            不通过
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="资质名称"
        prop="mobile"
      >
        <el-input
          v-model="changeData.certName"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="资质附件"
        style="width: 100%"
      >
        <FileUpload v-bind="fileProp" />
      </el-form-item>
      <el-form-item
        prop="remark"
        label="备注"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 610px"
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
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.file-upload-box {
  display: flex;
  width: 100%;
  margin: 0 0 10px 0;
}
</style>
