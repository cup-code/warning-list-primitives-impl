<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  addLubricatePlanFn,
  getAllUsersByCompany,
  getDeviceListByDepartFn,
} from '@/http/dev_new/lubricatePlan-api'

export default {
  name: 'lubricatePlanFrom',
  components: {
    SelectTree,
  },
  props: {
    method: {
      type: String,
      default: '',
    },
    planData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    const validate = function (rule, value, callback) {
      const num = Number(value)
      if (/^\+?(\d+)$/.test(num) == false) {
        callback(new Error('请输入正整数'))
      }
      else {
        callback()
      }
    }
    return {
      loading: false,
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
        departmentId: [{ required: true, message: '部门车间不能为空', trigger: 'change' }],
        assetDeviceId: [{ required: true, message: '设备名称不能为空', trigger: 'change' }],
        lubricatePosition: [{ required: true, message: '润滑部位不能为空', trigger: 'blur' }],
        lubricatePoints: [
          { required: true, message: '润滑点数不能为空', trigger: 'blur' },
          { validator: validate, trigger: 'blur' },
        ],
        firstLubricateTime: [
          {
            required: true,
            message: '首次润滑时间不能为空',
            trigger: 'change',
          },
        ],
        lubricateCycle: [
          { required: true, message: '润滑周期不能为空', trigger: 'blur' },
          { validator: validate, trigger: 'blur' },
        ],
        lubricateType: [{ required: true, message: '润滑方式不能为空', trigger: 'change' }],
        lubricateGreaseList: [{ required: true, message: '润滑油脂不能为空', trigger: 'change' }],
        lubricateStandard: [{ required: true, message: '润滑标准不能为空', trigger: 'blur' }],
        responsibleUserId: [{ required: true, message: '责任人不能为空', trigger: 'change' }],
      },
      // 选择列表数据
      assetDeviceNameList: [],
      responsibleUserList: [],
      lubricateTypeLIst: [],
      greaseList: [],
      // From表单数据
      inputForm: {
        companyId: '', // 所属企业
        departmentId: '', // 所属部门
        assetDeviceId: '',
        assetDeviceCode: '',
        lubricateGreaseList: [], // 油脂列表
      },
      // 首次润滑时间限制
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
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
    this.lubricateTypeLIst = this.$dictUtils.getDictList('lubricate_type')
    this.greaseList = this.$dictUtils.getDictList('lubricate_grease')
    if (this.method !== 'add') {
      this.inputForm = JSON.parse(JSON.stringify(this.planData))
      this.getDeviceName(this.planData.departmentId)
    }
  },
  methods: {
    getDepartmentId(value) {
      this.inputForm.companyId = value
      this.inputForm.departmentId = ''
    },
    // 获取设备名称列表
    getDeviceName(value) {
      this.inputForm.departmentId = value
      if (value) {
        this.isLoading = true
        getDeviceListByDepartFn(value)
          .then(({ data }) => {
            if (data.success) {
              this.assetDeviceNameList = data.result
            }
            else {
              this.$message.warning(data.message || '获取设备名称列表数据失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取设备名称列表数据出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      else {
        this.inputForm.assetDeviceId = ''
      }
    },
    // 获取设备编号
    getAssetDeviceCode(value) {
      if (value) {
        for (const item of this.assetDeviceNameList) {
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
      this.isLoading = true
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
        .finally(() => {
          this.isLoading = false
        })
    },
    // 提交表单数据
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addLubricatePlanFn(this.inputForm)
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
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      :rules="method === 'view' ? {} : dataRule"
      label-width="100px"
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
            v-for="item in assetDeviceNameList"
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
        label="润滑部位"
        prop="lubricatePosition"
      >
        <el-input
          v-model="inputForm.lubricatePosition"
          class="big-box"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item
        label="润滑点数"
        prop="lubricatePoints"
      >
        <el-input
          v-model="inputForm.lubricatePoints"
          class="small-box"
          type="number"
          :min="0"
          :step="1"
          placeholder="请输入正整数"
        />
      </el-form-item>
      <el-form-item
        label="首次润滑时间"
        prop="firstLubricateTime"
      >
        <el-date-picker
          v-model="inputForm.firstLubricateTime"
          class="small-box"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item
        label="润滑周期"
        prop="lubricateCycle"
      >
        <el-input
          v-model="inputForm.lubricateCycle"
          style="width: 270px"
          type="number"
          :min="0"
          :step="1"
          placeholder="请输入正整数"
        />
        <span>天</span>
      </el-form-item>
      <el-form-item
        label="润滑方式"
        prop="lubricateType"
      >
        <el-select
          v-model="inputForm.lubricateType"
          class="small-box"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option
            v-for="item in lubricateTypeLIst"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="润滑油脂"
        prop="lubricateGreaseList"
      >
        <el-checkbox-group
          v-model="inputForm.lubricateGreaseList"
          class="big-box"
        >
          <el-checkbox
            v-for="item in greaseList"
            :key="item.id"
            :label="item.id"
          >
            {{ item.dictName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        label="润滑标准"
        prop="lubricateStandard"
      >
        <el-input
          v-model="inputForm.lubricateStandard"
          class="big-box"
        />
      </el-form-item>
      <el-form-item
        label="责任人"
        prop="responsibleUserId"
      >
        <el-select
          v-model="inputForm.responsibleUserId"
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
