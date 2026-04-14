<script>
export default {
  name: 'ECell',
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
    max-width: 20vw;
    padding: 0 8px;
    box-sizing: border-box;

    &:first-child {
      flex: none;
      width: 30px !important;
      line-height: 30px;
      height: 30px;
    }
  }
}
</style>
