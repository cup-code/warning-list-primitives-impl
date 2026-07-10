<script>
import { getExtensionButtonList } from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      idKey: 'code',
      orderBy: '',
      currentRow: '',
      dataListAllSelections: [],
      dataListSelections: [],
      loading: false,
      visible: false,
    }
  },
  methods: {
    init(selectData) {
      this.refreshList()
      this.visible = true
      this.$nextTick(() => {
        this.dataListAllSelections = JSON.parse(JSON.stringify(selectData))

        this.setSelectRow()
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getExtensionButtonList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list
            this.total = data.page.count
          }
          this.$nextTick(() => {
            this.setSelectRow()
          })
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
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    handleCurrentChange(val) {
      this.currentRow = val
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.dataListAllSelections || this.dataListAllSelections.length <= 0) {
        this.$refs.buttonTable.clearSelection()
        return
      } // 标识当前行的唯一键的名称

      const idKey = this.idKey
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.buttonTable.clearSelection()

      for (let i = 0; i < this.dataList.length; i++) {
        if (selectAllIds.includes(this.dataList[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.buttonTable.toggleRowSelection(this.dataList[i], true)
        }
      }
    },
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = this.idKey

      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.dataListAllSelections.length <= 0) {
        this.dataListSelections.forEach((row) => {
          this.dataListAllSelections.push(row)
        })
        return
      } // 总选择里面的key集合

      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      const selectIds = [] // 获取当前页选中的id

      this.dataListSelections.forEach((row) => {
        selectIds.push(row[idKey]) // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里

        if (!selectAllIds.includes(row[idKey])) {
          this.dataListAllSelections.push(row)
        }
      })
      const noSelectIds = [] // 得到当前页没有选中的id

      this.dataList.forEach((row) => {
        if (!selectIds.includes(row[idKey])) {
          noSelectIds.push(row[idKey])
        }
      })
      noSelectIds.forEach((id) => {
        if (selectAllIds.includes(id)) {
          for (let i = 0; i < this.dataListAllSelections.length; i++) {
            if (this.dataListAllSelections[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              this.dataListAllSelections.splice(i, 1)
              break
            }
          }
        }
      })
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
      this.$emit('selectButton', JSON.parse(JSON.stringify(this.dataListAllSelections)))
    },
  },
}
</script>

<template>
  <el-dialog

    title="选择常用按钮"
    append-to-body
    :visible.sync="visible"
    class="dialog-selfBpmn"
  >
    <el-table
      ref="buttonTable"
      v-loading="loading"
      class="table"
      :data="dataList"
      border
      size="mini"
      highlight-current-row
      @selection-change="selectionChangeHandle"
      @current-change="handleCurrentChange"
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
        prop="code"
        header-align="center"
        align="center"
        sortable="custom"
        label="编码"
      />

      <el-table-column
        prop="sort"
        header-align="center"
        align="center"
        sortable="custom"
        label="排序"
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
</template>
