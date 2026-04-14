<script>
import XEUtils from 'xe-utils'
import {
  extensionActCategoryDelete,
  getExtensionActCategoryTreeData,
} from '@/http/safe-production/flowable-api'

import ActCategoryForm from './ActCategoryForm'

export default {
  components: {
    ActCategoryForm,
  },
  data() {
    return {
      dataList: [],
      searchForm: {
        name: '',
      },
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
      getExtensionActCategoryTreeData()
        .then(({ data }) => {
          this.dataList = data.treeData
          this.handleSearch()
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      const filterName = XEUtils.toValueString(this.searchForm.name).trim()
      if (filterName) {
        const options = { children: 'children' }
        const searchProps = ['name']
        this.dataList = XEUtils.searchTree(
          this.dataList,
          item =>
            searchProps.some(
              key => XEUtils.toValueString(item[key]).includes(filterName),
            ),
          options,
        )
        this.$nextTick(() => {
          this.$refs.xTree.setAllTreeExpand(true)
        })
      }
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
    // 新增下级
    addChild(id, name) {
      this.$refs.actCategoryForm.init('addChild', {
        id: '',
        parent: { id, name },
      })
    },
    // 新增
    add() {
      this.$refs.actCategoryForm.init('add', {
        id: '',
        parent: { id: '', name: '' },
      })
    },
    // 修改
    edit(id) {
      this.$refs.actCategoryForm.init('edit', {
        id,
        parent: { id: '', name: '' },
      })
    },
    // 查看
    view(id) {
      this.$refs.actCategoryForm.init('view', {
        id,
        parent: { id: '', name: '' },
      })
    },
    // 删除
    del(id) {
      const ids
        = id
          || this.$refs.xTree
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
        extensionActCategoryDelete(ids)
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.refreshList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard type="search">
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="small"
            placeholder="名称"
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
      <vxe-toolbar
        :refresh="{ query: refreshList }"
        export
        print
        custom
      >
        <template #buttons>
          <el-row>
            <!-- <el-button v-if="hasPermission('extension:actCategory:add')" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                        <el-button v-if="hasPermission('extension:actCategory:del')" :disabled="$refs.xTree && $refs.xTree.getCheckboxRecords().length === 0" type="danger" size="mini" icon="el-icon-delete" @click="del()">删除</el-button> -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="add()"
            >
              新建
            </el-button>
            <el-button
              :disabled="$refs.xTree && $refs.xTree.getCheckboxRecords().length === 0"
              type="danger"
              size="mini"
              plain
              btnIcon="el-icon-delete"
              @click="del()"
            >
              删除
            </el-button>
          </el-row>
        </template>
      </vxe-toolbar>
      <vxe-table
        ref="xTree"
        resizable
        border="inner"
        auto-resize
        row-id="id"
        size="mini"
        show-header-overflow
        show-overflow
        highlight-hover-row
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :print-config="{}"
        :export-config="{}"
        :tree-config="{ expandAll: true }"
        :loading="loading"
        :checkbox-config="{ labelField: '' }"
        :data="dataList"
      >
        <vxe-table-column type="checkbox" width="40px" />
        <vxe-table-column
          title="名称"
          field="name"
          align="left"
          tree-node
        >
          <template slot-scope="scope">
            <!-- <el-link type="primary" :underline="false" v-if="hasPermission('extension:actCategory:edit')" @click="edit(scope.row.id)">{{scope.row.name}}</el-link>
                            <el-link type="primary" :underline="false" v-else-if="hasPermission('extension:actCategory:view')"  @click="view(scope.row.id)">{{scope.row.name}}</el-link>
                            <span v-else>{{scope.row.name}}</span> -->

            <span>{{ scope.row.name }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="备注信息"
          field="remarks"
          align="center"
        />
        <vxe-table-column
          title="操作"
          width="300px"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="hasPermission('extension:actCategory:view')" type="text" icon="el-icon-view" size="mini" @click="view(scope.row.id)">查看</el-button>
                            <el-button v-if="hasPermission('extension:actCategory:edit')" type="text" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)">修改</el-button>
                            <el-button v-if="hasPermission('extension:actCategory:del')" type="text" size="mini" icon="el-icon-delete"  @click="del(scope.row.id)">删除</el-button>
                            <el-button v-if="hasPermission('extension:actCategory:del')" type="text" size="mini" icon="el-icon-circle-plus-outline" @click="addChild(scope.row.id, scope.row.name)">添加下级</el-button> -->

            <EButton
              type="text"
              icon="check"
              size="mini"
              @click="view(scope.row.id)"
            >
              查看
            </EButton>
            <EButton
              type="text"
              icon="edit"
              size="mini"
              @click="edit(scope.row.id)"
            >
              修改
            </EButton>
            <EButton
              type="text"
              size="mini"
              icon="delete"
              @click="del(scope.row.id)"
            >
              删除
            </EButton>
            <EButton
              type="text"
              size="mini"
              icon="add"
              @click="addChild(scope.row.id, scope.row.name)"
            >
              添加下级
            </EButton>
          </template>
        </vxe-table-column>
      </vxe-table>
    </ECard>

    <!-- 弹窗, 新增 / 修改 -->
    <ActCategoryForm
      ref="actCategoryForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  // padding: 10px;
  // height: calc(100vh - 50px);
  // box-sizing: border-box;
  // display: flex;
  // flex-direction: column;
  .query-form {
    // box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    // padding-left: 12px;
    // padding-top: 12px;
    // margin-bottom: 10px;
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-form-item__label {
      font-size: 14px !important;
    }
  }
  .main-con {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    flex: 1;
    padding: 10px;
    .pull-right {
      float: right;
    }
    .vxe-table {
      border-top: 1px solid #ebeef5;
      .vxe-table--header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }

    .el-pagination {
      text-align: right;
    }
  }
}
</style>
