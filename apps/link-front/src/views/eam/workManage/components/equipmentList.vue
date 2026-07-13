<script>
import { getDeviceByPageFn } from '@/http/dev_new/manage-api'

export default {
  name: 'EquipmentList',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      tableData: [],
      selected: {},
    }
  },
  computed: {
    getDisabled() {
      return !Object.keys(this.selected).length
    },
  },
  watch: {
    visible(v) {
      if (v) {
        this.getList()
      }
    },
  },
  methods: {
    getExpireMonthLabel(v) {
      if (v === -1) {
        return '--'
      }
      else if (v === 0) {
        return '到报废期限'
      }
      else {
        return `${v}个月`
      }
    },

    getColor(v) {
      if (v === -1 || v > 12) {
        return 'white'
      }
      else if (v === 0) {
        return '#FF4F58'
      }
      else if (v > 0 && v <= 12) {
        return '#ff9900'
      }
    },
    getList() {
      getDeviceByPageFn(this.params)
        .then((res) => {
          const { data } = res
          if (data.success) {
            this.tableData = data.result.list
            this.total = data.result.total
          }
        })
        .catch(() => {})
    },

    handleCurrentChange(e) {
      this.selected = e
    },

    onConfirm() {
      this.$emit('confirm', this.selected)
      this.onClose()
    },
    onClose() {
      this.$emit('update:visible', false)
      this.selected = {}
    },
  },
}
</script>

<template>
  <el-dialog
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    show-close
    @close="onClose"
  >
    <h2 slot="title">
      选择故障设备
    </h2>
    <ECard customStyle="padding:0 20px">
      <div class="selected">
        已选择设备:{{ selected.assetName }}
      </div>

      <el-table
        ref="singleTable"
        highlight-current-row
        :data="tableData"
        size="mini"
        height="400px"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        @current-change="handleCurrentChange"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="负责部门"
          prop="departmentName"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="名称"
          prop="assetName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="类别"
          prop="assetTypeName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="级别"
          prop="assetLevel"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('asset_level', scope.row.assetLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="重要等级"
          prop="importanceLevel"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('importance_level', scope.row.importanceLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="assetState"
          align="center"
        />
        <el-table-column
          label="有效期剩余"
          prop="expireMonth"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            <span
              :style="{
                background: getColor(scope.row.expireMonth),
                display: 'block',
                textAlign: 'center',
              }"
            >
              {{ getExpireMonthLabel(scope.row.expireMonth) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="编码"
          prop="assetCode"
          align="center"
        />
        <el-table-column
          label="规格型号"
          prop="model"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="设备负责人"
          prop="assetPrincipalName"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="位号"
          prop="assetNo"
          align="center"
        />
      </el-table>

      <el-pagination
        style="text-align: right; margin-top: 20px"
        :current-page.sync="params.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getList"
        @current-change="getList"
      />
    </ECard>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <EButton
        plain
        @click="onClose"
      >
        取消
      </EButton>
      <EButton
        type="primary"
        :disabled="getDisabled"
        @click="onConfirm"
      >
        确认
      </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0;
}
.selected {
  padding: 0 0 18px;
  color: var(--ky-primary);
}
</style>
