<script>
import { saveManufacturer } from '@/http/specialEquipment/management-api'
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'manufacturerInfo',
  props: {
    /**
     * 所属记录
     */
    dataRecord: null,
    /**
     * 操作类型（新增：add；编辑：edit；查看：look）
     */
    opType: String,
    did: String,
  },
  data() {
    return {
      labelPosition: 'right',
      colWidth: 12,
      colItemWidth: 10,
      isLoading: false,
      inputForm: {
        id: '',
        manufacturerName: '',
        manufacturerLicense: '',
        manufacturingDate: '',
        equipmentUniqueCode: '',
        installerName: '',
        installerLicense: '',
        installationDate: '',
        commissioningDate: '',
      },
      inputFormRule: {
        manufacturerName: [{ required: true, message: '制造单位不能为空', trigger: 'blur' }],
        manufacturerLicense: [{ required: true, message: '制造许可证不能为空', trigger: 'blur' }],
      },
    }
  },
  watch: {
    dataRecord: {
      handler(d) {
        this.$nextTick(() => {
          recoverNotNull(this.inputForm, d)
        })
      },
    },
    did: {
      immediate: true,
      handler(val) {
        if (val) {
          this.inputForm.id = val
        }
      },
    },
  },
  methods: {
    /**
     * 保存按钮单击
     */
    saveClick() {
      const me = this
      me.$refs.inputForm.validate((valid) => {
        if (valid) {
          me.isLoading = true
          saveManufacturer(me.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`保存异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div class="inputForm">
    <div class="special-equipment-title">
      制造投用信息
    </div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      :label-position="labelPosition"
      label-width="150px"
      :rules="inputFormRule"
      :disabled="opType === 'look'"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="制造单位"
            prop="manufacturerName"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.manufacturerName"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="制造许可证"
            prop="manufacturerLicense"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.manufacturerLicense"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="制造日期"
            prop="manufacturingDate"
          >
            <el-col :span="colItemWidth">
              <el-date-picker
                v-model="inputForm.manufacturingDate"
                type="date"
                placeholder=""
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="设备编码"
            prop="equipmentUniqueCode"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.equipmentUniqueCode"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="安装单位"
            prop="installerName"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.installerName"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="安装证书编号"
            prop="installerLicense"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.installerLicense"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="安装日期"
            prop="installationDate"
          >
            <el-col :span="colItemWidth">
              <el-date-picker
                v-model="inputForm.installationDate"
                type="date"
                placeholder=""
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="投用日期"
            prop="commissioningDate"
          >
            <el-col :span="colItemWidth">
              <el-date-picker
                v-model="inputForm.commissioningDate"
                type="date"
                placeholder=""
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <div style="text-align: right">
            <el-button
              type="primary"
              size="medium"
              :disabled="opType === 'look'"
              @click="saveClick"
            >
              保存
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped>
.inputForm .el-select {
  width: 100%;
}
</style>
