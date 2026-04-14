<script>
export default {
  props: {
    taskIndex: {
      type: Number,
      default: 0,
    },
    taskData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    /* 翻译管控方式 */
    setCtrlType() {
      let des = '-'
      switch (Number.parseInt(this.taskData.controlType)) {
        case 1:
          des = '自动化监控'
          break
        case 2:
          des = '隐患排查'
          break
        default:
      }
      return des
    },
    /* 翻译管控措施次类型 */
    setMinorType() {
      let minorCode = ''
      let minorName = '-'
      for (const item of this.allDic.measure_main) {
        if (item.id == this.taskData.controlMeasuresMainType) {
          minorCode = item.dictCode
          break
        }
      }
      for (const item of this.allDic[minorCode]) {
        if (item.id == this.taskData.controlMeasuresMinorType) {
          minorName = item.dictName
          break
        }
      }
      return minorName
    },
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
  },
}
</script>

<template>
  <div>
    <div class="right-des-box">
      <el-row>
        <el-col :span="12">
          序号：{{ taskIndex + 1 }}
        </el-col>
        <el-col :span="12">
          管控措施分类：{{
            $dictUtils.getDictLabelById('measure_main', taskData.controlMeasuresMainType, '--')
          }}
        </el-col>
      </el-row>
    </div>
    <div class="right-des-box">
      <div>管控措施：</div>
      <div>
        {{ taskData.controlMeasuresDesc ? taskData.controlMeasuresDesc : '-' }}
      </div>
    </div>
    <div
      v-if="taskData.controlType != 1"
      class="right-des-box"
    >
      <div>隐患排查内容：</div>
      <div>
        {{ taskData.checkContent ? taskData.checkContent : '-' }}
      </div>
    </div>
    <!-- <div class="right-des-box" v-if="taskData.controlType == 1">DCS自动采集数据，并进行报警</div> -->
  </div>
</template>

<style lang="scss" scoped>
.right-des-box {
  padding: 5px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
