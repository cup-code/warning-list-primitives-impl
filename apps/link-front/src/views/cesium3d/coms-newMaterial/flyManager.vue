<script>
import { mapActions, mapState } from "vuex";
import { clientWarningList } from "@/http/videoWarning/warning-api";
import Map2d from "../flyManager/map2d.vue";
import ProcessData from "../flyManager/processData.vue";
import RoutesMange from "../flyManager/routesMange.vue";

import WarningPlan from "../flyManager/warningPlan.vue";
import WarningVideo from "../flyManager/warningVideo.vue";

export default {
  name: "FlyManager",
  components: {
    RoutesMange,
    Map2d,
    WarningVideo,
    WarningPlan,
    ProcessData,
  },
  data() {
    return {
      warningList: [],
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["currentStep", "list", "isShowRoutes"]),
    isFinished() {
      return (
        this.list.findIndex((item) => item.name === this.currentStep.name) ===
        this.list.length - 1
      );
    },
  },
  methods: {
    ...mapActions("cesium3dStore", ["setPlanList", "setCurrentStep"]),

    async flyToRoutes(info) {
      this.setPlanList(info.id); // 调取接口获取当前计划的巡检点列表
      this.$store.commit("cesium3dStore/SET_IS_SHOW_ROUTES", !this.isShowRoutes);
      this.$emit("startInspection", this.isShowRoutes); // 触发父组件的startInspection事件
    },
    exitInspection() {
      this.setPlanList([]);
      this.setCurrentStep({});
      this.$store.commit("cesium3dStore/SET_IS_SHOW_ROUTES", !this.isShowRoutes);
      this.$emit("exitInspection");
    },
  },
  beforeDestroy() {
    this.$store.commit("cesium3dStore/SET_IS_SHOW_ROUTES", true);
    this.setCurrentStep({});
  },
};
</script>

<template>
  <div>
    <RoutesMange v-if="isShowRoutes" @flyToRoutes="flyToRoutes" />

    <div v-else class="relative items-end justify-between grid grid-cols-[24%_60%]">
      <div
        class="h-[calc(100vh-80px)] rounded-lg overflow-hidden mx-3 mt-2 transition-all duration-300 ease-in-out animate-slide-up"
      >
        <div
          class="flex h-[calc(100vh-80px)] flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border z-50"
        >
          <div
            class="rounded-md h-[40%] p-2 overflow-hidden mb-3 backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <Map2d />
          </div>
          <div
            class="rounded-md h-full p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="h-full rounded-lg">
              <WarningPlan />
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg overflow-hidden mx-3 mt-2">
        <div
          class="grid grid-cols-[3.5fr_2.8fr] gap-2 rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border z-50"
        >
          <div
            class="rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <ProcessData :processData="currentStep.processData || ''" />
          </div>
          <div
            class="rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <WarningVideo />
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-1/2 right-7 h-7 leading-7 px-5 z-50 text-white text-lg cursor-pointer transform translate-y-1/2 type-info"
        @click="exitInspection"
      >
        退出巡检
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.type-info {
  background: url(../css/bg-icon.png) no-repeat;
  background-size: 100% 100%;
  pointer-events: all;
}
</style>
