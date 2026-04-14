<script>
import { addAgainCost } from '@/http/safe-production/appmanage-api'

export default {
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据id
    infoId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
      // 编辑的数据
      changeData: {},
      // 文件上传组件传参
      fileProp: {
        editable: true,
        accept: [],
        noticMsg: '',
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
      },
      fileList: [], // 用来存储附件的数组
    }
  },
  mounted() {},
  created() {
    this.getInfoData()
  },
  methods: {
    returnFile(event) {
      this.changeData.file = event.file
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.infoId) {
        this.changeData.id = this.infoId
      }
      // 新增
      else {
        this.changeData = {}
      }
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addAgainCost(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="附件"
        prop="file"
      >
        <el-upload
          action="#"
          :on-preview="handlePreview"
          :http-request="returnFile"
          :limit="1"
          show-file-list
          :on-remove="handleRemove"
          :file-list="fileList"
        >
          <el-button
            size="small"
            type="primary"
          >
            点击上传
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
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
.collapse-icon {
  height: 20px;
  width: 6px;
  background: rgb(26, 26, 245);
}
.report-radio {
  .el-radio__label {
    font-size: 14px !important;
    padding-left: 5px !important;
  }
}
</style>
