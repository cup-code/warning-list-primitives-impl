<script>
import EButton from '../EButton/index.vue'

export default {
  name: 'EMoreButton',
  components: {
    EButton,
  },
  props: {
    type: {
      type: String,
      default: 'text',
    },
    round: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'mini',
    },
    icon: {
      type: String,
      default: 'more',
    },
    plain: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '更多',
    },
    list: {
      type: Array,
      default: () => {
        return [{ type: 'text', icon: '', text: '', size: 'mini', disabled: false }]
      },
    },
  },
  methods: {
    onClick(e) {
      this.$emit(`${e}`)
    },
  },
}
</script>

<template>
  <el-dropdown class="block">
    <EButton
      :icon="icon"
      :type="type"
      :round="round"
      :size="size"
      :plain="plain"
    >
      {{ text }}
    </EButton>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="(item, index) in list"
        :key="index"
        :disabled="item.disabled"
      >
        <EButton
          :disabled="item.disabled"
          :type="item.type"
          :size="item.size"
          :icon="item.icon"
          :btnIcon="item.btnIcon"
          @click="onClick(item.props)"
        >
          {{ item.text }}
        </EButton>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<style scoped lang="scss">
.block {
  margin-left: 6px;
}
</style>
