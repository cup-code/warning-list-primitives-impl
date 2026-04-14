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
      taskName: `作业过程中巡检-${this.detailData.jobNumber}`,
      taskType: '巡检',
    }
  },
  created() {
    this.getPrefix() // 获取图片/文件前缀
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
          <el-form-item label="任务执行人员">
            <el-input v-model="detailData.executorName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="核实人员照片">
            <div style="display: flex">
              <ImageSelect
                v-for="(item, index) in detailData.verifyPersonPhoto"
                :key="index"
                style="margin-right: 10px"
                :signUrl="item ? filePrefix + item : ''"
                width="100px"
                height="100px"
                disabled
              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检测行为照片">
            <div style="display: flex">
              <ImageSelect
                v-for="(items, indexs) in detailData.verifyActionPhoto"
                :key="indexs"
                style="margin-right: 10px"
                :signUrl="items ? filePrefix + items : ''"
                width="100px"
                height="100px"
                disabled
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="巡检意见">
        <el-input
          v-model="detailData.opinion"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="作业情况">
        <el-radio-group v-model="detailData.existProblems">
          <el-radio :label="false">
            正常
          </el-radio>
          <el-radio :label="true">
            异常
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="巡检人员签名">
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
}
</style>
