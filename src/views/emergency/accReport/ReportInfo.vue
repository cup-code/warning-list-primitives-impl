<script>
import {
  accReportAdd,
  accReportGetById,
  accReportUpdate,
} from '@/http/emergency/accident-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import AccReportData from './accReportData'
import { ACC_TYPE_LIST } from './constant'

export default {
  components: {
    FileUpload,
  },
  props: {
    // 详情id
    infoId: {
      type: [Number, String],
      default: null,
    },
    // 是否可编辑，暂时没有查看功能
    editable: {
      type: Boolean,
      default: true,
    },
    // 事件类型下拉列表数据
    evtTypeList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      accTypeList: ACC_TYPE_LIST, // 事故类别下拉列表
      isLoading: false,
      changeData: {},
      // 文件上传组件传参
      fileProp: {
        editable: this.editable,
        accept: ['image/png', 'image/jpg', 'image/jpeg'],
        noticMsg: 'png/jpg/jpeg',
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      show: false,
    }
  },
  created() {
    // 编辑需要获取数据
    if (this.infoId) {
      this.getInfoData()
    }
    else {
      this.changeData = new AccReportData()
    }

    // // 获取所有事故类型
    //     getAccTypeListAll()
    //       .then((res) => {
    //         if (res.data.success) {
    //           this.evtTypeList = res.data.result
    //         } else {
    //           this.$message.warning(res.data.message || '获取事故类型列表失败')
    //         }
    //       })
    //       .catch((err) => {
    //         this.$message.error('获取事故类型列表出错', err)
    //       })
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      accReportGetById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new AccReportData(res.data.result)
            this.fileProp.oldFileList = res.data.result.accessorys
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
      this.$refs.reportForm.validate((valid) => {
        if (this.fileProp.oldFileList.length == 0 && this.changeData.files.length == 0) {
          this.show = true
          return
        }
        if (valid) {
          let submitFunc = () => {}
          if (this.infoId) {
            submitFunc = accReportUpdate
          }
          else {
            submitFunc = accReportAdd
            delete this.changeData.id
          }
          this.isLoading = true
          submitFunc(this.changeData)
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
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <el-form
      ref="reportForm"
      :model="changeData"
      label-width="100px"
      :disabled="!editable"
    >
      <el-form-item
        label="事件名称"
        prop="eventName"
      >
        <el-input v-model="changeData.eventName" />
      </el-form-item>
      <el-form-item
        label="事件类型"
        prop="eventTypeId"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <el-radio-group
          v-model="changeData.eventTypeId"
          class="report-radio"
        >
          <el-radio
            v-for="item in evtTypeList"
            :key="item.id"
            :label="item.id"
          >
            {{ item.accidentTypeName }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="发生时间"
        prop="occurTime"
        :rules="[{ required: true, message: '请选择发生时间', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.occurTime"
          type="datetime"
          value-format="yyyy:MM:dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item
        label="发生地点"
        prop="occurSite"
        :rules="[{ required: true, message: '请填写发生地点', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.occurSite" />
      </el-form-item>
      <el-form-item
        label="事故类别"
        prop="incidentType"
        :rules="[{ required: true, message: '请选择事故类别', trigger: 'change' }]"
      >
        <el-radio-group
          v-model="changeData.incidentType"
          class="report-radio"
        >
          <el-radio :label="0">
            未遂
          </el-radio>
          <el-radio :label="1">
            既遂
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="内容"
        prop="content"
      >
        <el-input
          v-model="changeData.content"
          type="textarea"
          resize="none"
          :rows="4"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        :rules="[{ required: true, message: '请上传附件', trigger: 'change' }]"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
        <span
          v-show="show && fileProp.oldFileList.length == 0 && changeData.files.length == 0"
          style="color: #f56c6c"
        >请上传附件</span>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
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
        上报
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.report-radio {
  .el-radio__label {
    font-size: 14px !important;
    padding-left: 5px !important;
  }
}
</style>
