<script>
import { getSysOfficeTreeData, getSysUserList } from '@/http/safe-production/flowable-api'

export default {
  props: {
    selectData: {
      type: Array,
      default() {
        return []
      },
    },
    limit: {
      type: Number,
      default: 999999,
    },
  },
  data() {
    return {
      searchForm: {
        loginName: '',
        company: {
          id: '',
        },
        office: {
          id: '',
        },
        name: '',
      },
      filterText: '',
      dataListAllSelections: [],
      // 所有选中的数据包含跨页数据
      dataListSelections: [],
      idKey: 'id',
      // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      dataList: [],
      dynamicTags: [],
      officeTreeData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      loading: false,
      visible: false,
    }
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val)
    },
  },
  methods: {
    init() {
      this.visible = true
      this.$nextTick(() => {
        this.dataListAllSelections = JSON.parse(JSON.stringify(this.selectData))

        this.refreshTree()

        this.resetSearch()
      })
    },
    renderContent(h, _ref) {
      const node = _ref.node
      const data = _ref.data
      const store = _ref.store
      return h(
        'span',
        {
          class: 'custom-tree-node',
        },
        [
          data.type === '1'
            ? h('i', {
                class: 'fa fa-sitemap',
              })
            : h('i', {
                class: 'fa fa-users',
              }),

          h(
            'span',
            {
              class: 'text',
            },
            [node.label],
          ),
        ],
      )
    },
    getTemplateRow(index, row) {
      // 获取选中数据
      this.dataListSelections = [row]
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.dataListAllSelections || this.dataListAllSelections.length <= 0) {
        this.$refs.userTable.clearSelection()
        return
      } // 标识当前行的唯一键的名称

      const idKey = this.idKey
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.userTable.clearSelection()

      for (let i = 0; i < this.dataList.length; i++) {
        if (selectAllIds.includes(this.dataList[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.userTable.toggleRowSelection(this.dataList[i], true)
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
    // 得到选中的所有数据
    getAllSelectionData() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData()
    },
    filterNode(value, data) {
      if (!value)
        return true
      return data.name.includes(value)
    },
    del(tag) {
      this.dataListAllSelections.splice(this.dataListAllSelections.indexOf(tag), 1)
      this.$nextTick(() => {
        this.setSelectRow()
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getSysUserList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        ...this.searchForm,
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
          this.loading = false
        }

        this.$nextTick(() => {
          this.setSelectRow()
        })
      })
    },
    refreshTree() {
      getSysOfficeTreeData().then(({ data }) => {
        this.officeTreeData = data.treeData
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
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
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
    // 排序
    sortChangeHandle(obj) {
      if (obj.prop === 'office.name') {
        obj.prop = 'o.name'
      }

      if (obj.prop === 'company.name') {
        obj.prop = 'c.name'
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
      // if (data.type === '1') {
      //     this.searchForm.company.id = data.id;
      //     this.searchForm.office.id = '';
      // } else {
      //     this.searchForm.company.id = '';
      //     this.searchForm.office.id = data.id;
      // }
      this.searchForm.office.id = data.id
      this.searchForm.company.id = ''

      this.refreshList()
    },
    resetSearch() {
      this.searchForm.company.id = ''
      this.searchForm.office.id = ''
      this.$refs.officeTree.setCurrentKey(null)
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
    doSubmit() {
      if (this.limit < this.dataListAllSelections.length) {
        this.$message.error(
          '\u4F60\u6700\u591A\u53EA\u80FD\u9009\u62E9'.concat(this.limit, '\u4E2A\u7528\u6237'),
        )
        return
      }

      this.visible = false
      this.$emit('doSubmit', this.dataListAllSelections)
    },
  },
}
</script>

<template>
  <div>
    <el-dialog

      class="userDialog dialog-selfBpmn"
      title="用户选择"
      width="1000px"
      :close-on-click-modal="false"
      append-to-body
      :visible.sync="visible"
    >
      <el-container style="height: 500px">
        <el-aside width="200px">
          <el-card class="org">
            <div
              slot="header"
              class="clearfix"
            >
              <el-input
                v-model="filterText"
                placeholder="请输入组织机构过滤"
                size="mini"
              />
            </div>

            <el-tree
              ref="officeTree"
              :data="officeTreeData"
              :props="{
                value: 'id',
                label: 'departmentName',
                children: 'childrenDepartment',
              }"
              default-expand-all
              highlight-current
              node-key="id"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            />
          </el-card>
        </el-aside>

        <el-container>
          <el-header style="text-align: left; font-size: 12px; height: 30px">
            <el-form
              ref="searchForm"
              size="mini"
              inline
              :model="searchForm"
              @keyup.enter.native="refreshList"
              @submit.prevent.native
            >
              <el-form-item prop="loginName">
                <el-input
                  v-model="searchForm.loginName"
                  size="mini"
                  placeholder="登录名"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="mini"
                  @click="refreshList"
                >
                  查询
                </el-button>
                <el-button
                  size="mini"
                  @click="resetSearch"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-header>

          <el-main>
            <el-table
              ref="userTable"
              v-loading="loading"
              style="width: 100%"
              :data="dataList"
              size="mini"
              height="calc(100% - 40px)"
              @selection-change="selectionChangeHandle"
              @sort-change="sortChangeHandle"
            >
              <el-table-column
                v-if="limit <= 1"
                header-align="center"
                align="center"
                width="50"
              >
                <template slot-scope="scope">
                  <el-radio
                    :label="scope.row.id"
                    :value="dataListAllSelections[0] && dataListAllSelections[0].id"
                    @change.native="getTemplateRow(scope.$index, scope.row)"
                  >
                    <span />
                  </el-radio>
                </template>
              </el-table-column>

              <el-table-column
                v-if="limit > 1"
                type="selection"
                header-align="center"
                align="center"
                width="50"
              />

              <!-- <el-table-column prop="photo" header-align="center" align="center" label="头像">
                  <template slot-scope="scope">
                      <img
                          style="height: 35px;"
                          :src="scope.row.photo === '' ? '/static/img/avatar.png' : scope.row.photo"
                      >
                  </template>
              </el-table-column> -->

              <el-table-column
                prop="username"
                header-align="center"
                align="center"
                sortable="custom"
                min-width="90"
                label="登录名"
              />

              <el-table-column
                prop="fullName"
                header-align="center"
                align="真实姓名"
                sortable="custom"
                min-width="90"
                label="用户名"
              />

              <el-table-column
                prop="companyName"
                header-align="center"
                align="center"
                sortable="custom"
                min-width="110"
                label="所属公司"
              />

              <el-table-column
                prop="departmentName"
                header-align="center"
                align="center"
                sortable="custom"
                min-width="110"
                label="所属部门"
              />

              <el-table-column
                prop="loginFlag"
                header-align="center"
                align="center"
                min-width="100"
                label="状态"
              >
                <template slot-scope="scope">
                  <el-tag
                    v-if="scope.row.status === '0'"
                    type="danger"
                  >
                    禁用
                  </el-tag>
                  <el-tag
                    v-if="scope.row.status === '1'"
                    type="success"
                  >
                    在职
                  </el-tag>
                  <el-tag
                    v-if="scope.row.status === '2'"
                    type="warning"
                  >
                    借调
                  </el-tag>
                  <el-tag
                    v-if="scope.row.status === '3'"
                    type="danger"
                  >
                    离职
                  </el-tag>
                  <el-tag
                    v-if="scope.row.status === '4'"
                    type="danger"
                  >
                    退休
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              :current-page="pageNo"
              :page-sizes="[5, 10, 50, 100]"
              :page-size="pageSize"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="sizeChangeHandle"
              @current-change="currentChangeHandle"
            />
          </el-main>
        </el-container>

        <el-aside width="200px">
          <el-tag
            v-for="tag in dataListAllSelections"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="del(tag)"
          >
            {{ tag.fullName }}
          </el-tag>
        </el-aside>
      </el-container>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="doSubmit"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
