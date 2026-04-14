<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { getCompanyById, getCompanyPeopleById } from '@/http/GeneralQuery.js'
import { safeTargetSave } from '@/http/orgDuty/orgDuty-api.js'
import { commonFileGetByEntityId } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import { SAFE_EXAM_TYPE } from '../constant'

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
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      // 文件上传组件传参
      fileProp: {
        editable: this.editable,
        accept: ['application/pdf'],
        noticMsg: 'pdf',
        oldFileList: [], // 展示的文件列表
        fileLimit: 1, // 最大文件上传数量
      },
      // 编辑的数据
      changeData: {},
      depList: [], // 部门下拉列表
      personList: [], // 人员下拉列表
      examTypeList: SAFE_EXAM_TYPE, // 考核类型列表
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
        this.getDepList(this.info.companyId, false)
        this.getPersonList(this.info.checkDepartmentId, false)
        this.getFileList(this.info.id)
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
          checkType: '',
          checkDepartmentId: '',
          checkStaffId: '',
          checkTargets: '',
          remark: '',
          files: [],
        }
      }
    },
    /* 公司下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.changeData.checkDepartmentId = ''
      this.$refs.companySelect.closeSelect()
      this.getDepList(id)
    },
    /* 获取部门列表 */
    getDepList(id, isReset = true) {
      if (!id) {
        this.changeData.checkDepartmentId = ''
        this.changeData.checkStaffId = ''
        this.personList = []
        return
      }
      if (isReset) {
        this.changeData.checkDepartmentId = ''
        this.changeData.checkStaffId = ''
      }
      this.isLoading = true
      getCompanyById(id)
        .then((res) => {
          if (res.data.success) {
            this.depList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取部门列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取部门列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 获取用户列表 */
    getPersonList(id, isReset = true) {
      if (!id) {
        this.changeData.checkStaffId = ''
        return
      }
      if (isReset) {
        this.changeData.checkStaffId = ''
      }
      this.isLoading = true
      getCompanyPeopleById(id)
        .then((res) => {
          if (res.data.success) {
            this.personList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取人员列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取人员列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 获取文件列表 */
    getFileList(id) {
      this.isLoading = true
      commonFileGetByEntityId(id)
        .then((res) => {
          if (res.data.success) {
            this.fileProp.oldFileList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取文件列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取文件列表出错', err)
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
      this.$refs.targetForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          // const params = JSON.parse(JSON.stringify(this.changeData))
          safeTargetSave(this.changeData)
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
  <!-- 安全生产目标详情 -->
  <div v-loading="isLoading">
    <el-form
      ref="targetForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司名称"
        prop="companyId"
        :rules="[{ required: true, message: '请选择事件类型', trigger: 'change' }]"
      >
        <TreeSelect
          ref="companySelect"
          style="width: 250px"
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
        label="考核类别"
        prop="checkType"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-radio-group
          v-model="changeData.checkType"
          style="width: 250px"
        >
          <el-radio
            v-for="(item, index) in examTypeList"
            :key="index"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="考核部门"
        prop="checkDepartmentId"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.checkDepartmentId"
          clearable
          style="width: 250px"
          filterable
          @change="getPersonList"
        >
          <el-option
            v-for="item in depList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="changeData.checkType == 1"
        label="考核人"
        prop="checkStaffId"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.checkStaffId"
          clearable
          style="width: 250px"
          filterable
        >
          <el-option
            v-for="item in personList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="考核标准"
        prop="checkTargets"
        :rules="[{ required: true, message: '请填写', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.checkTargets"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 630px"
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
