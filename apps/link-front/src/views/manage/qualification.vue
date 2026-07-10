<!-- 企业资质管理页面 -->
<script>
import {
  deleteQualificationFn,
  getQualificationListFn,
} from '@/http/safe-production/qualification-manage-api'
import CompanyTree from '@/views/common-ui/CompanyTree.vue'
import QualificationForm from './form/QualificationForm'

export default {
  components: {
    CompanyTree,
    QualificationForm,
  },
  data() {
    return {
      isLoading: false,
      // 状态下拉列表
      stateList: [
        { name: '正常', value: false, id: 1 },
        { name: '过期', value: true, id: 2 },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        fuzzyQuery: '',
        isExpired: '',
        companyId: '',
      },
      tableData: [],
      total: 0,
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    /* 点击搜索 */
    searchClick() {
      this.isLoading = true
      getQualificationListFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击搜索 */
    queryClick() {
      this.searchData.pageNum = 1
      this.searchClick()
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
    /* 点击添加 */
    addClick() {
      this.$refs.qualificationForm.init('add', { id: '' })
    },
    /* 点击编辑 */
    editFn(v) {
      this.$refs.qualificationForm.init('edit', v)
    },
    viewFn(v) {
      this.$refs.qualificationForm.init('view', v)
    },
    /* 点击删除 */
    delClick(item) {
      this.$confirm(`您确定要删除${item.qualificationName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.isLoading = true
          deleteQualificationFn(item.id)
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
    resetButton() {
      this.searchData.fuzzyQuery = ''
      this.searchData.isExpired = ''
      this.searchClick()
    },
  },
}
</script>

<template>
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
      label-width="100"
    >
      <el-form-item label="关键字">
        <el-input
          v-model="searchData.fuzzyQuery"
          placeholder="名称/编号/发证单位"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchData.isExpired"
          clearable
        >
          <el-option
            v-for="item in stateList"
            :key="item.id"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="queryClick"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-right"
          @click="resetButton"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        v-if="hasBtnPermission('manage_qualification_add')"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addClick"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="companyName"
      >
        <template slot-scope="scope">
          <span
            class="check"
            @click="viewFn(scope.row)"
          >{{ scope.row.companyName }}</span>
        </template>
      </el-table-column>>
      <el-table-column
        label="资质证照名称"
        align="center"
        prop="qualificationName"
        width="140"
      />
      <el-table-column
        label="编号"
        align="center"
        prop="certificateNo"
      />
      <el-table-column
        label="证照等级"
        align="center"
        prop="qualificationLevel"
      />
      <el-table-column
        label="发证单位"
        align="center"
        prop="issuingAuthority"
      />
      <el-table-column
        label="发证日期"
        align="center"
        prop="issuingDate"
      />
      <el-table-column
        label="有效日期"
        align="center"
        prop="expirationDate"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remarks"
      />
      <el-table-column
        label="状态"
        align="center"
        width="60px"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.isExpired ? 'danger' : 'success'">
            {{
              scope.row.isExpired ? '过期' : '正常'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="140"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewFn(scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('manage_qualification_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editFn(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-if="hasBtnPermission('manage_qualification_delete')"
            style="color: var(--ky-danger)"
            type="text"
            @click="delClick(scope.row)"
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
      background
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
    <!-- 弹窗 -->
    <qualification-form
      slot="dialog"
      ref="qualificationForm"
      @refreshDataList="searchClick"
    />
  </TreeTable>
</template>
