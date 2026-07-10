<!-- 特种设备类型参数表单 - 电梯 -->
<script>
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'liftForm',
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
      colWidth: 24,
      inputForm: {
        id: '',
        yyjcs: '',
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
            label="曳引机参数"
            prop="yyjcs"
          >
            <el-input
              v-model="inputForm.yyjcs"
              placeholder=""
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="主要技术参数"
            prop="technicalParameter"
          >
            <el-input
              v-model="inputForm.technicalParameter"
              type="textarea"
              :rows="10"
              maxlength="20000"
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
