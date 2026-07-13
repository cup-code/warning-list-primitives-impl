<script>
import {
  majorHazardChemistryByPage,
  majorHazardChemistryDel,
} from '@/http/major-hazard/dangerChemical-api.js'
import { showFileWindow } from '@/utils/checkFile.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import ChemicalBookInfo from './components/ChemicalBookInfo.vue'

export default {
  components: {
    CompanyTree,
    ChemicalBookInfo,
  },
  data() {
    return {
      dialogTitle: '',
      isLoading: false,
      showInfoDialog: false,
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
      propData: {},
      tableData: [],
      total: 0,
    }
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
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      majorHazardChemistryByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
      }
      else {
        delete this.searchData.companyId
      }
      this.queryClick()
    },
    /* 点击新增 */
    addClick() {
      this.dialogTitle = '新增危化品'
      this.propData = {
        editable: true,
        companyId: this.searchData.companyId,
      }
      this.showInfoDialog = true
    },
    /* 点击查看/修改 */
    changeClick(infoId, editable) {
      this.dialogTitle = '危化品详情'
      this.propData = { editable, infoId }
      this.showInfoDialog = true
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
          majorHazardChemistryDel(item.row.id)
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
    /* 关闭弹窗事件 */
    closeDialogEvt(isRefresh) {
      this.showInfoDialog = false
      // if (isRefresh) {
      this.searchClick()
      // }
    },
    /* 点击预览说明书 */
    showFileClick(url) {
      showFileWindow(url)
    },
  },
}
</script>

<template>
  <!-- 危化品台账 -->
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.keywords"
          placeholder="危化品名称/编码"
        />
      </el-form-item>
      <el-form-item>
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
          :disabled="!searchData.companyId"
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
        label="所属公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="UN号"
        align="center"
        prop="unNumber"
      />
      <el-table-column
        label="CAS号"
        align="center"
        prop="casNumber"
      />
      <el-table-column
        label="危规号"
        align="center"
        prop="dangerousNumber"
      />
      <el-table-column
        label="中文名"
        align="center"
        prop="name"
      />
      <el-table-column
        label="存储数量(吨)"
        align="center"
        prop="maxStore"
      />
      <el-table-column
        label="存储地点及使用"
        align="center"
        prop="storeSite"
      />>
      <el-table-column
        label="是否重点监管危化品"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.isEmphasis ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="化学品安全说明书(SDS)"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showFileClick(scope.row.accessory.urlPath)"
          >
            {{ scope.row.accessory.originalName }}
          </el-button>
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
        class="fixed-dialog"
        :title="dialogTitle"
        width="800px"
        :visible.sync="showInfoDialog"
        :close-on-click-modal="false"
        @close="closeDialogEvt"
      >
        <ChemicalBookInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </TreeTable>
</template>
