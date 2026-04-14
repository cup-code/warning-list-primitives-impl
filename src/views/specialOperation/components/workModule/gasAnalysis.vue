<script>
import ImageSelect from '@/components/ImageSelect'

export default {
  components: { ImageSelect },
  props: {
    workData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      inputForm: {
        gasAnalysisConfigDTO: {
          gasAnalysisConfig: {},
        },
      },
      analyst: '',
      textareaValue: '',
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    setTimeout(() => {
      this.inputForm = Object.assign(this.inputForm, this.workData)
      const gasAnalysisConfig = this.inputForm.gasAnalysisConfigDTO.gasAnalysisConfig
      if (gasAnalysisConfig.analyseUserNames && gasAnalysisConfig.analyseUserNames.length > 0) {
        this.analyst
          = this.inputForm.gasAnalysisConfigDTO.gasAnalysisConfig.analyseUserNames[0] || ''
        this.textareaValue = `检测含氧量(${this.inputForm.gasAnalysisConfigDTO.analyzeResult[0]})%,可燃气体(${this.inputForm.gasAnalysisConfigDTO.analyzeResult[1]})%LEL,氢气(${this.inputForm.gasAnalysisConfigDTO.analyzeResult[2]})%LEL,氨气(${this.inputForm.gasAnalysisConfigDTO.analyzeResult[3]})%LEL,有毒介质气体(${this.inputForm.gasAnalysisConfigDTO.analyzeResult[4]})ppm,符合特殊作业要求。`
      }
    }, 300)
  },
  methods: {},
}
</script>

<template>
  <div class="handle">
    <el-form
      ref="inputForm"
      :model="inputForm"
      label-width="120px"
      disabled
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="气体分析人">
            <el-input
              v-model="analyst"
              class="small-box"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分析地点">
            <el-input v-model="inputForm.gasAnalysisConfigDTO.analyzePlace" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分析检测照片">
        <ImageSelect
          :signUrl="
            inputForm.gasAnalysisConfigDTO.checkImage
              ? filePrefix + inputForm.gasAnalysisConfigDTO.checkImage
              : ''
          "
          width="100px"
          height="100px"
          disabled
        />
      </el-form-item>
      <el-form-item label="分析结果">
        <el-input
          v-model="textareaValue"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="气体分析人员签名">
        <ImageSelect
          :signUrl="
            inputForm.gasAnalysisConfigDTO.signImagePath
              ? filePrefix + inputForm.gasAnalysisConfigDTO.signImagePath
              : ''
          "
          width="250px"
          height="100px"
          disabled
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: no-drop;
}
</style>
