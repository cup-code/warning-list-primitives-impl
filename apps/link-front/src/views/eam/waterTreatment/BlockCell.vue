<script>
export default {
  name: 'BlockCell',
  props: {
    customStyle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      list: [
        'w-4 h-1 bg-blue-400 absolute -top-0.5 -left-0.5',
        'w-4 h-1 bg-blue-400 absolute -top-0.5 -right-0.5',
        'w-4 h-1 bg-blue-400 absolute -bottom-0.5 -right-0.5',
        'w-4 h-1 bg-blue-400 absolute -bottom-0.5 -left-0.5',

        'w-1 h-4 bg-blue-400 absolute -top-0.5 -left-0.5',
        'w-1 h-4 bg-blue-400 absolute -top-0.5 -right-0.5',
        'w-1 h-4 bg-blue-400 absolute -bottom-0.5 -right-0.5',
        'w-1 h-4 bg-blue-400 absolute -bottom-0.5 -left-0.5',
      ],
    }
  },
}
</script>

<template>
  <div
    class="relative"
    style="border: 1px; border-style: solid; border-color: rgba(225, 225, 225, 0.4)"
    :style="customStyle"
  >
    <div
      v-for="(item, index) in list"
      :key="index"
      :class="item"
    />
    <slot />
  </div>
</template>
