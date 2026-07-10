<script>
import fileDownload from 'js-file-download'
import Step1 from './step1.vue'
import Step2 from './step2.vue'
import Step3 from './step3.vue'
import Step4 from './step4.vue'

export default {
  components: {
    Step1,
    Step2,
    Step3,
    Step4,
  },
  props: {
    /* 时间线描述 */
    timeLineList: {
      type: Array,
      default() {
        return [{ name: '下载填写模板' }, { name: '上传Excel' }, { name: '确认数据并生效' }]
      },
    },
    /* 下载模板方法 */
    templateFunc: {
      type: Function,
      default: () => {},
    },
    /* 解析excel方法 */
    analysisExcelFunc: {
      type: Function,
      default: () => {},
    },
    /* 确认保存excel数据方法 */
    saveExcelFunc: {
      type: Function,
      default: () => {},
    },
    /* 下载错误信息方法 */
    errorExcelFunc: {
      type: Function,
      default: () => {},
    },
    /* 展示用表格头 */
    showList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      curStep: 0, // 当前步数，0表示一个都没有完成，1表示第一个完成第二个正在做，以此类推
      timeLineProp: {
        dataList: [{ name: '' }],
      },
      // 上传成功后数据
      resultData: null,
    }
  },
  computed: {
    /* 设置禁用下一步 */
    setDisabled() {
      let isDisabled = false
      if (this.curStep === 1 && !this.resultData) {
        isDisabled = true
      }
      return isDisabled
    },
  },
  methods: {
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击上一步 */
    lastStepClick() {
      switch (this.curStep) {
        case 1:
          this.curStep = 0
          break
        case 2:
          this.curStep = 1
          this.resultData = null
          break
        case 3:
          this.curStep = 2
          break
        default:
      }
    },
    /* 点击下一步 */
    nextStepClick() {
      if (this.curStep < 2) {
        this.curStep += 1
      }
    },
    /* 上传成功回调 */
    uploadEvt(data) {
      this.resultData = data
    },
    /* 点击确认上传 */
    submitClick() {
      const saveData = this.resultData.datalist.filter((item) => {
        return !item.errorMsg
      })
      if (saveData.length === 0) {
        this.$message.warning('没有可导入的正确数据！请修改excel后重新上传！')
        return
      }
      this.isLoading = true
      this.saveExcelFunc(saveData)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('上传数据成功！')
            this.curStep = 3
          }
          else {
            this.$message.warning(res.data.message || '上传数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('上传数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 下载异常数据 */
    errorClick() {
      const errorData = this.resultData.datalist.filter((item) => {
        return !!item.errorMsg
      })
      this.isLoading = true
      this.errorExcelFunc(errorData)
        .then((res) => {
          const contentDisposition = res.headers['content-disposition']
          const fileName = window.decodeURI(
            contentDisposition.substring(contentDisposition.indexOf('=') + 1),
          )
          fileDownload(res.data, fileName)
        })
        .catch((err) => {
          this.$message.error('下载文件出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击再次上传 */
    oneMoreEvt() {
      this.curStep = 0
      this.resultData = null
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="excel-box"
  >
    <TimeLine
      class="time-line-box"
      :dataList="timeLineList"
      :curStep="curStep"
    />
    <!-- 第一步 -->
    <Step1
      v-if="curStep === 0"
      :templateFunc="templateFunc"
    />
    <!-- 第二步 -->
    <Step2
      v-if="curStep === 1"
      :analysisExcelFunc="analysisExcelFunc"
      @upload="uploadEvt"
    />
    <!-- 第三步 -->
    <Step3
      v-if="curStep === 2"
      :resultData="resultData"
      :showList="showList"
    />
    <!-- 第四步 结果反馈 -->
    <Step4
      v-if="curStep === 3"
      :errorExcelFunc="errorExcelFunc"
      :resultData="resultData"
      @oneMore="oneMoreEvt"
    />
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="curStep > 0 && curStep < 3"
        type="primary"
        size="medium"
        @click="lastStepClick"
      >
        上一步
      </el-button>
      <el-button
        v-if="curStep < 2"
        type="success"
        size="medium"
        :disabled="setDisabled"
        @click="nextStepClick"
      >
        下一步
      </el-button>
      <el-button
        v-if="resultData && resultData.wrong > 0 && curStep > 1"
        type="error"
        size="medium"
        @click="errorClick"
      >
        下载异常数据
      </el-button>
      <el-button
        v-if="curStep === 2"
        type="success"
        size="medium"
        :disabled="resultData.correct === 0"
        @click="submitClick"
      >
        确认上传
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.excel-box {
  .time-line-box {
    margin: 0 0 20px 0;
  }
}
</style>
