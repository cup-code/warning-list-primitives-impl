<script>
export default {
  name: 'ReportTable',
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    tableData: {
      type: Array,
      required: true,
      default: () => [],
    },
    showTable: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '100%',
    },
    headerBgColor: {
      type: String,
      default: '#2986c7',
    },
    headerTextColor: {
      type: String,
      default: '#fff',
    },
    subtitleBgColor: {
      type: String,
      default: '#f5f6fa',
    },
    subtitleTextColor: {
      type: String,
      default: '#333',
    },
    columnHeaderBgColor: {
      type: String,
      default: '#e5e6eb',
    },
    columnHeaderTextColor: {
      type: String,
      default: '#333',
    },
  },
}
</script>

<template>
  <div
    v-if="showTable"
    class="p-2 bg-white rounded-md box-border flex flex-col items-center justify-center border border-gray-200 mt-5"
    :style="{ width }"
  >
    <div
      v-if="title"
      :style="{ background: headerBgColor, color: headerTextColor }"
      class="w-full text-center"
    >
      <div class="px-4 py-2 text-xl font-medium text-center align-middle">
        {{ title }}
      </div>
    </div>
    <div
      v-if="subtitle"
      :style="{ background: subtitleBgColor, color: subtitleTextColor }"
      class="w-full text-center"
    >
      <div class="px-4 py-2 text-base font-medium text-center align-middle">
        {{ subtitle }}
      </div>
    </div>
    <table
      :style="{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      }"
    >
      <thead>
        <tr :style="{ background: columnHeaderBgColor, color: columnHeaderTextColor }">
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{
              padding: '8px 0',
              width: column.width || 'auto',
            }"
          >
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in tableData"
          :key="index"
          style="text-align: center; border-top: 1px solid #e5e6eb"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            style="padding: 8px 0"
          >
            {{ row[column.key] }}
          </td>
        </tr>
        <tr v-if="!tableData || tableData.length === 0">
          <td
            :colspan="columns.length"
            style="text-align: center; color: #aaa; padding: 16px"
          >
            暂无数据
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
