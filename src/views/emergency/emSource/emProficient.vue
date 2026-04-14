<script>
import { emProficientDel, emProficientGetByPage } from '@/http/emergency/emsource-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import ProficientInfo from './components/ProficientInfo.vue'

export default {
  components: {
    CompanyTree,
    ProficientInfo,
  },
  data() {
    return {
      propData: {
        companyData: {}, // 公司树结构
        companyId: '',
        companyName: '',
        isNew: false, // 是否新增
        editable: false, // 是否可编辑
        infoId: undefined, // 详情id
      },
      isLoading: false,
      total: 0, // 数据总数
      showInfoDialog: false, // 是否打开详情弹窗
      // 搜索数据
      searchData: {
        companyId: '',
        fullName: '',
        professionTerritory: '',
        remark: '',
        pageNum: 1,
        pageSize: 20,
      },
      // 表格数据
      tableData: [],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    /* 点击公司树的item */
    treeNodeTap(data) {
      if (data) {
        this.searchData.companyId = data.id
        this.propData.companyId = data.id
        this.propData.companyName = data.name
        this.getDataList() // 再次请求数据
      }
      else {
        delete this.searchData.companyId
      }
    },
    /* 点击重置 */
    refreshClick() {
      this.searchData = {
        companyId: '',
        fullName: '',
        professionTerritory: '',
        remark: '',
        pageNum: 1,
        pageSize: 20,
      }
      this.getDataList()
    },
    /* 请求列表数据 */
    getDataList() {
      this.isLoading = true
      emProficientGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求专家数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求专家数据出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 新增数据 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.propData.companyData = companyData
      this.propData.infoId = undefined
      this.propData.isNew = true
      this.propData.editable = true
      this.showInfoDialog = true
    },
    /* 查看或修改数据 */
    checkInfoClick(id, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      this.propData.companyData = companyData
      this.propData.infoId = id
      this.propData.editable = editable
      this.propData.isNew = false
      this.showInfoDialog = true
    },
    /* 删除危废数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          emProficientDel(item.row.id)
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
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    /* 保存成功回调 */
    infoSuccEvt(isRefresh) {
      this.showInfoDialog = false
      if (isRefresh) {
        this.getDataList()
      }
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <CompanyTree
      slot="tree"
      ref="companyTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="专家姓名">
        <el-input
          v-model="searchData.fullName"
          placeholder="专家姓名"
          clearable
        />
      </el-form-item>
      <el-form-item label="专业领域">
        <el-input
          v-model="searchData.professionTerritory"
          placeholder="专业领域"
          clearable
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="searchData.remark"
          placeholder="备注"
          clearable
        />
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
          :disabled="isLoading"
          icon="el-icon-search"
          @click="getDataList"
        >
          查询
        </el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="isLoading"
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
      :data="tableData"
      height="100%"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50"
        align="center"
      />
      <el-table-column
        label="专家姓名"
        prop="fullName"
        align="center"
      />
      <el-table-column
        label="专家电话"
        prop="phone"
        align="center"
      />
      <el-table-column
        label="专业领域"
        prop="professionTerritory"
        align="center"
      />
      <el-table-column
        label="学历"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('education', scope.row.education, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="专业"
        prop="profession"
        align="center"
      />
      <el-table-column
        label="备注"
        prop="remark"
        align="center"
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
            @click="delInfoClick(scope)"
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
      @current-change="getDataList"
      @size-change="getDataList"
    />
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :visible.sync="showInfoDialog"
      :close-on-click-modal="false"
      width="800px"
      title="应急专家"
    >
      <ProficientInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>
