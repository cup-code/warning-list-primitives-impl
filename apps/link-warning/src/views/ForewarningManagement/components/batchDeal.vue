<template>
  <div>
    <div class="flex items-center card-cell">
      <el-checkbox
        v-if="layout === 'card'"
        :indeterminate="localIndeterminate"
        v-model="localCheckAll"
        @change="CheckAllChange"
      >
        全选
      </el-checkbox>
      <div class="mx-2">已选：{{ selected.length }}条预警</div>
      <el-button
        size="mini"
        :disabled="selected.length === 0"
        @click="onDeal"
        type="primary"
      >
        {{ batchType === "deal" ? "确认处理" : "确认删除" }}
      </el-button>
    </div>
    <DealDialog
      :userType="userType"
      :selectedWarnings="selected"
      :visible.sync="dialogVisible"
      @success="handleSuccess"
    />
  </div>
</template>

<script>
import DealDialog from "./dealDialog.vue";

export default {
  name: "BatchDeal",
  components: {
    DealDialog,
  },
  props: {
    layout: {
      type: String,
      default: "card",
    },
    userType: {
      type: String,
      default: "CustomerStatus",
    },
    checkAll: {
      type: Boolean,
      default: false,
    },
    batchType: {
      type: String,
      default: "deal",
    },
    isIndeterminate: {
      type: Boolean,
      default: true,
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dialogVisible: false,
      localCheckAll: false,
      localIndeterminate: true,
    };
  },
  watch: {
    checkAll: {
      handler(newVal) {
        this.localCheckAll = newVal;
      },
      immediate: true,
    },
    isIndeterminate: {
      handler(newVal) {
        this.localIndeterminate = newVal;
      },
      immediate: true,
    },
  },
  methods: {
    CheckAllChange(value) {
      this.$emit("checkAllChange", value);
    },

    onDeal() {
      if (this.batchType === "delete") {
        this.$emit("delete");
        return;
      }
      this.dialogVisible = true;
    },

    handleSuccess() {
      this.$emit("success");
    },
  },
};
</script>
