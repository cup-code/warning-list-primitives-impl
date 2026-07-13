<script>
import { setTenantStatus, tenantControlList } from '../../http/manage-api'

const tenantStatus = { 0: '停止', 1: '启动' }
const tenantButtonStatus = { 0: '启动', 1: '停止' }
export default {
  name: 'tenantControl',
  filters: {
    getStatus(e) {
      return tenantStatus[e]
    },
    getButtonStatus(e) {
      return tenantButtonStatus[e]
    },
  },
  data() {
    return {
      loading: false,
      status: 0,
      dataList: [],
    }
  },
  computed: {},
  mounted() {
    this.getTenantList()
  },
  methods: {
    // 修改租户状态
    onControl(e) {
      const isEnable = e.tenantStatus !== '1'
      console.log(e.tenantStatus, isEnable, 999)

      const param = {
        enable: isEnable,
        tenantId: e.id,
      }
      this.loading = true
      setTenantStatus(param)
        .then((res) => {
          console.log('res', res)
          const { data } = res
          if (data.success) {
            this.$message.success(data.message)
            this.getTenantList()
            this.loading = false
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },

    // 获取租户列表
    getTenantList() {
      this.loading = true
      tenantControlList()
        .then((res) => {
          this.loading = false
          const { data } = res
          if (data.success) {
            this.dataList = data.result || []
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <div class="page-container-fixed">
    <ECard>
      <ETitle title="租户控制" classNameCell="mb-4" />
      <el-table
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column label="租户名称" prop="tenantName" align="left" />
        <el-table-column label="租户编码" prop="tenantCode" align="center" />
        <el-table-column label="租户状态" prop="tenantStatus" align="center">
          <template slot-scope="scope">
            {{ scope.row.tenantStatus | getStatus }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              style="color: var(--ky-primary)"
              @click="onControl(scope.row)"
            >
              {{ scope.row.tenantStatus | getButtonStatus }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
  .page-cell {
    padding: 10px;
    border-radius: 4px;
    background: #ffffff;
    margin-bottom: 14px;
  }
}
</style>
