<script>
import {
  getTreetFn,
  importTableDataFn,
  saveTableFromDBFn,
} from '@/http/safe-production/genCode/table-list-api'

export default {
  data() {
    return {
      searchForm: {
        name: '',
        dataSource: {
          enName: '',
        },
      },
      defaultProps: {
        value: 'id', // ID字段名
        label: 'label', // 显示名称
        children: 'children', // 子级字段名
      },
      visible: false,
      filterText: '',
      dataList: [],
      databaseTreeData: [],
      orderBy: '',
      dataListSelections: [],
      loading: false,
      selectDbName: '',
      dataSourceId: '',
    }
  },
  watch: {
    filterText(val) {
      this.$refs.databaseTree.filter(val)
    },
  },
  methods: {
    init() {
      this.visible = true
      this.refreshTree()
      this.searchForm.dataSource.enName = 'master'
      this.dataSourceId = 'master'
      this.selectDbName = '已选数据库: 本地数据库'
      if (this.searchForm.dataSource.enName !== '') {
        this.refreshList()
      }
    },
    filterNode: function filterNode(value, data) {
      if (!value)
        return true
      return data.label.includes(value)
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      importTableDataFn(this.searchForm)
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.rows
          }
          this.loading = false
        })
        .catch(() => {
          this.dataList = []
          this.loading = false
        })
    },
    refreshTree() {
      getTreetFn().then(({ data }) => {
        this.databaseTreeData = data.treeData
        this.$nextTick(() => {
          this.$refs.databaseTree.setCurrentKey('master')
        })
      })
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    // 排序
    sortChangeHandle(obj) {
      if (obj.prop === 'tableType') {
        obj.prop = 'table_type'
      }

      if (obj.prop === 'dataSource.name') {
        obj.prop = 'dataSource_id'
      }

      if (obj.prop === 'className') {
        obj.prop = 'class_name'
      }

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
    handleNodeClick(data) {
      if (data.type === 'db') {
        this.searchForm.dataSource.enName = data.enName
        this.selectDbName = `已选数据库: ${data.label}`
        this.dataSourceId = data.id
        this.refreshList()
      }
    },
    resetSearch() {
      this.searchForm.name = ''
      this.refreshList()
    },
    doSubmit() {
      const names = this.dataListSelections
        .map((item) => {
          return item.name
        })
        .join(',')
      const params = {
        'name': names,
        'dataSource.id': this.dataSourceId,
      }
      saveTableFromDBFn(params).then(({ data }) => {
        if (data.success) {
          this.$message.success({
            message: data.msg,
            dangerouslyUseHTMLString: true,
          })
          this.$emit('refreshDataList')
          this.visible = false
        }
        else {
          this.$message.error(data.msg)
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    title="导入数据库"
    width="1200px"
    append-to-body
    fullscreen
    style="overflow: auto; margin: 15px 20px"
    :visible.sync="visible"
  >
    <el-row :gutter="15">
      <el-col :span="5">
        {{ selectDbName }}
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          size="small"
          clearable
        />
        <el-tree
          ref="databaseTree"
          class="filter-tree"
          :data="databaseTreeData"
          :props="defaultProps"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          node-key="id"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        />
      </el-col>
      <el-col :span="19">
        <el-form
          ref="searchForm"
          v-model="searchForm"
          size="small"
          inline
          @submit.native.prevent
        >
          <el-form-item prop="name">
            <el-input
              v-model="searchForm.name"
              size="small"
              placeholder="表名"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              @click="refreshList"
            >
              查询
            </el-button>
            <el-button
              size="small"
              @click="resetSearch"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
          ref="table"
          v-loading="loading"
          class="table"
          :data="dataList"
          :height="300"
          size="small"
          :header-cell-style="{ background: '#f5f5f5' }"
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
            sortable="custom"
            label="表名"
          />
          <el-table-column
            prop="comments"
            sortable="custom"
            label="说明"
          />
        </el-table>
      </el-col>
    </el-row>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        type="primary"
        size="small"
        :disabled="dataListSelections.length === 0"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
