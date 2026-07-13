<script>
import { emTeamDel, emTeamGetByPage } from '@/http/emergency/emsource-api.js'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import GroupInfo from './components/GroupInfo.vue'

export default {
  components: {
    GroupInfo,
    CompanyTree,
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
        teamType: '',
        name: '',
        pageNum: 1,
        pageSize: 20,
      },
      teamTypeList: [], // 队伍类型
      // 表格数据
      tableData: [],
    }
  },
  created() {
    this.getDataList()
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.teamTypeList = dicList.team_type
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
        teamType: '',
        name: '',
        pageNum: 1,
        pageSize: 20,
      }
      this.getDataList()
    },
    /* 请求列表数据 */
    getDataList() {
      this.isLoading = true
      emTeamGetByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '请求列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('请求列表数据出错！', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 新增专家数据 */
    addClick() {
      const companyData = this.$refs.companyTree.getTreeData()
      this.propData.companyData = companyData
      this.propData.infoId = undefined
      this.propData.isNew = true
      this.propData.editable = true
      this.showInfoDialog = true
    },
    /* 查看或修改专家数据 */
    checkInfoClick(id, editable) {
      const companyData = this.$refs.companyTree.getTreeData()
      this.propData.companyData = companyData
      this.propData.infoId = id
      this.propData.editable = editable
      this.propData.isNew = false
      this.showInfoDialog = true
    },
    /* 删除专家数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          emTeamDel(item.row.id)
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
      <el-form-item label="队伍类型">
        <el-select
          v-model="searchData.teamType"
          placeholder="队伍类型"
          clearable
        >
          <el-option
            v-for="item in teamTypeList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="队伍名称">
        <el-input
          v-model="searchData.name"
          placeholder="队伍名称"
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
        width="50"
        label="序号"
        align="center"
      />
      <el-table-column
        label="队伍类型"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('team_type', scope.row.teamType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="队伍名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="负责人姓名"
        align="center"
        prop="headName"
      />
      <el-table-column
        label="负责人电话"
        align="center"
        prop="headPhone"
        min-width="100px"
      />
      <el-table-column
        label="分管负责人姓名"
        align="center"
        prop="viceHeadName"
        min-width="105px"
      />
      <el-table-column
        label="分管负责人电话"
        align="center"
        prop="viceHeadPhone"
        min-width="105px"
      />
      <el-table-column
        label="队员人数"
        align="center"
        prop="teamPersonNum"
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
    <!-- 弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :visible.sync="showInfoDialog"
      :close-on-click-modal="false"
      width="800px"
      title="应急队伍详情"
      :append-to-body="true"
    >
      <GroupInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @succ="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>
