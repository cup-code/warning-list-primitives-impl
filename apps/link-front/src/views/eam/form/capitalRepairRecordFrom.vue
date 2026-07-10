<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { addRepairRecord } from '@/http/dev_new/capitalRepair-api'
import { getAllUsersByCompany, getDeviceListByDepartFn } from '@/http/dev_new/lubricatePlan-api'

export default {
  name: 'capitalRepairRecordFrom',
  components: {
    SelectTree,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    recordData: {
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
        departmentId: [{ required: true, message: '部门车间不能为空', trigger: 'change' }],
        assetDeviceId: [{ required: true, message: '设备名称不能为空', trigger: 'change' }],
        repairDate: [{ required: true, message: '维修时间不能为空', trigger: 'change' }],
        // repairCosts:{ type:'number', message: '请输入数字', trigger: 'blur' },
        repairUserId: [{ required: true, message: '维修责任人不能为空', trigger: 'change' }],
        repairContent: [{ required: true, message: '维修内容不能为空', trigger: 'blur' }],
        acceptUserIdList: [{ required: true, message: '维修验收人不能为空', trigger: 'blur' }],
      },
      // 选择列表数据
      assetDeviceList: [],
      responsibleUserList: [],
      // From表单数据
      inputForm: {
        companyId: '', // 所属企业
        departmentId: '', // 所属部门
        assetDeviceId: '',
        assetDeviceCode: '',
        acceptUserIdList: [],
      },
    }
  },
  watch: {
    'inputForm.assetDeviceId': {
      immediate: true, // 刷新页面立即触发
      handler(val) {
        this.getAssetDeviceCode(val)
      },
    },
    'inputForm.departmentId': {
      immediate: true, // 刷新页面立即触发
      handler(val, oal) {
        if (val && oal) {
          this.inputForm.assetDeviceId = ''
        }
      },
    },
  },
  created() {
    this.getResponsibleUser()
    if (this.method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.recordData))
      this.getDeviceName(this.recordData.departmentId)
    }
  },
  methods: {
    getDepartmentId(value) {
      this.inputForm.companyId = value
      this.inputForm.departmentId = ''
    },
    // 获取设备名称列表
    getDeviceName(value) {
      // console.log(456,value)
      this.inputForm.departmentId = value
      if (value) {
        getDeviceListByDepartFn(value)
          .then(({ data }) => {
            if (data.success) {
              this.assetDeviceList = data.result
            }
            else {
              this.$message.warning(data.message || '获取设备名称列表数据失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取设备名称列表数据出错', err)
          })
      }
      else {
        this.inputForm.assetDeviceId = ''
      }
    },
    // 获取设备编号
    getAssetDeviceCode(value) {
      if (value) {
        for (const item of this.assetDeviceList) {
          if (item.id == value) {
            this.inputForm.assetDeviceCode = item.assetCode
          }
        }
      }
      else {
        this.inputForm.assetDeviceCode = ''
      }
    },
    // 获取责任人列表
    getResponsibleUser() {
      const companyId = this.$store.state.user.user.companyId
      getAllUsersByCompany(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.responsibleUserList = data.result
          }
          else {
            this.$message.warning(data.message || '获取责任人列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取责任人列表数据出错', err)
        })
    },
    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addRepairRecord(this.inputForm)
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
  <div class="fromClass">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="所属公司"
        prop="companyId"
      >
        <SelectTree
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
          @getValue="getDepartmentId"
        />
      </el-form-item>
      <el-form-item
        label="部门车间"
        prop="departmentId"
      >
        <SelectTree
          class="small-box"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :url="inputForm.companyId ? `sysDepartment/companyDepartment/${inputForm.companyId}` : ''"
          :value="inputForm.departmentId"
          :clearable="true"
          :accordion="true"
          @getValue="getDeviceName"
        />
      </el-form-item>
      <el-form-item
        label="设备名称"
        prop="assetDeviceId"
      >
        <el-select
          v-model="inputForm.assetDeviceId"
          class="small-box"
          placeholder="请选择"
          clearable
          filterable
          @change="getAssetDeviceCode"
        >
          <el-option
            v-for="item in assetDeviceList"
            :key="item.id"
            :label="item.assetName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="设备编号"
        prop="assetDeviceCode"
      >
        <el-input
          v-model="inputForm.assetDeviceCode"
          class="small-box"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="维修时间"
        prop="repairDate"
      >
        <el-date-picker
          v-model="inputForm.repairDate"
          class="small-box"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>`
      <el-form-item
        label="维修费用"
        prop="repairCosts"
      >
        <el-input
          v-model="inputForm.repairCosts"
          style="width: 270px"
        />
        <span>万元</span>
      </el-form-item>
      <el-form-item
        label="维修责任人"
        prop="repairUserId"
      >
        <el-select
          v-model="inputForm.repairUserId"
          class="small-box"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option
            v-for="item in responsibleUserList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="维修内容"
        prop="repairContent"
      >
        <el-input
          v-model="inputForm.repairContent"
          class="big-box"
          type="textarea"
          :rows="4"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item
        label="维修验收人"
        prop="acceptUserIdList"
      >
        <el-select
          v-model="inputForm.acceptUserIdList"
          class="big-box"
          placeholder="请选择"
          multiple
          clearable
          filterable
        >
          <el-option
            v-for="item in responsibleUserList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remarks"
      >
        <el-input
          v-model="inputForm.remarks"
          class="big-box"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-show="method !== 'view'"
          type="primary"
          :loading="isLoading"
          @click="doSubmit()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fromClass {
  .small-box {
    width: 280px;
  }
  .big-box {
    width: 670px;
  }
  .dialog-footer {
    padding: 10px 20px 20px;
    text-align: right;
    box-sizing: border-box;
  }
}
</style>
