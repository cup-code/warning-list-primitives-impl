<script>
export default {
  name: 'ChartContainer',
}
</script>

<template>
  <div class="grid grid-rows-3 grid-cols-2 gap-4">
    <slot />
  </div>
</template>

<style scoped>
/* No additional styles needed as grid classes are used */
</style>
