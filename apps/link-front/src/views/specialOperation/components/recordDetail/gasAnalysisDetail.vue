<script>
import ImageSelect from '@/components/ImageSelect'

export default {
  components: { ImageSelect },
  props: {
    // 详情
    detailData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      taskStatus: '已执行',
      taskName: `作业气体分析-${this.detailData.jobNumber}`,
      taskType: '气体分析',
      analyzeResult: '',
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.analyzeResult = `检测含氧量(${this.detailData.analyzeResult[0]})%,可燃气体(${this.detailData.analyzeResult[1]})%LEL,氢气(${this.detailData.analyzeResult[2]})%LEL,氨气(${this.detailData.analyzeResult[3]})%LEL,有毒介质气体(${this.detailData.analyzeResult[4]})ppm,符合特殊作业要求`
  },
  methods: {
    close() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="handle">
    <el-form
      :model="detailData"
      label-width="100px"
      disabled
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="作业票编号">
            <el-input
              v-model="detailData.jobNumber"
              class="small-box"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务类型">
            <el-input v-model="taskType" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务名称">
            <el-input v-model="taskName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务状态">
            <el-input v-model="taskStatus" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="任务下发时间"
            prop="workStartDate"
          >
            <el-input v-model="detailData.createdTime" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="任务执行时间"
            prop="workEndDate"
          >
            <el-input v-model="detailData.signTime" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="气体分析人">
            <el-input v-model="detailData.executorName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分析地点">
            <el-input v-model="detailData.analyzePlace" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分析检测照片">
        <ImageSelect
          :signUrl="detailData.checkImage ? filePrefix + detailData.checkImage : ''"
          width="100px"
          height="100px"
          disabled
        />
      </el-form-item>
      <el-form-item label="分析结果">
        <el-input
          v-model="analyzeResult"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="分析人员签名">
        <ImageSelect
          :signUrl="detailData.signImagePath ? filePrefix + detailData.signImagePath : ''"
          width="250px"
          height="100px"
          disabled
        />
      </el-form-item>
    </el-form>
    <div class="button">
      <el-button
        size="medium"
        @click="close"
      >
        返回
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.handle {
  cursor: no-drop;
}
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 90px;
}
</style>
