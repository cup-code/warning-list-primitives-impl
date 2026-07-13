<script>
export default {
  name: 'gasTypeDia',
  data() {
    return {
      tableData: [],
    }
  },
  created() {},
  methods: {
    addFn() {
      const item = {
        businessCategory: 2,
        toxicityName: '',
      }
      this.tableData.push(item)
    },
    delFn(v, idx) {
      console.log('v:', v)
      console.log('idx: ', idx)
      this.tableData.splice(idx, 1)
    },

    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <div style="margin-bottom: 10px">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addFn"
      >
        新增
      </el-button>
    </div>

    <div style="height: 300px">
      <el-table
        :data="tableData"
        :header-cell-style="{ background: '#f5f5f5' }"
        align="center"
        height="100%"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="毒性气体类别"
          align="center"
          prop="toxicityName"
        >
          <template slot-scope="scope">
            <div style="padding: 0 100px">
              <el-input v-model="scope.row.toxicityName" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              style="color: var(--ky-danger)"
              @click="delFn(scope.row, scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="dialog-footer">
      <span style="float: right">
        <el-button>关闭</el-button>
        <el-button
          v-noMoreClick
          type="primary"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
