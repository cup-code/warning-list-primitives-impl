<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { addLaborPlan } from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import { getSubordinateCompany } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  components: { SelectTree, FileUpload },
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
    return {
      isLoading: false,
      corporationList: [],
      departmentList: [],
      jobList: [],
      companyId: '',

      planStatus: '已编制',
      inputForm: {
        companyId: '',
        companyName: '',
        departmentId: '',
        departmentName: '',
        laborProtection: [],
        planEndDate: '',
        planName: '',
        planStartDate: '',
        planStatus: 0,
        postId: '',
        postName: '',
        preparedBy: '',
        remark: '',
      },
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
        deleteFront: true,
        editable: this.Method === 'add',
      },
      oldFiles: [], // 再次编辑时，需要记录之前上传的附件
      newFiles: [], // 再次编辑时，需要记录新上传的附件
    }
  },
  created() {
    this.getSubordinateCompany()
    if (this.Method != 'add') {
      this.companyId = this.$store.state.user.user.companyId
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))

      if (this.inputForm.files && this.inputForm.files.length) {
        this.fileProp.oldFileList = this.inputForm.files.map((item) => {
          return {
            originalName: item,
            attachmentName: item,
            filePath: item,
          }
        })
      }
      this.oldFiles = cloneDeep(this.inputForm.files) || []
      this.newFiles = []
    }
    else {
      setTimeout(() => {
        const user = JSON.parse(sessionStorage.getItem('user'))
        this.inputForm.preparedBy = user.fullName
        this.inputForm.companyId = user.companyId
        this.inputForm.companyName = user.companyName
        this.getAllDepartByCompany(this.inputForm.companyId)
        setTimeout(() => {
          this.inputForm.departmentId = user.departmentId
          this.inputForm.departmentName = user.departmentName
          this.getJobList(this.inputForm.departmentId)
        }, 300)
      }, 300)
    }
  },
  methods: {
    // 获取公司列表
    getSubordinateCompany() {
      getSubordinateCompany()
        .then(({ data }) => {
          if (data.success) {
            this.corporationList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },

    // 通过公司查部门
    getAllDepartByCompany(companyId) {
      getAllDepartByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.departmentList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 获取部门下的岗位
    getJobList(departmentId) {
      getPostByDepartmentId(departmentId)
        .then(({ data }) => {
          if (data.success) {
            this.jobList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    endDate(e) {
      if (!this.inputForm.planStartDate) {
        this.$message.error('请先选择计划开始时间')
        this.inputForm.planEndDate = ''
      }
      else if (this.inputForm.planStartDate) {
        const startTime = new Date(this.inputForm.planStartDate).getTime()
        const endtTime = new Date(e).getTime()
        if (endtTime < startTime) {
          this.$message.error('计划结束时间不能小于计划开始时间')
          this.inputForm.planEndDate = ''
        }
        else {
          this.inputForm.planEndDate = e
        }
      }
    },
    // 获取公司id
    getApplicantCorporationName(value) {
      this.inputForm.companyId = value
      this.getAllDepartByCompany(this.inputForm.companyId)
    },

    // 获取部门id
    getApplicantDeptName(value) {
      this.inputForm.departmentId = value
      this.getJobList(this.inputForm.departmentId)
    },

    uploadEvt(fileList) {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], 'OCCUPATION_TEMPERATURE_WORK').then(
          ({ data }) => {
            if (data.success) {
              this.$message.success('上传成功')
              this.newFiles.push(data.result)
            }
            else {
              this.$message.error(data.message || '上传失败')
            }
          },
        )
      }
      else {
        this.newFiles = []
      }
    },
    // 删除新上传的附件
    delNewFiles(index) {
      this.newFiles.splice(index, 1)
    },
    // 再次编辑的时候删除之前上传的附件
    delDocPath(index) {
      this.oldFiles.splice(index, 1)
    },
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.files = this.oldFiles.concat(this.newFiles)
          addLaborPlan(this.inputForm)
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
        label="计划名称"
        :rules="{
          required: true,
          message: '计划名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input v-model="inputForm.planName" style="width: 192px" />
      </el-form-item>
      <el-form-item
        label="归属公司"
        prop="companyId"
        :rules="{
          required: true,
          message: '归属公司不能为空',
          trigger: 'blur',
        }"
      >
        <SelectTree
          class="small-row"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="corporationList"
          :value="inputForm.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="
            (value) => {
              getApplicantCorporationName(value);
            }
          "
        />
      </el-form-item>

      <el-form-item label="归属部门" prop="departmentId">
        <SelectTree
          class="small-row"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="departmentList"
          :value="inputForm.departmentId"
          :clearable="true"
          :accordion="true"
          @getValue="
            (value) => {
              getApplicantDeptName(value);
            }
          "
        />
      </el-form-item>

      <el-form-item label="岗位名称" prop="workPost">
        <el-select
          v-model="inputForm.workPost"
          class="small-row"
          value-key="id"
          multiple
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in jobList"
            :key="item.id"
            :label="item.postName"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划开始时间" prop="planStartDate">
        <el-date-picker
          v-model="inputForm.planStartDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="计划结束时间" prop="planEndDate">
        <el-date-picker
          v-model="inputForm.planEndDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          @change="endDate"
        />
      </el-form-item>
      <el-form-item label="制定人" prop="preparedBy">
        <el-input
          v-model="inputForm.preparedBy"
          class="small-row"
          disabled
        />
      </el-form-item>
      <el-form-item label="计划状态" prop="planStatus">
        <el-input
          v-model="planStatus"
          class="small-row"
          disabled
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="inputForm.remark"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
        />
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <el-form-item label="附件" prop="contactPlaceTime">
            <FileUpload
              v-bind="fileProp"
              @upload="uploadEvt"
              @delSucc="delDocPath"
              @delNewUpload="delNewFiles"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">取消</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >提交</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.small-row {
  width: 192px;
}

.big-row {
  width: 500px;
}
</style>
