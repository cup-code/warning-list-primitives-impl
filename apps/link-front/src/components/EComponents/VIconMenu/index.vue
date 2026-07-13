<template>
  <div class="flex items-center gap-3 p-4 rounded-xl min-w-[80px]">
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      class="v-icon-button relative flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-all duration-300 ease-in-out"
      @click="handleClick(item, index)"
    >
      <div class="flex items-center justify-center w-full h-full">
        <svg-icon
          v-if="item.icon"
          :icon-class="item.icon"
          class="w-10 h-10 text-gray-300 transition-colors duration-300 hover:text-white"
        />
        <slot v-else :name="`icon-${index}`" />
        <span v-if="item.text" class="text-sm ml-2">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VIconMenu",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    menuItems() {
      return this.items.length > 0 ? this.items : this.defaultItems;
    },
    defaultItems() {
      return [
        { icon: "menu", name: "home" },
        { icon: "layout", name: "apps" },
        { icon: "setting", name: "settings" },
        { icon: "more", name: "more" },
      ];
    },
  },
  methods: {
    handleClick(item, index) {
      this.$emit("click", item, index);
    },
  },
};
</script>

<style lang="scss" scoped>
.pattern-background {
  background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    );
}

.v-icon-button {
  background: linear-gradient(145deg, #012531 0%, #012531 100%);
  box-shadow: inset 0 2px 4px rgba(101, 187, 254, 0.4),
    inset 0 -2px 4px rgba(101, 187, 254, 0.05), 0 4px 8px rgba(101, 187, 254, 0.3);

  // &:hover {
  //   transform: translateY(-2px);
  //   background: linear-gradient(145deg, #012531 0%, #012531 100%);
  //   box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4),
  //     inset 0 -2px 4px rgba(255, 255, 255, 0.08), 0 6px 12px rgba(255, 255, 255, 0.4);
  // }

  &:active {
    transform: translateY(0);
    background: linear-gradient(145deg, #012531 0%, #012531 100%);
    box-shadow: inset 0 2px 6px rgba(101, 187, 254, 0.5),
      inset 0 -1px 2px rgba(101, 187, 254, 0.03);
  }
}
</style>
