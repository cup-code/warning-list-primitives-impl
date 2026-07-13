<script>
import { getAuthToken } from '@/utils/tab-session'
import SelectTree from '@/components/mjTreeSelect/mjTreeSelect.vue'
import TestCarForm from './TestCarForm'
import TestCarKindForm from './TestCarKindForm'

export default {
  components: {
    SelectTree,
    TestCarForm,
    TestCarKindForm,
  },
  data() {
    return {
      window,
      searchForm: {
        kind: {
          id: '',
        },
      },
      filterText: '',
      testCarKindTreeData: [],
      selectTestCarKindName: '',
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isImportCollapse: false,
      loading: false,
    }
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.testCarKindTree.filter(val)
    },
  },
  mounted() {
    this.refreshTree()
    this.refreshList()
  },
  methods: {
    filterNode(value, data) {
      if (!value)
        return true
      return data.name.includes(value)
    },
    refreshTree() {
      this.$http({
        url: `/test/treetable/testCarKind/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.testCarKindTreeData = data.treeData
      })
    },
    handleNodeClick(data) {
      this.searchForm.kind.id = data.id
      this.refreshList()
    },
    addChildTreeNode(node) {
      this.$refs.testCarKindForm.init('addChild', {
        id: '',
        parent: { id: node.id, name: node.name },
      })
    },
    // 新增
    addTreeNode() {
      this.$refs.testCarKindForm.init('add', {
        id: '',
        parent: { id: '', name: '' },
      })
    },
    // 修改
    editTreeNode(data) {
      this.$refs.testCarKindForm.init('edit', {
        id: data.id,
        parent: { id: '', name: '' },
      })
    },
    delTreeNode(data) {
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        this.$http({
          url: '/test/treetable/testCarKind/delete',
          method: 'delete',
          params: { id: data.id },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg)
            this.loading = false
            this.refreshTree()
            this.refreshList()
          }
        })
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      this.$http({
        url: '/test/treetable/testCar/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
          this.loading = false
        }
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
    // 新增
    add() {
      this.$refs.testCarForm.init('add', '', this.testCarKindTreeData)
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.testCarForm.init('edit', id, this.testCarKindTreeData)
    },
    // 查看
    view(id) {
      this.$refs.testCarForm.init('view', id, this.testCarKindTreeData)
    },
    // 删除
    del(id) {
      const ids
        = id
          || this.dataListSelections
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
          url: '/test/treetable/testCar/delete',
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
    // 导入成功
    uploadSuccess(res, file) {
      if (res.success) {
        this.$message.success({
          dangerouslyUseHTMLString: true,
          message: res.msg,
        })
      }
      else {
        this.$message.error(res.msg)
      }
    },
    // 下载模板
    downloadTpl() {
      this.$utils.download('/test/treetable/testCar/import/template')
    },
    exportExcel() {
      const params = {
        ...this.searchForm,
      }
      this.$utils.download('/test/treetable/testCar/export', params)
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.filterText = ''
      this.$refs.testCarKindTree.setCurrentKey(null)
      this.refreshList()
    },
  },
}
</script>

<template>
  <div class="page-container-sidebar">
    <ECard type="sidebar">
      <div>
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          size="mini"
        />
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          circle
          @click="addTreeNode"
        />
      </div>
      <div class="el-scrollbar__view">
        <el-tree
          ref="testCarKindTree"
          class="filter-tree"
          :data="testCarKindTreeData"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          default-expand-all
          highlight-current
          node-key="id"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <span
            slot-scope="{ node, data }"
            class="custom-tree-node"
          >
            <span>{{ node.label }}</span>
            <span>
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-plus"
                @click="() => addChildTreeNode(data)"
              />
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-edit-outline"
                @click="() => editTreeNode(data)"
              />
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-delete"
                @click="() => delTreeNode(data)"
              />
            </span>
          </span>
        </el-tree>
      </div>
    </ECard>
    <div class="page-main">
      <ECard type="search">
        <el-form
          ref="searchForm"
          :inline="true"
          size="mini"
          class="query-form"
          :model="searchForm"
          @keyup.enter.native="refreshList()"
          @submit.native.prevent
        >
          <!-- 搜索框 -->
          <el-form-item prop="kind.id">
            <SelectTree
              ref="kind"
              :props="{
                value: 'id', // ID字段名
                label: 'name', // 显示名称
                children: 'children', // 子级字段名
              }"
              size="mini"
              :data="testCarKindTreeData"
              :value="searchForm.kind.id"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  searchForm.kind.id = value
                }
              "
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
            :disabled="dataListSelections.length != 1"
            plain
            @click="edit()"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            :disabled="dataListSelections.length <= 0"
            plain
            @click="del()"
          >
            删除
          </el-button>
          <el-button-group class="pull-right">
            <el-button
              type="default"
              size="mini"
              icon="el-icon-upload2"
              title="导入"
              @click="isImportCollapse = !isImportCollapse"
            />
            <el-button
              type="default"
              size="mini"
              icon="el-icon-download"
              title="导出"
              @click="exportExcel()"
            />
            <el-button
              type="default"
              size="mini"
              icon="el-icon-refresh"
              @click="refreshList"
            />
          </el-button-group>
        </div>
        <el-table
          v-loading="loading"
          :data="dataList"
          size="mini"
          height="65vh"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
          class="table"
          @selection-change="selectionChangeHandle"
          @sort-change="sortChangeHandle"
        >
          <el-table-column
            type="selection"
            size="medium"
            header-align="center"
            align="center"
            width="50"
          />
          <el-table-column
            prop="name"
            show-overflow-tooltip
            sortable="custom"
            label="品牌"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="kind.name"
            show-overflow-tooltip
            sortable="custom"
            label="车系"
          />
          <el-table-column
            prop="remarks"
            show-overflow-tooltip
            sortable="custom"
            label="备注信息"
          />
          <el-table-column
            :key="Math.random()"
            header-align="center"
            align="center"
            fixed="right"
            width="200"
            label="操作"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-view"
                size="mini"
                @click="view(scope.row.id)"
              >
                查看
              </el-button>
              <el-button
                type="text"
                icon="el-icon-edit"
                size="mini"
                @click="edit(scope.row.id)"
              >
                修改
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                size="mini"
                @click="del(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </ECard>

      <ECard type="footer">
        <el-pagination
          style="text-align: right"
          :current-page="pageNo"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
        />
      </ECard>
    </div>
    <!-- 导入导出 -->
    <el-dialog
      title="导入Excel"
      :visible.sync="isImportCollapse"
    >
      <el-form
        v-show="isImportCollapse"
        ref="importForm"
        :inline="true"
        class="query-form"
      >
        <el-form-item>
          <el-button
            type="default"
            size="mini"
            @click="downloadTpl()"
          >
            下载模板
          </el-button>
        </el-form-item>
        <el-form-item prop="loginName">
          <el-upload
            class="upload-demo"
            :headers="{ Authorization: getAuthToken() }"
            :action="`${$http.BASE_URL}/test/treetable/testCar/import`"
            :on-success="uploadSuccess"
            :show-file-list="true"
          >
            <el-button
              size="mini"
              type="primary"
            >
              点击上传
            </el-button>
            <div
              slot="tip"
              class="el-upload__tip"
            >
              只允许导入“xls”或“xlsx”格式文件！
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 弹窗, 新增 / 修改 -->
    <TestCarForm
      ref="testCarForm"
      @refreshDataList="refreshList"
    />
    <TestCarKindForm
      ref="testCarKindForm"
      @refreshTree="refreshTree"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-container-sidebar {
}
</style>
