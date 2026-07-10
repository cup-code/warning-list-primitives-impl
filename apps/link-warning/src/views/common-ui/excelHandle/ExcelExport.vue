<script>
import fileDownload from 'js-file-download'
import { excelExportApi, getExcelHeader } from '@/http/excel-api'

export default {
  props: {
    /* 请求条件 */
    reqData: {
      type: Object,
      default() {
        return {}
      },
    },
    /* 请求业务对象 */
    businessData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      headerList: [], // 表头复选框数据
      checkList: [], // 选中的表头数据
      isLoading: false,
      checkAll: false, // 是否全选
    }
  },
  created() {
    this.getHeader()
  },
  methods: {
    /* 请求表头数据 */
    getHeader() {
      this.isLoading = true
      getExcelHeader(this.businessData.key)
        .then((res) => {
          if (res.data.success) {
            this.headerList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取表头数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取表头数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击导出 */
    submitClick() {
      if (this.checkList.length > 0) {
        const params = {
          exportFields: this.checkList,
          query: this.reqData,
        }
        this.isLoading = true
        excelExportApi(this.businessData.key, params)
          .then((res) => {
            fileDownload(res.data, `${this.businessData.name}.xlsx`)
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
        for (const item of this.headerList) {
          this.checkList.push(item)
        }
      }
      else {
        this.checkList = []
      }
    },
    /* 选择回调 */
    checkChangeEvt() {
      if (this.checkList.length === this.headerList.length) {
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
        :indeterminate="checkList.length > 0 && checkList.length < headerList.length"
        @change="checkAllEvt"
      >
        全选
      </el-checkbox>
      <el-checkbox-group
        v-model="checkList"
        @change="checkChangeEvt"
      >
        <el-checkbox
          v-for="item in headerList"
          :key="item.value"
          :label="item"
        >
          {{ item.alias }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin-right: 10px"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        type="success"
        size="medium"
        :loading="isLoading"
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
