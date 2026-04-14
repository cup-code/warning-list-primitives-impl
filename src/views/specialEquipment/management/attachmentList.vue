<script>
import { commonFileGetByEntityIdFn, uploadFileList } from '@/http/manage-api'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    FileUpload,
  },
  props: {
    did: String, // 设备id
    method: String,
  },
  data() {
    return {
      loading: false,
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: false,
        editable: true,
      },
      files: [],
    }
  },
  created() {
    if (this.did) {
      this.commonFileGetByEntityId(this.did)
    }
    this.fileProp.editable = this.method !== 'look'
  },
  methods: {
    uploadEvt(fileList) {
      this.files = fileList
    },
    /* 文件上传 */
    uploadFile() {
      this.loading = true
      const upFileData = {
        files: this.files,
        entityId: this.did,
        businessName: 'special_equipment',
        categoryName: 'attachment',
      }
      uploadFileList(upFileData)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '文件上传成功')
          }
          else {
            this.$message.warning(data.message || '文件上传失败')
          }
        })
        .catch((err) => {
          this.$message.error('文件上传出错', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 根据id获取附件信息
    commonFileGetByEntityId(id) {
      commonFileGetByEntityIdFn(id).then(({ data }) => {
        this.fileProp.oldFileList = (data.result || []).map((item) => {
          return {
            originalName: item.originalName,
            attachmentName: item.originalName,
            filePath: item.urlPath,
            id: item.id,
            entityId: item.entityId,
          }
        })
      })
    },
    // 保存检验记录
    saveClick() {
      if (this.files.length) {
        this.uploadFile()
      }
    },
  },
}
</script>

<template>
  <div>
    <div class="special-equipment-title">
      相关附件
    </div>
    <FileUpload
      v-bind="fileProp"
      @upload="uploadEvt"
    />
    <el-row>
      <el-col>
        <div style="text-align: right">
          <el-button
            type="primary"
            size="medium"
            :disabled="method === 'look'"
            :loading="loading"
            @click="saveClick"
          >
            保存
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
