<script>
import { commonFileDel } from '@/http/user-api.js'

export default {
  props: {
    mark: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: '150px',
    },
    width: {
      type: String,
      default: '150px',
    },
    // 这里的数组中要传对象，对象中的urlPath为图片地址
    dataList: {
      type: Array,
      default() {
        return []
      },
    },
    limit: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {
      isLoading: false,
      outFileList: [],
      showImgList: [],
    }
  },
  watch: {
    dataList(newValue, oldValue) {
      this.showImgList = this.dataList.map((item) => {
        item.url = this.filePrefix + item.urlPath
        return item
      })
    },
  },
  created() {
    // this.showImgList = JSON.parse(JSON.stringify(this.dataList))
    this.getPrefix()
  },
  methods: {
    fileChange(file) {
      console.log(file)
      this.outFileList.push(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.showImgList.push({ url: reader.result })
      }

      this.$emit('fileChange', { fileList: this.outFileList, mark: this.mark })
    },
    /* 移除图片 */
    removeClick(item, index) {
      // 如果有id，则是已上传图片，删除要走接口
      if (item.id) {
        this.deleteFileClick(item, index)
      }
      // 没id则是临时图片
      else {
        this.showImgList.splice(index, 1)
        this.outFileList.splice(index, 1)
        this.$emit('fileChange', {
          fileList: this.outFileList,
          mark: this.mark,
          removeIndex: index,
        })
      }
    },
    /* 删除已上传附件 */
    deleteFileClick(item, index) {
      this.$confirm(`您确定要删除文件<${item.originalName}>吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          commonFileDel(item)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.showImgList.splice(index, 1)
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 占位 */
    stopClick() {},
    /* 占位 */
    uploadImage() {},
  },
}
</script>

<template>
  <el-upload
    ref="uploader"
    v-loading="isLoading"
    :limit="limit"
    :disabled="disabled"
    class="uploader"
    action
    multiple
    :show-file-list="false"
    accept="image/*"
    :http-request="uploadImage"
    :before-upload="fileChange"
  >
    <div
      v-for="(item, index) in showImgList"
      :key="index"
      class="uploader-img-box"
    >
      <el-button
        type="primary"
        size="mini"
        class="btn-remove"
        @click.stop="removeClick(item, index)"
      >
        移除
      </el-button>
      <img
        :src="item.url"
        class="img-item"
        style="object-fit: contain"
        :style="`width:${width};height:${height};`"
        @click.stop="stopClick"
      >
      <div
        class="stop-item"
        @click.stop="stopClick"
      />
    </div>
    <div
      v-if="showImgList.length < limit"
      class="uploader-icon"
      :style="`width:${width};height:${height};`"
    >
      <i class="el-icon-plus" />
    </div>
  </el-upload>
</template>

<style lang="scss" scoped>
.uploader {
  .el-upload {
    display: flex;
    flex-wrap: wrap;
  }
  .uploader-icon {
    margin: 10px 10px 0 0;
    font-size: 28px;
    color: #8c939d;
    text-align: center;
    border-radius: 6px;
    border: 1px dashed rgba(153, 153, 153, 0.36);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .uploader-img-box {
    position: relative;
    cursor: auto;

    .img-item {
      display: inline-block;
      border: 1px dashed rgba(153, 153, 153, 0.36);
      border-radius: 6px;
      overflow: hidden;
    }
    .btn-remove {
      position: absolute;
      bottom: 0;
      left: calc(50% - 5px);
      transform: translate(-50%, 0);
    }
    .stop-item {
      display: inline-block;
      width: 10px;
      height: 100%;
    }
  }
}
</style>
