<script>
import { getAuthToken } from '@/utils/tab-session'
import UserSelect from '@/components/userSelect'
import TestGenFirstForm from './TestGenFirstForm'

export default {
  components: {
    UserSelect,
    TestGenFirstForm,
  },
  data() {
    return {
      window,
      searchForm: {
        fieldOne: '',
        fieldTwo: '',
        fieldThree: '',
        fieldFour: {
          id: '',
        },
      },
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
  mounted() {
    this.refreshList()
  },
  created() {
    this.getPrefix()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      this.$http({
        url: '/test/genfirst/testGenFirst/list',
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
      this.$refs.testGenFirstForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.testGenFirstForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.testGenFirstForm.init('view', id)
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
          url: '/test/genfirst/testGenFirst/delete',
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
      this.$utils.download('/test/genfirst/testGenFirst/import/template')
    },
    exportExcel() {
      const params = {
        ...this.searchForm,
      }
      this.$utils.download('/test/genfirst/testGenFirst/export', params)
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
        size="mini"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <!-- 搜索框 -->
        <el-form-item prop="fieldOne">
          <el-input
            v-model="searchForm.fieldOne"
            size="mini"
            placeholder="字段1"
            clearable
          />
        </el-form-item>
        <el-form-item prop="fieldTwo">
          <el-select
            v-model="searchForm.fieldTwo"
            placeholder="请选择字段2"
            size="mini"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('control_measures')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="fieldThree">
          <el-date-picker
            v-model="searchForm.fieldThree"
            type="datetime"
            size="mini"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择字段3"
          />
        </el-form-item>
        <el-form-item prop="fieldFour.id">
          <user-select
            :limit="1"
            size="mini"
            placeholder="请选择字段4"
            :value="searchForm.fieldFour.id"
            @getValue="
              value => {
                searchForm.fieldFour.id = value
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
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          min-width="50"
        />
        <el-table-column
          min-width="120"
          prop="fieldOne"
          show-overflow-tooltip
          sortable="custom"
          label="字段1"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.fieldOne }}</span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          prop="fieldTwo"
          show-overflow-tooltip
          sortable="custom"
          label="字段2"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('control_measures', scope.row.fieldTwo, '-') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fieldThree"
          show-overflow-tooltip
          sortable="custom"
          label="字段3"
        />
        <el-table-column
          prop="fieldFour.username"
          show-overflow-tooltip
          sortable="custom"
          label="字段4"
        />
        <el-table-column
          prop="fieldFive.departmentName"
          show-overflow-tooltip
          sortable="custom"
          label="字段5"
        />
        <el-table-column
          prop="fieldSix.districtName"
          show-overflow-tooltip
          sortable="custom"
          label="字段6"
        />
        <el-table-column
          min-width="200"
          prop="fieldSeven"
          show-overflow-tooltip
          sortable="custom"
          label="字段7"
        >
          <template
            v-if="scope.row.fieldSeven"
            slot-scope="scope"
          >
            <el-image
              v-for="(src, index) in scope.row.fieldSeven.split('|')"
              :key="index"
              style="height: 50px; width: 50px; margin-right: 10px"
              :src="filePrefix + src"
              :preview-src-list="scope.row.fieldSeven.split('|').map(src => filePrefix + src)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="fieldEight"
          show-overflow-tooltip
          sortable="custom"
          label="字段8"
        >
          <template
            v-if="scope.row.fieldEight"
            slot-scope="scope"
          >
            <a
              v-for="(item, index) in scope.row.fieldEight.split('|')"
              :key="index"
              :href="filePrefix + item"
              target="_blank"
            >
              {{ decodeURIComponent(item.substring(item.lastIndexOf('/') + 1)) }}
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="fieldNine"
          show-overflow-tooltip
          sortable="custom"
          label="字段9"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('depart_type', scope.row.fieldNine, '-') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fieldTen"
          show-overflow-tooltip
          sortable="custom"
          label="字段10"
        >
          <template slot-scope="scope">
            {{
              scope.row.fieldTen
                .split(',')
                .map(item => {
                  return $dictUtils.getDictLabel('analysis_unit', item, '-')
                })
                .join(',')
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fieldYyy"
          show-overflow-tooltip
          sortable="custom"
          label="字段yyy"
        />
        <el-table-column
          prop="remarks"
          show-overflow-tooltip
          sortable="custom"
          label="备注信息"
        />
        <el-table-column
          :key="Math.random()"
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

    <!-- 导入导出 -->
    <el-dialog
      title="导入Excel"
      :visible.sync="isImportCollapse"
    >
      <el-form
        v-show="isImportCollapse"
        ref="importForm"
        size="mini"
        :inline="true"
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
            :action="`${$http.BASE_URL}/test/genfirst/testGenFirst/import`"
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
    <TestGenFirstForm
      ref="testGenFirstForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
::v-deep.table {
  display: block;
}
</style>
