<script>
import { addInspectionPartFn } from '@/http/dev_new/inspection-api'

export default {
  data() {
    return {
      title: '',
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        assetDeviceId: '',
        positionCode: '',
        positionName: '',
        enable: true,
        fictional: true,
        remarks: '',
        sortOrder: 0,
      },
      dataRule: {
        positionName: [{ required: true, message: '部位名称不能为空', trigger: 'blur' }],
        positionCode: [{ required: true, message: '部位编码不能为空', trigger: 'blur' }],
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
        this.title = '新增巡检部位'
      }
      else if (method === 'edit') {
        this.title = '编辑巡检部位'
      }
      else if (method === 'view') {
        this.title = '查看巡检部位'
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
          addInspectionPartFn(this.inputForm).then(({ data }) => {
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
        <el-form-item
          label="部位名称"
          prop="positionName"
        >
          <el-input v-model="inputForm.positionName" />
        </el-form-item>
        <el-form-item
          label="部位编号"
          prop="positionCode"
        >
          <el-input v-model="inputForm.positionCode" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input
            v-model="deviceName"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="虚拟部位"
          prop="fictional"
        >
          <el-radio-group v-model="inputForm.fictional">
            <el-radio-button :label="true">
              是
            </el-radio-button>
            <el-radio-button :label="false">
              否
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="是否启用"
          prop="enable"
        >
          <el-radio-group v-model="inputForm.enable">
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
        <el-form-item
          label="备注"
          prop="remarks"
        >
          <el-input
            v-model="inputForm.remarks"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
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
