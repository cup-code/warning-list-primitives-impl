<script>
import fileDownload from 'js-file-download'
import { certSafeManageExcelExport } from '@/http/base-module/certificateManager-api'

export default {
  props: {
    /* 复选框数据 */
    pickList: {
      type: Array,
      default() {
        return []
      },
    },
    /* 请求条件 */
    reqData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      isLoading: false,
      checkList: [],
      isIndeterminate: false,
      checkAll: false,
    }
  },
  methods: {
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击导出 */
    submitClick() {
      if (this.checkList.length > 0) {
        const params = this.reqData
        params.colNames = this.checkList.join()
        this.isLoading = true
        certSafeManageExcelExport(params)
          .then((res) => {
            // console.log(res)
            const contentDisposition = res.headers['content-disposition']
            const fileName = window.decodeURI(
              contentDisposition.substring(contentDisposition.indexOf('=') + 1),
            )
            fileDownload(res.data, fileName)
            this.cancelClick()
          })
          .catch((err) => {
            this.$message.error('下载出错', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      else {
        this.$message.warning('至少选择1个字段')
      }
    },
    /* 全选回调 */
    checkAllEvt(val) {
      if (val) {
        this.checkList = []
        for (const item of this.pickList) {
          this.checkList.push(item.value)
        }
      }
      else {
        this.checkList = []
      }
    },
    /* 选择回调 */
    checkChangeEvt() {
      if (this.checkList.length === this.pickList.length) {
        this.checkAll = true
      }
      else {
        this.checkAll = false
      }
    },
  },
}
</script>

<template>
  <div class="export-bg">
    <div class="export-pick">
      <span class="pick-title">可选字段：</span>
      <el-checkbox
        v-model="checkAll"
        :indeterminate="checkList.length > 0 && checkList.length < pickList.length"
        @change="checkAllEvt"
      >
        全选
      </el-checkbox>
      <el-checkbox-group
        v-model="checkList"
        @change="checkChangeEvt"
      >
        <el-checkbox
          v-for="item in pickList"
          :key="item.value"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-loading="isLoading"
        type="success"
        size="medium"
        @click="submitClick"
      >
        导出
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.export-bg {
  .export-pick {
    .pick-title {
      font-weight: bold;
    }
  }
  .el-checkbox {
    margin-top: 10px;
  }
}
</style>
