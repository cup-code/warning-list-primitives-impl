<script>
import { cloneDeep } from 'lodash'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { addHotWork } from '@/http/occupationalHealth/sanitation-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { getPostByDepartmentId } from '@/http/safe-production/post-manage-api'
import { getSubordinateCompany } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  components: { SelectTree, PickPeople, FileUpload },
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
      showPeopleDialog: false,
      corporationList: [],
      departmentList: [],
      jobList: [],
      companyId: '',
      peopleProp: {}, // 选择人员参数
      inputForm: {
        companyId: '',
        departmentId: '',
        departmentName: '',
        workPost: [],
        postUser: [],
        files: [],
        postLimit: null,
        postMaxTemperature: null,
        postMinTemperature: null,
        avgHour: null,
        isGrantAllowance: null,
        reportWriterDate: '',
        reportWriterUser: [],
        temperatureMeasure: '',
        remark: '',
      },
      postUser: '',
      reportWriterUser: '',
      stuffType: null, // 选择人员类型： 1：岗位人员，2：填报人员
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
      this.getAllDepartByCompany(this.companyId)
      setTimeout(() => {
        this.inputForm = Object.assign(
          {},
          this.inputForm,
          JSON.parse(JSON.stringify(this.FromData)),
        )
        this.getJobList(this.inputForm.departmentId)
        if (this.inputForm.postUser.length > 0) {
          const postArr = this.inputForm.postUser.map((val) => {
            return val.fullName
          })
          this.postUser = postArr.join(',')
        }
        if (this.inputForm.reportWriterUser.length > 0) {
          const fillingArr = this.inputForm.reportWriterUser.map((val) => {
            return val.fullName
          })
          this.reportWriterUser = fillingArr.join(',')
        }

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
      }, 200)
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

    // 获取公司id
    getApplicantCorporationName(value) {
      this.inputForm.companyId = value
      this.getAllDepartByCompany(this.inputForm.companyId)
    },

    // 获取部门id
    getApplicantDeptName(value) {
      this.inputForm.departmentId = value
      for (const key of this.departmentList) {
        if (value == key.id) {
          this.inputForm.departmentName = key.departmentName
        }
      }
      this.getJobList(this.inputForm.departmentId)
    },

    // 选择岗位人员
    choosePeople(type) {
      if (type == 1) {
        this.peopleProp.oldPickList = this.inputForm.postUser || []
      }
      else {
        this.peopleProp.oldPickList = this.inputForm.reportWriterUser || []
      }
      this.stuffType = type
      this.peopleProp.listType = 'company'
      this.showPeopleDialog = true
    },
    // 选择岗位人员之后的回调
    closePeopleEvt(params) {
      if (params) {
        if (this.stuffType == 1) {
          this.inputForm.postUser = params.data.map((item) => {
            return {
              id: item.id,
              fullName: item.fullName,
            }
          })
          if (this.inputForm.postUser.length > 0) {
            const nameArr = this.inputForm.postUser.map((val) => {
              return val.fullName
            })
            this.postUser = nameArr.join(',') || ''
          }
        }
        else {
          this.inputForm.reportWriterUser = params.data.map((item) => {
            return {
              id: item.id,
              fullName: item.fullName,
            }
          })
          if (this.inputForm.reportWriterUser.length > 0) {
            const newNameArr = this.inputForm.reportWriterUser.map((val) => {
              return val.fullName
            })
            this.reportWriterUser = newNameArr.join(',')
          }
        }
      }
      this.showPeopleDialog = false
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
          addHotWork(this.inputForm)
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

      <el-form-item
        label="归属部门"
        prop="departmentId"
        :rules="{
          required: true,
          message: '归属部门不能为空',
          trigger: 'blur',
        }"
      >
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
      <el-form-item label="岗位人员">
        <el-input
          v-model="postUser"
          style="width: 192px"
          readonly
          @focus="choosePeople(1)"
        />
      </el-form-item>
      <el-form-item
        label="岗位定员"
        prop="postLimit"
        :rules="{
          required: true,
          message: '岗位定员不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.postLimit"
          class="small-row"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="岗位最高温度"
        prop="postMaxTemperature"
        :rules="{
          required: true,
          message: '岗位最高温度不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.postMaxTemperature"
          class="small-row"
          placeholder="单位(℃)"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="岗位最低温度"
        prop="postMinTemperature"
        :rules="{
          required: true,
          message: '岗位最低温度不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.postMinTemperature"
          class="small-row"
          placeholder="单位(℃)"
          clearable
        />
      </el-form-item>
      <el-form-item label="高温环境平均每天持续小时" prop="avgHour">
        <el-input
          v-model="inputForm.avgHour"
          class="small-row"
          placeholder="单位(小时)"
          clearable
        />
      </el-form-item>
      <el-form-item label="是否需要发放高温津贴" prop="isGrantAllowance">
        <el-select
          v-model="inputForm.isGrantAllowance"
          class="small-row"
          placeholder="请选择"
          clearable
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="填报人员">
        <el-input
          v-model="reportWriterUser"
          style="width: 192px"
          readonly
          @focus="choosePeople(2)"
        />
      </el-form-item>
      <el-form-item label="填报时间" prop="reportWriterDate">
        <el-date-picker
          v-model="inputForm.reportWriterDate"
          class="small-row"
          style="width: 192px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="当前已采取的降温措施" prop="temperatureMeasure">
        <el-input
          v-model="inputForm.temperatureMeasure"
          class="big-row"
          type="textarea"
          :rows="4"
          placeholder="请填写"
          clearable
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
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >提交</el-button>
      </span>
    </div>
    <el-dialog
      class="fixed-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
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
</template>

<style scoped>
.small-row {
  width: 192px;
}

.big-row {
  width: 500px;
}
</style>
