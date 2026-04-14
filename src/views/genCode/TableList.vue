<script>
import {
  createCustomObjFn,
  delTableListFn,
  getFormUrlFn,
  getTableListFn,
  getTreetFn,
  removeTableListFn,
} from '@/http/safe-production/genCode/table-list-api'
import GenCodeForm from './GenCodeForm'
import GenMenuForm from './GenMenuForm'
import GenSyncForm from './GenSyncForm'
import GenTableForm from './GenTableForm'
import ImportTable from './ImportTable'

export default {
  name: 'tableList',
  components: {
    GenTableForm,
    GenSyncForm,
    GenCodeForm,
    GenMenuForm,
    ImportTable,
  },
  data() {
    return {
      defaultProps: {
        value: 'id',
        label: 'label',
        children: 'children',
      },
      moreButton: [
        {
          type: 'text',
          props: 'delete',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          disabled: false,
        },
        {
          type: 'text',
          props: 'sync',
          icon: 'sync',
          size: 'mini',
          text: '同步数据',
          disabled: false,
        },
      ],
      searchForm: {
        nameLike: '',
        dataSource: {
          id: '',
        },
      },
      code: 0,
      msg: '',
      serial: '',
      filterText: '',
      dataList: [],
      databaseTreeData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      loading: false,
    }
  },
  watch: {
    filterText(val) {
      this.$refs.databaseTree.filter(val)
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
      return data.label.includes(value)
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      const params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
        },
        this.searchForm,
      )
      getTableListFn(params).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
        }
        this.loading = false
        this.msg = data.msg
        this.code = data.code
        this.serial = data.serial
      })
    },
    refreshTree() {
      getTreetFn().then(({ data }) => {
        this.databaseTreeData = data.treeData
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
    // 新增
    add() {
      this.$refs.genTableForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.genTableForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.genTableForm.init('view', id)
    },
    // 删除
    del(id) {
      this.$confirm(
        '\u786E\u8BA4\u8981\u5220\u9664\u8BE5\u6761\u8BB0\u5F55\u5E76\u5220\u9664\u5BF9\u5E94\u7684\u6570\u636E\u5E93\u7269\u7406\u8868\u5417?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).then(() => {
        delTableListFn(id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })
            this.refreshList()
          }
        })
      })
    },
    // 移除一条或多条数据
    remove(id) {
      const ids
        = id
          || this.dataListSelections
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm('\u786E\u8BA4\u8981\u79FB\u9664\u9009\u4E2D\u8BB0\u5F55\u5417?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        removeTableListFn(ids).then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })
            this.refreshList()
          }
        })
      })
    },
    handleNodeClick(data) {
      if (data.type === 'db') {
        this.searchForm.dataSource.id = data.id
      }
      else {
        this.searchForm.dataSource.id = ''
      }
      this.refreshList()
    },
    sync(id) {
      this.$refs.genSyncForm.init(id)
    },
    genCode() {
      const id = this.dataListSelections[0].id
      const tableType = this.dataListSelections[0].tableType
      if (tableType === '2') {
        this.$message.error('不能选择附表生成代码，请选择主表!')
        return
      }
      if (tableType === '5') {
        this.$message.error('不能选择右表生成代码，请选择左树!')
        return
      }
      const isSync = this.dataListSelections[0].isSync
      if (isSync === '0') {
        this.$message.error('请先同步数据库!')
        return
      }
      this.$refs.genCodeForm.init(id)
    },
    createMenu() {
      const id = this.dataListSelections[0].id
      const tableType = this.dataListSelections[0].tableType
      if (tableType === '2' || tableType === '5') {
        this.$message.error('不能选择附表创建菜单，请选择主表!')
        return
      }
      const isSync = this.dataListSelections[0].isSync
      if (isSync === '0') {
        this.$message.error('请先同步数据库!')
        return
      }
      this.$refs.genMenuForm.init(id, tableType)
    },
    createCustomObj() {
      const id = this.dataListSelections[0].id
      const tableType = this.dataListSelections[0].tableType
      this.$confirm(
        '\u662F\u5426\u5C06\u8BE5\u8868\u5BF9\u5E94\u7684\u5B9E\u4F53\u6DFB\u52A0\u5230java\u81EA\u5B9A\u4E49\u5BF9\u8C61\u4E2D\uFF1F',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning',
        },
      )
        .then(() => {
          const params = {
            gen_table_id: id,
            genTableType: tableType,
          }
          createCustomObjFn(params).then(({ data }) => {
            if (data.success) {
              this.$message.success(data.msg)
            }
            else {
              this.$message.error(data.msg)
            }
          })
        })
        .catch(() => {})
    },
    getActivitiFormUrl() {
      const id = this.dataListSelections[0].id
      const tableType = this.dataListSelections[0].tableType
      if (tableType !== '6') {
        this.$message.error('请选择工作流表单')
        return
      }
      const params = {
        gen_table_id: id,
        genTableType: tableType,
      }
      getFormUrlFn(params).then(({ data }) => {
        if (data.success) {
          this.$alert(data.url, '流程表单地址', {
            dangerouslyUseHTMLString: true,
            showClose: false,
          })
        }
        else {
          this.$message.error(data.msg)
        }
      })
    },
    manageCustomObj() {
      this.$router.push('/gen/GenCustomObjList')
    },
    importFromDB() {
      this.$refs.importTable.init()
    },
    resetSearch() {
      this.searchForm.dataSource.id = ''
      this.filterText = ''
      this.$refs.databaseTree.setCurrentKey(null)
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
  },
}
</script>

<template>
  <TreeTable
    ref="treeTable"
    :useMoreBtn="false"
  >
    <ECard slot="tree">
      <el-input
        v-model="filterText"
        placeholder="数据库:请输入关键字过滤"
        size="mini"
        clearable
      />
      <div style="margin-top: 10px">
        <el-tree
          ref="databaseTree"
          class="filter-tree"
          :data="databaseTreeData"
          :props="defaultProps"
          highlight-current
          :expand-on-click-node="false"
          node-key="id"
          check-strictly
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        />
      </div>
    </ECard>
    <ECard
      slot="search"
      customStyle="margin-bottom:0"
    >
      <el-form
        ref="searchForm"
        v-model="searchForm"
        size="small"
        inline
        @submit.native.prevent
      >
        <el-form-item prop="nameLike">
          <el-input
            v-model="searchForm.nameLike"
            size="small"
            placeholder="表名"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <EButton
            icon="search"
            type="primary"
            @click="refreshList"
          >
            查询
          </EButton>
          <EButton
            plain
            icon="sync"
            @click="resetSearch"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <!-- <el-button-group> -->
        <EButton
          type="primary"
          btnIcon="el-icon-plus"
          @click="add()"
        >
          新建
        </EButton>
        <EButton
          plain
          icon="download"
          type="info"
          @click="importFromDB()"
        >
          数据库导入表单
        </EButton>
        <EButton
          plain
          icon="edit"
          type="success"
          :disabled="dataListSelections.length != 1"
          @click="edit()"
        >
          修改
        </EButton>
        <EButton
          plain
          icon="unShelve"
          type="danger"
          tpye="danger"
          :disabled="dataListSelections.length < 1"
          @click="remove()"
        >
          移除
        </EButton>
        <EButton
          plain
          icon="code"
          :disabled="dataListSelections.length != 1"
          @click="genCode()"
        >
          生成代码
        </EButton>
        <EButton
          plain
          icon="menu"
          :disabled="dataListSelections.length != 1"
          @click="createMenu()"
        >
          创建菜单
        </EButton>
        <EButton
          plain
          icon="type"
          :disabled="dataListSelections.length != 1"
          @click="createCustomObj()"
        >
          添加到java类型
        </EButton>
        <EButton
          plain
          icon="flow"
          :disabled="dataListSelections.length != 1"
          @click="getActivitiFormUrl()"
        >
          获取流程表单
        </EButton>
        <!-- </el-button-group> -->
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        class="table"
        auto-resize
        :data="dataList"
        height="90%"
        size="small"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
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
          prop="tableType"
          show-overflow-tooltip
          min-width="100"
          sortable="custom"
          label="表类型"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('table_type', scope.row.tableType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          min-width="180"
          sortable="custom"
          label="表名"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row.id)"
            >
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="dataSource.name"
          show-overflow-tooltip
          min-width="120"
          sortable="custom"
          align="center"
          label="来自数据库"
        />
        <el-table-column
          prop="comments"
          show-overflow-tooltip
          sortable="custom"
          label="说明"
        />
        <el-table-column
          prop="className"
          show-overflow-tooltip
          sortable="custom"
          label="类名"
        />
        <el-table-column
          prop="parentTable"
          show-overflow-tooltip
          align="center"
          label="主表"
        />
        <el-table-column
          label="同步数据库"
          prop="isSync"
          min-width="120"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.isSync !== '1'"
              size="mini"
              type="danger"
            >
              未同步
            </el-tag>
            <el-tag
              v-if="props.row.isSync === '1'"
              size="mini"
              type="success"
            >
              已同步
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              size="mini"
              icon="edit"
              type="text"
              @click="edit(scope.row.id)"
            >
              修改
            </EButton>
            <EButton
              size="mini"
              icon="unShelve"
              type="text"
              @click="remove(scope.row.id)"
            >
              移除
            </EButton>
            <!-- <el-button @click="del(scope.row.id)" size="mini" type="text">删除</el-button>
              <el-button @click="sync(scope.row.id)" size="mini" type="text">同步数据库</el-button> -->

            <EMoreButton
              icon="more"
              text="更多"
              :list="moreButton"
              @delete="del(scope.row.id)"
              @sync="sync(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard slot="page">
      <el-pagination
        style="text-align: right"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>
    <!-- <div class="content">
      <div class="right"></div>
    </div> -->

    <gen-table-form
      ref="genTableForm"
      @refreshDataList="refreshList"
    />
    <gen-sync-form
      ref="genSyncForm"
      @refreshDataList="refreshList"
    />
    <import-table
      ref="importTable"
      @refreshDataList="refreshList"
    />
    <gen-code-form ref="genCodeForm" />
    <gen-menu-form ref="genMenuForm" />
  </TreeTable>
</template>

<style lang="scss" scoped>
.page-container-sidebar {
}
.content {
  display: flex;
}
.left {
  width: 240px;
  overflow: auto;
}
.right {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
}
.table {
  margin-top: 10px;
}

::v-deep.table {
  display: block;
}
</style>
