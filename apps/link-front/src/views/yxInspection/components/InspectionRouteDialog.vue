<script>
import { ref, reactive, watch, computed, getCurrentInstance, nextTick, onBeforeUnmount } from "vue";
import Sortable from "sortablejs";
import { saveOrUpdateLine } from "@/http/inspection/yx-inspection-api";
import { getUsersByDepartIdFn } from "@/http/safe-production/user-manage-api";
import { getMockStatus } from "@/utils/mockConfig";

// 获取当前模块的 Mock 状态
const USE_MOCK = getMockStatus("inspectionRoute");

export default {
  name: "InspectionRouteDialog",
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
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const loading = ref(false);
    const tableRef = ref(null);
    let sortableInstance = null;

    // 用户列表（负责人选项）
    const userOptions = ref([]);

    // 表单数据
    const form = reactive({
      id: "",
      lineName: "", // API 字段：巡检路线名称
      directorId: "", // API 字段：负责人ID
      directorName: "", // 显示用：负责人名称
      contactPhone: "",
      remarks: "",
      points: [], // 巡检点列表 [{ placeId, placeName }]
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      const titles = {
        add: "新增巡检路线",
        edit: "编辑巡检路线",
        view: "查看巡检路线",
      };
      return titles[props.dialogType] || "巡检路线";
    });

    // 是否只读
    const isReadonly = computed(() => props.dialogType === "view");

    // 表单校验规则
    const rules = {
      lineName: [{ required: true, message: "请输入路线名称", trigger: "blur" }],
    };

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) {
          initForm();
          loadUserOptions();
          nextTick(() => initSortable());
        } else {
          destroySortable();
        }
      },
      { immediate: true }
    );

    // 监听巡检点列表变化，重新初始化拖拽
    watch(
      () => form.points.length,
      () => nextTick(() => initSortable())
    );

    // 加载负责人选项
    const loadUserOptions = async () => {
      try {
        const user = proxy.$store.state.user.user || {};
        const departmentId = user.departmentId;
        if (!departmentId) {
          console.warn("未获取到当前用户部门ID");
          userOptions.value = [];
          return;
        }
        const res = await getUsersByDepartIdFn(departmentId);
        if (res.data?.success) {
          userOptions.value = (res.data.result || []).map((u) => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
          }));
        }
      } catch (error) {
        console.error("获取用户列表失败:", error);
        userOptions.value = [];
      }
    };

    // 负责人选择变化
    const handleDirectorChange = (userId) => {
      const user = userOptions.value.find((u) => u.id === userId);
      if (user) {
        form.directorName = user.fullName;
      }
    };

    // 初始化表单
    const initForm = () => {
      if (props.dialogType === "add") {
        Object.assign(form, {
          id: "",
          lineName: "",
          directorId: "",
          directorName: "",
          contactPhone: "",
          remarks: "",
          points: [],
        });
      } else {
        const info = props.info || {};
        // 映射字段：routeName -> lineName, personInCharge -> directorName
        form.id = info.id || "";
        form.lineName = info.lineName || info.routeName || "";
        form.directorId = info.directorId || "";
        form.directorName = info.directorName || info.personInCharge || "";
        form.contactPhone = info.contactPhone || "";
        form.remarks = info.remarks || "";
        // 映射巡检点列表：yxInspectionLinePlaces -> points
        form.points = (info.yxInspectionLinePlaces || []).map((p, idx) => ({
          id: p.placeId || `point-${idx}`,
          placeId: p.placeId,
          placeName: p.placeName || p.name,
          sortOrder: p.sortOrder,
        }));
      }
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 新增巡检点
    const handleAddPoint = () => {
      emit("add-point");
    };

    // 删除巡检点
    const handleRemovePoint = (index) => {
      form.points.splice(index, 1);
    };

    // 确认提交（保存）
    const handleConfirm = () => {
      if (props.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true;

          // 构建请求数据（API 字段格式）
          const submitData = {
            id: form.id || undefined,
            lineName: form.lineName,
            directorId: form.directorId || undefined,
            contactPhone: form.contactPhone || undefined,
            placeIdList: form.points.map((p) => p.placeId).filter(Boolean),
            remarks: form.remarks || undefined,
          };

          if (USE_MOCK) {
            // Mock 保存
            setTimeout(() => {
              loading.value = false;
              proxy.$message.success("保存成功");
              emit("submit");
              handleClose();
            }, 500);
          } else {
            // 调用真实 API
            saveOrUpdateLine(submitData)
              .then((res) => {
                loading.value = false;
                if (res.data?.success) {
                  proxy.$message.success(res.data.message || "保存成功");
                  emit("submit");
                  handleClose();
                } else {
                  proxy.$message.error(res.data?.message || "保存失败");
                }
              })
              .catch((err) => {
                loading.value = false;
                proxy.$message.error("保存失败");
                console.error("保存巡检路线失败:", err);
              });
          }
        }
      });
    };

    // 供父组件在选取巡检点后追加到列表
    const addPoints = (list) => {
      const items = Array.isArray(list) ? list : [];
      items.forEach((item, idx) => {
        form.points.push({
          id: item.placeId || item.id || `point-${Date.now()}-${idx}`,
          placeId: item.placeId || item.id,
          placeName: item.placeName || item.name,
        });
      });
    };

    // 供父组件替换巡检点列表
    const setPoints = (list) => {
      const items = Array.isArray(list) ? list : [];
      form.points = items.map((item, idx) => ({
        id: item.placeId || item.id || `point-${Date.now()}-${idx}`,
        placeId: item.placeId || item.id,
        placeName: item.placeName || item.name,
      }));
    };

    // 拖拽排序
    function initSortable() {
      if (isReadonly.value) return;
      destroySortable();
      nextTick(() => {
        const tbody = tableRef.value?.$el?.querySelector(
          ".el-table__body-wrapper table tbody"
        );
        if (!tbody) return;
        sortableInstance = Sortable.create(tbody, {
          handle: ".drag-handle",
          animation: 150,
          onEnd: ({ newIndex, oldIndex }) => {
            if (newIndex === oldIndex) return;
            const [row] = form.points.splice(oldIndex, 1);
            form.points.splice(newIndex, 0, row);
          },
        });
      });
    }

    function destroySortable() {
      if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
      }
    }

    onBeforeUnmount(() => destroySortable());

    return {
      dialogVisible,
      formRef,
      form,
      loading,
      dialogTitle,
      isReadonly,
      rules,
      userOptions,
      tableRef,
      handleClose,
      handleAddPoint,
      handleRemovePoint,
      removePoint: handleRemovePoint,
      handleDirectorChange,
      handleConfirm,
      addPoints,
      setPoints,
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
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
      :disabled="isReadonly"
    >
      <el-form-item label="路线名称" prop="lineName" required>
        <el-input v-model="form.lineName" placeholder="请输入路线名称" />
      </el-form-item>

      <el-form-item label="负责人">
        <el-select
          v-model="form.directorId"
          placeholder="请选择负责人"
          filterable
          clearable
          style="width: 100%"
          @change="handleDirectorChange"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="联系电话">
        <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>

      <el-form-item label="">
        <el-button v-if="!isReadonly" type="primary" size="small" @click="handleAddPoint">
          新增巡检点
        </el-button>
      </el-form-item>

      <el-form-item label="" class="points-table-item">
        <el-table ref="tableRef" :data="form.points" border size="small" style="width: 100%" row-key="id">
          <el-table-column label="序号" type="index" width="60" :index="(i) => i + 1" />
          <el-table-column label="拖动" width="60" align="center">
            <template slot-scope="">
              <i class="el-icon-rank drag-handle" style="cursor: move" />
            </template>
          </el-table-column>
          <el-table-column label="巡检点" prop="placeName" min-width="120">
            <template slot-scope="{ row }">
              {{ row.placeName || row.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="{ $index }">
              <el-button
                v-if="!isReadonly"
                type="text"
                size="small"
                class="delete-btn"
                @click="handleRemovePoint($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">取 消</el-button>
      <el-button v-if="!isReadonly" type="primary" :loading="loading" @click="handleConfirm" size="small">
        保 存
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.points-table-item {
  margin-bottom: 0;
}

.drag-handle {
  cursor: move;
  color: #909399;
  font-size: 16px;
}

.delete-btn {
  color: #f56c6c;
  padding: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
