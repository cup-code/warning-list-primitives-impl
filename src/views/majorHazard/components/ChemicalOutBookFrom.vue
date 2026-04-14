<script>
import UserSelectDialog from '@/components/SelfBpmn/components/userSelect/UserSelectDialog'
import SelectTree from '@/components/treeSelect/treeSelect'
import { chemistryOutAdd } from '@/http/major-hazard/ChemicalOutBook-api'

export default {
  name: 'ChemicalOutBookFrom',
  components: { SelectTree, UserSelectDialog },
  props: {
    method: {
      type: String,
      default: '',
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
      isLoading: false,
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
        chemical: [{ required: true, message: '化学品不能为空', trigger: 'blur' }],
        userId: [{ required: true, message: '领用人不能为空', trigger: 'blur' }],
        outDate: [{ required: true, message: '领用日期不能为空', trigger: 'change' }],
      },
      inputForm: {
        companyId: '123',
        companyName: '',
        userId: '',
        userName: '',
        storageName: '',
        storageRealName: '',
      },
    }
  },
  created() {
    if (this.method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.fromData))
    }
  },
  methods: {
    getCompanyId(valueId, valueTitle) {
      this.inputForm.companyId = valueId
      this.inputForm.companyName = valueTitle
      this.inputForm.storageName = ''
      this.inputForm.storageRealName = ''
    },
    getStorageName(valueId, valueTitle) {
      this.inputForm.storageName = valueId
      this.inputForm.storageRealName = valueTitle
    },
    // 打开领用人弹窗
    openUserSelectDialog() {
      this.$refs.UserSelectDialog.init()
    },
    // 领用人信息回调
    userIdSubmit(Selections) {
      if (Selections.length > 0) {
        // 回调数据
        this.inputForm.userName = Selections[0].fullName
        this.inputForm.userId = Selections[0].id
      }
      else {
        // 回调空数据
        this.inputForm.userName = ''
        this.inputForm.userId = ''
      }
    },
    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          chemistryOutAdd(this.inputForm)
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
      :rules="method === 'view' ? {} : dataRule"
      :class="method === 'view' ? 'readonly' : ''"
      :disabled="method === 'view'"
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
        label="出库编号"
        prop="outNo"
      >
        <el-input
          v-model="inputForm.outNo"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="仓库名称"
        prop="storageName"
      >
        <SelectTree
          ref="officeTree"
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :url="inputForm.companyId ? `sysDepartment/companyDepartment/${inputForm.companyId}` : ''"
          :value="inputForm.storageName"
          :clearable="true"
          :accordion="true"
          @getValue="getStorageName"
        />
      </el-form-item>
      <el-form-item
        label="化学品"
        prop="chemical"
      >
        <el-input
          v-model="inputForm.chemical"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="出库数量"
        prop="outCount"
      >
        <el-input
          v-model="inputForm.outCount"
          placeholder="请输入"
          clearable
          type="number"
        />
      </el-form-item>
      <el-form-item
        label="单位"
        prop="outUnit"
      >
        <el-input
          v-model="inputForm.outUnit"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="领用人"
        prop="userId"
      >
        <el-input
          v-model="inputForm.userName"
          placeholder="请选择领用人"
          disabled
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="openUserSelectDialog"
          />
        </el-input>
      </el-form-item>
      <el-form-item
        label="领用日期"
        prop="outDate"
      >
        <el-date-picker
          v-model="inputForm.outDate"
          value-format="yyyy-MM-DD"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="outStatus"
      >
        <el-input
          v-model="inputForm.outStatus"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="登记时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="inputForm.createTime"
          value-format="yyyy-MM-DD hh:mm:ss"
          type="datetime"
          placeholder="选择日期时间"
          clearable
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmit()"
        >确定保存</el-button>
      </span>
    </div>
    <!-- 领用人弹窗 -->
    <UserSelectDialog
      ref="UserSelectDialog"
      :limit="1"
      @doSubmit="userIdSubmit"
    />
  </div>
</template>

<style scoped></style>
