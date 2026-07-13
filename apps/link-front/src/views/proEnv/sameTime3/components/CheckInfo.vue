<script>
import {
  threeTimeCheckById,
  threeTimeCheckDelFile,
  threeTimeCheckSaveInfo,
  threeTimeCheckUpdateInfo,
} from '@/http/pro-env/time3check-api.js'

export default {
  props: {
    // 是否新创建
    isNew: {
      type: Boolean,
      default: true,
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 详情id
    infoId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      accept: [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      loadingDialog: false,
      changeData: { files: [] }, // 修改/新增的数据
      showFiles: [], // 展示已上传的老文件列表
      fileLimit: 9, // 上传文件最大数量
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 初始化信息 */
    getInfoData() {
      // 新增
      if (this.isNew) {
        this.changeData = { createdTime: new Date().getTime(), files: [] }
        this.showFiles = []
      }
      // 修改或查看
      else {
        this.loadingDialog = true
        threeTimeCheckById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              const {
                id,
                organization,
                documentNum,
                title,
                remark,
                createdTime,
              } = res.data.result
              this.changeData = {
                files: [],
                id,
                organization,
                documentNum,
                title,
                remark,
                createdTime: new Date(createdTime).getTime(),
              }
              this.showFiles = res.data.result.accessorys
            }
            else {
              this.$message.warning(res.data.message || '请求详情失败')
            }
          })
          .catch((err) => {
            this.$message.error('请求详情出错！', err)
          })
          .finally(() => {
            this.loadingDialog = false
          })
      }
    },
    /* 移除完成回调 */
    handleRemove(file, fileList) {
      this.changeData.files = fileList
    },
    /* 限制上传数量 */
    handleExceed() {
      this.$message.warning(`最多上传 ${this.fileLimit} 个文件！`)
    },
    /* 上传事件 */
    uploadEvt(data) {
      return new Promise((resolve, reject) => {
        if (!this.accept.includes(data.file.type)) {
          this.$message.warning('只能上传png/jpg/jpeg格式的图片、excel、word或pdf')
          reject()
        }
        else {
          this.changeData.files.push(data.file)
          resolve()
        }
      })
    },
    /* 确认保存 */
    saveChangeClick() {
      this.$refs.infoForm.validate((valid) => {
        if (valid) {
          let saveFunc = threeTimeCheckUpdateInfo
          if (this.isNew) {
            saveFunc = threeTimeCheckSaveInfo
          }
          this.loadingDialog = true
          saveFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success(res.data.message || '保存成功！')
                this.closeClick(true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错！', err)
            })
            .finally(() => {
              this.loadingDialog = false
            })
        }
      })
    },
    /* 删除已上传附件 */
    deleteFileClick(item, index) {
      this.$confirm(`您确定要删除文件<${item.fileName}>吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingDialog = true
          threeTimeCheckDelFile(item)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.showFiles.splice(index, 1)
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.loadingDialog = false
            })
        })
        .catch(() => {})
    },
    /* 关闭弹窗 */
    closeClick(isRefresh = false) {
      this.$emit('succ', isRefresh)
    },
  },
}
</script>

<template>
  <div class="check-info">
    <el-form
      ref="infoForm"
      v-loading="loadingDialog"
      :model="changeData"
      label-width="80px"
      size="mini"
      style="width: 500px"
      :disabled="!editable"
    >
      <el-form-item
        label="单位"
        prop="organization"
        :rules="{ required: true, message: '请填写单位', trigger: 'blur' }"
      >
        <el-input v-model="changeData.organization" />
      </el-form-item>
      <el-form-item
        label="文号"
        prop="documentNum"
        :rules="{ required: true, message: '请填写文号', trigger: 'blur' }"
      >
        <el-input v-model="changeData.documentNum" />
      </el-form-item>
      <el-form-item
        label="标题"
        prop="title"
        :rules="{ required: true, message: '请填写标题', trigger: 'blur' }"
      >
        <el-input v-model="changeData.title" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
        />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-date-picker
          v-model="changeData.createdTime"
          type="date"
          value-format="timestamp"
          placeholder="选择创建日期"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        prop="files"
        :rules="{
          required: showFiles.length + changeData.files.length === 0,
          message: '请上传附件',
          trigger: 'change',
        }"
      >
        <!-- 已上传文件列表 -->
        <div class="filelist-box">
          <div>已上传文件：</div>
          <div
            v-for="(item, index) in showFiles"
            :key="item.id"
            class="filelist-item"
          >
            <div class="filelist-item-left">
              <i class="el-icon-document" />
              <span>{{ item.fileName }}</span>
            </div>
            <i
              v-if="editable"
              class="el-icon-close filelist-item-right"
              @click="deleteFileClick(item, index)"
            />
          </div>
        </div>
        <el-upload
          class="file-upload"
          :accept="accept.toString()"
          action="#"
          multiple
          :limit="fileLimit - showFiles.length"
          :disabled="showFiles.length >= 5"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
          :http-request="uploadEvt"
          :file-list="changeData.files"
        >
          <el-button
            type="primary"
            size="mini"
          >
            上传
          </el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="closeClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        :disabled="loadingDialog"
        @click="saveChangeClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.check-info {
  .file-upload {
    margin: 5px 0 0 0;
  }
  .filelist-box {
    display: flex;
    flex-direction: column;
    .filelist-item {
      display: flex;
      justify-content: space-between;
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
}
</style>
