<script>
import {
  ref,
  reactive,
  watch,
  computed,
  nextTick,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue";
import Sortable from "sortablejs";
import InlineMapSelection from "./InlineMapSelection.vue";
import SelectInspectionItemDialog from "./SelectInspectionItemDialog.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { saveInspectionPlace } from "@/http/inspection/yx-inspection-api";
import { getSpecifiedModule } from "@/http/companyConfig/companyConfig-api.js";

export default {
  name: "InspectionPointDialog",
  components: {
    InlineMapSelection,
    SelectInspectionItemDialog,
    VueQrcode,
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
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const loading = ref(false);
    const tableRef = ref(null);
    const mapKey = ref(0);
    let sortableInstance = null;

    // 表单数据（与图示一致）
    const form = reactive({
      id: "",
      pointName: "",
      pointCode: "",
      needCheckIn: "是",
      requirePhoto: "是",
      position: "",
      remarks: "",
      alarmMinutes: 30,
      geoInfo: "",
      qrcodeImage: "", // 巡检点二维码图片（上传）
    });

    // 巡检项表格数据
    const itemList = ref([]);
    const selectItemDialogVisible = ref(false);

    // 弹窗标题
    const dialogTitle = computed(() => {
      const titles = {
        add: "新增巡检点",
        edit: "编辑巡检点",
        view: "查看巡检点",
      };
      return titles[props.dialogType] || "巡检点";
    });

    const isReadonly = computed(() => props.dialogType === "view");

    // 表单校验规则
    const rules = {
      pointName: [{ required: true, message: "请输入点名称", trigger: "blur" }],
      pointCode: [{ required: true, message: "请输入点编号", trigger: "blur" }],
      needCheckIn: [{ required: true, message: "请选择是否打卡", trigger: "change" }],
      requirePhoto: [{ required: true, message: "请选择现场拍照", trigger: "change" }],
    };

    // 监听 visible
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) {
          initForm(); // 先初始化表单数据
          mapKey.value = Date.now(); // 再更新 key，让地图组件挂载时能获取到正确的 geoInfo
          nextTick(() => initSortable());
        } else {
          destroySortable();
        }
      },
      { immediate: true }
    );

    watch(
      () => itemList.value.length,
      () => nextTick(() => initSortable())
    );

    function initForm() {
      if (props.dialogType === "add") {
        Object.assign(form, {
          id: "",
          pointName: "",
          pointCode: "",
          needCheckIn: "是",
          requirePhoto: "是",
          position: "",
          remarks: "",
          alarmMinutes: 30,
          geoInfo: "",
          qrcodeImage: "",
        });
        itemList.value = [];
        // 新增时获取地图初始定位
        initMapLocation();
      } else {
        Object.assign(form, {
          id: props.info.id,
          pointName: props.info.pointName ?? "",
          pointCode: props.info.pointCode ?? "",
          needCheckIn: props.info.needCheckIn ?? "是",
          requirePhoto: props.info.requirePhoto ?? "是",
          position: props.info.position ?? "",
          remarks: props.info.remarks ?? "",
          alarmMinutes: props.info.alarmMinutes ?? 30,
          geoInfo:
            typeof props.info.geoInfo === "string" && props.info.geoInfo
              ? props.info.geoInfo
              : props.info.geoInfo ?? "",
          qrcodeImage: props.info.qrcodeImage ?? "",
          contentList: props.info.contentList || [],
        });
        itemList.value = (props.info.contentList || []).map((item, idx) => ({
          id: item.id ?? idx + 1,
          category: item.category ?? "",
          itemName: item.itemName ?? "",
          standard: item.standard ?? "",
          sortOrder: idx + 1,
        }));
      }
    }

    function handleClose() {
      emit("update:visible", false);
      emit("close");
    }

    function handleSetPointInfo(info) {
      form.geoInfo =
        typeof info === "string" ? info : (info && JSON.stringify(info)) || "";
    }

    async function handleConfirm() {
      if (isReadonly.value) {
        handleClose();
        return;
      }

      formRef.value?.validate(async (valid) => {
        if (!valid) return;

        loading.value = true;

        try {
          // 解析 geoInfo
          let geoInfo = null;
          if (form.geoInfo) {
            try {
              geoInfo =
                typeof form.geoInfo === "string"
                  ? JSON.parse(form.geoInfo)
                  : form.geoInfo;
            } catch (e) {
              console.error("geoInfo 解析失败:", e);
            }
          }

          // 构建符合 API 要求的 payload
          const payload = {
            id: form.id || undefined,
            placeCode: form.pointCode,
            placeName: form.pointName,
            needMark: form.needCheckIn === "是",
            needPhoto: form.requirePhoto === "是",
            placePosition: form.position,
            attention: form.remarks,
            geoInfo: geoInfo
              ? JSON.stringify({
                  longitude: geoInfo.longitude,
                  latitude: geoInfo.latitude,
                  cityName: geoInfo.cityName || geoInfo.address || "",
                })
              : "",
            contentIdList: itemList.value
              .map((item) => item.id || item.contentId)
              .filter(Boolean),
          };

          const res = await saveInspectionPlace(payload);

          if (res.data?.success) {
            proxy.$message.success(form.id ? "修改成功" : "新增成功");
            emit("submit", payload);
            handleClose();
          } else {
            proxy.$message.error(res.data?.message || "保存失败");
          }
        } catch (error) {
          console.error("保存巡检点失败:", error);
          proxy.$message.error("保存失败");
        } finally {
          loading.value = false;
        }
      });
    }

    // 巡检项：新增（打开多选弹窗）
    function handleAddItem() {
      selectItemDialogVisible.value = true;
    }

    // 巡检项：编辑（点击表格行打开多选弹窗，可追加选择）
    function handleEditItem(row, index) {
      selectItemDialogVisible.value = true;
    }

    // 巡检项选择确认（多选）
    function handleSelectItemConfirm(selectedItems) {
      if (selectedItems && selectedItems.length > 0) {
        // 获取当前已有的巡检项ID集合
        const existingIds = new Set(
          itemList.value.map((item) => item.contentId || item.id)
        );

        // 过滤出新增的巡检项（避免重复添加）
        const newItems = selectedItems
          .filter((item) => !existingIds.has(item.contentId))
          .map((item, idx) => ({
            id: Date.now() + idx,
            contentId: item.contentId,
            category: item.category ?? "",
            itemName: item.itemName ?? "",
            standard: item.standard ?? "",
            sortOrder: itemList.value.length + idx + 1,
          }));

        // 追加到列表
        itemList.value = [...itemList.value, ...newItems];
      }
      selectItemDialogVisible.value = false;
    }

    function handleDeleteItem(index) {
      itemList.value.splice(index, 1);
    }

    // 获取地图初始定位配置（新增弹窗时使用）
    async function initMapLocation() {
      const companyId = JSON.parse(sessionStorage.getItem("user"))?.companyId;
      if (!companyId) return;

      try {
        const { data } = await getSpecifiedModule(companyId, "YixunSetting");
        if (data.success && data.result) {
          const config = {};
          data.result.forEach((item) => {
            config[item.item] = item.value;
          });
          if (config.longitude && config.latitude) {
            form.geoInfo = JSON.stringify({
              longitude: config.longitude,
              latitude: config.latitude,
              cityName: config.cityName || "",
            });
            mapKey.value = Date.now();
          }
        }
      } catch (e) {
        console.error("获取地图初始定位失败:", e);
      }
    }

    // 拖拽
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
            const [row] = itemList.value.splice(oldIndex, 1);
            itemList.value.splice(newIndex, 0, row);
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
      itemList,
      selectItemDialogVisible,
      tableRef,
      mapKey,
      handleClose,
      handleConfirm,
      handleSetPointInfo,
      handleAddItem,
      handleEditItem,
      handleSelectItemConfirm,
      handleDeleteItem,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="930px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="dialog-body">
      <!-- 不在 form 上使用 disabled：查看模式下地图仍需滚轮缩放与拖拽平移，整表禁用会阻断地图命中 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="small">
        <!-- 第一行：点名称、点编号 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检点名称" prop="pointName" required>
              <el-input
                v-model="form.pointName"
                placeholder="请输入点名称"
                clearable
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡检点编号" prop="pointCode" required>
              <el-input
                v-model="form.pointCode"
                placeholder="请输入点编号"
                clearable
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行： 巡检位置、注意事项   -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检位置">
              <el-input
                v-model="form.position"
                placeholder="请输入巡检位置"
                clearable
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注意事项">
              <el-input
                v-model="form.remarks"
                placeholder="请输入注意事项"
                clearable
                :disabled="isReadonly"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第三行：是否打卡、现场拍照-->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否打卡" prop="needCheckIn" required>
              <el-radio-group v-model="form.needCheckIn" :disabled="isReadonly">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现场拍照" prop="requirePhoto" required>
              <el-radio-group v-model="form.requirePhoto" :disabled="isReadonly">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：报警时间、巡检点二维码（待上传） -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检点二维码">
              <div class="qrcode-container">
                <VueQrcode
                  v-if="form.pointCode"
                  :value="form.pointCode"
                  :options="{ width: 100 }"
                />
                <div v-else class="qrcode-placeholder">
                  <i class="el-icon-picture-outline" />
                  <span>请先输入点编号</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置标注：复用 SetPoint 地图组件 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="位置标注" prop="geoInfo">
              <div class="location-tip">
                <i class="el-icon-location-outline" />
                <span>在地图标注上当前巡检点的位置</span>
              </div>
              <div v-if="dialogVisible" class="map-container">
                <InlineMapSelection
                  :key="mapKey"
                  :geoInfo="form.geoInfo"
                  :disabled="isReadonly"
                  @setPointInfo="handleSetPointInfo"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 巡检项表格 -->
        <el-form-item label="巡检项" class="form-item-table">
          <div class="table-toolbar">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              :disabled="isReadonly"
              @click="handleAddItem"
            >
              选择巡检项
            </el-button>
          </div>
          <el-table
            ref="tableRef"
            :data="itemList"
            border
            size="small"
            :header-cell-style="{ background: '#f5f7fa' }"
            row-key="id"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
              :index="(i) => i + 1"
            />
            <el-table-column width="50" align="center" label="拖动">
              <template #default>
                <i class="el-icon-rank drag-handle" style="cursor: move" />
              </template>
            </el-table-column>
            <el-table-column
              label="类别"
              width="100"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ $dictUtils.getDictLabel("inspectionCategory", row.category) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemName"
              label="巡检项"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="standard"
              label="巡检标准"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  v-if="!isReadonly"
                  type="text"
                  class="text-danger"
                  @click="handleDeleteItem($index)"
                >
                  删除
                </el-button>
                <span v-else>—</span>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        size="small"
        :loading="loading"
        @click="handleConfirm"
      >
        确认保存
      </el-button>
    </span>

    <!-- 选择巡检项弹窗（多选） -->
    <SelectInspectionItemDialog
      :visible.sync="selectItemDialogVisible"
      :selected-ids="itemList.map((item) => item.contentId || item.id)"
      @close="selectItemDialogVisible = false"
      @confirm="handleSelectItemConfirm"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  max-height: 56vh;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 100%;
}

/* 巡检点二维码：自动生成显示区域 */
.qrcode-container {
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;

  i {
    font-size: 24px;
    margin-bottom: 4px;
  }
}

.unit {
  margin-left: 9px;
  color: #606266;
  font-size: 12px;
}

.location-tip {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #409eff;
  font-size: 12px;

  i {
    margin-right: 6px;
    font-size: 16px;
  }
}

.map-container {
  width: 100%;
  max-width: 100%;
  height: 300px;
  border-radius: 4px;
  overflow: hidden;
}

.form-item-table {
  display: block;

  ::v-deep .el-form-item__content {
    display: block;
    max-width: 100%;
  }
}

/* 表格区域不撑出宽度，避免出现 x 轴滚动条 */
.form-item-table ::v-deep .el-table {
  width: 100% !important;
}

.form-item-table ::v-deep .el-table__body-wrapper {
  overflow-x: hidden;
}

.table-toolbar {
  margin-bottom: 8px;
}

.text-danger {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 弹窗内容区不出现 x 轴滚动条 */
::v-deep .el-dialog__body {
  overflow-x: hidden;
}
</style>
