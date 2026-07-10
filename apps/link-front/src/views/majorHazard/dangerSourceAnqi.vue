<script>
import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api'
import { dangerSourceDel, getDangerSourceByPage } from '@/http/major-hazard/dangerSourceAnqi-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'

export default {
  name: 'dangerSourceAnqi',
  components: { AllDepartmentTree },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        isPage: true,
        departmentId: '',
      },
      tableData: [],
      levelList: [{ dictCode: '一级', dictName: '一级' }],
      // 风险区域列表
      riskRegionList: [],
    }
  },
  computed: {
    setRiskRegionDes() {
      return function (id) {
        let des = '--'
        for (const item of this.riskRegionList) {
          if (item.id == id) {
            des = item.name
            break
          }
        }
        return des
      }
    },
  },
  async created() {
    this.getTableData()
    // 风险区域表
    const areaRes = await getRiskAreaAll()
    this.riskRegionList = areaRes.data.result || []
  },
  methods: {
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data && data.onlyTreeUse)
        return

      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.departmentId = ''
      }
      this.searchFn()
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getDangerSourceByPage(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
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
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      switch (type) {
        case 'add':
          this.$router.push({
            path: `/detail/danger/${null}/add`,
          })
          break
        case 'edit':
          this.$router.push({
            path: `/detail/danger/${infoData.id}/edit`,
          })
          break
        case 'view':
          this.$router.push({
            path: `/detail/danger/${infoData.id}/view`,
          })
          break
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此重大危险源' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        dangerSourceDel(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败', err)
          })
      })
    },
    resetSearch() {
      this.searchData = {
        pageNum: 1,
        pageSize: 10,
        isPage: true,
        departmentId: '',
      }
      // this.getTableData()
      this.$refs.companyTree.refreshTree()
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    :isShowSearch="true"
  >
    <!-- 左侧树 -->
    <AllDepartmentTree
      slot="tree"
      ref="companyTree"
      :hasResponsible="false"
      @treeNodeTap="treeNodeTap"
    />

    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
      label-width="100"
    >
      <el-row>
        <el-form-item label="重大危险源名称">
          <el-input
            v-model="searchData.unifyName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item label="重大危险源等级">
          <el-select
            v-model="searchData.hazardLevel"
            placeholder="重大危险源等级"
            style="width: 100%"
          >
            <el-option
              v-for="item in levelList"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="searchFn"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            size="small"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <!-- <div slot='auxiliary' class='auxiliary-button'>
            <el-button type='primary' plain icon='el-icon-plus' @click="changeFn('add')">新增</el-button>
        </div> -->

    <!-- 表格 -->
    <el-table
      slot="table"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="100%"
      :border="true"
      class="customer-table"
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
      />
      <el-table-column
        label="统一编号"
        align="center"
        prop="unifyRef"
        min-width="150"
      />
      <el-table-column
        label="危险源名称"
        align="center"
        prop="unitName"
      />
      <el-table-column
        label="重大危险源等级"
        align="center"
        prop="hazardLevel"
      />
      <el-table-column
        label="危化品名称"
        align="center"
        prop="chemistryNames"
      />
      <el-table-column
        label="所属风险区域"
        align="center"
        prop="riskRegion"
      >
        <template slot-scope="scope">
          <span>{{ setRiskRegionDes(scope.row.riskRegion) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('dangerSource_anqi_view')"
            type="text"
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('dangerSource_anqi_modify')"
            style="color: var(--ky-warning)"
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('dangerSource_anqi_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      style="padding-top: 10px"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />
  </TreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
