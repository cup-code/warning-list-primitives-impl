<script>
import { ref, reactive, watch, computed, nextTick, getCurrentInstance } from "vue";
import { saveOrUpdateKnowledgeBase } from "@/http/inspection/yx-inspection-api";
import { getMockStatus } from "@/utils/mockConfig";
import FileUpload from "@/views/common-ui/FileUpload.vue";

import { upLoadImg } from "@/http/manage-api";
// 获取当前模块的 Mock 状态
const USE_MOCK = getMockStatus("knowledgeBase");

/** 知识库附件：仅允许 PDF 与视频（与 FileUpload 的 accept 校验一致） */
const KNOWLEDGE_BASE_ACCEPT = ["application/pdf", "video/mp4"];

const KNOWLEDGE_BASE_ACCEPT_TIP = "PDF 及视频（如 MP4 ）";

/** 展示用文件名：兼容接口未返回 fileName，从路径或其它字段推导 */
function resolveDisplayFileName(info, filePath) {
  const direct =
    info.fileName ||
    info.originalName ||
    info.originalFileName ||
    info.attachName ||
    info.name;
  if (direct) return direct;
  if (!filePath || typeof filePath !== "string") return "";
  const noQuery = filePath.split("?")[0];
  const segments = noQuery.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "";
  if (!last) return "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export default {
  name: "KnowledgeBaseDialog",
  components: {
    FileUpload,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "add",
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  created() {
    this.getPrefix();
  },
  setup(props, { emit }) {
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const fileUploadRef = ref(null);
    const loading = ref(false);
    const { proxy } = getCurrentInstance();

    // 表单数据（统一字段）
    const form = reactive({
      id: "",
      title: "",
      category: "",
      resourceType: "",
      enable: true,
      file: "",
      fileName: "",
      description: "",
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      const titles = {
        add: "新增知识库",
        edit: "编辑知识库",
        view: "查看知识库",
      };
      return titles[props.dialogType] || "知识库";
    });

    // 是否只读
    const isReadonly = computed(() => props.dialogType === "view");

    // 类型选项
    const typeOptions = [
      { label: "PDF", value: "PDF" },
      { label: "视频", value: "video" },
    ];

    const categoryOptions = [
      { label: "手册", value: "手册" },
      { label: "培训", value: "培训" },
      { label: "进阶", value: "进阶" },
    ];

    // 表单校验规则
    const rules = {
      title: [{ required: true, message: "请输入知识标题", trigger: "blur" }],
      category: [{ required: true, message: "请选择知识分类", trigger: "change" }],
    };

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
      if (props.dialogType === "add") {
        Object.assign(form, {
          id: "",
          title: "",
          category: "",
          resourceType: "",
          enable: true,
          file: "",
          fileName: "",
          description: "",
        });
      } else {
        const info = props.info || {};
        form.id = info.id || "";
        form.title = info.resourceName || "";
        form.category = info.category || "";
        form.resourceType = info.resourceType || "";
        form.enable = info.enable === true || info.enable === "是";
        form.description = info.description || "";
        // 文件回显：从详情/列表接口获取的文件路径（接口常不返回 fileName，需从路径解析）
        const filePath = info.fileUrl || info.file || "";
        form.file = filePath;
        form.fileName = resolveDisplayFileName(info, filePath) || info.resourceName || "";
      }
    };

    // 已上传文件列表（供 FileUpload 回显）
    const oldFileList = computed(() => {
      if (!form.file) return [];
      return [{ urlPath: form.file, originalName: form.fileName || "文件" }];
    });

    const uploadEvt = (fileList) => {
      if (fileList.length) {
        upLoadImg(fileList[fileList.length - 1], "YI_XUN").then(({ data }) => {
          if (data.success) {
            form.file = data.result;
            form.fileName = fileList[fileList.length - 1].name;
            // 上传成功后清空 el-upload 内部队列，避免与 oldFileList 重复显示
            nextTick(() => {
              if (fileUploadRef.value) {
                fileUploadRef.value.upFiles = [];
              }
            });
          }
        });
      } else {
        form.file = "";
        form.fileName = "";
      }
    };

    // 文件删除处理
    const handleFileDelete = () => {
      form.file = "";
      form.fileName = "";
    };

    // 关闭弹窗
    const handleClose = () => {
      // 清空 el-upload 内部队列
      if (fileUploadRef.value) {
        fileUploadRef.value.upFiles = [];
      }
      // 重置表单，确保 oldFileList computed 依赖变化，下次打开时 FileUpload watcher 能触发
      Object.assign(form, {
        id: "",
        title: "",
        category: "",
        enable: true,
        resourceType: "",
        file: "",
        fileName: "",
        description: "",
      });
      emit("update:visible", false);
      emit("close");
    };

    // 确认保存
    const handleConfirm = () => {
      if (props.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true;

          const submitData = {
            id: form.id || undefined,
            resourceName: form.title,
            resourceType: form.resourceType,
            category: form.category,
            enable: form.enable,
            description: form.description,
            file: form.file,
            fileName: form.fileName,
          };

          if (USE_MOCK) {
            // Mock 保存
            setTimeout(() => {
              loading.value = false;
              emit("submit", { ...form });
              handleClose();
            }, 500);
          } else {
            saveOrUpdateKnowledgeBase(submitData)
              .then((res) => {
                loading.value = false;
                if (res.data?.success) {
                  emit("submit", { ...form });
                  handleClose();
                }
              })
              .catch(() => {
                loading.value = false;
              });
          }
        }
      });
    };

    return {
      dialogVisible,
      formRef,
      fileUploadRef,
      form,
      loading,
      dialogTitle,
      isReadonly,
      typeOptions,
      categoryOptions,
      rules,
      oldFileList,
      handleFileDelete,
      uploadEvt,
      handleClose,
      handleConfirm,
      knowledgeBaseUploadAccept: KNOWLEDGE_BASE_ACCEPT,
      knowledgeBaseUploadNotice: KNOWLEDGE_BASE_ACCEPT_TIP,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="560px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
      :disabled="isReadonly"
    >
      <el-form-item label="知识标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入知识标题" clearable />
      </el-form-item>

      <el-form-item label="是否启用">
        <el-switch v-model="form.enable" />
      </el-form-item>

      <el-form-item label="类别">
        <el-select v-model="form.category" placeholder="请选择类别" style="width: 100%">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="格式">
        <el-select
          v-model="form.resourceType"
          placeholder="请选择格式"
          style="width: 100%"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="附件">
        <FileUpload
          ref="fileUploadRef"
          fileType="YI_XUN"
          :oldFileList="oldFileList"
          :fileLimit="1"
          :multiple="false"
          :editable="!isReadonly"
          :disabled="isReadonly"
          :deleteFront="true"
          :accept="knowledgeBaseUploadAccept"
          :noticMsg="knowledgeBaseUploadNotice"
          @upload="uploadEvt"
          @delSucc="handleFileDelete"
        />
        <div class="upload-tip">仅限上传{{ knowledgeBaseUploadNotice }}格式的文件</div>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入描述"
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">取消</el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        :loading="loading"
        size="small"
        @click="handleConfirm"
      >
        确认保存
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1;
  padding-top: 4px;
}
</style>
