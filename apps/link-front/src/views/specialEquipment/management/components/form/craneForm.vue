<!-- 特种设备类型参数表单 - 起重设备 -->
<script>
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  name: 'craneForm',
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
        upWeight: '',
        upHeight: '',
        workingLevel: '',
        trackLength: '',
        trackSpan: '',
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
            label="起重量"
            prop="upWeight"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.upWeight"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="起升高度（m）"
            prop="upHeight"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.upHeight"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="工作级别"
            prop="workingLevel"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.workingLevel"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>

        <el-col :span="colWidth">
          <el-form-item
            label="轨长（m）"
            prop="trackLength"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.trackLength"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="跨度"
            prop="trackSpan"
          >
            <el-col :span="colItemWidth">
              <el-input
                v-model="inputForm.trackSpan"
                placeholder=""
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item
            label="主要技术参数"
            prop="technicalParameter"
          >
            <el-col :span="18">
              <el-input
                v-model="inputForm.technicalParameter"
                placeholder=""
                type="textarea"
                :rows="10"
                maxlength="20000"
                show-word-limit
                resize="none"
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
