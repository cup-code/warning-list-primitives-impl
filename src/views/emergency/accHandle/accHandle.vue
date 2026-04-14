<script>
import moment from 'moment'
import FileItem from '@/views/common-ui/FileItem.vue'
import HandleInfo from './HandleInfo.vue'

export default {
  components: {
    HandleInfo,
    FileItem,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      showInfoDialog: false,
      showFileDialog: false,
      checkFileId: '', // 查看文件id
      // 详情组件传参
      propData: {},
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD HH:mmm:ss')
        }
        return date
      }
    },
  },
  created() {
    // const allDic = JSON.parse(sessionStorage.getItem('dictList'))
    // this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        pageNum: 1,
        pageSize: 20,
      }
      this.searchClick()
    },
    /* 点击搜索 */
    searchClick() {
      // this.isLoading = true
      // emRehearsalPlanByPage(this.searchData)
      //   .then((res) => {
      //     if (res.data.success) {
      //       this.tableData = res.data.result.list
      //       this.total = res.data.result.total
      //     } else {
      //       this.$message.warning(res.data.message || '获取列表失败')
      //     }
      //   })
      //   .catch((err) => {
      //     this.$message.error('获取列表出错', err)
      //   })
      //   .finally(() => {
      //     this.isLoading = false
      //   })
    },
    /* 查看附件 */
    showFileClick(id) {
      this.checkFileId = id
      this.showFileDialog = true
    },
    /* 点击新增 */
    addClick() {},
    /* 点击编辑 */
    editClick(infoId) {
      this.propData = { infoId }
      this.showInfoDialog = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
  },
}
</script>

<template>
  <SearchTable v-loading="isLoading">
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="事件名称">
        <el-input v-model="searchData.evtName" />
      </el-form-item>
      <el-form-item label="事件内容">
        <el-input v-model="searchData.evtCtx" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-refresh-right"
          @click="refreshClick"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
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
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="事件名称"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="事件内容"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="事件地点"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="事件时间"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ setDate(scope.row.drillTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="事件状态"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'danger' : 'warning'">
            {{
              scope.row.status ? '处理中' : '已上报'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="上报人"
        align="center"
        prop="person"
      />
      <el-table-column
        label="上报人电话"
        align="center"
        prop="personNum"
      />
      <el-table-column
        label="附件"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.id"
            type="success"
            @click="showFileClick(scope.row.id)"
          >
            查看
          </el-button>
          <el-tag v-else>
            无
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="50"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="editClick(scope.row.id)"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
      style="margin: 0 20px 0 0"
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="normal-dialog"
        title="应急预案选择"
        :visible.sync="showInfoDialog"
        width="850px"
        append-to-body
        :close-on-click-modal="false"
      >
        <HandleInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <el-dialog
        title="附件列表"
        :visible.sync="showFileDialog"
        width="300px"
        append-to-body
        :close-on-click-modal="false"
      >
        <FileItem
          v-if="showFileDialog"
          :checkFileId="checkFileId"
          @close="showFileDialog = false"
        />
      </el-dialog>
    </div>
  </SearchTable>
</template>
