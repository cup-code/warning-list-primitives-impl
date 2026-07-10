<script>
import {
  delJavaTypeFn,
  getJavaTypeDetailFn,
  getJavaTypeListFn,
} from '@/http/safe-production/genCode/java-type-api'
import GenJavaTypeForm from './GenJavaTypeForm'

export default {
  name: 'genJavaTypeList',
  components: {
    GenJavaTypeForm,
  },
  data() {
    return {
      searchForm: {
        label: '',
        value: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
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
      const params = Object.assign(
        {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
        },
        this.searchForm,
      )
      getJavaTypeListFn(params).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
        }
        else {
          this.$message.error(data.msg)
        }
        this.loading = false
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
      this.$refs.genJavaTypeForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.genJavaTypeForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.genJavaTypeForm.init('view', id)
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
      this.$confirm('\u786E\u5B9A\u5220\u9664\u6240\u9009\u9879\u5417?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
      }).then(() => {
        this.loading = true
        // this.$http({
        //   url: '/gen/genCustomObj/deleteAll',
        //   method: 'delete',
        //   params: {
        //     'ids': ids
        //   }
        // })
        delJavaTypeFn(ids).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
          else {
            this.$message.error(data.msg)
          }
        })
      })
    },
    // 查看详情
    detail(row) {
      getJavaTypeDetailFn(row.id).then(({ data }) => {
        this.dataList.forEach((item, index) => {
          if (item.id === row.id) {
            item.genCustomFieldList = data.genCustomObj.genCustomFieldList
          }
        })
      })
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
  },
}
</script>

<template>
  <div class="page">
    <ECard type="search">
      <el-form
        ref="searchForm"
        inline
        :model="searchForm"
        @submit.native.prevent
      >
        <el-form-item prop="label">
          <el-input
            v-model="searchForm.label"
            placeholder="标签"
            clearable
          />
        </el-form-item>
        <el-form-item prop="value">
          <el-input
            v-model="searchForm.value"
            placeholder="完整类名"
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
            icon="sync"
            plain
            @click="resetSearch"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard>
      <div class="card-ell">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="add()"
        >
          新建
        </el-button>
        <el-button
          type="success"
          icon="el-icon-edit-outline"
          :disabled="dataListSelections.length != 1"
          plain
          @click="edit()"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="dataListSelections.length <= 0"
          plain
          @click="del()"
        >
          删除
        </el-button>
        <el-button-group class="pull-right">
          <el-tooltip
            effect="dark"
            content="刷新"
            placement="top"
            class="item"
          >
            <el-button
              type="default"
              icon="el-icon-refresh"
              @click="refreshList()"
            />
          </el-tooltip>
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        class="table"
        :data="dataList"
        height="65vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
        @expand-change="detail"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-tabs v-if="scope.row.type === '0'">
              <el-tab-pane label="java字段">
                <el-table
                  style="width: 100%"
                  :data="scope.row.genCustomFieldList"
                >
                  <el-table-column
                    prop="name"
                    show-overflow-tooltip
                    label="java属性"
                  />
                  <el-table-column
                    prop="remarks"
                    show-overflow-tooltip
                    label="备注信息"
                  />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-table-column>
        <el-table-column
          label="标签"
          prop="label"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- <el-link  type="primary" :underline="false" v-if="hasPermission('sys:menu:edit')" @click="edit(scope.row.id)">{{scope.row.label}}</el-link> -->
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row.id)"
            >
              {{ scope.row.label }}
            </el-link>
            <!-- <span v-else>{{scope.row.label}}</span> -->
          </template>
        </el-table-column>
        <el-table-column
          prop="value"
          show-overflow-tooltip
          sortable="custom"
          label="完整类名"
        />
        <el-table-column
          prop="dataUrl"
          show-overflow-tooltip
          sortable="custom"
          label="数据接口"
        />
        <el-table-column
          prop="tableName"
          show-overflow-tooltip
          sortable="custom"
          label="物理表名"
        />
        <el-table-column
          prop="sort"
          show-overflow-tooltip
          sortable="custom"
          label="排序"
        />
        <el-table-column
          label="操作"
          min-width="200px"
          align="center"
          header-align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="view(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="edit(scope.row.id)"
            >
              修改
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- <div class="bg-white top">
      <el-row> </el-row>
    </div> -->

    <ECard type="footer">
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
    <gen-java-type-form
      ref="genJavaTypeForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding: 10px;
}
.pull-right {
  float: right;
}
.table {
  margin-top: 10px;
}
</style>
