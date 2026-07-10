<script>
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
    showBtn: {
      type: Boolean,
      default: true,
    },
    signUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showImg: '',
      loading: false,
      useSignUrl: true,
      picDatailDialog: false, // 查看大图的弹框
    }
  },
  watch: {
    signUrl() {
      if (this.useSignUrl)
        this.showImg = this.signUrl
    },
  },
  created() {
    this.showImg = this.signUrl
  },
  methods: {
    fileChange(file) {
      let outFile = ''
      if (file === '') {
        this.showImg = ''
      }
      else {
        const reader = new FileReader()
        reader.readAsDataURL(file.raw)
        reader.onload = () => {
          this.showImg = reader.result
        }
        outFile = file.raw
      }
      if (this.mark === null)
        this.$emit('fileChange', outFile)
      else this.$emit('fileChange', { file: outFile, mark: this.mark })
    },
    /* 无用 */
    uploadImage() {},
    /* 移除图片 */
    removeClick() {
      this.useSignUrl = false
      this.showImg = ''
      this.fileChange('')
    },
    // 查看大图
    viewBigPic() {
      this.picDatailDialog = true
    },
  },
}
</script>

<template>
  <div>
    <el-upload
      v-loading="loading"
      :disabled="disabled"
      class="avatar-uploader"
      action
      :show-file-list="false"
      accept="image/*"
      :http-request="uploadImage"
      :on-change="fileChange"
      :style="`width:${width};height:${height};`"
    >
      <div class="btnArea">
        <!-- <el-button
          v-show="showImg && showBtn"
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click.stop="removeClick"
        ></el-button> -->
        <i
          v-show="showImg && showBtn"
          v-if="!disabled"
          class="el-icon-delete icon"
          @click.stop="removeClick"
        />
        <!-- <el-button
          v-show="showImg && showBtn"
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click.stop="viewBigPic"
        ></el-button> -->
        <i
          v-show="showImg && showBtn"
          class="el-icon-search icon"
          @click.stop="viewBigPic"
        />
      </div>
      <img v-if="showImg" :src="showImg" class="avatar" style="object-fit: contain">
      <span v-else class="avatar-uploader-icon">
        <i class="el-icon-plus" />
      </span>
    </el-upload>
    <el-dialog title="查看详情" :visible.sync="picDatailDialog" :modal="false">
      <el-image :src="showImg" />
    </el-dialog>
  </div>
</template>

<style lang="scss">
.avatar-uploader:hover {
  .btnArea {
    display: block;
  }
}
.avatar-uploader {
  .el-upload {
    border: 1px dashed rgba(153, 153, 153, 0.36);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .lable {
    font-size: 20px;
    color: #e0e0e0;
  }
  .avatar-uploader-icon {
    display: block;
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    text-align: center;
    border-radius: 6px;
    border: 1px dashed rgba(153, 153, 153, 0.36);

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
    border: 1px dashed rgba(153, 153, 153, 0.36);
    border-radius: 6px;
    overflow: hidden;
  }
  .btnArea {
    display: none;
    width: 100%;
    text-align: center;
    position: absolute;
    bottom: 0;
    font-size: 14px;
    .icon {
      display: inline-block;
    }
    .icon:first-child {
      color: red;
    }
    .icon:nth-child(2) {
      color: #409eff;
      margin-left: 8px;
    }
  }
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
  height: 100%;
}
</style>
