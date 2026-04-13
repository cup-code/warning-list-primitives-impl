<script>
import WarningInfo from './warningInfo.vue'

export default {
  name: 'CheckGroup',
  components: {
    WarningInfo,
  },
  props: {
    tableData: {
      type: Array,
      default: () => {
        return []
      },
    },
    height: {
      type: String,
      default: '100%',
    },
    form: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: '',
    },
    allType: {
      type: Boolean,
      default: false,
    },
    isBatch: {
      type: Boolean,
      default: false,
    },
    checkboxGroup: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      localCheckboxGroup: [],
      list: [],
    }
  },
  watch: {
    checkboxGroup: {
      handler(newVal) {
        this.localCheckboxGroup = newVal
      },
      immediate: true,
    },
    tableData: {
      handler(newVal) {
        this.list = newVal
      },
      immediate: true,
    },
  },
  methods: {
    handleChecked(value) {
      this.$emit('check', value)
    },
  },
}
</script>

<template>
  <el-checkbox-group
    v-model="localCheckboxGroup"
    class="flex overflow-y-auto flex-wrap content-start w-full"
    style="scrollbar-width: auto; -ms-overflow-style: auto"
    size="mini"
    @change="handleChecked"
  >
    <div v-for="item in list" :key="item.id" class="warning-checkbox-wrapper">
      <el-checkbox :key="item.id" :label="item.id" border>
        <WarningInfo
          :type="type"
          :form="form"
          :pageNum="form.pageNum"
          :item="item"
          :allType="allType"
          customStyle="width:100%;margin:0;border:none;"
        />
      </el-checkbox>
    </div>
  </el-checkbox-group>
</template>

<style lang="scss" scoped>
.warning-checkbox-wrapper {
  width: calc((100% - 36px) / 3);
  margin: 0 6px;
  margin-top: 10px;

  &:nth-child(-n + 3) {
    margin-top: 0;
  }

  .el-checkbox {
    display: block;
    width: 100%;
    height: 100%;

    ::v-deep .el-checkbox__label {
      width: 100%;
      padding: 0;
    }

    ::v-deep .el-checkbox__input {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
    }
  }
}

::v-deep.el-checkbox.is-bordered.el-checkbox--mini {
  height: auto;
  padding: 0;
  border-radius: 6px;
}
</style>
