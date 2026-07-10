<script>
import { getAuthToken } from '@/utils/tab-session'
export default {
  props: {
    upLoadUrl: {
      type: String,
      default: () => {
        return ''
      },
    },
    limit: {
      type: Number,
      default: () => {
        return 1
      },
    },
    value: {
      type: Object,
      default: () => {
        return {}
      },
    },
    downloadable: false,
  },
  data() {
    return {
      window,
      fileList: [],
    }
  },
  computed: {
    requestUrl() {
      if (this.upLoadUrl != null && this.upLoadUrl.trim() != '') {
        return this.$http.BASE_URL + this.upLoadUrl
      }
      else {
        return `${this.$http.BASE_URL}/file/upload`
      }
    },
  },
  watch: {
    value: {
      handler(val) {
        this.echoUpload(this.value)
      },
      immediate: true,
    },
  },
  mounted() {
    this.echoUpload(this.value)
  },
  methods: {
    handleRemove(file) {
      this.fileList = []
      this.change()
    },
    // 上传成功的回调
    handleSuccess(response, file, fileList) {
      if (response.code != 200) {
        this.$message.error('上传失败')
        return
      }
      this.fileList.push({
        name: file.response.result.fileName,
        url: file.response.result.filePath,
        raw: file.raw,
      })
      this.change()
    },
    // 回传出去
    change() {
      this.$emit('input', this.fileList[0] || {})
      this.$emit('change', this.fileList[0] || {})
    },
    // 上传检验
    handleBeforeUpload(file) {
      const extension = file.name.split('.')[file.name.split('.').length - 1].toLowerCase()
      const extensionList = ['mp4', 'pdf']
      if (!extensionList.includes(extension)) {
        this.$message.error('只支持MP4、PDF。')
        return false
      }
      return true
    },
    // 回显
    echoUpload(val) {
      if (!val || JSON.stringify(val) === '{}') {
        this.fileList = []
      }
      else {
        this.fileList = [val]
      }
    },
    // 点击文件
    tapFile(file) {
      if (!this.downloadable) {
        return
      }
      const globalData = JSON.parse(localStorage.getItem('globalData'))
      window.open(globalData.minioFilePrefix + file.file)
    },
  },
}
</script>

<template>
  <div class="fileUpload-component-baseDialog">
    <el-upload
      :headers="{
        Authorization: getAuthToken(),
        clientChannel: 'WEB',
      }"
      :limit="limit"
      :action="requestUrl"
      :file-list="fileList"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :show-file-list="true"
      :before-upload="handleBeforeUpload"
      :class="fileList && fileList.length >= limit ? 'hide_box' : ''"
      :on-preview="tapFile"
    >
      <el-button
        size="mini"
        type="primary"
      >
        上传<i class="el-icon-upload el-icon--right" />
      </el-button>
      <div
        slot="tip"
        class="el-upload__tip"
      >
        只允许MP4、PDF。
      </div>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.fileUpload-component-baseDialog {
  .el-upload-list {
    position: absolute;
    top: 0;
    left: 80px;
    .el-upload-list__item {
      margin: 0;
      line-height: inherit;
      &:hover {
        .el-icon-close {
          height: 100%;
          line-height: inherit;
          top: 0;
        }
      }
    }
  }
}
</style>
