<script>
import { getRiskAreaAll } from '@/http/defense/shandong/riskControl-api'
import { dangerSourceDel, getImportantSourceByPage } from '@/http/major-hazard/dangerSourceAnqi-api'
import DeptTree from '@/views/common-ui/OwnDeparmentTree.vue'

export default {
  name: 'importanceSource',
  components: { DeptTree },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        isPage: true,
        queryKey: '',
        departmentId: '',
        showMore: false,
      },
      tableData: [],
      levelList: [
        { dictCode: 0, dictName: '低风险' },
        { dictCode: 1, dictName: '一般风险' },
        { dictCode: 2, dictName: '较大风险' },
        { dictCode: 3, dictName: '重大风险' },
      ],
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
    toggleMore() {
      this.searchData.showMore = !this.searchData.showMore
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getImportantSourceByPage(this.searchData)
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
            path: `/detail/important/${null}/add`,
          })
          break
        case 'edit':
          this.$router.push({
            path: `/detail/important/${infoData.id}/edit`,
          })
          break
        case 'view':
          this.$router.push({
            path: `/detail/important/${infoData.id}/view`,
          })
          break
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此重要危险源' + ' ?', '提示', {
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
        showMore: false,
      }
      this.$refs.deptTree.refreshTree()
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
    <DeptTree
      slot="tree"
      ref="deptTree"
      @treeNodeTap="treeNodeTap"
    />

    <!-- 搜索栏 -->
    <el-form
      slot="search"
      label-width="36px"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="重要危险源名称"
            label-width="100px"
          >
            <el-input
              v-model="searchData.unitName"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item
            label="重要危险源风险等级"
            label-width="120px"
          >
            <el-select
              v-model="searchData.hazardLevel"
              placeholder="重要危险源风险等级"
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
        </el-col>
        <el-col
          v-if="searchData.showMore"
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item label="类型">
            <el-select
              v-model="searchData.unitType"
              placeholder="类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('analysis_type')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="searchData.showMore"
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item label="来源">
            <el-select
              v-model="searchData.source"
              placeholder="来源"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('analysis_source')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="searchData.showMore"
          :span="8"
          style="padding-left: 10px"
        >
          <el-form-item
            label="风险区域"
            label-width="60px"
          >
            <el-select
              v-model="searchData.riskRegion"
              placeholder="风险区域"
              style="width: 100%"
            >
              <el-option
                v-for="item in riskRegionList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="8"
          style="padding-left: 10px"
        >
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
          <el-button
            type="text"
            style="margin-left: 8px"
            @click="toggleMore"
          >
            {{ searchData.showMore == true ? '收起' : '高级筛选' }}
            <i :class="searchData.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-col>
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
        label="责任部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="区域"
        align="center"
        prop="region"
      />
      <el-table-column
        label="负责人"
        align="center"
        prop="liableUserName"
      />
      <el-table-column
        label="重要危险源名称"
        align="center"
        prop="unitName"
        width="110"
      />
      <el-table-column
        label="重要危险源风险等级"
        align="center"
        prop="hazardLevel"
        width="130"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.hazardLevel == 0
              ? '低风险'
              : scope.row.hazardLevel == 1
                ? '一般风险'
                : scope.row.hazardLevel == 2
                  ? '较大风险'
                  : scope.row.hazardLevel == 3
                    ? '重大风险'
                    : ''
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="重要危险源描述"
        align="center"
        prop="unitDesc"
        width="110"
      />
      <el-table-column
        label="来源"
        align="center"
        prop="source"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_source', scope.row.source) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        align="center"
        prop="unitType"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险区域"
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
            v-if="hasBtnPermission('importanceSource_anqi_view')"
            type="text"
            @click="changeFn('view', scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('importanceSource_anqi_modify')"
            style="color: var(--ky-warning)"
            type="text"
            @click="changeFn('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('importanceSource_anqi_delete')"
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
