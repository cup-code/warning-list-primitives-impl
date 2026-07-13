<script>
import { getExtensionConditionList } from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      searchForm: {
        name: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      currentRow: null,
      loading: false,
      visible: false,
    }
  },
  methods: {
    show() {
      this.visible = true
      this.refreshList()
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getExtensionConditionList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        name: this.searchForm.name,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list
            this.total = data.page.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
    },
    // 多选
    handleCurrentChange(val) {
      this.currentRow = val
    },
    // 排序
    sortChangeHandle(obj) {
      if (obj.order === 'ascending') {
        this.orderBy = `${obj.prop} asc`
      }
      else if (obj.order === 'descending') {
        this.orderBy = `${obj.prop} desc`
      }
      else {
        this.orderBy = ''
      }

      this.refreshList()
    },
    doSubmit() {
      if (this.currentRow === null) {
        this.$message.error('\u8BF7\u9009\u62E9\u4E00\u6761\u8868\u8FBE\u5F0F!')
        return
      }

      this.visible = false
      this.$emit('setCondition', this.currentRow.expression)
    },
  },
}
</script>

<template>
  <el-dialog

    title="选择常用流程表达式"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="dialog-selfBpmn"
  >
    <el-form
      ref="searchForm"
      class="query-form"
      size="mini"
      inline
      :model="searchForm"
      @keyup.native.enter="refreshList"
      @submit.native.prevent
    >
      <el-form-item prop="name">
        <el-input
          v-model="searchForm.name"
          size="mini"
          placeholder="名称"
          clearable
        />
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      class="table"
      :data="dataList"
      size="mini"
      highlight-current-row
      @current-change="handleCurrentChange"
      @sort-change="sortChangeHandle"
    >
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        sortable="custom"
        label="名称"
      />

      <el-table-column
        prop="expression"
        header-align="center"
        align="center"
        sortable="custom"
        label="表达式"
      />

      <el-table-column
        prop="remarks"
        header-align="center"
        align="center"
        sortable="custom"
        label="备注"
      />
    </el-table>

    <el-pagination
      :current-page="pageNo"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="total"
      background
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    />

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="mini"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        size="mini"
        type="primary"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
