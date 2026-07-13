<script>
import { importFileByID, uploadFileList } from '@/http/occupationalHealth/sanitation-api'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'riskFile',
  components: { FileUpload },
  props: {
    method: {
      type: String,
      default: '',
    },
    riskFileList: {
      type: Array,
      default: () => {
        return [
          { fileType: 'contingency-plan' },
          { fileType: 'management-plan' },
          { fileType: 'management-system' },
          { fileType: 'other' },
        ]
      },
    },
  },
  data() {
    return {
      temporaryFiles: {},
      temp: [
        {
          id: '',
          name: '应急预案文件',
          fileType: 'contingency-plan',
          compileDate: '',
          compilePerson: '',
          fileProp: {
            editable: this.method != 'view',
            oldFileList: [],
            fileLimit: 1,
          },
        },
        {
          id: '',
          name: '管理方案文件',
          fileType: 'management-plan',
          compileDate: '',
          compilePerson: '',
          fileProp: {
            editable: this.method != 'view',
            oldFileList: [],
            fileLimit: 1,
          },
        },
        {
          id: '',
          name: '管理制度文件',
          fileType: 'management-system',
          compileDate: '',
          compilePerson: '',
          fileProp: {
            editable: this.method != 'view',
            oldFileList: [],
            fileLimit: 1,
          },
        },
        {
          id: '',
          name: '其他文件',
          fileType: 'other',
          fileProp: {
            editable: this.method != 'view',
            oldFileList: [],
            fileLimit: 1,
          },
        },
      ],
    }
  },
  computed: {
    relevantFilesData() {
      this.riskFileList.forEach((data) => {
        this.temp.forEach((item) => {
          // 父子组件的数组项中fileType是一致的，用于校验。
          if (data.fileType == item.fileType) {
            ;(item.id = data.id),
            (item.compilePerson = data.compilePerson || ''),
            (item.compileDate = data.compileDate || ''),
            this.getFileList(item.id)
            // 这里要用this.getFileList(item.id)来获取文件回显
          }
        })
      })
      return this.temp
    },
  },
  methods: {
    /* 文件 */
    uploadEvt(fileList, fileType) {
      this.temporaryFiles[fileType] = fileList
    },
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.relevantFilesData.forEach((data) => {
          if (data.id == entityId) {
            data.fileProp.oldFileList = getFileResult.data.result
          }
        })
      }
      else {
        this.$message.warning(getFileResult.data.message || '查询文件失败')
      }
    },
    async uploadFile(type, id, file) {
      const upFileData = {
        files: file,
        entityId: id,
        businessName: 'dangerSourceDetail',
        categoryName: `${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(uploadFileResult.data.message || '文件上传失败')
      }
    },
    doSubmitFile() {
      // 这里用this.relevantFilesData更新掉旧的this.riskFileList，再将this.riskFileList返回父组件提交表单
      this.relevantFilesData.forEach((data) => {
        this.riskFileList.forEach((item) => {
          if (data.fileType == item.fileType) {
            item.compilePerson = data.compilePerson
            item.compileDate = data.compileDate
          }
        })
      })
      // 这里调用上传文件接口
      this.relevantFilesData.forEach((data) => {
        if (this.temporaryFiles[data.fileType] != undefined) {
          this.uploadFile(data.fileType, data.id, this.temporaryFiles[data.fileType])
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-row
      v-for="(item, index) in relevantFilesData"
      :key="item.index + item.name"
      class="row-item"
    >
      <el-col
        :span="8"
        class="col-item ci-first"
      >
        <span class="label-span">{{ item.name }}</span>
        <FileUpload
          v-bind="item.fileProp"
          :fileType="item.fileType"
          @upload="uploadEvt"
        />
      </el-col>
      <el-col
        v-if="index !== 3"
        :span="8"
        class="col-item ci-mid"
      >
        <span>编制人</span>
        <el-input
          v-model="item.compilePerson"
          placeholder="请输入"
          clearable
        />
      </el-col>
      <el-col
        v-if="index !== 3"
        :span="8"
        class="col-item ci-last"
      >
        <span>编制时间</span>
        <el-date-picker
          v-model="item.compileDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.row-item {
  padding: 10px 0;
  .col-item {
    display: flex;
    align-items: center;
    &.ci-first {
      .label-span {
        width: 80px;
      }
      .file-box {
        flex: 1;
        overflow: hidden;
        ::v-deep .el-upload-list {
          width: 100%;
          .el-upload-list__item-name {
            width: 80%;
          }
        }
      }
    }
    &.ci-mid {
      padding: 0 20px;
      span {
        width: 50px;
      }
    }
    &.ci-last {
      span {
        width: 60px;
      }
    }
  }
}
</style>
