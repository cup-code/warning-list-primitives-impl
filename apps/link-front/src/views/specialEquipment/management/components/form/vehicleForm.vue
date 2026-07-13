<!-- 特种设备类型参数表单 - 厂内机动车 -->
<script>
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'vehicleForm',
  props: {
    /**
     * 所属记录
     */
    dataRecord: null,
    /**
     * 操作类型（新增：add；编辑：edit；查看：look）
     */
    opType: String,
    /**
     * 是否显示加载动画
     */
    isLoading: Boolean,
  },
  data() {
    return {
      labelPosition: 'right',
      colWidth: 12,
      colItemWidth: 10,
      inputForm: {
        id: '',
        speed: '',
        weight: '',
        engineNumber: '',
        carNum: '',
        driveMode: '',
        payloadCapacity: '',
        information: '',
        technicalParameter: '',
      },
      inputFormRule: {},
    }
  },
  watch: {
    dataRecord: {
      handler(d) {
        this.$nextTick(() => {
          if (d.equipmentParams) {
            const record = d.equipmentParams
            recoverNotNull(this.inputForm, record)
          }
          else {
            this.inputForm.id = d.id
          }
        })
      },
    },
  },
  methods: {
    /**
     * 保存按钮单击
     */
    saveClick() {
      this.$emit('formSubmit', this.inputForm, this.$refs.inputForm)
    },
  },
}
</script>

<template>
  <div class="inputForm">
    <el-form
      ref="inputForm"
      :model="inputForm"
      :label-position="labelPosition"
      label-width="150px"
      :disabled="opType === 'look'"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="行驶速度(km/h)"
            prop="speed"
          >
            <el-input v-model="inputForm.speed" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="车辆自重(kg)"
            prop="weight"
          >
            <el-input v-model="inputForm.weight" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="发动机编号"
            prop="engineNumber"
          >
            <el-input v-model="inputForm.engineNumber" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="厂内车牌号"
            prop="carNum"
          >
            <el-input v-model="inputForm.carNum" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="驱动方式"
            prop="driveMode"
          >
            <el-input v-model="inputForm.driveMode" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="额定起重量(t)"
            prop="payloadCapacity"
          >
            <el-input v-model="inputForm.payloadCapacity" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="资料情况"
            prop="information"
          >
            <el-input
              v-model="inputForm.information"
              type="textarea"
              :rows="5"
              maxlength="10000"
              show-word-limit
              resize="none"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="主要技术参数"
            prop="technicalParameter"
          >
            <el-input
              v-model="inputForm.technicalParameter"
              type="textarea"
              :rows="5"
              maxlength="10000"
              show-word-limit
              resize="none"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <div style="text-align: right">
            <el-button
              type="primary"
              size="medium"
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
