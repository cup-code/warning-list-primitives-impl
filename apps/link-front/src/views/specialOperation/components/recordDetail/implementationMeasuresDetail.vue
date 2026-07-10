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
      taskName: `作业安全落实-${this.detailData.jobNumber}`,
      taskType: '安全措施落实',
      measureContent: '',
      extraSafetyMeasures: '',
    }
  },
  computed: {
    setMeasureInfo() {
      return function (arr) {
        let msg = ''
        arr.forEach((val, index) => {
          msg += `${`${index + 1}、${val.content};`}`
        })

        return msg
      }
    },
    setextraSafetyMeasures() {
      return function (arr) {
        let text = ''
        arr.forEach((val, index) => {
          text += `${`${index + 1}、${val};`}`
        })

        return text
      }
    },
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.measureContent = this.setMeasureInfo(this.detailData.measureContent)
    this.extraSafetyMeasures = this.setextraSafetyMeasures(this.detailData.extraSafetyMeasures)
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
          <el-form-item label="安全措施人">
            <el-input v-model="detailData.executorName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="安全措施">
        <el-input
          v-model="measureContent"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="其他补充措施">
        <el-input
          v-model="extraSafetyMeasures"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="落实人员签名">
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
  margin-top: 120px;
}
</style>
