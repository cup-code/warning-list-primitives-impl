<script>
import { formatDate } from '@/utils'

export default {
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
      // this.loading = true;
      // getDeviceGroup(this.sForm).then(res => {
      //     this.loading = false;
      //     let resD = res.data, msg = resD.message;
      //     if(resD.success === true) {
      //         this.tableData = resD.result;
      //         this.total = resD.total;
      //     }else {
      //         this.$message.error(msg || '查询分类失败');
      //     }
      // }).catch(err => {
      //     this.loading = false;
      //     this.$message.error('查询分类失败');
      // });
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 删除 分类
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.groupName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // this.loading = true;
          // deleteDeviceGroup(v.id).then(res => {
          //     this.loading = false;
          //     let resD = res.data, msg = resD.message;
          //     if (resD.success === true) {
          //         this.$message.success(msg || "删除成功");
          //         this.getDataList();
          //     }else {
          //         this.$message.error(msg || '删除失败!');
          //     }
          // }).catch(err => {
          //     this.loading = false;
          //     this.$message.error('删除失败!');
          // });
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <div class="signIn-eam">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="24">
        <el-button
          type="success"
          icon="el-icon-download"
          size="mini"
        >
          导出
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="地点"
            prop="a"
            align="center"
          />
          <el-table-column
            label="地址"
            prop="b"
            align="center"
          />
          <el-table-column
            label="经度"
            prop="c"
            align="center"
          />
          <el-table-column
            label="纬度"
            prop="c"
            align="center"
          />
          <el-table-column
            label="备注"
            prop="c"
            align="center"
          />
          <el-table-column
            label="时间"
            prop="c"
            align="center"
          />
          <el-table-column
            label="签到人"
            prop="c"
            align="center"
          />
          <el-table-column
            label="操作"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
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
.signIn-eam {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
