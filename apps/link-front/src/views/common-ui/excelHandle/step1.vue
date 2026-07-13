<script>
import fileDownload from 'js-file-download'

export default {
  props: {
    /* 下载模板方法 */
    templateFunc: {
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
    /* 点击下载模板 */
    downloadClick() {
      this.isLoading = true
      this.templateFunc()
        .then((res) => {
          const contentDisposition = res.headers['content-disposition']
          // fileName必用这种方式进行解析，否则乱码
          const fileName = window.decodeURI(
            contentDisposition.substring(contentDisposition.indexOf('=') + 1),
          )
          // let url = window.URL.createObjectURL(new Blob([res.data]))
          // let a = document.createElement('a')
          // a.style.display = 'none'
          // a.href = url
          // a.setAttribute('download', fileName)
          // document.body.appendChild(a)
          // //点击下载
          // a.click()
          // // 下载完成移除元素
          // document.body.removeChild(a)
          // // 释放掉blob对象
          // window.URL.revokeObjectURL(url)
          fileDownload(res.data, fileName)
        })
        .catch((err) => {
          this.$message.error('下载文件出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>

<template>
  <div class="step1-box">
    <div class="step1-item position-wrap">
      <div class="step1-title">
        请下载Excel模板，按右图格式填入
      </div>
      <div class="step1-title">
        导入注意事项：
      </div>
      <p>1、必须按格式要求进行填写;</p>
      <p>2、无特殊情况不得进行合并单元格;</p>
      <p>3、对于不清楚的字段可以及时询问系统管理员;</p>
      <div
        class="step1-btn"
        style="margin: 10px 0 0 0"
      >
        <el-button
          v-loading="isLoading"
          type="success"
          size="medium"
          round
          icon="el-icon-download"
          @click="downloadClick"
        >
          下载Excel模板
        </el-button>
      </div>
    </div>
    <div class="step1-item">
      <div class="step1-title">
        Excel示例：
      </div>
      <el-image
        style="height: 100%"
        :src="require('@/views/common-ui/excelHandle/excel_demo.png')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step1-box {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  overflow: hidden;
  .step1-item {
    width: 48%;
    .step1-title {
      font-weight: bold;
      font-size: 18px;
    }
    .step1-des {
      font-size: 16px;
      margin: 5px 0 0 0;
    }
    .step1-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .position-wrap {
    position: relative;
  }
}
</style>
