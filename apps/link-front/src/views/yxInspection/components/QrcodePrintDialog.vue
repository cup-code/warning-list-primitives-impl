<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
  name: "QrcodePrintDialog",
  components: {
    VueQrcode,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    printList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      printObj: {
        id: "qrcodePrintContent",
        popTitle: "巡检点二维码",
      },
    };
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<template>
  <el-dialog
    :visible.sync="visible"
    title="打印预览"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 打印内容区域 -->
    <div id="qrcodePrintContent" class="print-content">
      <div
        v-for="(item, index) in printList"
        :key="index"
        class="qrcode-item"
      >
        <VueQrcode :value="item.pointCode" :options="{ width: 150 }" />
        <div class="qrcode-info">
          <p class="point-name">{{ item.pointName }}</p>
          <p class="point-code">{{ item.pointCode }}</p>
        </div>
      </div>
      <div v-if="!printList.length" class="empty-tip">
        暂无数据
      </div>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" v-print="printObj">打印</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.print-content {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 10px;

  .qrcode-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 180px;
    padding: 15px;
    margin: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;

    .qrcode-info {
      margin-top: 10px;
      text-align: center;
      .point-name {
        font-weight: bold;
        font-size: 14px;
        margin: 0;
        word-break: break-all;
      }
      .point-code {
        font-size: 12px;
        color: #666;
        margin: 5px 0 0 0;
      }
    }
  }

  .empty-tip {
    width: 100%;
    text-align: center;
    color: #999;
    padding: 40px 0;
  }
}

::v-deep .el-dialog__body {
  padding: 10px 20px;
}
</style>