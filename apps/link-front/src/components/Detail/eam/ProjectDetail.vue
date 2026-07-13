<script>
import { addPlanAssetItems, getMainItemsByType } from '@/http/eam-api'
import { formatDate } from '@/utils'

export default {
  props: [
    'plan', // 计划信息
    'assetDt',
  ],
  data: () => ({
    loading: false,
    tableData: [],
    sels: [], // 记录已勾选的
    submitLoading: false,
  }),

  created() {
    this.getDataList()
  },

  methods: {
    formatDate,
    // 请求 该资产类型下 所有维保项目
    getDataList() {
      this.tableData = []
      this.loading = true

      getMainItemsByType(this.plan.maintenanceType, this.assetDt.assetsTypeId)
        .then((res) => {
          this.loading = false
          const resD = res.data
          if (resD.success === true) {
            this.tableData = resD.result || []

            // 勾选已有数据
            this.$nextTick(() => {
              this.genCheck()
            })
          }
        })
        .catch((err) => {
          this.loading = false
        })
    },
    // 勾选已有数据
    genCheck() {
      // 先清空所选
      this.$refs.assetItemsTable.clearSelection()

      // 该资产下 已选 项目
      const parts = this.assetDt.maintenanceItemVOList || []

      // 遍历数据, 进行勾选
      this.tableData.forEach((item) => {
        try {
          parts.forEach((p) => {
            if (item.id === p.id) {
              this.$refs.assetItemsTable.toggleRowSelection(item, true) // 勾选
              throw '找到目标, 退出当前遍历'
            }
          })
        }
        catch (e) {}
      })
    },

    // 勾选事件
    selectionFn(v) {
      this.sels = v
    },

    saveFn() {
      this.submitLoading = true
      const params = {
        assetsId: this.assetDt.assetsId,
        itemIds: this.sels.map(item => item.id),
        planId: this.plan.id,
      }

      addPlanAssetItems(params)
        .then((res) => {
          this.submitLoading = false

          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '保存成功')
          }
          else {
            this.$message.error(msg || '保存失败')

            // 恢复原始勾选
            this.genCheck()
          }
        })
        .catch((err) => {
          this.submitLoading = false
          this.$message.error('保存失败')

          // 恢复原始勾选
          this.genCheck()
        })
    },
  },
}
</script>

<template>
  <div class="projectDetail-template">
    <el-row>
      <el-col :span="24" />
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          ref="assetItemsTable"
          v-loading="loading"
          class="point-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
          @selection-change="selectionFn"
        >
          <el-table-column
            type="selection"
            width="50"
            align="center"
          />
          <el-table-column
            label="内容"
            prop="itemContent"
            align="center"
          />
          <el-table-column
            label="结果"
            prop="operationResultList"
            align="center"
          >
            <template slot-scope="props">
              {{
                (props.row.operationResultList || []).map(item => item.operationResult).join(' | ')
              }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 底部 按钮 -->
    <el-row>
      <el-col
        :span="24"
        style="text-align: center"
      >
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="saveFn"
        >
          保存
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.projectDetail-template {
  .mid-con {
    padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
      .el-table-column--selection .cell {
        padding: 0 10px;
      }
    }
  }
}
</style>
