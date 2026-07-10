<script>
import {
  delDataBaseFn,
  getDataBaseDetailFn,
  getDataBaseListFn,
} from '@/http/safe-production/genCode/data-base-type-api'
import GenDataBaseTypeForm from './GenDataBaseTypeForm'

export default {
  name: 'genDataBaseTypeList',
  components: {
    GenDataBaseTypeForm,
  },
  data() {
    return {
      searchForm: {
        type: '',
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
      getDataBaseListFn(params).then(({ data }) => {
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
      this.$refs.genDataBaseTypeForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.genDataBaseTypeForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.genDataBaseTypeForm.init('view', id)
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
        delDataBaseFn(ids).then(({ data }) => {
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
      getDataBaseDetailFn(row.id).then(({ data }) => {
        this.dataList.forEach((item, index) => {
          if (item.id === row.id) {
            item.genTableFieldTypeList = data.genDataBaseType.genTableFieldTypeList
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
  <div class="page-container">
    <ECard type="search">
      <el-form
        ref="searchForm"
        inline
        :model="searchForm"
        @submit.native.prevent
      >
        <el-form-item prop="type">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('db_type')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="refreshList"
          >
            查询
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard>
      <div class="card-cell">
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
        size="small"
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
            <el-tabs>
              <el-tab-pane label="表字段物理类型">
                <el-table
                  style="width: 100%"
                  :data="scope.row.genTableFieldTypeList"
                >
                  <el-table-column
                    prop="label"
                    label="标签"
                  />
                  <el-table-column
                    prop="value"
                    label="值"
                  />
                  <el-table-column
                    prop="sort"
                    label="排序"
                  />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-table-column>
        <el-table-column
          label="数据库类型"
          prop="type"
          sortable="custom"
        >
          <template slot-scope="scope">
            <!-- <el-link  type="primary" :underline="false" v-if="hasPermission('sys:menu:edit')" @click="edit(scope.row.id)">{{scope.row.name}}</el-link> -->
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row.id)"
            >
              {{ $dictUtils.getDictLabel('db_type', scope.row.type) }}
            </el-link>
            <!-- <span v-else>{{scope.row.name}}</span> -->
          </template>
        </el-table-column>
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

    <gen-data-base-type-form
      ref="genDataBaseTypeForm"
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
}
</style>
