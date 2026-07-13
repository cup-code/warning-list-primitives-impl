/* * @Author: xiaorui 维保标准弹框 * @Date: 2022-07-13 15:36:00 * @Last Modified by: xiaorui * @Last
Modified time: 2022-07-14 10:15:45 */
<script>
import { addMaintenanceStandardFn } from '@/http/dev_new/maintenance-api'

export default {
  data() {
    return {
      title: '',
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        assetDeviceId: '', // 设备id
        commonFaults: '', // 常见故障
        disposalMethod: '', // 故障处理方法
        maintenanceContent: '', // 维保内容
        maintenanceRequirement: '', // 维保要求
        possibleCause: '', // 可能故障原因
        mustPhotograph: true, // 强制拍照
        sortOrder: 99,
      },
      dataRule: {
        maintenanceContent: [{ required: true, message: '维保内容不能为空', trigger: 'blur' }],
        maintenanceRequirement: [{ required: true, message: '维保要求不能为空', trigger: 'blur' }],
      },
      deviceName: '',
    }
  },
  methods: {
    init(method, obj, deviceId, deviceName) {
      // console.log(obj)
      this.method = method
      this.inputForm.assetDeviceId = deviceId
      this.inputForm.id = obj.id // 新增时要置空
      this.deviceName = deviceName
      this.visible = true
      if (method === 'add') {
        this.title = '新增维保标准'
      }
      else if (method === 'edit') {
        this.title = '编辑维保标准'
      }
      else if (method === 'view') {
        this.title = '查看维保标准'
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method !== 'add') {
          this.inputForm = this.recover(this.inputForm, obj)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          addMaintenanceStandardFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"
      width="500px"

      :visible.sync="visible"
      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        :disabled="method === 'view'"
        @submit.native.prevent
      >
        <el-form-item label="设备名称">
          <el-input
            v-model="deviceName"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="维保内容"
          prop="maintenanceContent"
        >
          <el-input v-model="inputForm.maintenanceContent" />
        </el-form-item>
        <el-form-item
          label="维保要求"
          prop="maintenanceRequirement"
        >
          <el-input
            v-model="inputForm.maintenanceRequirement"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item
          label="常见故障"
          prop="commonFaults"
        >
          <el-input
            v-model="inputForm.commonFaults"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item
          label="可能故障原因"
          prop="possibleCause"
        >
          <el-input
            v-model="inputForm.possibleCause"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item
          label="故障处理方法"
          prop="disposalMethod"
        >
          <el-input
            v-model="inputForm.disposalMethod"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item
          label="强制拍照"
          prop="mustPhotograph"
        >
          <el-radio-group v-model="inputForm.mustPhotograph">
            <el-radio-button :label="true">
              是
            </el-radio-button>
            <el-radio-button :label="false">
              否
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="排序号"
          prop="sortOrder"
        >
          <el-input-number
            v-model="inputForm.sortOrder"
            :step="1"
            controls-position="right"
            :min="0"
            label="排序号"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
