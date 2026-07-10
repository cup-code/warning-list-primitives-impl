/* * @Author: xiaorui 数据字典管理页面 * @Date: 2022-04-20 11:47:38 * @Last Modified by:
xiaorui * @Last Modified time: 2022-09-26 10:28:01 */
<script>
import XEUtils from 'xe-utils'
import {
  deleteDict,
  getDictList,
  syncDictFn,
} from '@/http/safe-production/dict-manage-api'
import { VirtualTree } from '@/utils/virtualTree'
import DictForm from './form/DictForm'

export default {
  components: {
    DictForm,
  },
  data() {
    return {
      loading: false,
      searchForm: {
        name: '',
      },
      dataList: [],
      tenantCode: JSON.parse(sessionStorage.getItem('user')).tenantCode,
      virtualTree: null,
      pageSize: 20,
      currentPage: 1,
      totalCount: 0,
      propKeys: ['dictName', 'dictCode', 'remarks'], // 添加搜索字段定义
    }
  },
  computed: {
    filteredDataList() {
      const filterText = XEUtils.toValueString(this.searchForm.name).trim()
      if (!filterText)
        return this.dataList
      // 使用全量数据搜索，传入搜索字段
      return this.virtualTree.searchNodes(filterText.toLowerCase(), this.propKeys)
    },
  },
  created() {
    this.virtualTree = new VirtualTree(this.pageSize)
    this.refreshList()
  },
  mounted() {
    // 添加滚动监听
    this.$nextTick(() => {
      const tableBody = this.$refs.table.$el.querySelector('.el-table__body-wrapper')
      if (tableBody) {
        tableBody.addEventListener('scroll', this.handleTableScroll)
      }
    })
  },
  beforeDestroy() {
    // 移除滚动监听
    const tableBody = this.$refs.table.$el.querySelector('.el-table__body-wrapper')
    if (tableBody) {
      tableBody.removeEventListener('scroll', this.handleTableScroll)
    }
  },
  methods: {
    async refreshList() {
      this.loading = true
      try {
        const { data } = await getDictList(this.tenantCode)
        if (data.success) {
          const sortedData = this.preProcessData(data.result || [])
          this.totalCount = sortedData.length // 记录总数
          this.dataList = this.virtualTree.setData(sortedData)
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      }
      catch (error) {
        console.error('Failed to fetch dict list:', error)
        this.$message.error('获取数据失败')
      }
      finally {
        this.loading = false
      }
    },
    preProcessData(data) {
      return data.sort((a, b) => {
        const levelDiff = (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0)
        if (levelDiff !== 0)
          return levelDiff
        return a.sort - b.sort
      })
    },
    async lazyLoad(row, treeNode, resolve) {
      try {
        const children = this.virtualTree.getChildren(row.id)
        resolve(children)
      }
      catch (error) {
        console.error('Failed to load children:', error)
        resolve([])
      }
    },
    handleTableScroll(e) {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = e.target
      // 添加数据总量判断，避免无限加载
      if (
        scrollHeight - scrollTop - clientHeight < 100
        && this.dataList.length < this.totalCount
      ) {
        const nextPage = Math.floor(this.dataList.length / this.pageSize) + 1
        const newData = this.virtualTree.getPageData(nextPage)
        if (newData && newData.length > 0) {
          this.dataList = [...this.dataList, ...newData]
        }
      }
    },
    handleSearch() {
      this.$nextTick(() => {
        this.virtualTree.resetSearch()
        if (this.searchForm.name) {
          // 展开搜索结果的所有节点
          const results = this.filteredDataList
          this.$refs.table.store.states.expandRows = results
        }
      })
    },
    resetButton() {
      this.searchForm.name = ''
      this.virtualTree.resetSearch()
      this.refreshList()
    },
    addChild(row) {
      this.$refs.dictForm.init('addChild', { id: '', parent: { id: row.id } })
    },
    add() {
      this.$refs.dictForm.init('add', { id: '', parent: { id: '' } })
    },
    edit(row) {
      this.$refs.dictForm.init(
        'edit',
        { id: row.id, parent: { id: row.parentId } },
        row,
      )
    },
    view(row) {
      this.$refs.dictForm.init(
        'view',
        { id: row.id, parent: { id: row.parentId } },
        row,
      )
    },
    syncDict() {
      syncDictFn()
        .then(({ data }) => {
          if (data.success) {
            this.searchForm.name = ''
            this.$message.success(data.message)
            this.refreshList()
            return getTenantDictListMap()
          }
          else {
            this.$message.error(data.message || '同步失败')
          }
        })
        .then(({ data }) => {
          const key = 'dictList'
          if (data.success) {
            sessionStorage.setItem(key, JSON.stringify(data.result || '[]'))
          }
        })
    },
    del(id) {
      this.$confirm(`确定删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        deleteDict(id, this.tenantCode).then(({ data }) => {
          this.loading = false
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success',
              duration: 1500,
            })
            this.refreshList()
          }
          else {
            this.$message.error(data.message)
          }
        })
      })
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="searchForm"
        size="mini"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="handleSearch()"
        @submit.native.prevent
      >
        <el-form-item prop="name" label="字典名称">
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
            @click="handleSearch"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            size="mini"
            icon="el-icon-refresh-right"
            @click="resetButton"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table" noneBottom>
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('manage_dict_add')"
          type="primary"
          plain
          size="mini"
          icon="el-icon-plus"
          @click="add"
        >
          新增
        </el-button>
        <el-button
          v-if="tenantCode !== 'super'"
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          @click="syncDict"
        >
          同步
        </el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="filteredDataList"
        height="92%"
        style="width: 100%"
        row-key="id"
        lazy
        :load="lazyLoad"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          label="名称"
          width="200px"
          prop="dictName"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row)"
            >
              {{ scope.row.dictName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="排序"
          prop="sort"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              size="small"
              type="info"
              effect="plain"
            >
              {{ scope.row.sort }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Code"
          prop="dictCode"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag size="small">
              {{ scope.row.dictCode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remarks" />
        <el-table-column
          label="操作"
          width="200px"
          prop="name"
        >
          <template slot-scope="scope">
            <EButton
              v-if="hasBtnPermission('manage_dict_add')"
              type="text"
              icon="add"
              @click="addChild(scope.row)"
            >
              新增子级
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_dict_modify')"
              type="text"
              icon="edit"
              @click="edit(scope.row)"
            >
              修改
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_dict_delete')"
              type="text"
              icon="delete"
              @click="del(scope.row.id)"
            >
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- <div class="bg-white top">
      <div class="auxiliary-button"></div>
      <div style="height: 74vh"></div>
    </div> -->
    <!-- 弹窗, 新增 / 修改 -->
    <DictForm
      ref="dictForm"
      slot="dialog"
      @refreshDataList="refreshList"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
::v-deep .vxe-table {
  background: #ffffff;
  // padding-left: 10px;
}

.head-search {
  width: 100%;
  padding: 5px 0 5px 10px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.auxiliary-button {
  width: 100%;
  background: #ffffff;
  box-sizing: border-box;
  padding: 5px 0 5px 10px;
}

.el-table {
  transform: translateZ(0);
}

.el-table__body-wrapper {
  overflow-y: auto;
  will-change: transform;
}
</style>
