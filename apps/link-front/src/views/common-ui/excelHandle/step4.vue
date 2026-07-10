<script>
import fileDownload from 'js-file-download'

export default {
  props: {
    /* 上传数据结果 */
    resultData: {
      type: Object,
      default() {
        return {}
      },
    },
    /* 异常excel信息下载方法 */
    errorExcelFunc: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      isLoading: false,
    }
  },
  created() {},
  methods: {
    /* 点击下载 */
    downloadClick() {
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
    oneMoreClick() {
      this.$emit('oneMore')
    },
  },
}
</script>

<template>
  <div class="step4-box">
    <i
      class="step4-icon"
      :class="
        resultData.wrong > 0 ? 'el-icon-warning step4-warning' : 'el-icon-success step4-success'
      "
    />
    <!-- 有异常 -->
    <div
      v-if="resultData.wrong > 0"
      class="step4-des"
    >
      <div>
        成功导入 {{ resultData.correct }} 条数据，<span style="color: rgb(246, 211, 84)">{{ resultData.wrong }} 条</span>异常数据，您可以下
      </div>
      <div>载未导入成功的数据信息表，修改后上传</div>
    </div>
    <div
      v-if="resultData.wrong > 0"
      class="step4-btn"
    >
      <el-button
        v-loading="isLoading"
        size="small"
        type="primary"
        round
        @click="downloadClick"
      >
        下载异常数据
      </el-button>
      <el-button
        size="small"
        round
        @click="oneMoreClick"
      >
        再次上传
      </el-button>
    </div>
    <!-- 无异常 -->
    <div
      v-else
      class="step4-des"
    >
      成功导入 {{ resultData.correct }} 条数据
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step4-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .step4-icon {
    font-size: 70px;
  }
  .step4-warning {
    color: #e6a23c;
  }
  .step4-success {
    color: #67c23a;
  }
  .step4-des {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0;
  }
  .step4-btn {
  }
}
</style>
