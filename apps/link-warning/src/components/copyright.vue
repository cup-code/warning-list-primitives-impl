<script>
export default {
  props: ['desc'],
}
</script>

<template>
  <div
    v-if="desc"
    class="copyright"
  >
    <span> {{ desc || '' }}</span>
  </div>
</template>

<style lang="scss">
.copyright {
  width: 100%;
  position: fixed;
  bottom: 20px;
  z-index: 88;
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  padding-bottom: 10px;
  span {
    margin-right: 20px;
  }
}
</style>
