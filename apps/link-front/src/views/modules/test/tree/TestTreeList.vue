<script>
import XEUtils from 'xe-utils'
import TestTreeForm from './TestTreeForm'

export default {
  components: {
    TestTreeForm,
  },
  data() {
    return {
      searchForm: {
        name: '',
        remarks: '',
      },
      dataList: [],
      loading: false,
    }
  },
  mounted() {
    this.refreshList()
  },

  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      this.$http({
        url: '/test/tree/testTree/treeData',
        method: 'get',
      }).then(({ data }) => {
        this.dataList = data.treeData
        this.handleSearch()
        this.loading = false
      })
    },
    handleSearch() {
      const options = { children: 'children' }
      const searchProps = ['name', 'remarks']
      this.dataList = XEUtils.searchTree(
        this.dataList,
        item =>
          searchProps.every(
            key =>
              XEUtils.toValueString(this.searchForm[key]).trim() === ''
              || XEUtils.toValueString(item[key]).includes(this.searchForm[key]),
          ),
        options,
      )
      this.$nextTick(() => {
        this.$refs.testTree.setAllTreeExpand(true)
      })
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
    // 新增下级
    addChild(id, name) {
      this.$refs.testTreeForm.init('addChild', {
        id: '',
        parent: { id, name },
      })
    },
    // 新增
    add() {
      this.$refs.testTreeForm.init('add', {
        id: '',
        parent: { id: '', name: '' },
      })
    },
    // 修改
    edit(id) {
      this.$refs.testTreeForm.init('edit', {
        id,
        parent: { id: '', name: '' },
      })
    },
    // 查看
    view(id) {
      this.$refs.testTreeForm.init('view', {
        id,
        parent: { id: '', name: '' },
      })
    },
    // 删除
    del(id) {
      const ids
        = id
          || this.$refs.testTree
            .getCheckboxRecords()
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        this.$http({
          url: '/test/tree/testTree/delete',
          method: 'delete',
          params: { ids },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
          this.loading = false
        })
      })
    },
    edit_top() {
      const id = this.$refs.testTree.getCheckboxRecords()[0].id
      this.edit(id)
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard type="search">
      <el-form
        ref="searchForm"
        size="mini"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <!-- 搜索框 -->
        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="mini"
            placeholder="名称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="remarks">
          <el-input
            v-model="searchForm.remarks"
            size="mini"
            placeholder="备注信息"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="refreshList()"
          >
            查询
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard>
      <div class="card-cell">
        <vxe-toolbar
          :refresh="{ query: refreshList }"
          export
          print
          custom
        >
          <template #buttons>
            <el-row>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="add()"
              >
                新建
              </el-button>
              <el-button
                type="success"
                size="mini"
                icon="el-icon-edit-outline"
                :disabled="$refs.testTree && $refs.testTree.getCheckboxRecords().length !== 1"
                plain
                @click="edit_top()"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                :disabled="$refs.testTree && $refs.testTree.getCheckboxRecords().length === 0"
                plain
                @click="del()"
              >
                删除
              </el-button>
            </el-row>
          </template>
        </vxe-toolbar>
      </div>
      <vxe-table
        ref="testTree"
        resizable
        border="inner"
        auto-resize
        row-id="id"
        size="mini"
        show-header-overflow
        show-overflow
        highlight-hover-row
        :print-config="{}"
        :export-config="{}"
        :tree-config="{}"
        :loading="loading"
        :checkbox-config="{ checkStrictly: true }"
        :data="dataList"
        height="calc(100vh - 270px)"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <vxe-table-column
          type="checkbox"
          width="40px"
        />
        <vxe-table-column
          field="name"
          align="left"
          tree-node
          title="名称"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="remarks"
          title="备注信息"
        />
        <vxe-table-column
          title="操作"
          width="300px"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-view"
              @click="view(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click="edit(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-circle-plus-outline"
              @click="addChild(scope.row.id, scope.row.name)"
            >
              添加下级组织机构
            </el-button>
          </template>
        </vxe-table-column>
      </vxe-table>
    </ECard>

    <!-- 弹窗, 新增 / 修改 -->
    <TestTreeForm
      ref="testTreeForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
}
</style>
