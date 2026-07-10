<script>
export default {
  props: {
    analysisExcelFunc: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      fileLimit: 1,
      acceptType: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      accept: ['.xls', '.xlsx'],
      noticMsg: 'xls/xlsx',
    }
  },
  methods: {
    /* 移除完成回调 */
    handleRemove() {
      this.$emit('upload', null)
    },
    /* 限制上传数量 */
    handleExceed() {
      this.$message.warning(`最多上传 ${this.fileLimit} 个文件！`)
    },
    /* 上传事件 */
    uploadEvt(data) {
      return new Promise((resolve, reject) => {
        if (!this.acceptType.includes(data.file.type)) {
          this.$message.warning(`只能上传${this.noticMsg}格式的文件`)
          reject()
          return
        }
        this.analysisExcelFunc(data.file)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('上传成功！')
              this.$emit('upload', res.data.result)
              resolve()
            }
            else {
              this.$message.warning(res.data.message || '上传文件失败')
              reject()
            }
          })
          .catch((err) => {
            this.$message.error('上传文件出错', err)
            reject()
          })
      })
    },
  },
}
</script>

<template>
  <div class="step2-box">
    <div class="step2-item">
      <div class="step2-des">
        1.请使用xlsx、xls文件上传
      </div>
      <div class="step2-des">
        2.文件大小不得超过20M
      </div>
      <div class="step2-des">
        3.不可修改数据模板原有格式
      </div>
    </div>
    <el-upload
      :accept="accept.toString()"
      action="#"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :http-request="uploadEvt"
      class="step2-upload"
      drag
      :limit="fileLimit"
    >
      <i class="el-icon-upload" />
      <div>将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.step2-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .step2-upload {
    width: 360px;
    margin: 10px 0 0;
  }
  .step2-item {
    width: 360px;
    .step2-des {
      margin: 5px 0 0 0;
      font-size: 16px;
    }
  }
}
</style>
