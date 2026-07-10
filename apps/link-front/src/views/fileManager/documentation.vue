<script>
import moment from 'moment'
import { docKnowledgeBaseDel, docKnowledgeBaseGetByPage } from '@/http/file-manager/fileDoc-api.js'
import FileInfo from './components/FileInfo.vue'
import FileTypeTree from './components/FileTypeTree.vue'

export default {
  components: {
    FileTypeTree,
    FileInfo,
  },
  data() {
    return {
      fileStateList: [
        { name: '评审中', value: 0 },
        { name: '评审通过', value: 1 },
        { name: '已退回', value: 2 },
      ],
      propData: {
        editable: false,
      },
      dialogTitle: '',
      showFileInfoDialog: false,
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      checkFileId: '', // 查看文件列表的id
    }
  },
  computed: {
    setDate() {
      return function (timestamp) {
        let date = '-'
        if (timestamp) {
          date = moment(timestamp).format('YYYY/MM/DD')
        }
        return date
      }
    },
    setStateDes() {
      return function (state) {
        let des = '-'
        for (const item of this.fileStateList) {
          if (item.value == state) {
            des = item.name
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.searchClick()
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
      this.$refs.leftTree.refreshTree()
    },
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      docKnowledgeBaseGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取分页列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取分页列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.docType = {
          id: data.id,
          level: data.level,
        }
      }
      else {
        delete this.searchData.docType
      }
      this.queryClick()
    },
    /* 关闭文档详情弹窗事件 */
    fileInfoDialogEvt(isRefresh) {
      this.showFileInfoDialog = false
      if (isRefresh) {
        this.searchClick()
      }
    },
    /* 新增数据 */
    addClick() {
      this.dialogTitle = '新增文档'
      this.propData = { editable: true }
      this.showFileInfoDialog = true
    },
    /* 查看/修改数据 */
    checkInfoClick(infoId, editable) {
      this.dialogTitle = '文档详情'
      this.propData = {
        editable,
        infoId,
      }
      this.checkFileId = infoId
      this.showFileInfoDialog = true
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          docKnowledgeBaseDel(item.row.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功！')
                this.searchClick()
              }
              else {
                this.$message.warning(res.data.message || '删除失败')
              }
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <FileTypeTree
      slot="tree"
      ref="leftTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="文档标题">
        <el-input v-model="searchData.title" />
      </el-form-item>
      <el-form-item label="上传时间">
        <el-date-picker
          v-model="searchData.startTime"
          style="width: 180px"
          type="datetime"
          value-format="timestamp"
          placeholder="开始时间"
        />
        <span style="margin: 0 5px">至</span>
        <el-date-picker
          v-model="searchData.endTime"
          style="width: 180px"
          type="datetime"
          value-format="timestamp"
          placeholder="结束时间"
        />
      </el-form-item>
      <!-- 没数据 暂时隐藏 -->
      <el-form-item
        v-if="false"
        label="文档状态"
      >
        <el-select v-model="searchData.state">
          <el-option
            v-for="item in fileStateList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
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
          type="success"
          size="mini"
          @click="addClick"
        >
          新建
        </el-button>
        <!-- <el-button type="primary" size="mini">发布</el-button> -->
        <!-- <el-button type="warning" size="mini">归档</el-button>
        <el-button type="danger" size="mini">作废</el-button> -->
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
        label="序号"
      />
      <el-table-column
        label="文档标题"
        align="center"
        prop="title"
      />
      <el-table-column
        label="知识库类别"
        align="center"
        prop="type.name"
      />
      <!-- 没数据 暂时隐藏 TODO -->
      <el-table-column
        v-if="false"
        label="状态"
        align="center"
      >
        <template slot-scope="scope">
          {{ setStateDes(scope.row.state) }}
        </template>
      </el-table-column>
      <el-table-column
        label="发布单位"
        align="center"
        prop="issuedDept"
      />
      <el-table-column
        label="发布文号"
        align="center"
        prop="issuedNumber"
      />
      <el-table-column
        label="实施日期"
        align="center"
      >
        <template slot-scope="scope">
          {{ setDate(scope.row.executeTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="修订日期"
        align="center"
      >
        <template slot-scope="scope">
          {{ setDate(scope.row.reviseTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="上传时间"
        align="center"
      >
        <template slot-scope="scope">
          {{ setDate(scope.row.fileUploadTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="createdName"
      />
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
            @click="checkInfoClick(scope.row.id, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row.id, true)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            style="color: var(--ky-danger)"
            @click="delClick(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
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
        :title="dialogTitle"
        :visible.sync="showFileInfoDialog"
        width="800px"
        append-to-body
        :close-on-click-modal="false"
      >
        <FileInfo
          v-if="showFileInfoDialog"
          v-bind="propData"
          :checkFileId="checkFileId"
          @close="fileInfoDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
