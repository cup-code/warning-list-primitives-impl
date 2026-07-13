<script>
import { getHisDataById } from '@/http/dev/manage-api'
import { formatDate } from '@/utils'

export default {
  props: ['pid', 'did'],
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
  }),
  created() {
    this.getDataList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getHisDataById(this.pid, this.did, this.sForm)
        .then(({ data }) => {
          this.loading = false
          const msg = data.message
          if (data.success) {
            if (data.result) {
              this.tableData = data.result.results || []
              this.total = data.result.numResults
            }
          }
          else {
            this.$message.error(msg || '获取 历史测点数据 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 历史测点数据 失败')
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="pointHis-template">
    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="point-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            label="测点名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="测点编码"
            prop="ioCode"
            align="center"
          />
          <el-table-column
            label="测点值"
            prop="value"
            align="center"
          />
          <el-table-column
            label="单位"
            prop="unit"
            align="center"
          />
          <el-table-column
            label="测点类型"
            prop="type"
            align="center"
          />
          <el-table-column
            label="事件时间"
            prop="eventDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.eventDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="接收时间"
            prop="receivedDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.receivedDate) }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
        background
        style="text-align: right"
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.pointHis-template {
  .mid-con {
    padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
