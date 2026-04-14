<script>
import { saveOrUpdateSafeLibEvalItemByUser } from '@/http/fireControl-api'
// import { commonApi } from 'link-sdk'
const { upLoadImg } = this.$commonApi

export default {
  components: {},
  props: {
    title: {
      require: true,
      type: String,
      default: '标题',
    },
    width: {
      type: String,
      default: '50%',
    },
    visible: {
      required: true,
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'mini',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    labelWidth: {
      type: String,
      default: '90px',
    },
    dataSource: {
      required: false,
      type: Object,
      default: () => {
        return {}
      },
    },
    formStatus: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialogForm: {},
      rules: {
        evalDesc: [{ required: true, message: '不能为空', trigger: 'change' }],
        isBlank: [{ required: true, message: '不能为空', trigger: 'change' }],
      },
      problemOptions: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      fileProp: {
        editable: !this.disabled,
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
        deleteFront: true,
      },
    }
  },
  watch: {
    dataSource: {
      handler(val) {
        this.dialogForm = JSON.parse(JSON.stringify(val))
        this.reverseParams(this.dialogForm)
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    // 关闭模态框
    closeDialog() {
      this.$emit('handleClose', false)
    },
    // 确定
    doneFn() {
      this.$refs.dialogForm.validate((valid, obj) => {
        if (!valid)
          return
        saveOrUpdateSafeLibEvalItemByUser({
          ...this.dialogForm,
          reviewStatus: '已自评',
        }).then(({ data }) => {
          if (data.code != '200') {
            this.$message.error(data.message || '保存失败!')
            return
          }
          else {
            this.$message.success('保存成功')
          }
          this.$emit('refreshList')
          this.closeDialog()
        })
      })
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      if (fileList[0]) {
        upLoadImg(fileList[0], 'ISM_REVIEW_PATH').then(({ data }) => {
          if (data.success) {
            this.dialogForm.reviewFile = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.delDocPath()
      }
    },
    // 删除附件
    delDocPath() {
      this.dialogForm.reviewFile = ''
    },
    reverseParams(data) {
      this.fileProp.oldFileList = data.reviewFile
        ? [
            {
              attachmentName: (data.reviewFile || '').split('/').pop() || '',
              filePath: data.reviewFile,
            },
          ]
        : []
    },
    handleBlank(val) {
      val && this.$set(this.dialogForm, 'realScore', 0)
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="normal-dialog course-dialog"
      :title="title"
      :width="width"
      :close-on-click-modal="false"
      center
      :visible.sync="visible"
      :before-close="closeDialog"
      destroy-on-close
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="rules"
        :size="size"
        :label-width="labelWidth"
        :disabled="disabled"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="考评类目" prop="categoryName">
              <el-input
                v-model.trim="dialogForm.categoryName"
                placeholder="请输入"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考评项目" prop="itemName">
              <el-input
                v-model.trim="dialogForm.itemName"
                placeholder="请输入"
                clearable
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="考评内容" prop="evalContent">
              <el-input
                v-model.trim="dialogForm.evalContent"
                type="textarea"
                rows="3"
                placeholder="请输入"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="考评办法" prop="evalMeasure">
              <el-input
                v-model.trim="dialogForm.evalMeasure"
                type="textarea"
                rows="3"
                placeholder="请输入"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标准分值" prop="standardScore">
              <el-input-number
                v-model="dialogForm.standardScore"
                :min="1"
                label="标准分值"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="自评/评审描述" prop="evalDesc">
              <el-input
                v-model.trim="dialogForm.evalDesc"
                type="textarea"
                rows="3"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否空项" prop="isBlank">
              <el-radio-group v-model="dialogForm.isBlank" @change="handleBlank">
                <el-radio
                  v-for="item in problemOptions || []"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="实际得分" prop="realScore">
              <el-input-number
                v-model="dialogForm.realScore"
                :min="0"
                label="实际得分"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="12">
                <el-form-item label="附件" prop="reviewFile">
                  <KyBaseAppendix
                    v-if="visible"
                    v-bind="fileProp"
                    fileType="reviewFile"
                    @upload="uploadEvt"
                    @delSucc="delDocPath"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="disabled"
          @click="doneFn"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.normal-dialog.course-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
@mixin requiredFlag {
  content: "*";
  color: #f03d3d;
  margin-right: 4px;
}
.define-item {
  .el-form-item__label::before {
    @include requiredFlag;
  }
}
.defineHeader {
  @include requiredFlag;
}
</style>
