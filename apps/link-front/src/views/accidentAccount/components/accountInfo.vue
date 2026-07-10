<script>
import moment from 'moment'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  accAccidentGetById,
  addAccidentAccount,
} from '@/http/accidentAccount/accidentAccount-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import {
  ACC_COUNTABILITY,
  ACC_TYPE_LIST,
  ANALYSIS,
  STATUS_LIST,
} from '../constant'

export default {
  components: {
    TreeSelect,
    FileUpload,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    infoId: {
      type: [String, Number],
      default: null,
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
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
      isLoading: false,
      ACC_TYPE_LIST, // 事故类别下拉列表
      STATUS_LIST, // 状态
      ANALYSIS, // 调查
      ACC_COUNTABILITY, // 追责
      // 编辑的数据
      changeData: {},
      // 文件上传组件传参
      fileProp: {
        editable: this.editable,
        accept: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        noticMsg: 'excel',
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.infoId) {
        accAccidentGetById(this.infoId)
          .then((res) => {
            if (res.data.success) {
              this.changeData = res.data.result
              this.changeData.occurTime = moment(this.changeData.occurTime).format(
                'YYYY-MM-DD HH:mm:ss',
              )
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
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.accForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addAccidentAccount(this.changeData)
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
  <!-- 分析单元详情 -->
  <div
    v-loading="isLoading"
    class="acc-info"
  >
    <el-form
      ref="accForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
    >
      <el-divider content-position="left">
        <div class="title-box">
          事故信息
        </div>
      </el-divider>
      <el-form-item
        label="发生时间"
        prop="occurTime"
        :rules="[{ required: true, message: '请选择发生时间', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.occurTime"
          class="small-box"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:00"
          format="yyyy-MM-dd HH:mm"
        />
      </el-form-item>
      <el-form-item
        label="单位"
        prop="companyId"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'blur' }]"
      >
        <TreeSelect
          ref="treeSelect"
          class="small-box"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="companyChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="事故名称"
        prop="eventName"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.eventName"
          class="small-box"
        />
      </el-form-item>
      <el-form-item
        label="专业"
        prop="incidentMajor"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.incidentMajor"
          class="small-box"
        />
      </el-form-item>
      <el-form-item
        label="事件类型"
        prop="eventTypeId"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <el-radio-group
          v-model="changeData.eventTypeId"
          class="large-box radio-box"
          size="medium"
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
        label="简要经过"
        prop="briefDescription"
        :rules="[{ required: true, message: '请输入简要经过', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.briefDescription"
          class="large-box"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item
        label="直接原因"
        prop="directCause"
        :rules="[{ required: true, message: '请输入简要原因', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.directCause"
          class="large-box"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item
        label="事故间接原因"
        prop="indirectCause"
        :rules="[{ required: true, message: '请输入事故间接原因', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.indirectCause"
          class="large-box"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item
        label="事故内容"
        prop="content"
        :rules="[{ required: true, message: '请输入事故内容', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.content"
          class="large-box"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item
        label="事故发生地点"
        prop="occurSite"
        :rules="[{ required: true, message: '请输入事故发生地点', trigger: 'blur' }]"
      >
        <el-input
          v-model="changeData.occurSite"
          class="large-box"
          type="textarea"
          resize="none"
          :rows="3"
        />
      </el-form-item>
      <el-form-item
        label="是否组织调查"
        prop="isAnalysis"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'blur' }]"
      >
        <el-radio-group
          v-model="changeData.isAnalysis"
          class="large-box radio-box"
        >
          <el-radio
            v-for="item in ANALYSIS"
            :key="item.value"
            :label="item.value"
          >
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="事故状态"
        prop="eventState"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'blur' }]"
      >
        <el-radio-group
          v-model="changeData.eventState"
          class="large-box radio-box"
        >
          <el-radio
            v-for="item in STATUS_LIST"
            :key="item.value"
            :label="item.value"
          >
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="是否追责"
        prop="isAccountability"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'blur' }]"
      >
        <el-radio-group
          v-model="changeData.isAccountability"
          class="large-box radio-box"
        >
          <el-radio
            v-for="item in ACC_COUNTABILITY"
            :key="item.value"
            :label="item.value"
          >
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="事故类别"
        prop="incidentType"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'blur' }]"
      >
        <el-radio-group
          v-model="changeData.incidentType"
          class="large-box radio-box"
        >
          <el-radio
            v-for="item in ACC_TYPE_LIST"
            :key="item.value"
            :label="item.value"
          >
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-divider content-position="left">
        <div class="title-box">
          采取措施
        </div>
      </el-divider>
      <el-form-item
        class="large-box"
        label="负责人"
        prop="measuresDirector"
        :rules="[{ required: true, message: '请输入负责人', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.measuresDirector"
          class="small-box"
        />
      </el-form-item>
      <el-form-item
        label="措施内容"
        prop="measuresContent"
        :rules="[{ required: true, message: '请输入措施内容', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.measuresContent"
          type="textarea"
          resize="none"
          :rows="4"
          class="large-box"
        />
      </el-form-item>
      <el-form-item
        class="large-box"
        label="完成情况"
        prop="measuresSituation"
        :rules="[{ required: true, message: '请输入完成情况', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.measuresSituation"
          class="small-box"
        />
      </el-form-item>
      <el-form-item
        label="附件"
        prop="files"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
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
.acc-info {
  .title-box {
    font-weight: bold;
    font-size: 16px;
  }
  .small-box {
    width: 250px;
  }
  .large-box {
    width: 610px;
  }
  .radio-box {
    margin-top: 8px;
    .el-radio {
      margin-bottom: 10px;
    }
    .el-radio__label {
      font-size: 14px !important;
    }
  }
}
</style>
