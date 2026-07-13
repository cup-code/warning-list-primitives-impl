<script>
export default {
  name: 'CTable',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => {
        return []
      },
    },
    tableData: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
}
</script>

<template>
  <el-table
    height="90%"
    :data="tableData"
    :loading="loading"
    :header-cell-style="{ background: 'var(--ky-head-color)' }"
    align="center"
  >
    <el-table-column
      v-for="item in list"
      :key="item.prop"
      :prop="item.prop"
      :fixed="item.fixed"
      :label="item.label"
      :align="item.align || 'center'"
      :min-width="item.width || 150"
    >
      <template slot-scope="scope">
        <div v-if="!item.slot">
          {{ scope.row[item.prop] }}
        </div>
        <slot
          v-else
          :info="scope.row"
        />
      </template>
    </el-table-column>
  </el-table>
</template>
