<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { addSourceFilesData, getSourceFile } from '@/http/major-hazard/dangerSourceFiles-api'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  name: 'sourceFilesFrom',
  components: { SelectTree, FileUpload },
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    fromData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      loading: false,
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
      },
      // 附件信息列表
      filesname: [
        {
          name: '重大危险源档案：',
          type: '重大危险源档案',
          fileProp: {
            editable: this.editable,
            // delFunc:deleteFile,     //删除接口
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '一、辨识、分级记录：',
          type: '辨识分级记录',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '二、危险化学品重大危险源基本特征表：',
          type: '危险化学品重大危险源基本特征表',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '三、涉及的所有化学品安全技术说明书：',
          type: '涉及的所有化学品安全技术说明书',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '四、区域位置图、周边环境图、平面布置图、工艺流程图：',
          type: '区域位置图周边环境图平面布置图工艺流程图',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '五、管理规章制度及安全操作规程：',
          type: '管理规章制度及安全操作规程',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '六、设备、安全设施和安全监测监控系统情况：',
          type: '设备安全设施和安全监测监控系统情况',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '七、应急预案、评审意见、演练计划评估报告：',
          type: '应急预案评审意见演练计划评估报告',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '八、安全评估报告或者安全评价报告：',
          type: '安全评估报告或者安全评价报告',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '九、安全包保责任人、职责、联系方式：',
          type: '安全包保责任人职责联系方式',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '十、场所安全包保责任人公示安全警示安全周知：',
          type: '场所安全包保责任人公示安全警示安全周知',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '十一、重大危险源场所关键装置重点部位照片：',
          type: '重大危险源场所关键装置重点部位照片',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '十二、重大危险源从业人员情况：',
          type: '重大危险源从业人员情况',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '十三、安全包保责任人履职记录，履职情况评价：',
          type: '安全包保责任人履职记录',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '十四、其他文件、资料：',
          type: '其他文件',
          fileProp: {
            editable: this.editable,
            accept: [
              'image/png',
              'image/jpg',
              'image/jpeg',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            noticMsg: 'png/jpg/jpeg',
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
      ],
      inputForm: {
        companyId: '',
        year: '',
        name: '',
      },
    }
  },
  created() {
    this.inputForm = JSON.parse(JSON.stringify(this.fromData))
    if (this.inputForm.id) {
      this.getFiles()
    }
  },
  methods: {
    getCompanyId(valueId, valueTitle) {
      this.inputForm.companyId = valueId
      this.inputForm.companyName = valueTitle
    },
    /* 上传回调事件 */
    uploadEvt(fileList, fileType) {
      this.inputForm[fileType] = fileList
    },
    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addSourceFilesData(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true, 'submit')
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
      this.$emit('succ', isRefresh)
    },
    // 获取回显文件
    getFiles() {
      getSourceFile(this.inputForm.id)
        .then(({ data }) => {
          if (data.success) {
            for (const key in data.result.filesMap) {
              this.filesname.map((item) => {
                if (key == item.type) {
                  item.fileProp.oldFileList = data.result.filesMap[key]
                }
              })
            }
          }
          else {
            this.$message.warning(data.message || '获取文件失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取文件出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>

<template>
  <div class="sourceFilesFrom">
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      :rules="editable ? dataRule : {}"
      label-width="100px"
      :class="editable ? '' : 'readonly'"
      :disabled="!editable"
      @submit.native.prevent
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
      >
        <SelectTree
          ref="officeTree"
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="sysCompany/getSubordinateCompany"
          :value="inputForm.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="getCompanyId"
        />
      </el-form-item>
      <el-form-item
        label="所属年份"
        prop="year"
      >
        <el-date-picker
          v-model="inputForm.year"
          value-format="yyyy"
          type="year"
          placeholder="选择年"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="inputForm.name"
          placeholder="名称"
          clearable
          class="big-box"
        />
      </el-form-item>
      <!-- 附件 -->
      <el-form-item
        v-for="item in filesname"
        :key="item.index"
        :label="item.name"
        :prop="item.type"
        label-width="200px"
      >
        <div class="big-box">
          <FileUpload
            v-bind="item.fileProp"
            :fileType="item.type"
            @upload="uploadEvt"
          />
        </div>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="editable"
          v-noMoreClick
          type="primary"
          @click="doSubmit()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sourceFilesFrom {
  .small-box {
    width: 280px;
  }
  .big-box {
    width: 600px;
  }
}
</style>
