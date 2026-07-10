<script>
import moment from 'moment'
import { threeTimeCheckDel, threeTimeCheckPageQuery } from '@/http/pro-env/time3check-api.js'
import CheckInfo from './components/CheckInfo.vue'

export default {
  components: {
    CheckInfo,
  },
  data() {
    return {
      isNew: false, // 是否新创建
      editable: false, // 弹窗是否可编辑
      infoId: '', // 详情id
      loadingSearch: false, // 搜索表格数据loading
      showInfoDialog: false, // 是否打开新增弹窗
      // 搜索数据
      searchData: {
        organization: '',
        documentNum: '',
        title: '',
        pageNum: 1,
        pageSize: 20,
      },
      total: 0, // 数据总数
      // 表格数据
      tableData: [],
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        const date = moment(timestamp).format('YYYY/MM/DD')
        return date
      }
    },
  },
  created() {
    this.getDataList()
  },
  methods: {
    /* 请求列表数据 */
    getDataList() {
      this.loadingSearch = true
      threeTimeCheckPageQuery(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.total = res.data.result.total
            this.tableData = res.data.result.list
          }
          else {
            this.$message.warning(res.data.message || '请求表格数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求表格数据出错！', err)
        })
        .finally(() => {
          this.loadingSearch = false
        })
    },
    /* 删除资料 */
    delInfoClick(item) {
      this.$confirm(`您是否确定要删除<${item.title} >信息?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingSearch = true
          threeTimeCheckDel(item.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.getDataList()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错！', err)
            })
            .finally(() => {
              this.loadingSearch = false
            })
        })
        .catch(() => {})
    },
    /* 详情变更完成回调 */
    infoSuccEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.getDataList()
      }
    },
    /* 新建详情 */
    addClick() {
      this.infoId = undefined
      this.editable = true
      this.isNew = true
      this.showInfoDialog = true
    },
    /* 查看/修改详情 */
    changeClick(id, editable) {
      this.isNew = false
      this.editable = editable
      this.infoId = id
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <SearchTable v-loading="loadingSearch">
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="单位">
        <el-input
          v-model="searchData.organization"
          placeholder="单位名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="文号">
        <el-input
          v-model="searchData.documentNum"
          placeholder="文号"
          clearable
        />
      </el-form-item>
      <el-form-item label="标题">
        <el-input
          v-model="searchData.title"
          placeholder="标题"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          :disabled="loadingSearch"
          icon="el-icon-search"
          @click="getDataList"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="loadingSearch"
          icon="el-icon-plus"
          @click="addClick"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
      />
      <el-table-column
        prop="organization"
        label="单位"
        align="center"
      />
      <el-table-column
        prop="documentNum"
        label="文号"
        align="center"
      />
      <el-table-column
        prop="title"
        label="标题"
        align="center"
      />
      <el-table-column
        prop="createdTime"
        label="创建时间"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="changeClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="changeClick(scope.row.id, true)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delInfoClick(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="loadingSearch"
      style="margin: 0 20px 0 0"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getDataList"
      @size-change="getDataList"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <!-- 详情弹窗 -->
      <el-dialog
        class="normal-dialog"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
        width="600px"
        title="资料详情"
      >
        <CheckInfo
          v-if="showInfoDialog"
          :infoId="infoId"
          :isNew="isNew"
          :editable="editable"
          @succ="infoSuccEvt"
        />
      </el-dialog>
    </div>
  </SearchTable>
</template>
