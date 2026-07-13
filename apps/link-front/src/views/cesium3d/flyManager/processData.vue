<script>
import { mapState } from "vuex";
export default {
  name: "ProcessData",

  data() {
    return {
      processData: [],
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["pointInfo", "nonProcessInfo"]),
  },
  watch: {
    nonProcessInfo: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.processData = newVal.map((item) => ({
            ...item,
            value: Number(item.valueList?.[0]?.value || 0)?.toFixed(2),
          }));
        } else {
          this.processData = [];
        }
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>

<template>
  <div class="flex flex-col box-border">
    <div
      class="text-white mb-2 p-1 w-1/3 rounded-sm"
      style="background-image: linear-gradient(30deg, #0f445d 10%, transparent 80%)"
    >
      非工艺数据
    </div>
    <div
      class="flex flex-wrap overflow-y-auto content-start pt-3 h-[20vh] rounded-lg"
      style="background-color: rgba(0, 0, 0, 0.3); scrollbar-width: none"
    >
      <div
        v-for="item in processData"
        :key="item.code"
        class="flex items-center justify-between h-7 leading-7 mb-2 mx-1"
        style="background-color: rgba(225, 225, 225, 0.3); width: calc(50% - 8px)"
      >
        <div
          class="text-xs p-1 truncate rounded-sm"
          style="color: #4afafe; max-width: 74%"
        >
          <span>{{ item.code }}</span>
          <span>-</span>
          <span>{{ item.name }}</span>
        </div>
        <div class="text-xs p-1 rounded-sm" style="color: #4afafe">
          <span>{{ item.value }}</span>
          <span>{{ item.ioUnit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
