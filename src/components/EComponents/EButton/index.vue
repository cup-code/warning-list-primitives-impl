<script>
export default {
  name: "EButton",
  props: {
    type: {
      type: String,
      default: "default",
    },
    size: {
      type: String,
      default: "mini",
    },
    // 使用lucide库中的svg
    icon: {
      type: String,
      default: "",
    },
    // 使用elemnt中的图标
    btnIcon: {
      type: String,
      default: "",
    },
    round: {
      type: Boolean,
      default: false,
    },
    plain: {
      type: Boolean,
      default: false,
    },
    circle: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
    },
    customClass: {
      type: String,
      default: "",
    },
  },
  computed: {
    getColor() {
      return this.disabled && this.type === "text" ? "color:#bbb" : "";
    },
  },
  methods: {
    onClick() {
      this.$emit("click");
    },
  },
};
</script>

<template>
  <el-button
    class="e-btn"
    :class="customClass"
    :circle="circle"
    :disabled="disabled"
    :icon="btnIcon"
    :type="type"
    :color="color"
    :round="round"
    :size="size"
    :plain="plain"
    @click="onClick"
  >
    <svg-icon
      v-show="icon"
      :icon-class="icon"
      class="btn-icon"
      :class="
        plain || disabled || type === 'text'
          ? [`btn-icon-${type}`, `btn-icon-${disabled}`]
          : 'unPlain'
      "
      :style="{ getColor, color }"
    />
    <slot />
  </el-button>
</template>

<style lang="scss" scoped>
.e-btn {
  border-radius: 4px;
  overflow: hidden;

  &.is-disabled.is-plain:hover {
    .btn-icon {
      margin-right: 3px;
      color: #909399;

      &-true {
        opacity: 0.5;
      }

      &-text {
        color: var(--ky-primary);
      }

      &-primary {
        color: var(--ky-primary);
      }

      &-success {
        color: var(--ky-success);
      }

      &-danger {
        color: var(--ky-danger);
      }

      &-warning {
        color: var(--ky-warning);
      }

      &-info {
        color: var(--ky-info);
      }
    }
  }

  &:hover {
    .btn-icon {
      margin-right: 3px;
      color: #ffffff;

      &-default {
        color: var(--ky-primary);
      }

      &-text {
        color: var(--ky-primary);
      }
    }
  }

  .btn-icon {
    margin-right: 3px;
    color: #606266;

    &-true {
      opacity: 0.5;
    }

    &-text {
      color: var(--ky-primary);
    }

    &-primary {
      color: var(--ky-primary);
    }

    &-success {
      color: var(--ky-success);
    }

    &-danger {
      color: var(--ky-danger);
    }

    &-warning {
      color: var(--ky-warning);
    }

    &-info {
      color: var(--ky-info);
    }
  }

  .unPlain {
    margin-right: 3px;
    color: #ffffff;
  }
}

::v-deep.el-button {
  i + span {
    display: inline !important;
  }
  span {
    display: flex !important;
  }
}
</style>
