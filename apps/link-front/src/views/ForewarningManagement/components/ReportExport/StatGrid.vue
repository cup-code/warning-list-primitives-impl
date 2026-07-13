<script>
export default {
  name: 'StatGrid',
  props: {
    actualList: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
}
</script>

<template>
  <div class="table-container">
    <div class="mb-4 py-2 box-border text-lg font-semibold">
      本周报告预警实况
    </div>
    <div
      class="flex flex-wrap justify-between items-stretch p-3 mx-auto w-full bg-white rounded-md"
      style="border: 2px solid #23457b; width: 100%"
    >
      <div
        v-for="(item, idx) in actualList"
        :key="idx"
        class="flex flex-col items-center w-1/4 warning"
      >
        <div
          style="
            font-weight: bold;
            font-size: 22px;
            margin-bottom: 2px;
            letter-spacing: 1px;
          "
        >
          {{ item.value }}
        </div>
        <div style="font-size: 15px; font-weight: 500; margin-bottom: 2px">
          {{ item.label }}
        </div>
        <div
          v-if="item.sub"
          style="font-size: 13px; color: #23457b; opacity: 0.85; font-weight: 400"
        >
          {{ item.sub }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.warning {
  margin-bottom: 30px;
  text-align: center;
  color: #23457b;

  &:nth-child(n + 5) {
    margin-bottom: 0;
  }
}
</style>
