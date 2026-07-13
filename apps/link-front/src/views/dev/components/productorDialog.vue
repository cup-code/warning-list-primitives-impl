<script>
// import { getDeviceList } from '@/http/dev/manage-api'
import { getProductList } from '@/http/dev/product-api'
import { distributionProduct, getTenantProduct } from '@/http/manage-api'

import { checkTableList, productorConfig } from './distribution'

export default {
  name: 'ProductorDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    isCheck: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      searchData: {
        pageNum: 1,
        pageSize: 12,
      },
      selectProduction: [],
      title: '分配产品',
      total: 0,
      tableConfig: productorConfig,
      productList: [],
      tableData: [],
    }
  },
  watch: {
    dialogVisible: {
      async handler(val) {
        if (val) {
          if (!this.isCheck) {
            await this.getList()
          }
          await this.getProduction()
        }
      },
      immediate: true,
    },
    isCheck: {
      handler(val) {
        if (val) {
          this.tableConfig = checkTableList
          this.title = '查看产品'
        }
        else {
          this.tableConfig = productorConfig
          this.title = '分配产品'
        }
      },
      immediate: true,
    },
  },

  methods: {
    onSelectable() {
      const list = []
      this.productList.map((a) => {
        list.push(
          ...this.tableData.filter((b) => {
            return b.id === a.id
          }),
        )
      })

      console.log(222, list)

      this.$refs.table.setSelection(list)
    },
    onSelect(e) {
      this.selectProduction = e
        .map((item) => {
          return item.id
        })
        .join(',')
    },
    getList() {
      // 获取产品列表
      getProductList(this.searchData)
        .then(({ data }) => {
          const msg = data.message

          if (data.success === true && data.result) {
            this.tableData = data.result.list
            this.total = data.result.total
          }
          else {
            this.$message.error(msg || '获取终端失败')
          }
        })
        .catch(() => {
          this.$message.error('获取终端失败')
        })
    },

    getProduction() {
      getTenantProduct({ tenantId: this.info.id })
        .then((res) => {
          if (res.data.success) {
            if (this.isCheck) {
              this.tableData = res.data.result.productVOList
              return
            }
            this.productList = res.data.result.productVOList

            this.onSelectable()
          }
          else {
            this.$message.error(res.data.message)
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    onConfirm() {
      const params = {
        tenantId: this.info.id,
        productIdList: this.selectProduction,
      }
      distributionProduct(params)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.$message.success(res.data.message)
          }
          else {
            console.log(res.data)
            this.$message.error(res.data.message)
          }

          this.onClose()
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    onClose() {
      this.$emit('update:dialogVisible', false)
      this.$emit('update:isCheck', false)
      this.tableData = []
      this.productList = []
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    destroy-on-close
    :visible.sync="dialogVisible"
    width="56%"
    :before-close="onClose"
  >
    <ECard customStyle="height:300px">
      <CTable
        ref="table"
        height="100%"
        :selection="!isCheck"
        :tableData="tableData"
        :list="tableConfig"
        @select="onSelect"
      />
    </ECard>

    <ECard v-if="!isCheck" type="footer">
      <el-pagination
        style="text-align: right"
        background
        :current-page="searchData.pageNum"
        :page-sizes="[12, 24, 60]"
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getList"
        @current-change="getList"
      />
    </ECard>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button
        :disabled="!selectProduction.length"
        type="primary"
        @click="onConfirm"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>
