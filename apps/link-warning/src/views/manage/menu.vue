<script>
import { cloneDeep } from 'lodash'
import XEUtils from 'xe-utils'
import { deleteMenu, getMenuList } from '@/http/safe-production/menu-manage-api'
import MenuForm from './form/MenuForm'

export default {
  components: {
    MenuForm,
  },
  data() {
    return {
      loading: false,
      searchForm: {
        name: '',
      },
      dataList: [],
      canAsParentMenu: [], // 可以作为父级的菜单，需要是板块类型或者目录类型但没有设置跳转页面的
    }
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getMenuList().then((res) => {
        this.loading = false
        const resD = res.data
        if (resD.success && resD.result) {
          // 可以作为父级的菜单，需要是板块类型或者目录类型但没有设置跳转页面的
          this.canAsParentMenu = this.setTreeData(
            resD.result.filter((item) => {
              return (
                item.menuType === '0'
                || (item.menuType === '1'
                  && !item.vueComponent
                  && !item.externalUrl
                  && item.channelType !== 'APP')
                || (item.channelType === 'APP' && item.menuType === '0')
              )
            }),
          )
          // 当前租户所有的菜单
          this.dataList = this.setTreeData(resD.result)
          this.cloneDataList = cloneDeep(this.dataList)
        }
      })
    },
    handleSearch() {
      const filterName = XEUtils.toValueString(this.searchForm.name).trim()
      if (filterName) {
        const options = { children: 'children' }
        const searchProps = ['menuName']
        this.dataList = XEUtils.searchTree(
          this.cloneDataList,
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
      else {
        this.dataList = this.cloneDataList
      }
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
    // 新增下级
    addChild(row) {
      this.$refs.menuForm.init('addChild', {
        id: '',
        parent: {
          id: row.id,
          channelType: row.channelType,
          menuType: row.menuType,
          vueComponent: row.vueComponent,
        },
        row,
      })
    },
    // 新增
    add() {
      this.$refs.menuForm.init('add', {
        id: '',
        parent: { id: '', channelType: 'WEB', menuType: '0' },
      })
    },
    // 修改
    edit(row) {
      this.$refs.menuForm.init('edit', {
        id: row.id,
        parent: { id: '', channelType: '', menuType: '' },
        row,
      })
    },
    // 查看
    view(row) {
      this.$refs.menuForm.init('view', {
        id: row.id,
        parent: { id: '', channelType: '', menuType: '' },
        row,
      })
    },
    // 删除
    del(id) {
      this.$confirm(`确定删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        deleteMenu(id).then(({ data }) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success',
              duration: 1500,
            })
            this.refreshList()
          }
          else {
            this.loading = false
            this.$message.error('存在租户正在使用该菜单,无法删除')
          }
        })
      })
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard slot="search" noneBottom type="search">
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="handleSearch()"
        @submit.native.prevent
      >
        <el-form-item prop="name" label="名称">
          <el-input
            v-model="searchForm.name"
            size="small"
            placeholder="名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <EButton
            type="primary"
            btnIcon="el-icon-search"
            @click="handleSearch"
          >
            查询
          </EButton>
          <EButton btnIcon="el-icon-refresh-right" @click="resetSearch()">
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard slot="table">
      <div v-if="hasBtnPermission('manage_menu_add')" class="card-cell">
        <EButton
          v-if="hasBtnPermission('manage_menu_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="add()"
        >
          新增
        </EButton>
      </div>
      <vxe-table
        ref="xTree"
        resizable
        border="inner"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        auto-resize
        height="90%"
        row-id="id"
        size="small"
        show-header-overflow
        show-overflow
        highlight-hover-row
        :print-config="{}"
        :export-config="{}"
        :tree-config="{ reserve: true }"
        :loading="loading"
        :data="dataList"
      >
        <vxe-table-column
          title="名称"
          field="menuName"
          align="left"
          tree-node
          width="200px"
        >
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" @click="view(scope.row)">
              {{
                scope.row.menuName
              }}
            </el-link>
          </template>
        </vxe-table-column>
        <vxe-table-column title="排序" field="sort" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag size="small" type="info" effect="plain">
              {{ scope.row.sort }}
            </el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column title="归属" field="channelType" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.channelType === 'WEB'"
              size="small"
              type="success"
            >
              WEB平台
            </el-tag>
            <el-tag v-else-if="scope.row.channelType === 'APP'" size="small">
              APP
            </el-tag>
            <el-tag
              v-else-if="scope.row.channelType === 'APP_MAIN'"
              size="small"
            >
              APP主页
            </el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column title="图标" field="icon" align="center" width="120px">
          <template slot-scope="scope">
            <i :class="scope.row.icon" />
          </template>
        </vxe-table-column>
        <vxe-table-column title="类型" field="menuType" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.menuType === '0'" size="small">
              板块
            </el-tag>
            <el-tag
              v-else-if="scope.row.menuType === '1'"
              size="small"
              type="success"
            >
              目录
            </el-tag>
            <el-tag
              v-else-if="scope.row.menuType === '2'"
              size="small"
              type="info"
            >
              菜单
            </el-tag>
            <el-tag
              v-else-if="scope.row.menuType === '3'"
              size="small"
              type="info"
            >
              按钮
            </el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column title="是否通用" field="canCommon" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.canCommon === true"
              size="small"
              type="success"
            >
              是
            </el-tag>
            <el-tag
              v-else-if="scope.row.canCommon === false"
              size="small"
              type="danger"
            >
              否
            </el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="路径"
          field="vueComponent"
          width="200px"
          align="center"
        />
        <!-- <vxe-table-column title="备注" field="remarks" width="170px" align="center"></vxe-table-column> -->
        <vxe-table-column title="操作" min-width="150px" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('manage_menu_add')"
              type="text"
              :disabled="scope.row.menuType == '3'"
              @click="addChild(scope.row)"
            >
              新增子级
            </el-button>
            <el-button
              v-if="hasBtnPermission('manage_menu_modify')"
              type="text"
              style="color: var(--ky-warning)"
              @click="edit(scope.row)"
            >
              修改
            </el-button>
            <el-button
              v-if="hasBtnPermission('manage_menu_delete')"
              style="color: var(--ky-danger)"
              type="text"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </vxe-table-column>
      </vxe-table>
    </ECard>
    <!-- 弹窗, 新增 / 修改 -->
    <menu-form
      ref="menuForm"
      slot="dialog"
      :canAsParentMenu="canAsParentMenu"
      @refreshDataList="refreshList"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
// .page {
//   padding: 10px;
//   background: #f3f7f9;
// }

.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
::v-deep .vxe-table {
  background: #ffffff;
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
</style>
