<script>
import { commonFileDel } from '@/http/user-api.js'
import { downloadFile, showFileWindow } from '@/utils/checkFile.js'

export default {
  props: {
    fileType: {
      // 当页面中有多个上传文件时，区分具体那个文件
      type: String,
      default: '',
    },
    // 已上传标题文字
    uploadDes: {
      type: String,
      default: '已上传：',
    },
    // 删除接口
    delFunc: {
      type: Function,
      default: commonFileDel,
    },
    // 是否可删除
    isDel: {
      type: Boolean,
      default: true,
    },
    // 按钮文字
    btnDes: {
      type: String,
      default: '上传',
    },
    // 文件是否可多选
    multiple: {
      type: Boolean,
      default: true,
    },
    // 是否可编辑使用
    editable: {
      type: Boolean,
      default: true,
    },
    // 是否前端删除，不调后台接口
    deleteFront: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 已上传的文件列表
    oldFileList: {
      type: Array,
      default() {
        return []
      },
    },
    // 文件最大数量
    fileLimit: {
      type: Number,
      default: 9,
    },
    // 可上传的类型
    accept: {
      type: Array,
      default() {
        return [
          'image/png',
          'image/jpg',
          'image/jpeg',
          'application/pdf',
          'application/msword',
          'application/vnd.ms-excel',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
      },
    },
    // 文件类型提示
    noticMsg: {
      type: String,
      default: 'png/jpg/jpeg/word/excel/pdf',
    },
  },
  data() {
    return {
      isLoading: false,
      showFiles: [], // 已上传的文件列表
      upFiles: [], // 待上传的文件列表
    }
  },
  watch: {
    oldFileList(newValue) {
      this.showFiles = newValue
    },
    editable() {
      this.upFiles = []
    },
  },
  created() {
    this.showFiles = this.oldFileList
  },
  methods: {
    showFileWindow,
    downloadFile,
    // 移除之前记录移除文件的下标
    beforeRemove(file, fileList) {
      this.removeIndex = fileList.findIndex((item) => {
        return item === file
      })
    },
    /* 移除完成回调 */
    handleRemove(file, fileList) {
      this.upFiles = fileList
      if (this.fileLimit === 1) {
        // 兼容之前附件只上传一个的情况
        this.$emit('upload', this.upFiles, this.fileType)
      }
      else {
        this.$emit('delNewUpload', this.removeIndex)
      }
    },
    /* 限制上传数量 */
    handleExceed() {
      this.$message.warning(`最多上传 ${this.fileLimit} 个文件！`)
    },
    handleProgress(event, file, fileList) {
      this.upFiles = fileList
    },
    /* 上传事件 */
    uploadEvt(data) {
      return new Promise((resolve, reject) => {
        if (!this.accept.includes(data.file.type)) {
          this.$message.warning(`只能上传${this.noticMsg}格式的文件`)
          reject()
        }
        else {
          this.upFiles.push(data.file)
          this.$emit('upload', this.upFiles, this.fileType, data)
          resolve()
        }
      })
    },
    /* 删除已上传附件 */
    deleteFileClick(item, index) {
      this.$confirm(`您确定要删除文件<${item.originalName}>吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          if (this.deleteFront) {
            this.showFiles.splice(index, 1)
            this.$emit('delSucc', index, this.fileType)
          }
          else {
            this.isLoading = true
            this.delFunc(item)
              .then((res) => {
                if (res.data.success) {
                  this.$message.success('删除成功')
                  this.showFiles.splice(index, 1)
                  this.$emit('delSucc', index, this.fileType)
                }
                else {
                  this.$message.warning(res.data.message || '删除失败')
                }
              })
              .finally(() => {
                this.isLoading = false
              })
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="file-box"
  >
    <!-- 已上传文件列表 -->
    <div
      v-if="showFiles.length > 0"
      class="filelist-box"
    >
      <div style="color: #67c23a">
        {{ uploadDes }}
      </div>

      <div
        v-for="(item, index) in showFiles"
        :key="item.id"
        class="filelist-item"
      >
        <div class="filelist-item-left">
          <i class="el-icon-document" />
          <span>{{ item.originalName || item.attachmentName }}</span>
        </div>
        <div class="filelist-item-right">
          <i
            class="el-icon-search btn-icon"
            style="margin: 0 5px 0 10px"
            @click="showFileWindow(item.urlPath || item.filePath)"
          />
          <i
            class="el-icon-download btn-icon"
            @click="downloadFile(item.urlPath || item.filePath)"
          />
          <i
            v-if="editable"
            v-show="isDel"
            class="el-icon-close btn-icon"
            @click="deleteFileClick(item, index)"
          />
        </div>
      </div>
    </div>
    <!-- 继续上传 -->
    <el-upload
      v-if="editable"
      class="file-upload"
      :accept="accept.toString()"
      action="#"
      :multiple="multiple"
      :limit="fileLimit - showFiles.length"
      :disabled="showFiles.length >= fileLimit"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-progress="handleProgress"
      :http-request="uploadEvt"
      :file-list="upFiles"
    >
      <el-button
        v-show="showFiles.length + upFiles.length < fileLimit"
        :disabled="disabled"
        type="primary"
        size="mini"
      >
        <i
          class="el-icon-upload"
          style="margin: 0 5px 0 0"
        />{{ btnDes }}
      </el-button>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.file-box {
  .file-upload {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    margin: 5px 0 0 0;
    ::v-deep.el-upload-list__item {
      margin: 0 5px;
    }
  }
  .filelist-box {
    // flex-direction: column;
    .filelist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      height: 25px;
      &:hover {
        background: #f5f7fa;
        .filelist-item-right {
          display: block;
        }
      }
      .filelist-item-left {
        i {
          margin: 0 5px 0 5px;
        }
      }
      .filelist-item-right {
        display: block;
        .btn-icon {
          margin-right: 5px;
          cursor: pointer;
          height: 25px;
          width: 20px;
          line-height: 25px;
          text-align: center;
          color: #409eff;
        }
      }
    }
  }
}
.file-box ::v-deep {
  .el-upload-list__item-name {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
