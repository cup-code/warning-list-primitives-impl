<script>
import {
  addMonitorReport,
  importFileByID,
  uploadFileList,
} from '@/http/occupationalHealth/sanitation-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'monitorReportDia',
  components: { FileUpload },
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
    thirdBookArrList: {
      type: Array,
      default: [],
    },
  },
  data() {
    const editableFile = this.Method != 'view'
    return {
      isLoading: false,
      projectStartDate: [],
      inputForm: {
        reportName: '',
        monitorType: '',
        monitorMechanism: '',
        projectStartDate: '',
        remark: '',
      },
      fileProp: {
        // 附件
        editable: editableFile,
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      temporaryFiles: {},
    }
  },
  created() {
    if (this.Method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.FromData))
      this.getFileList(this.inputForm.id)
      if (this.inputForm.monitorBeginDate) {
        this.projectStartDate.push(this.inputForm.monitorBeginDate, this.inputForm.monitorEndDate)
      }
    }
    else {
      this.inputForm.id = getUUID(32) // 生成数据id
    }
  },
  methods: {
    /* 文件回调 */
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    /* 文件上传 */
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'occupationalHealth',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (uploadFileResult.data.success) {
        this.doSubmitPersonneDialog()
      }
      if (!uploadFileResult.data.success) {
        this.$message.warning(data.message || '文件上传失败')
      }
    },
    // 删除文件
    delFile(e) {
      this.temporaryFiles.monitorReportDia.splice(e, 1)
    },
    // 获取文件回显信息
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.fileProp.oldFileList = getFileResult.data.result
      }
      else {
        this.$message.warning(data.message || '查询文件失败')
      }
    },
    // 提交文件
    submit() {
      if (this.temporaryFiles != undefined) {
        this.uploadFile(
          'monitorReportDia',
          this.inputForm.id,
          this.temporaryFiles.monitorReportDia,
        )
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          // if (this.temporaryFiles != undefined) {
          //   this.uploadFile('monitorReportDia', this.inputForm.id, this.temporaryFiles['monitorReportDia'])
          // }
          this.inputForm.monitorBeginDate = this.projectStartDate[0]
          this.inputForm.monitorEndDate = this.projectStartDate[1]
          addMonitorReport(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="100px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="报告名称"
        prop="reportName"
        :rules="{
          required: true,
          message: '报告名称不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.reportName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="监测类别"
        prop="monitorType"
      >
        <el-select
          v-model="inputForm.monitorType"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('Monitor_category')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="监测机构"
        prop="monitorMechanism"
      >
        <el-select
          v-model="inputForm.monitorMechanism"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in thirdBookArrList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="监测时间"
        prop="projectStartDate"
      >
        <el-date-picker
          v-model="projectStartDate"
          class="small-row"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="详情附件"
        prop="temporaryFiles"
        style="width: 450px"
      >
        <FileUpload
          v-bind="fileProp"
          fileType="monitorReportDia"
          @upload="uploadEvt"
          @delNewUpload="delFile"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="inputForm.remark"
          placeholder="请输入"
          type="textarea"
          :rows="3"
          clearable
          class="big-row"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          :loading="isLoading"
          @click="submit()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.small-row {
  width: 200px;
}

.big-row {
  width: 650px;
}
</style>
