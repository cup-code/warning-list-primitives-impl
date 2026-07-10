<script>
import { threeTimeGetPermit, threeTimeUploadPermit } from '@/http/pro-env/time3permit-api.js'

export default {
  data() {
    return {
      isLoading: false,
      permitData: {},
      // 要上传的图片数据
      uploadFileData: {
        file: '',
        type: '',
      },
      ediable: false,
    }
  },
  computed: {
    setHeight() {
      const settings = this.$store.state.settings
      let height = '50px'
      if (settings.tagModel && settings.layout !== 'lr') {
        height = '100px'
      }
      return height
    },
    setImage() {
      return function (type) {
        const front = this.filePrefix ? this.filePrefix : ''
        let back = ''
        // 正本
        if (type == 1) {
          back = this.permitData.original ? this.permitData.original : ''
        }
        // 副本
        else {
          back = this.permitData.transcript ? this.permitData.transcript : ''
        }
        const result = front + back
        return result
      }
    },
  },
  created() {
    if (this.$route.path !== '/showEmissionPermit') {
      this.ediable = true
    }
    this.getPermitData()
    this.getPrefix()
  },
  methods: {
    /* 获取许可证数据 */
    getPermitData() {
      this.isLoading = true
      threeTimeGetPermit()
        .then((res) => {
          if (res.data.success) {
            this.permitData = res.data.result ? res.data.result : {}
          }
          else {
            this.$message.warning(res.data.message || '获取许可证失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取许可证出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 上传事件 */
    uploadEvt(data) {
      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(data.file.type)) {
        this.$message.warning('只能上传png/jpg/jpeg格式的图片')
      }
      else {
        this.uploadFileData.file = data.file
        this.uploadFileData.type = data.data.type
        this.isLoading = true
        threeTimeUploadPermit(this.uploadFileData)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('上传成功')
              if (this.uploadFileData.type == 1) {
                this.permitData.transcript = res.data.result.transcript
              }
              else {
                this.permitData.original = res.data.result.original
              }
            }
            else {
              this.$message.warning(res.data.message || '上传失败')
            }
          })
          .catch((err) => {
            this.$message.warning('上传出错！', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
  },
}
</script>

<template>
  <div
    id="permit"
    v-loading="isLoading"
    :style="`height:calc(100vh - ${setHeight})`"
  >
    <!-- <Permit />
    <Permit style="margin: 30px 0 0 0" /> -->
    <div class="permit-item">
      <div class="permit-item-title">
        排污许可证(正本)
      </div>
      <el-image
        class="permit-item-img"
        :src="setImage(1)"
      >
        <div
          slot="error"
          class="error-slot"
        >
          暂无图片...
        </div>
      </el-image>
      <div>
        <el-upload
          v-if="ediable"
          action="#"
          :http-request="uploadEvt"
          :show-file-list="false"
          :data="{ type: 0 }"
        >
          <el-button
            type="primary"
            size="mini"
          >
            上传
          </el-button>
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </div>
    </div>
    <div
      class="permit-item"
      style="margin: 30px 0 0 0"
    >
      <div class="permit-item-title">
        排污许可证(副本)
      </div>
      <el-image
        class="permit-item-img"
        :src="setImage(2)"
      >
        <div
          slot="error"
          class="error-slot"
        >
          暂无图片...
        </div>
      </el-image>
      <div>
        <el-upload
          v-if="ediable"
          action="#"
          :http-request="uploadEvt"
          :show-file-list="false"
          :data="{ type: 1 }"
        >
          <el-button
            type="primary"
            size="mini"
          >
            上传
          </el-button>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#permit {
  padding: 20px;
  background: #f6fafe;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  overflow-y: auto;
  .permit-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px;
    box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
    .permit-item-title {
    }
    .permit-item-img {
      min-width: 200px;
      min-height: 200px;
      margin: 10px 0;
    }
  }
  .error-slot {
    background: #f5f7fa;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: gray;
    font-size: 14px;
  }
}
</style>
