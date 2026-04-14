<script>
export default {
  props: {
    headers: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    dtType: {
      type: String,
      default: 'real',
    },
  },
}
</script>

<template>
  <el-table
    :data="data"
    border
    size="mini"
    style="width: 100%"
    :header-cell-style="{ background: '#f5f5f5' }"
  >
    <!-- <el-table-column
            v-for="(item, index) in headers"
            :key="index"
            :label="item.label"
            :prop="item.prop"
            align="center"
        >
            <template slot-scope="scope">
                <el-button v-if="item.isOpera" type="primary" size="small">{{scope.row[item.prop]}}</el-button>
                <template v-else-if="item[dtType]">
                    <el-table-column
                        v-for="(son, idx) in item[dtType]"
                        :key="idx"
                        :label="son.label"
                        :prop="son.prop"
                        align="center"
                    >

                    </el-table-column>
                </template>
                <div v-else>{{scope.row[item.prop]}}</div>
            </template>
        </el-table-column> -->

    <el-table-column
      v-for="(item, index) in headers"
      :key="index"
      :label="item.unit ? `${item.label}(${item.unit})` : item.label"
      :prop="item.prop"
      align="center"
    >
      <template v-if="item[dtType]">
        <el-table-column
          v-for="(son, idx) in item[dtType]"
          :key="idx"
          :label="son.label"
          :prop="son.prop"
          align="center"
        />
      </template>
    </el-table-column>
  </el-table>
</template>
