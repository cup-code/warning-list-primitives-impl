<!-- 特种设备类型参数表单 - 蒸汽管道 -->
<script>
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'steamPipesForm',
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
        position: '',
        registrationNum: '',
        pipelineLevel: '',
        medium: '',
        workPressure: '',
        specification: '',
        length: '',
        classify: '',
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
            label="所在位置"
            prop="position"
          >
            <el-input v-model="inputForm.position" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="使用登记证号"
            prop="registrationNum"
          >
            <el-input v-model="inputForm.registrationNum" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="管道级别"
            prop="pipelineLevel"
          >
            <el-input v-model="inputForm.pipelineLevel" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="介质"
            prop="medium"
          >
            <el-input v-model="inputForm.medium" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="工作压力(Mpa)"
            prop="workPressure"
          >
            <el-input v-model="inputForm.workPressure" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="规格"
            prop="specification"
          >
            <el-input v-model="inputForm.specification" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="长度(m)"
            prop="length"
          >
            <el-input v-model="inputForm.length" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="分类"
            prop="classify"
          >
            <el-input v-model="inputForm.classify" />
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
