<script>
import { ref, reactive, watch, computed } from "vue";

export default {
  name: "InspectionRecordDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const dialogVisible = ref(false);

    // 弹窗标题
    const dialogTitle = computed(() => "巡检详情");

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
      },
      { immediate: true }
    );

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    return {
      dialogVisible,
      dialogTitle,
      handleClose,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="计划名称">{{ info.planName }}</el-descriptions-item>
      <el-descriptions-item label="巡检点">{{ info.pointName }}</el-descriptions-item>
      <el-descriptions-item label="巡检项">{{ info.itemName }}</el-descriptions-item>
      <el-descriptions-item label="巡检结果">
        <el-tag size="small" :type="info.result === '正常' ? 'success' : 'danger'">
          {{ info.result }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="巡检人">{{ info.inspector }}</el-descriptions-item>
      <el-descriptions-item label="巡检时间">{{ info.inspectTime }}</el-descriptions-item>
    </el-descriptions>

    <div class="detail-section">
      <div class="section-title">巡检详情</div>
      <el-row :gutter="20" class="detail-content">
        <el-col :span="12">
          <div class="detail-item">
            <span class="label">巡检值：</span>
            <span class="value">正常</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <span class="label">标准值：</span>
            <span class="value">电流、电压正常</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="detail-item">
            <span class="label">备注：</span>
            <span class="value">巡检正常，设备运行良好</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="detail-section">
      <div class="section-title">现场照片</div>
      <div class="photo-list">
        <div class="photo-item">
          <el-image
            style="width: 120px; height: 120px"
            :src="'https://via.placeholder.com/120'"
            fit="cover"
            :preview-src-list="['https://via.placeholder.com/400']"
          />
        </div>
        <div class="photo-item">
          <el-image
            style="width: 120px; height: 120px"
            :src="'https://via.placeholder.com/120'"
            fit="cover"
            :preview-src-list="['https://via.placeholder.com/400']"
          />
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-section {
  margin-top: 20px;

  .section-title {
    font-weight: 600;
    font-size: 14px;
    color: #303133;
    margin-bottom: 15px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }

  .detail-content {
    .detail-item {
      margin-bottom: 10px;

      .label {
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #303133;
      }
    }
  }

  .photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .photo-item {
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #dcdfe6;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
