/* * @Author: xiaorui 文档评审弹框 * @Date: 2023-01-11 17:03:33 * @Last Modified by: xiaorui * @Last
Modified time: 2023-01-13 10:34:21 */
<script>
import { saveDocReviewFn } from '@/http/file-manager/document-api'
import { formatDate } from '@/utils/index'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      currentUserName: '',
      inputForm: {
        id: '', // 	待评审纪录id
        reviewDate: '',
        reviewOpinion: '', // 评审意见
        pass: true, // 是否通过
      },
    }
  },
  created() {
    const userData = JSON.parse(sessionStorage.getItem('user'))
    this.currentUserName = userData.fullName
  },
  methods: {
    init(id) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.id = id
        this.inputForm.reviewDate = formatDate(new Date())
      })
    },
    // 表单提交
    doSubmit(pass) {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.inputForm.pass = pass
          this.loading = true
          saveDocReviewFn(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message || '保存成功')
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存失败')
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
    title="评审会签文件"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      label-width="100px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item label="评审人">
            <el-input
              v-model="currentUserName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="评审时间"
            prop="reviewDate"
          >
            <el-date-picker
              v-model="inputForm.reviewDate"
              disabled
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="评审意见"
        prop="reviewOpinion"
      >
        <el-input
          v-model="inputForm.reviewOpinion"
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
        v-noMoreClick
        size="small"
        :loading="loading"
        @click="doSubmit(false)"
      >评审拒绝</el-button>
      <el-button
        v-noMoreClick
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit(true)"
      >评审通过</el-button>
    </span>
  </el-dialog>
</template>
