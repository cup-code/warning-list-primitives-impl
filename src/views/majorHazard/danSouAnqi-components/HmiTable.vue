<script>
import {
  deleteBindHmiById,
  getBindHmiByHazardId,
  saveBindHmi,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import BindHmi from '../components/bindHmi'

export default {
  name: 'HmiTable',
  components: { BindHmi },
  props: {
    method: {
      type: String,
      default: '',
    },
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      dtList: [],
      visibleBind: false,
      // 打开前已选的数据
      oldList: [],
    }
  },
  watch: {
    info(v) {
      this.getDataList()
    },
  },
  methods: {
    async getDataList() {
      const { data } = await getBindHmiByHazardId(this.info.id)
      if (data.code == 200) {
        this.dtList = data.result || []
      }
      else {
        this.dtList = []
      }
    },
    // 绑定组态
    bindFn() {
      getBindHmiByHazardId(this.info.id)
        .then(({ data }) => {
          if (data.success) {
            this.oldList = data.result || []
          }
          else {
            this.$message.warning(data.message || '获取已有信息失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取已有信息出错', err)
        })
        .finally(() => {
          this.visibleBind = true
        })
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.hmiName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteBindHmiById(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch((e) => {})
    },
    closeHmi(pickList) {
      if (pickList) {
        const params = []
        pickList.forEach((item) => {
          params.push({
            companyId: this.info.companyId,
            hazardId: this.info.id,
            hazardType: this.info.hazardType,
            hmiId: item.hmiId,
          })
        })
        saveBindHmi(params)
          .then(({ data }) => {
            if (data.success) {
              this.visibleBind = false
              this.$message.success('绑定组态成功')
              this.getDataList()
            }
            else {
              this.$message.warning(data.message || '绑定组态失败')
            }
          })
          .catch((err) => {
            this.$message.error('绑定组态出错', err)
          })
      }
      else {
        this.visibleBind = false
      }
    },
  },
}
</script>

<template>
  <div style="margin: 20px 0">
    <div style="margin: 10px 0">
      <el-button
        type="primary"
        plain
        size="mini"
        @click="bindFn"
      >
        绑定组态图
      </el-button>
    </div>

    <el-table
      slot="table"
      :data="dtList"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="200"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="组态名称"
        align="center"
        prop="hmiName"
      />
      <el-table-column
        label="所属分组"
        align="center"
        prop="groupName"
      />
      <el-table-column
        v-if="method !== 'view'"
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template
          v-if="method !== 'view'"
          slot-scope="scope"
        >
          <el-button
            size="mini"
            type="text"
          >
            <router-link
              tag="a"
              target="_blank"
              :to="{
                name: 'editor',
                query: { id: scope.row.encryptHmiId || scope.row.code },
              }"
            >
              查看组态
            </router-link>
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 绑定弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="绑定组态图"
      :close-on-click-modal="false"

      width="850px"
      :visible.sync="visibleBind"
    >
      <BindHmi
        v-if="visibleBind"
        :oldList="oldList"
        @close="closeHmi"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
