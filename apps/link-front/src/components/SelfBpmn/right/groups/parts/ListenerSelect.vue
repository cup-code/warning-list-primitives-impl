<script>
import { getExtensionListenerList } from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      searchForm: {
        listenerType: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
      visible: false,
    }
  },
  activated() {
    this.refreshList()
  },
  methods: {
    init(type) {
      this.searchForm.listenerType = type
      this.visible = true
      this.refreshList()
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getExtensionListenerList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        listenerType: this.searchForm.listenerType,
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
    selectionChangeHandle(val) {
      this.dataListSelections = val
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
    submit() {
      this.visible = false
      this.$emit('selectListener', this.dataListSelections)
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
  },
}
</script>

<template>
  <div>
    <el-dialog

      title="选择常用监听器"
      append-to-body
      :visible.sync="visible"
      class="dialog-selfBpmn"
    >
      <el-table
        v-loading="loading"
        class="table"
        :data="dataList"
        border
        size="mini"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          prop="name"
          header-align="center"
          align="center"
          sortable="custom"
          label="名称"
        />

        <el-table-column
          prop="listenerType"
          header-align="center"
          align="center"
          sortable="custom"
          label="监听器类型"
        >
          <template slot-scope="scope">
            {{ scope.row.listenerType === '1' ? '执行监听器' : '任务监听器' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="event"
          header-align="center"
          align="center"
          sortable="custom"
          label="事件"
        />

        <el-table-column
          prop="valueType"
          header-align="center"
          align="center"
          sortable="custom"
          label="值类型"
        >
          <template slot-scope="scope">
            {{ { 1: '类', 2: '表达式', 3: '委托表达式' }[scope.row.valueType] }}
          </template>
        </el-table-column>

        <el-table-column
          prop="value"
          header-align="center"
          align="center"
          sortable="custom"
          label="值"
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

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >
          取 消
        </el-button>
        <el-button
          size="mini"
          type="primary"
          @click="submit"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
