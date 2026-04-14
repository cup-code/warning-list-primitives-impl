<script>
import ImageSelect from '@/components/ImageSelect'
import { getAcceptInfo } from '@/http/specialOperation/specialWork-api.js'

export default {
  components: { ImageSelect },
  props: {
    // 详情
    sid: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      detailData: {},
      taskStatus: '已执行',
      taskName: '',
      taskType: '作业验收',
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
    this.getAcceptInfo()
  },
  methods: {
    getAcceptInfo() {
      getAcceptInfo(this.sid).then(({ data }) => {
        if (data.success) {
          this.detailData = data.result
          this.taskName = `作业验收-${this.detailData.jobNumber}`
        }
      })
    },
    close() {
      this.$emit('close', false)
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
          <el-form-item label="验收人">
            <el-input v-model="detailData.executorName" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="完工验收意见">
        <el-input
          v-model="detailData.opinion"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="验收人员签名">
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
  margin-top: 50px;
  margin-bottom: 20px;
}
</style>
