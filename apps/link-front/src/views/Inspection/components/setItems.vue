<script>
import { SetItemsTableConfig } from "../config";

export default {
  name: "setItems",
  components: {},
  props: {
    // 表格数据（单一数据源，由父组件管理）
    tableData: {
      type: Array,
      default: () => [],
    },
    // 是否禁用（查看模式）
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      columns: SetItemsTableConfig,
    };
  },
  methods: {
    getTypeName(code) {
      const target = this.$dictUtils
        .getDictList("videoInspectType")
        .find((item) => item.dictCode === code);
      return target ? target.dictName : "";
    },
    handleTypeChange(info, typeCode) {
      this.handleInspectionTypeChange({
        ...info,
        typeCode,
        typeName: this.getTypeName(typeCode),
      });
    },
    handleSortOrderChange(info, value) {
      this.$emit("update", {
        ...info,
        sortOrder: value,
      });
    },
    handleAdd() {
      this.$emit("add");
    },
    handleDelete(info) {
      this.$emit("delete", info);
    },
    handleEdit(info) {
      this.$emit("select", {
        ...info,
        type: "edit",
      });
    },
    handleView(info) {
      this.$emit("select", {
        ...info,
        type: "view",
      });
    },
    handleInspectionItemChange(item) {
      console.log(item);
      this.$emit("select", item);
    },
    handleInspectionTypeChange(item) {
      // 当巡检类型改变时，通知父组件更新
      this.$emit("update", item);
    },
  },
};
</script>

<template>
  <div class="p-3 h-48">
    <EButton
      type="primary"
      :disabled="disabled"
      btnIcon="el-icon-plus"
      class="mb-2"
      @click="handleAdd"
    >
      新增巡检项
    </EButton>
    <CTable :tableData="tableData" :list="columns" height="100%">
      <template #typeName="{ info }">
        <el-select
          :value="info.typeCode"
          :disabled="disabled"
          placeholder="请选择巡检类型"
          @change="(val) => handleTypeChange(info, val)"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('videoInspectType')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </template>
      <template #itemName="{ info }">
        <EButton
          type="text"
          :disabled="disabled"
          @click="handleInspectionItemChange(info)"
        >
          {{ info.itemName || "选择" }}
        </EButton>
      </template>
      <template #sortOrder="{ info }">
        <el-input-number
          :value="info.sortOrder || 0"
          :disabled="disabled"
          :min="0"
          :max="9999"
          controls-position="right"
          @change="(val) => handleSortOrderChange(info, val)"
        />
      </template>
      <template #operation="{ info }">
        <EButton type="text" :disabled="disabled" @click="handleView(info)">
          查看
        </EButton>
        <EButton type="text" :disabled="disabled" @click="handleEdit(info)">
          修改
        </EButton>
        <EButton type="text" :disabled="disabled" @click="handleDelete(info)">
          删除
        </EButton>
      </template>
    </CTable>
  </div>
</template>
