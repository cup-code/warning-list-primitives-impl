<script>
import {
  getAssessContentInfo,
  uploadExecuteFile,
} from '@/http/changeManagement/changeManagementNew-api'

export default {
  props: {
    changeFactParams: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      formData: {
        assessContent: {},
        executeFile: [],
        executeIllustrate: '',
      },
      // 文件上传组件传参
      fileProp: {
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        fileClass: 'CHANGE_MANAGEMENT',
      },
    }
  },
  created() {
    if (this.changeFactParams.applyId) {
      this.getAssessContentInfoFn()
    }
  },
  methods: {
    getAssessContentInfoFn() {
      getAssessContentInfo(this.changeFactParams).then(({ data }) => {
        if (data.success) {
          this.formData = Object.assign(this.formData, data.result)
        }
      })
    },
    closeLoading() {
      this.$emit('closeLoading', false)
    },

    /* 点击提交 */
    submitClick() {
      if (!this.formData.executeIllustrate) {
        this.$message.warning('执行说明不能为空')
        return
      }
      this.isLoading = true
      const param = {
        applyId: this.changeFactParams.applyId,
        contentId: this.changeFactParams.contentId,
        taskId: this.changeFactParams.todoTaskId,
        executeFile: this.formData.executeFile,
        executeIllustrate: this.formData.executeIllustrate,
      }
      uploadExecuteFile(param)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('保存成功')
            this.closeLoading()
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
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <div class="dialog-info">
      <el-form
        ref="checkTableForm"
        :model="formData"
        label-width="100px"
        style="width: calc(100% - 50px)"
      >
        <el-form-item
          label="变更编号"
          prop="applyRef"
        >
          <span>{{ formData.applyRef }}</span>
        </el-form-item>
        <el-form-item label="变更内容">
          <span>{{ formData.assessContent.assessContent }}</span>
        </el-form-item>
        <el-form-item label="分类">
          <span>{{ formData.assessContent.assessCategoryName }}</span>
        </el-form-item>
        <el-form-item label="内容">
          <span>{{ formData.assessContent.assessContent }}</span>
        </el-form-item>
        <el-form-item label="初始风险">
          <span>{{ formData.assessContent.initRisk }}</span>
        </el-form-item>
        <el-form-item label="控制风险">
          <span>{{ formData.assessContent.controlMeasure }}</span>
        </el-form-item>
        <el-form-item label="控制后风险">
          <span>{{ formData.assessContent.controlRisk }}</span>
        </el-form-item>
        <el-form-item
          label="执行说明"
          class="explain-box"
        >
          <el-input
            v-model="formData.executeIllustrate"
            type="textarea"
            :rows="2"
            resize="none"
          />
        </el-form-item>
        <el-form-item
          label="相关附件"
          prop="executeFile"
        >
          <KyFileUpload
            v-model="formData.executeFile"
            v-bind="fileProp"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="closeLoading"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认落实
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.explain-box {
  position: relative;
}
.explain-box::before {
  content: '*';
  font-size: 12px;
  color: red;
  position: absolute;
  top: 8px;
  left: 32px;
}
</style>
