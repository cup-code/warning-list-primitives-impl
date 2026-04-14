<script>
import { tenantControlList } from '@/http/manage-api'
import { tableList } from './components/distribution'
import ProductorDialog from './components/productorDialog'

export default {
  name: 'ProductDistribution',
  components: { ProductorDialog },
  data() {
    return {
      list: tableList,
      tableData: [],
      tableLoading: false,
      showProduction: false,
      detail: false,
      detailInfo: {},
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    onDistribute(e) {
      this.detailInfo = e
      this.showProduction = true
    },
    onCheck(e) {
      this.detailInfo = e
      this.detail = true
      this.showProduction = true
    },
    getList() {
      this.tableLoading = true
      tenantControlList()
        .then((res) => {
          this.tableLoading = false
          const { data } = res
          if (data.success) {
            this.tableData = data.result || []
          }
        })
        .catch(() => {
          this.tableLoading = false
        })
    },
  },
}
</script>

<template>
  <div class="page-container-fixed">
    <ECard>
      <CTable
        v-slot="props"
        height="100%"
        :tableData="tableData"
        :list="list"
        :loading="tableLoading"
      >
        <EButton
          type="text"
          icon="deal"
          @click="onDistribute(props.info)"
        >
          产品分配
        </EButton>
        <EButton
          type="text"
          icon="check"
          @click="onCheck(props.info)"
        >
          查看产品
        </EButton>
      </CTable>
    </ECard>

    <ProductorDialog
      :dialogVisible.sync="showProduction"
      :info="detailInfo"
      :isCheck.sync="detail"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
}
</style>
