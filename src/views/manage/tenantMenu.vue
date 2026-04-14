<script>
import XEUtils from 'xe-utils'
import {
  deleteTenantMenu,
  getTenantMenuList,
} from '@/http/safe-production/menu-manage-api'
import TenantMenuForm from './form/TenantMenuForm'

export default {
  name: 'tenantMenu',
  components: {
    TenantMenuForm,
  },
  data() {
    return {
      loading: false,
      tenantId: '',
      searchForm: {
        name: '',
      },
      dataList: [],
      canAsParentMenu: [], // 可以作为父级的菜单，需要是板块类型或者目录类型但没有设置跳转页面的
      hasMenuList: [],
    }
  },
  mounted() {
    this.tenantId = this.$store.state.user.user.tenantId
    this.refreshList()
  },
  methods: {
    onUi() {
      this.$router.push({
        path: '/uiPage',
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getTenantMenuList(this.tenantId).then((res) => {
        this.loading = false
        const resD = res.data
        if (resD.success && resD.result) {
          // 可以作为父级的菜单，需要是板块类型或者目录类型但没有设置跳转页面的
          this.canAsParentMenu = this.setTreeData(
            resD.result.filter((item) => {
              return (
                (item.menuType === '0'
                  || (item.menuType === '1' && !item.vueComponent && !item.externalUrl))
                && item.channelType === 'WEB'
              )
            }),
          )
          // 当前租户所有的菜单
          this.dataList = this.setTreeData(resD.result)
          // if (this.currentRow) {
          //   this.$nextTick(() => {
          //     this.$refs.xTree.setTreeExpand(this.currentRow,true)
          //   })
          // }
          // 过滤出是前端组件类型的菜单
          const vueMenuList = resD.result.filter((item) => {
            return item.menuType === '2' && item.vueComponent
          })
          this.hasMenuList = vueMenuList.map((item) => {
            return item.vueComponent
          })
        }
        else {
          this.$message.warning(resD.message || '获取菜单列表失败')
        }
      })
    },
    handleSearch() {
      const filterName = XEUtils.toValueString(this.searchForm.name).trim()
      if (filterName) {
        const options = { children: 'children' }
        const searchProps = ['menuName']
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
    addChild(row) {
      // this.currentRow = row
      this.$refs.tenantMenuForm.init('addChild', {
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
      this.$refs.tenantMenuForm.init('add', {
        id: '',
        parent: { id: '', channelType: 'WEB', menuType: '0' },
      })
    },
    // 修改
    edit(row) {
      this.$refs.tenantMenuForm.init('edit', {
        id: row.tenantMenuId,
        parent: { id: '', channelType: '', menuType: '' },
        row,
      })
    },
    // 查看
    view(row) {
      this.$refs.tenantMenuForm.init('view', {
        id: row.tenantMenuId,
        parent: { id: '', channelType: '', menuType: '' },
        row,
      })
    },
    // 删除
    del(row) {
      this.$confirm(`确定删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        deleteTenantMenu(row.tenantMenuId).then(({ data }) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success',
              duration: 1500,
            })
            this.refreshList()
          }
        })
        // console.log(this.$refs.xTree.value)
        // this.$refs.xTree.remove(row).then(()=> {
        //   console.log('delete')
        // })
        // this.loading = false
      })
    },
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <!-- <div class="head-search"> -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
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
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="handleSearch"
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
          <!-- <el-button @click="onUi">uiyemian</el-button> -->
        </el-form-item>
      </el-form>
    </ECard>
    <ECard slot="table" noneBottom>
      <div class="auxiliary-button">
        <el-button
          v-if="hasBtnPermission('manage_tenantMenu_add')"
          size="mini"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="add()"
        >
          新增
        </el-button>
      </div>
      <vxe-table
        ref="xTree"
        resizable
        border="inner"
        round
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        auto-resize
        height="90%"
        row-id="id"
        size="small"
        show-header-overflow
        show-overflow
        highlight-hover-row
        highlight-current-row
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
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row)"
            >
              {{
                scope.row.menuName
              }}
            </el-link>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="排序"
          field="sort"
          align="center"
          width="100px"
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
        </vxe-table-column>
        <vxe-table-column
          title="归属"
          field="channelType"
          align="center"
          width="150px"
        >
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
            <el-tag v-else-if="scope.row.channelType === 'APP_MAIN'" size="small">
              APP主页
            </el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="图标"
          field="icon"
          align="center"
          width="60px"
        >
          <template slot-scope="scope">
            <i :class="scope.row.icon" />
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="类型"
          field="menuType"
          align="center"
          width="70px"
        >
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
        <vxe-table-column
          title="是否通用"
          field="canCommon"
          align="center"
          width="90px"
        >
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
          width="300px"
          align="center"
        />
        <vxe-table-column
          title="操作"
          min-width="150px"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <EButton
              v-if="hasBtnPermission('manage_tenantMenu_add')"
              type="text"
              icon="add"
              :disabled="scope.row.menuType == '3'"
              @click="addChild(scope.row)"
            >
              新增子级
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_tenantMenu_modify')"
              type="text"
              icon="edit"
              size="small"
              @click="edit(scope.row)"
            >
              修改
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_tenantMenu_delete')"
              type="text"
              icon="delete"
              size="small"
              @click="del(scope.row)"
            >
              删除
            </EButton>
          </template>
        </vxe-table-column>
      </vxe-table>
    </ECard>
    <!-- 弹窗, 新增 / 修改 -->
    <template slot="dialog">
      <tenant-menu-form
        ref="tenantMenuForm"
        :tenantId="tenantId"
        :canAsParentMenu="canAsParentMenu"
        :hasMenuList="hasMenuList"
        @refreshDataList="refreshList"
      />
    </template>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
// .page-container {
// }
.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
::v-deep .vxe-table {
  border-color: var(--ky-border-color);
  border-radius: 6px;
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
  box-sizing: border-box;
  padding-bottom: 10px;
}
</style>
