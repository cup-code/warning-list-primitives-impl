<script>
import { commonFileGetByEntityId } from '@/http/user-api.js'
import { showFileWindow } from '@/utils/checkFile.js'

export default {
  props: {
    checkFileId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      fileList: [],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    /* 获取文件列表 */
    getDataList() {
      this.isLoading = true
      commonFileGetByEntityId(this.checkFileId)
        .then((res) => {
          if (res.data.success) {
            this.fileList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取文件列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取文件列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 查看文件内容 */
    showFileClick(url) {
      showFileWindow(url)
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="filelist-box"
  >
    <div class="filelist-title">
      点击查看详情：
    </div>
    <div
      v-for="item in fileList"
      :key="item.id"
      class="filelist-item"
      @click="showFileClick(item.urlPath)"
    >
      <div class="filelist-item-left">
        <i class="el-icon-document" />
        <span>{{ item.originalName }}</span>
      </div>
      <!-- <i class="el-icon-close filelist-item-right" @click="deleteFileClick(item, index)" v-if="editable" /> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filelist-box {
  display: flex;
  flex-direction: column;
  .filelist-title {
    margin: 0 0 10px 0;
  }

  .filelist-item {
    display: flex;
    justify-content: space-between;
    user-select: none;
    height: 25px;
    cursor: pointer;
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
      display: none;
      margin-right: 10px;
      cursor: pointer;
      height: 25px;
      width: 25px;
      line-height: 25px;
      text-align: center;
      color: #409eff;
    }
  }
}
</style>
