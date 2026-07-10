<script>
import { ref, watch } from 'vue'

export default {
  name: 'DeviceForm',
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    isView: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { expose }) {
    const formRef = ref(null)

    // 表单数据
    const formData = ref({
      deviceName: '',
      deviceType: '',
      deviceCode: '',
      deviceStatus: '1',
      installLocation: '',
      responsiblePerson: '',
      contactPhone: '',
      purchaseDate: '',
      deviceDesc: '',
      remark: '',
    })

    // 设备类型选项
    const deviceTypeOptions = [
      { label: '监控设备', value: '1' },
      { label: '传感器', value: '2' },
      { label: '报警器', value: '3' },
      { label: '控制器', value: '4' },
      { label: '其他', value: '5' },
    ]

    // 设备状态选项
    const deviceStatusOptions = [
      { label: '正常', value: '1' },
      { label: '故障', value: '2' },
      { label: '维修中', value: '3' },
      { label: '停用', value: '4' },
    ]

    // 表单验证规则
    const formRules = {
      deviceName: [
        { required: true, message: '请输入设备名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
      ],
      deviceType: [
        { required: true, message: '请选择设备类型', trigger: 'change' },
      ],
      deviceCode: [
        { required: true, message: '请输入设备编号', trigger: 'blur' },
      ],
      deviceStatus: [
        { required: true, message: '请选择设备状态', trigger: 'change' },
      ],
      contactPhone: [
        {
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入正确的手机号码',
          trigger: 'blur',
        },
      ],
    }

    // 监听 info 变化，更新表单数据
    watch(
      () => props.info,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          formData.value = { ...formData.value, ...newVal }
        }
        else {
          // 重置表单
          formData.value = {
            deviceName: '',
            deviceType: '',
            deviceCode: '',
            deviceStatus: '1',
            installLocation: '',
            responsiblePerson: '',
            contactPhone: '',
            purchaseDate: '',
            deviceDesc: '',
            remark: '',
          }
          formRef.value?.clearValidate()
        }
      },
      { immediate: true, deep: true },
    )

    // 表单验证方法
    const validate = (callback) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          callback(true, formData.value)
        }
        else {
          callback(false)
        }
      })
    }

    // 暴露方法给父组件
    expose({
      validate,
    })

    return {
      formRef,
      formData,
      formRules,
      deviceTypeOptions,
      deviceStatusOptions,
    }
  },
}
</script>

<template>
  <div class="device-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      size="small"
      :disabled="isView"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="设备名称" prop="deviceName">
            <el-input
              v-model="formData.deviceName"
              placeholder="请输入设备名称"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="设备类型" prop="deviceType">
            <el-select
              v-model="formData.deviceType"
              placeholder="请选择设备类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in deviceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="设备编号" prop="deviceCode">
            <el-input
              v-model="formData.deviceCode"
              placeholder="请输入设备编号"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="设备状态" prop="deviceStatus">
            <el-select
              v-model="formData.deviceStatus"
              placeholder="请选择设备状态"
              style="width: 100%"
            >
              <el-option
                v-for="item in deviceStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="安装位置" prop="installLocation">
            <el-input
              v-model="formData.installLocation"
              placeholder="请输入安装位置"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="责任人" prop="responsiblePerson">
            <el-input
              v-model="formData.responsiblePerson"
              placeholder="请输入责任人"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="formData.contactPhone"
              placeholder="请输入联系电话"
              clearable
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="购置日期" prop="purchaseDate">
            <el-date-picker
              v-model="formData.purchaseDate"
              type="date"
              placeholder="请选择购置日期"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="设备描述" prop="deviceDesc">
            <el-input
              v-model="formData.deviceDesc"
              type="textarea"
              :rows="3"
              placeholder="请输入设备描述"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.device-form {
  padding: 10px 20px;

  ::v-deep .el-form-item {
    margin-bottom: 18px;
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    &:disabled {
      background-color: #f5f7fa;
      cursor: not-allowed;
    }
  }
}
</style>
