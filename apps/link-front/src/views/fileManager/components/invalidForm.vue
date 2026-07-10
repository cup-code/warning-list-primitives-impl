/* * @Author: xiaorui 作废文档的弹框 * @Date: 2023-01-13 10:10:13 * @Last Modified by: xiaorui *
@Last Modified time: 2023-01-13 11:49:44 */
<script>
import { invalidDocFn } from '@/http/file-manager/document-api'
import { upLoadImg } from '@/http/manage-api'
import { formatDate } from '@/utils/index'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: {
    FileUpload,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      currentUserName: '',
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
        editable: true,
      },
      inputForm: {
        docId: '',
        voidDate: '',
        voidCertificate: '', // 作废证明
        voidRemarks: '', // 作废说明
      },
      dataRule: {
        voidCertificate: [{ required: true, message: '请上传作废证明', trigger: 'blur' }],
      },
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.currentUserName = userData.fullName
  },
  methods: {
    init(docId) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.docId = docId
        this.inputForm.voidDate = formatDate(new Date())
      })
    },
    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[0], 'DOC_PATH').then(({ data }) => {
          if (data.success) {
            this.inputForm.voidCertificate = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.voidCertificate = ''
      }
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          invalidDocFn(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message || '作废成功')
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '作废失败')
              }
            })
            .catch((err) => {
              this.$message.error('作废失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    title="作废文档文件"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="作废人">
            <el-input
              v-model="currentUserName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="作废时间"
            prop="voidDate"
          >
            <el-date-picker
              v-model="inputForm.voidDate"
              disabled
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="作废证明"
        style="width: 500px"
        prop="voidCertificate"
      >
        <FileUpload
          v-if="visible"
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
      <el-form-item
        label="作废说明"
        prop="voidRemarks"
      >
        <el-input
          v-model="inputForm.voidRemarks"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >取消</el-button>
      <el-button
        v-noMoreClick
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >作废</el-button>
    </span>
  </el-dialog>
</template>
