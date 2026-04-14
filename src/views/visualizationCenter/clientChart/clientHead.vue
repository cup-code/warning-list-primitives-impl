<script>
export default {
  name: 'ClientHead',
  props: {
    list: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
}
</script>

<template>
  <div class="cell-item">
    <div
      v-for="(item, index) in list"
      :key="item.name"
      class="item-block"
      :inex="index"
    >
      {{ item }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cell-item {
  width: 100%;
  display: flex;
  line-height: 30px;
  height: 30px;
  background: rgba($color: #0a1e46, $alpha: 0.6);

  .item-block {
    flex: 1;
    text-align: center;
    max-width: calc((100% - 84px) / 3);
    padding: 0 8px;
    box-sizing: border-box;

    &:last-child {
      flex: none;
      width: 74px !important;
      padding-right: 28px;
      box-sizing: border-box;
    }
  }
}
</style>
