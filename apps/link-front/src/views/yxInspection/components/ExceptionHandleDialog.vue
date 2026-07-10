<script>
import { ref, reactive, watch, computed, getCurrentInstance } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { auditInspectionAbnormal } from "@/http/inspection/yx-inspection-api";

export default {
  name: "ExceptionHandleDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "view", // "view" | "audit"
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const loading = ref(false);

    // 表单数据（仅审核模式使用）
    const form = reactive({
      auditResult: "",
      abnormalLevel: "",
      problemDesc: "",
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      return props.dialogType === "audit" ? "审核巡检异常记录" : "异常详情";
    });

    // 是否只读（view 模式）
    const isReadonly = computed(() => props.dialogType === "view");

    // 是否为问题类型（审核模式）
    const isProblem = computed(() => form.auditResult === "1");

    // filePrefix 前缀（用于图片、视频、音频URL）
    const filePrefix = computed(() => {
      const globalData = JSON.parse(localStorage.getItem("globalData")) || {};
      return globalData.minioFilePrefix || "";
    });

    // 图片列表（添加 filePrefix 前缀）
    const photoList = computed(() => {
      if (!props.info.photo) return [];
      return props.info.photo
        .split(",")
        .filter((url) => url.trim())
        .map((url) => filePrefix.value + url.trim());
    });

    // 视频URL（添加 filePrefix 前缀）
    const videoUrl = computed(() => {
      if (!props.info.video) return "";
      return filePrefix.value + props.info.video;
    });

    // 音频URL（添加 filePrefix 前缀）
    const audioUrl = computed(() => {
      if (!props.info.audio) return "";
      return filePrefix.value + props.info.audio;
    });

    // 格式化异常时间
    const formatExceptionTime = (val) => {
      if (!val) return "-";
      const str = String(val).trim().replace(/-/g, "/");
      const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    // 动态校验规则（仅审核模式使用）
    const rules = computed(() => ({
      auditResult: [{ required: true, message: "请选择审核结果", trigger: "change" }],
      problemDesc: isProblem.value
        ? [{ required: true, message: "请输入问题描述", trigger: "blur" }]
        : [],
    }));

    // 审核API调用
    const { mutate: auditMutate } = useMutation({
      mutationFn: (data) => auditInspectionAbnormal(data),
      onSuccess: ({ data }) => {
        loading.value = false;
        if (data?.success) {
          proxy.$message.success(props.dialogType === "audit" ? "审核成功" : "操作成功");
          emit("submit");
          handleClose();
        } else {
          proxy.$message.error(data?.message || "操作失败");
        }
      },
      onError: (error) => {
        loading.value = false;
        proxy.$message.error(error?.message || "操作失败");
      },
    });

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) {
          initForm();
        }
      },
      { immediate: true }
    );

    // 初始化表单
    const initForm = () => {
      Object.assign(form, {
        auditResult: "",
        abnormalLevel: "",
        problemDesc: "",
      });
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 确认提交
    const handleConfirm = () => {
      if (props.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (!valid) return;

        loading.value = true;

        // 构建请求参数
        const params = {
          executeRecordId: props.info.id,
          auditResult: form.auditResult,
        };

        // 选择"问题"时需要额外参数
        if (form.auditResult === "1") {
          if (form.abnormalLevel) params.abnormalLevel = form.abnormalLevel;
          params.problemDesc = form.problemDesc;
        }

        auditMutate(params);
      });
    };

    return {
      dialogVisible,
      formRef,
      form,
      loading,
      dialogTitle,
      isReadonly,
      isProblem,
      rules,
      filePrefix,
      photoList,
      videoUrl,
      audioUrl,
      formatExceptionTime,
      handleClose,
      handleConfirm,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="small">
      <!-- 只读信息区域：两列布局 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划名称">
            <el-input :value="info.planName || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检岗位">
            <el-input :value="info.inspectionPost || info.postName || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检人员">
            <el-input :value="info.inspector || info.executeUsername || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="异常时间">
            <el-input
              :value="formatExceptionTime(info.exceptionTime || info.executeDate)"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 多媒体展示区域 -->
      <!-- 图片 -->
      <el-form-item label="图片：">
        <div class="media-list">
          <div
            v-for="(url, index) in photoList"
            :key="index"
            class="media-item image-item"
          >
            <el-image
              :src="url"
              :preview-src-list="photoList"
              fit="cover"
              class="preview-image"
            >
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </div>
      </el-form-item>

      <!-- 视频 -->
      <el-form-item label="视频：">
        <div class="media-list">
          <div class="media-item video-item">
            <video
              :src="videoUrl"
              controls
              class="preview-video"
              preload="metadata"
            ></video>
          </div>
        </div>
      </el-form-item>

      <!-- 语音 -->
      <el-form-item label="语音：">
        <div class="media-list">
          <div class="media-item audio-item">
            <audio :src="audioUrl" controls class="preview-audio"></audio>
          </div>
        </div>
      </el-form-item>

      <!-- 文字（语音转文字） -->
      <el-form-item label="文字：">
        <el-input
          :value="info.problemDesc || '-'"
          type="textarea"
          :rows="2"
          disabled
          placeholder="暂无文字内容"
        />
      </el-form-item>

      <!-- 审核表单（仅 audit 模式显示） -->
      <template v-if="!isReadonly">
        <el-form-item label="审核结果" prop="auditResult" required>
          <el-radio-group v-model="form.auditResult">
            <el-radio label="0">误报</el-radio>
            <el-radio label="1">有效</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 选择"问题"时动态显示 -->
        <template v-if="isProblem">
          <el-form-item label="异常级别" prop="abnormalLevel">
            <el-radio-group v-model="form.abnormalLevel">
              <el-radio label="1">一般</el-radio>
              <el-radio label="3">紧急</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="问题描述" prop="problemDesc">
            <el-input
              v-model="form.problemDesc"
              type="textarea"
              :rows="3"
              placeholder="请输入问题描述"
            />
          </el-form-item>
        </template>

        <!-- 提示信息 -->
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="提示：审核后，将无法进行修改，请确认后再保存"
          class="audit-tip"
        />
      </template>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">{{
        isReadonly ? "关 闭" : "取 消"
      }}</el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
        size="small"
      >
        确认保存
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.media-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.media-item {
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;

  &.image-item {
    width: 80px;
    height: 80px;
  }

  &.video-item {
    width: 200px;
    height: 120px;
  }

  &.audio-item {
    width: 100%;
    max-width: 400px;
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-audio {
  width: 100%;
  height: 40px;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  color: #909399;
  background-color: #f5f7fa;
}

.audit-tip {
  margin-top: 16px;
  background-color: #fdf6ec;
  border: 1px solid #f5d8a8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
