<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import UserSelectDia from '@/components/userSelect/UserSelectDialog'
import {
  addHygieneThree,
  importFileByID,
  uploadFileList,
} from '@/http/occupationalHealth/sanitation-api'
import { getUUID } from '@/utils/UUID'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'sanitationDialog',
  components: { SelectTree, FileUpload, UserSelectDia },
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    const editableFile = this.Method != 'view'
    return {
      isLoading: false,
      isFileList: [
        { value: 0, label: '否' },
        { value: 1, label: '是' },
      ],
      inputForm: {
        dutyPerson: '',
        dutyPersonName: '',
        threeEvaluateDTOS: [], // 评价附表集
        projectName: '',
        ascriptionUnit: '',
        declareDate: '',
        buildUnit: '',
        projectStartDate: '',
        threeType: '',
      },
      // 附件信息列表
      filesname: [
        {
          name: '预评价',
          id: '',
          evaluateName: 'estimate', // 评价类型
          isFile: 1,
          remark: '',
          threeId: '', // 职业卫生三同时主表id
          fileProp: {
            // 附件
            editable: editableFile,
            oldFileList: [], // 展示的文件列表
            fileLimit: 9, // 最大文件上传数量
          },
        },
        {
          name: '职业病防护设施设计专篇',
          id: '',
          evaluateName: 'illness',
          isFile: 1,
          remark: '',
          threeId: '',
          fileProp: {
            editable: editableFile,
            oldFileList: [],
            fileLimit: 9,
          },
        },
        {
          name: '控制效果评价',
          id: '',
          evaluateName: 'control',
          isFile: 1,
          remark: '',
          threeId: '',
          fileProp: {
            editable: editableFile,
            oldFileList: [],
            fileLimit: 9,
          },
        },
        {
          name: '现状评价',
          id: '',
          evaluateName: 'present',
          isFile: 1,
          remark: '',
          threeId: '',
          fileProp: {
            editable: editableFile,
            oldFileList: [],
            fileLimit: 9,
          },
        },
        {
          name: '验收报告',
          id: '',
          evaluateName: 'check',
          isFile: 1,
          remark: '',
          threeId: '',
          fileProp: {
            editable: editableFile,
            oldFileList: [],
            fileLimit: 9,
          },
        },
      ],
      temporaryFiles: {},
    }
  },
  created() {
    if (this.Method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.FromData))
      this.inputForm.threeEvaluateVOS.forEach((item) => {
        this.filesname.forEach((data) => {
          if (data.evaluateName == item.evaluateName) {
            Object.assign(data, item)
            this.getFileList(item.id)
          }
        })
      })
    }
    else {
      this.filesname.forEach((data) => {
        // 生成数据id
        data.id = getUUID(32)
      })
    }
  },
  methods: {
    // 打开领用人弹窗
    openUserSelectDialog() {
      this.$refs.UserSelectDia.init()
    },
    // 领用人信息回调
    userIdSubmit(Selections) {
      if (Selections.length > 0) {
        // 回调数据
        this.inputForm.dutyPerson = Selections[0].id
        this.inputForm.dutyPersonName = Selections[0].fullName
      }
      else {
        // 回调空数据
        this.inputForm.dutyPerson = ''
        this.inputForm.dutyPersonName = ''
      }
    },
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
        categoryName: `sanitation-${type}`,
      }
      this.isLoading = true
      const uploadFileResult = await uploadFileList(upFileData)
      if (!uploadFileResult.data.success) {
        this.$message.warning(data.message || '文件上传失败')
      }
    },
    // 获取文件回显信息
    async getFileList(entityId) {
      const getFileResult = await importFileByID(entityId)
      if (getFileResult.data.success) {
        this.filesname.forEach((data) => {
          if (data.id == entityId) {
            data.fileProp.oldFileList = getFileResult.data.result
          }
        })
      }
      else {
        this.$message.warning(data.message || '查询文件失败')
      }
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.filesname.forEach((data) => {
            if (this.temporaryFiles[data.evaluateName] != undefined) {
              this.uploadFile(data.evaluateName, data.id, this.temporaryFiles[data.evaluateName])
            }
          })
          this.inputForm.threeEvaluateDTOS = this.filesname
          addHygieneThree(this.inputForm)
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
        label="项目名称"
        prop="projectName"
        :rules="{
          required: true,
          message: '项目名称不能为空',
          trigger: 'change',
        }"
      >
        <el-input
          v-model="inputForm.projectName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="归属单位"
        prop="ascriptionUnit"
        :rules="{
          required: true,
          message: '归属单位不能为空',
          trigger: 'blur',
        }"
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
          :value="inputForm.ascriptionUnit"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              inputForm.ascriptionUnit = value
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="负责人"
        prop="dutyPerson"
      >
        <el-input
          v-model="inputForm.dutyPersonName"
          class="small-row"
          placeholder="点击右侧选择"
          disabled
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="openUserSelectDialog()"
          />
        </el-input>
      </el-form-item>
      <el-form-item
        label="申报时间"
        prop="declareDate"
      >
        <el-date-picker
          v-model="inputForm.declareDate"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="建设单位"
        prop="buildUnit"
      >
        <el-input
          v-model="inputForm.buildUnit"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="项目启动日期"
        prop="projectStartDate"
      >
        <el-date-picker
          v-model="inputForm.projectStartDate"
          class="small-row"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="三同时类型"
        prop="threeType"
        :rules="{
          required: true,
          message: '三同时类型不能为空',
          trigger: 'blur',
        }"
      >
        <el-select
          v-model="inputForm.threeType"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('three_type')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <div
        v-for="item in filesname"
        :key="item.id"
      >
        <div style="display: flex; line-height: 20px">
          <div style="width: 10px; height: 20px; margin: 0 10px; background-color: #00e7ff" />
          {{ item.name }}
        </div>
        <el-divider style="margin: 6px 0" />
        <el-form-item
          label="详情附件"
          prop="temporaryFiles"
          style="width: 450px"
        >
          <FileUpload
            v-bind="item.fileProp"
            :fileType="item.evaluateName"
            @upload="uploadEvt"
          />
        </el-form-item>
        <el-form-item
          label="是否归档"
          prop="isFile"
        >
          <el-select
            v-model="item.isFile"
            class="small-row"
            placeholder="请选择建设单位"
            clearable
          >
            <el-option
              v-for="item in isFileList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="item.remark"
            placeholder="请输入"
            type="textarea"
            :rows="3"
            clearable
            class="big-row"
          />
        </el-form-item>
      </div>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
    <!-- 领用人弹窗 -->
    <UserSelectDia
      ref="UserSelectDia"
      :limit="1"
      @doSubmit="userIdSubmit"
    />
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
