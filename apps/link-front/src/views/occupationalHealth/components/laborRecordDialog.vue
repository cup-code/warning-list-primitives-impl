<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { addLaborRecord, getPlanList } from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import { getSubordinateCompany } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: { SelectTree, FileUpload, PickPeople },
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
      showDialog: false,
      showPeopleDialog: false,
      isShow: false,
      corporationList: [],
      departmentList: [],
      jobList: [],
      planList: [],
      companyId: '',
      useUser: '',
      peopleProp: {}, // 选择人员参数
      planStatus: '已编制',
      inputForm: {
        companyId: '',
        companyName: '',
        departmentId: '',
        departmentName: '',
        files: [],
        planId: '',
        planName: '',
        postId: '',
        postName: '',
        remark: '',
        useDate: '',
        useUser: [],
        workshopSection: '',
        workshopSectionName: '',
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
    this.getPlanListFn()
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
    getPlanListFn() {
      getPlanList().then(({ data }) => {
        this.planList = data.result || []
        console.log('劳保计划名称===', data)
      })
    },
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

    selecePlan(e) {
      this.inputForm.planName = e.planName
    },

    // 选择岗位人员
    choosePeople(type) {
      this.peopleProp.oldPickList = this.inputForm.useUser || []
      this.peopleProp.listType = 'company'
      this.showDialog = true
      this.showPeopleDialog = true
    },
    // 选择岗位人员之后的回调
    closePeopleEvt(params) {
      if (params) {
        this.inputForm.useUser = params.data.map((item) => {
          return {
            id: item.id,
            fullName: item.fullName,
          }
        })
        if (this.inputForm.useUser.length > 0) {
          const nameArr = this.inputForm.useUser.map((val) => {
            return val.fullName
          })
          this.useUser = nameArr.join(',')
        }
      }
      this.showDialog = false
      this.showPeopleDialog = false
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
              this.isShow = false
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
          this.inputForm.files = this.oldFiles.concat(this.newFiles)
          if (this.inputForm.files.length == 0) {
            this.isShow = true
            return
          }
          this.isLoading = true
          addLaborRecord(this.inputForm)
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
        <el-select
          v-model="inputForm.id"
          class="big-row"
          value-key="id"
          placeholder="请选择"
          clearable
          @change="selecePlan"
        >
          <el-option
            v-for="item in planList"
            :key="item.id"
            :label="item.planName"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领用记录号" prop="laborRecordRef">
        <el-input
          v-model="inputForm.laborRecordRef"
          class="small-row"
          disabled
        />
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
          multiple
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in jobList"
            :key="item.id"
            :label="item.postName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领用人员">
        <el-input
          v-model="useUser"
          style="width: 192px"
          readonly
          @focus="choosePeople()"
        />
      </el-form-item>
      <el-form-item label="领用时间" prop="useDate">
        <el-date-picker
          v-model="inputForm.useDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <el-form-item label="领用证明" required>
            <FileUpload
              v-bind="fileProp"
              @upload="uploadEvt"
              @delSucc="delDocPath"
              @delNewUpload="delNewFiles"
            />
            <span v-show="isShow" class="file-box">领用证明不能为空</span>
          </el-form-item>
        </el-col>
      </el-row>
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
      <el-dialog
        class="fixed-dialog"
        title="选择人员"
        :visible.sync="showDialog"
        width="1200px"
        append-to-body
        :close-on-click-modal="false"
      >
        <PickPeople
          v-if="showPeopleDialog"
          v-bind="peopleProp"
          @close="closePeopleEvt"
        />
      </el-dialog>
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
.file-box {
  color: #f56c6c;
}
</style>
