<script>
import {
  emRehearsalPlanAdd,
  emRehearsalPlanById,
  emRehearsalPlanUpdate,
} from '@/http/emergency/rehearsal-api.js'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api.js'
import { fzyGetUserByDepId } from '@/http/user-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import RePlanData from './rePlanData'

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
      // 文件上传组件传参
      fileProp: {
        oldFileList: [], // 展示的文件列表
        fileLimit: 9, // 最大文件上传数量
      },
      isLoading: false,
      changeData: new RePlanData(),
      depList: [], // 部门数据列表
      personList: [], // 部门下负责人数据列表
      planTypeList: [], // 预案类型下拉列表
      isShow: false,
    }
  },
  created() {
    // 编辑需要获取数据
    if (this.infoId) {
      this.getInfoData()
    }
    // 新增需要默认选择当前登录用户的公司id、name
    else {
      const userData = JSON.parse(sessionStorage.getItem('user'))
      this.changeData.companyId = userData.companyId
      this.changeData.companyName = userData.companyName
      this.getDepList()
    }
    const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.planTypeList = allDic.emplan_type
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      emRehearsalPlanById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.changeData = new RePlanData(res.data.result)
            this.fileProp.oldFileList = res.data.result.accessorys
            this.getDepList(false)
            this.getPersonList(false)
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
    /* 所属公司下拉列表点击 */
    companyTreeNodeTap(data) {
      this.changeData.companyId = data.id
      this.changeData.companyName = data.companyName
      this.$refs.tableTypeSelect.blur()
      this.getDepList()
    },
    /* 按公司id查询公司下所有部门 */
    getDepList(isClear = true) {
      this.isLoading = true
      getAllDepartByCompanyFn(this.changeData.companyId)
        .then((res) => {
          if (res.data.success) {
            if (isClear) {
              this.changeData.dutyDept = ''
              this.changeData.dutyPerson = ''
            }
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
    /* 按部门id查询部门下所有人员 */
    getPersonList(isClear = true) {
      this.isLoading = true
      fzyGetUserByDepId(this.changeData.dutyDept)
        .then((res) => {
          if (res.data.success) {
            this.personList = res.data.result
            if (isClear) {
              this.changeData.dutyPerson = ''
            }
          }
          else {
            this.$message.warning(res.data.message || '获取负责人列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取负责人列表出错', err)
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
      this.$refs.planForm.validate((valid) => {
        if (this.fileProp.oldFileList.length == 0 && this.changeData.files.length == 0) {
          this.isShow = true
          return
        }
        if (valid) {
          let submitFunc = () => {}
          if (this.infoId) {
            submitFunc = emRehearsalPlanUpdate
          }
          else {
            submitFunc = emRehearsalPlanAdd
            delete this.changeData.id
          }
          this.changeData.setDutyDeptName(this.depList)
          this.changeData.setDutyPersonName(this.personList)
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
    class="plan-info"
  >
    <el-form
      ref="planForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      :disabled="!editable"
    >
      <el-form-item
        label="计划名称"
        prop="drillName"
        :rules="[{ required: true, message: '请填写计划名称', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.drillName" />
      </el-form-item>
      <el-form-item
        label="所属公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择所属公司', trigger: 'change' }]"
      >
        <el-select
          ref="tableTypeSelect"
          v-model="changeData.companyId"
          style="width: 100%"
        >
          <el-option
            :value="changeData.companyId"
            :label="changeData.companyName"
          >
            <el-tree
              :data="companyData"
              :props="{ children: 'childrenCompany', label: 'companyName' }"
              highlight-current
              :expand-on-click-node="false"
              node-key="id"
              check-strictly
              @node-click="companyTreeNodeTap"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="参演对象"
        prop="drillObject"
        :rules="[{ required: true, message: '请填写参演对象', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.drillObject" />
      </el-form-item>
      <el-form-item
        label="演练时间"
        prop="drillTime"
        :rules="[{ required: true, message: '请选择演练时间', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="changeData.drillTime"
          type="date"
          value-format="timestamp"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="预案类型"
        prop="planType"
        :rules="[{ required: true, message: '请选择预案类型', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.planType"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in planTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="演练项目"
        prop="drillItem"
        :rules="[{ required: true, message: '请填写参演对象', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.drillItem" />
      </el-form-item>
      <el-form-item
        label="演练方式"
        prop="drillWay"
        :rules="[{ required: true, message: '请填写参演对象', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.drillWay" />
      </el-form-item>
      <el-form-item
        label="组织人员"
        prop="organizePerson"
        :rules="[{ required: true, message: '请填写参演对象', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.organizePerson" />
      </el-form-item>
      <el-form-item
        label="负责部门"
        prop="dutyDept"
        :rules="[{ required: true, message: '请选择负责部门', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.dutyDept"
          filterable
          style="width: 100%"
          @change="getPersonList(true)"
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
        label="负责人"
        prop="dutyPerson"
        :rules="[{ required: true, message: '请选择负责人', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.dutyPerson"
          filterable
          style="width: 100%"
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
        label="附件"
        :rules="[{ required: true, message: '请选择附件', trigger: 'change' }]"
      >
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
        />
        <span
          v-show="isShow && fileProp.oldFileList.length == 0 && changeData.files.length == 0"
          style="color: #f56c6c"
        >请上传演练照片</span>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
        />
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
        提交
      </el-button>
    </div>
  </div>
</template>
