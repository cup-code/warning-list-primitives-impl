<script>
export default {
  name: 'ETitle',
  props: {
    title: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    classNameCell: {
      type: String,
      default: '',
    },
    customStyle: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
  <div :class="`flex items-center h-7 mb-3 ${classNameCell}`" :style="customStyle">
    <div class="mr-2 w-2 h-full bg-primary" />
    <div :class="`text-lg font-bold ${className}`">
      {{ title }}
    </div>
  </div>
</template>
