<script>
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import { addOrEditViewPoint } from "@/http/map/manage-api";
import { loadJsmap, unloadJsmap } from "@/utils/loadJsmap";

export default {
  name: "AddViewDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => {
        return {
          buildName: "",
          buildId: "",
          viewName: "",
          isDefault: false,
          inclination: 0,
          rotation: 30,
          distance: 0,
          latitude: 0,
          longitude: 0,
          height: 0,
        };
      },
    },
    isCheck: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "update:isCheck", "close", "submit"],
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const queryClient = useQueryClient();
    const form = ref({
      buildName: "",
      buildId: "",
      viewName: "",
      isDefault: false,
      inclination: 0,
      rotation: 30,
      distance: 0,
      center: {
        x: 0,
        y: 0,
        z: 0,
      },
    });

    const map = ref(null);
    const formRef = ref(null);
    const mapServerURL = window.g.MAP_URL;

    const rules = {
      viewName: [{ required: true, message: "请输入视角名称", trigger: "blur" }],
      buildName: [{ required: true, message: "请选择建筑名称", trigger: "blur" }],
      inclination: [{ required: true, message: "请设置倾斜角", trigger: "blur" }],
      rotation: [{ required: true, message: "请设置旋转角", trigger: "blur" }],
      distance: [{ required: true, message: "请设置距离", trigger: "blur" }],
    };

    onMounted(async () => {
      await loadJsmap();
    });

    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          if (props.info.viewName) {
            const {
              buildName,
              viewName,
              isDefault,
              inclination,
              rotation,
              distance,
              latitude,
              longitude,
              height,
            } = props.info;
            form.value = {
              ...props.info,
              buildName,
              viewName,
              isDefault: isDefault || false,
              inclination: Number(inclination) || 0,
              rotation: Number(rotation) || 30,
              distance: Number(distance) || 0,
              center: {
                x: Number(longitude) || 0,
                y: Number(latitude) || 0,
                z: Number(height) || 0,
              },
            };
          }
          vm.$nextTick(() => {
            if (props.isCheck || props.isEdit) {
              getBuildingId(props.info);
            } else {
              getBuildingId(vm.$dictUtils.getDictList("3DModel")[0]);
            }
          });
        }
      }
    );

    function onChangeName() {}

    async function getBuildingId(e) {
      if (map.value !== null) {
        map.value.destroy();
      }

      form.value.buildId = Number(e.dictCode || e.buildId);
      form.value.buildName = e.dictName || e.buildName;
      initMap(Number(e.dictCode || e.buildId));
      if (props.isCheck || props.isEdit) {
        onChange(form.value);
      }
    }

    function onChange(e) {
      if (map.value) {
        setTimeout(() => {
          map.value.setView({
            center: e.center,
            tilt: e.inclination,
            rotate: e.rotation,
            distance: e.distance || 425,
          });
        }, 700);
      }
    }

    function initMap(buildId) {
      map.value = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: "mapView",
        mapServerURL,
        openingAnimation: false,
        showLoading: false,
        buildingSelected: false,
        selectedEffect: false,
        showGlobe: true,
        showNavigationDisplay: true,
        defaultTiltAngle: 30,
        defaultRotationAngle: 30,
      });
      map.value.openMapById(buildId);
      map.value.on("loadComplete", () => {
        const compassControl = new jsmap.JSCompassControl({
          position: jsmap.JSControlPosition.LEFT_TOP,
          offset: {
            x: 10,
            y: 20,
          },
        });
        map.value.addControl(compassControl);

        const zoomControl = new jsmap.JSZoomControl({
          position: jsmap.JSControlPosition.LEFT_TOP,
          offset: {
            x: 40,
            y: 10,
          },
        });
        map.value.addControl(zoomControl);
        console.log(form.value, 888);
        // onChange(form.value)
      });
    }

    function closeMap() {
      if (map.value && Object.keys(map.value).length > 0) {
        map.value.destroy();
        map.value = null;
      }
    }

    function onClear() {
      map.value.destroy();
      map.value = null;
    }

    function onClose() {
      form.value = {};
      emit("update:visible", false);
      emit("update:isCheck", false);
      emit("update:info", {});

      emit("close", false);
    }

    const { mutate: addViewPoint } = useMutation({
      mutationFn: (formData) => addOrEditViewPoint(formData),
      onSuccess: (res) => {
        if (res.data.success) {
          queryClient.invalidateQueries({ queryKey: ["viewPointList"] });
          emit("submit");
          onClose();
          vm.$message.success("操作成功");
        } else {
          vm.$message.error(res.data.message);
        }
      },
    });
    function onSubmit() {
      if (formRef.value.validate) {
        formRef.value.validate((valid) => {
          if (valid) {
            const { center, tilt, rotate, distance } = map.value.currentView;
            const formData = {
              ...form.value,
              center,
              longitude: center.x,
              latitude: center.y,
              height: center.z,
              inclination: tilt,
              rotation: rotate,
              distance,
            };
            addViewPoint(formData);
          } else {
            console.log("表单验证失败");
            return false;
          }
        });
      }
    }

    return {
      form,
      map,
      formRef,
      rules,
      getBuildingId,
      onChangeName,
      onChange,
      initMap,
      closeMap,
      onClear,
      onClose,
      onSubmit,
    };
  },
  beforeDestroy() {
    unloadJsmap();
  },
};
</script>

<template>
  <el-dialog
    v-max-dialog
    title="新增视角"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    class="normal-dialog"
    width="70%"
    :visible="visible"
    @close="onClose"
  >
    <div class="px-3" style="height: 480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" inline>
        <el-form-item label="建筑名称：" prop="buildName">
          <el-select
            v-model="form.buildName"
            clearable
            :disabled="isCheck"
            placeholder="请选择建筑名称"
            @clear="onClear"
            @change="getBuildingId"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('3DModel')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="视角名称：" prop="viewName">
          <div class="w-44">
            <el-input
              v-model="form.viewName"
              :disabled="isCheck"
              clearable
              placeholder="请输入视角名称"
              @change="onChangeName"
            />
          </div>
        </el-form-item>
        <el-form-item label="是否默认：" prop="isDefault">
          <el-switch v-model="form.isDefault" :disabled="isCheck" />
        </el-form-item>
      </el-form>
      <div
        id="mapView"
        class="border-slate-100 relative flex flex-1 items-center justify-center border"
        style="height: 88%"
      >
        <div
          v-if="isCheck"
          class="absolute inset-0 z-50 bg-gray-400 opacity-10"
          style="cursor: not-allowed"
        />
        <div v-if="map === null">请选择建筑ID</div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer" style="height: 36px">
      <e-button type="default" @click="onClose"> 取消 </e-button>
      <e-button type="primary" :disabled="isCheck" @click="onSubmit"> 确定 </e-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .cesium-control-left {
  z-index: 10 !important;
}
::v-deep.el-form-item {
  margin-bottom: 16px !important;
}
::v-deep .el-form-item__content {
  height: 28px !important;
}

::v-deep .el-input-number--small {
  width: 182px;
}

::v-deep.el-slider__runway {
  margin: 12px 0 !important;
}
</style>
