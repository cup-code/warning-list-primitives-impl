<script>
import { getExtendById } from '@/http/dev/product-api'

export default {
  props: ['pid'],
  data: () => ({
    loading: false,
    tableData: [],
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getExtendById(this.pid)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.tableData = resD.result || []
          }
          else {
            this.$message.error(msg || '获取 扩展属性 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 扩展属性 失败')
        })
    },
  },
}
</script>

<template>
  <div class="extend-template">
    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="extend-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
        >
          <el-table-column
            label="扩展属性编码"
            prop="code"
            align="center"
          />
          <el-table-column
            label="扩展属性名"
            prop="name"
            align="center"
          />
          <el-table-column
            label="扩展属性值"
            prop="value"
            align="center"
          />
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.extend-template {
  .mid-con {
    padding: 15px 0;
    .extend-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
