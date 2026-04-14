<script>
import {
  certRecheckRecordAdd,
  certRecheckRecordInfoById,
  certSafeManageUpload,
} from '@/http/base-module/certificateManager-api.js'
import { getLicenseByTypeId } from '@/http/base-module/staffCertificate-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    FileUpload,
  },
  props: {
    infoId: {
      type: [Number, String],
      required: true,
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showUserName: '', // 用户名称
      isLoading: false,
      changeData: {}, // 新增的数据
      fileLimit: 1,
      accept: ['image/png', 'image/jpg', 'image/jpeg'],
      fileProp: {
        // 文件上传组件传参
        editable: this.editable,
        isDel: false,
        accept: [
          'image/png',
          'image/jpg',
          'image/jpeg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        noticMsg: 'png/jpg/jpeg/pdf/word',
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
      },
      categoryNameEnum: [],
    }
  },
  created() {
    // 获取字典信息
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getPrefix()
    this.getInfoData()
  },
  methods: {
    getInfoData() {
      this.isLoading = true
      // 获取详情
      certRecheckRecordInfoById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            const resObj = res.data.result || {}
            resObj.licenceType && this.getCategoryName(resObj.licenceType)
            // 如果可编辑，则是新增，不展示老数据
            // 根据格式添加文件
            if (resObj.enclosure) {
              const arrry = {
                originalName: resObj.enclosure.split('/').pop(),
                urlPath: resObj.enclosure,
              }
              this.fileProp.oldFileList = [arrry]
            }
            // 上传展示的文件
            if (this.editable) {
              this.changeData = {
                byId: this.infoId,
                userId: resObj.userId,
                licenceType: resObj.licenceType,
                licenceName: resObj.licenceName,
                startTime: new Date().getTime(),
              }
            }
            // 不可编辑则是查看，需要展示老数据
            else {
              this.changeData = {
                byId: this.infoId,
                userId: resObj.userId,
                licenceType: resObj.licenceType,
                licenceName: resObj.licenceName,
                licenceNumber: resObj.licenceNumber,
                mechanism: resObj.mechanism,
                startTime: new Date(resObj.startTime).getTime(),
                endTime: new Date(resObj.endTime).getTime(),
                nextReview: new Date(resObj.nextReview).getTime(),
                remarks: resObj.remarks,
                enclosure: resObj.enclosure,
              }
            }
            this.showUserName = resObj.fullName
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 限制上传数量 */
    handleExceed() {
      this.$message.warning(`最多上传 ${this.fileLimit} 个文件！`)
    },
    /* 上传事件 */
    uploadEvt(fileList) {
      if (fileList[0]) {
        this.isLoading = true
        certSafeManageUpload(fileList[0])
          .then((res) => {
            if (res.data.success) {
              this.changeData.enclosure = res.data.result
            }
            else {
              this.$message.warning(res.data.message || '上传文件失败')
            }
          })
          .catch((err) => {
            this.$message.error('上传文件出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.recheckForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          certRecheckRecordAdd(this.changeData)
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
    getCategoryName(id) {
      getLicenseByTypeId(id).then(({ data }) => {
        if (data.success) {
          const resList = data.result || []
          this.categoryNameEnum = resList
        }
        else {
          this.$message.error(data.message || '无数据')
          this.categoryNameEnum = []
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="recheck-info"
  >
    <el-form
      ref="recheckForm"
      inline
      label-width="100px"
      :disabled="!editable"
      :model="changeData"
    >
      <el-form-item
        label="姓名"
        disabled
      >
        <el-input
          v-model="showUserName"
          disabled
          style="width: 290px"
        />
      </el-form-item>
      <el-form-item
        label="证照类型"
        disabled
      >
        <KyOptSelect
          v-model.trim="changeData.licenceType"
          disabled
          :clearable="true"
          style="width: 290px"
          option="id"
          label="typeName"
          url="license/type/all"
        />
      </el-form-item>
      <el-form-item
        label="证照名称"
        disabled
      >
        <KyOptSelect
          v-model.trim="changeData.licenceName"
          style="width: 290px"
          disabled
          :clearable="true"
          option="id"
          label="categoryName"
          :localOptions="categoryNameEnum"
        />
      </el-form-item>
      <el-form-item
        label="证照号码"
        prop="licenceNumber"
        :rules="[{ required: true, message: '请输入证照号码', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.licenceNumber"
          style="width: 290px"
        />
      </el-form-item>
      <el-form-item
        label="有效日期"
        prop="startTime"
        :rules="[{ required: true, message: '请选择开始日期', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.startTime"
          type="date"
          value-format="timestamp"
          placeholder="开始日期"
          style="width: 130px"
        />
        <span style="margin: 0 0 0 10px">至</span>
      </el-form-item>
      <el-form-item
        label=""
        prop="endTime"
        :rules="[
          { required: true, message: '请选择结束日期', trigger: 'change' },
          {
            type: 'number',
            min: changeData.startTime,
            message: '不能早于开始时间',
            trigger: 'change',
          },
        ]"
      >
        <el-date-picker
          v-model="changeData.endTime"
          type="date"
          value-format="timestamp"
          placeholder="结束日期"
          style="width: 130px"
        />
      </el-form-item>
      <el-form-item
        label="下次复审"
        prop="nextReview"
        :rules="[
          { required: true, message: '请选择复审日期', trigger: 'change' },
          {
            type: 'number',
            min: changeData.startTime,
            message: '不能早于开始时间',
            trigger: 'change',
          },
        ]"
      >
        <el-date-picker
          v-model="changeData.nextReview"
          type="date"
          value-format="timestamp"
          placeholder="复审日期"
          style="width: 290px"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remarks"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 690px"
        />
      </el-form-item>
      <el-form-item label="证照附件">
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        type="primary"
        size="medium"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recheck-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  // 上传文件
  // 上传文件
  .file-upload {
    margin: 5px 0 0 0;
    .el-upload {
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .el-upload:hover {
      border-color: #409eff;
    }
    .upload-img {
      display: block;
      width: 100px;
      height: 100px;
    }
    .upload-icon {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
    }
  }
}
</style>
