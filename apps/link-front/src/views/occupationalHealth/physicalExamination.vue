<script>
import { getExaminationN, removeExaminationBook } from '@/http/occupationalHealth/sanitation-api'
import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'

import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import NExaDialog from './components/NExaDialog'

export default {
  name: 'physicalExamination',
  components: { OwnDeparmentTree, NExaDialog },
  data() {
    const year = new Date().getFullYear()
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        postName: '',
        userName: '',
        harmFactor: '',
      },
      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      jobList: [],
      yearData: [
        {
          label: `${year - 2}体检状态`,
          year: year - 2,
          type: 'occupationalDiseasesTypeMap',
          value: 1,
        },
        {
          label: `${year - 2}体检结果`,
          year: year - 2,
          type: 'examinationResultMap',
          value: 2,
        },
        {
          label: `${year - 2}体检结论`,
          year: year - 2,
          type: 'examinationConclusionMap',
          value: 3,
        },
        {
          label: `${year - 1}体检状态`,
          year: year - 1,
          type: 'occupationalDiseasesTypeMap',
          value: 4,
        },
        {
          label: `${year - 1}体检结果`,
          year: year - 1,
          type: 'examinationResultMap',
          value: 5,
        },
        {
          label: `${year - 1}体检结论`,
          year: year - 1,
          type: 'examinationConclusionMap',
          value: 6,
        },
        {
          label: `${year}体检状态`,
          year,
          type: 'occupationalDiseasesTypeMap',
          value: 7,
        },
        {
          label: `${year}体检结果`,
          year,
          type: 'examinationResultMap',
          value: 8,
        },
        {
          label: `${year}体检结论`,
          year,
          type: 'examinationConclusionMap',
          value: 9,
        },
      ],
    }
  },
  computed: {
    setHarmFactor() {
      return function (val) {
        let msg = '--'
        const hazardsList = this.$dictUtils.getDictList('occupational_hazards')
        hazardsList.forEach((res) => {
          if (val == res.id) {
            msg = res.dictName
          }
        })
        return msg
      }
    },
  },
  created() {
    this.getTableData()

    const companyId = this.$store.state.user.user.companyId
    if (companyId) {
      this.getJobList(companyId)
    }
  },
  methods: {
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      if (data) {
        this.searchData.departmentId = data.id
      }
      else {
        this.searchData.depratmentId = ''
      }
      this.searchFn()
    },
    // 获取部门下的岗位
    getJobList(companyId) {
      getAllPostByCompanyFn(companyId)
        .then(({ data }) => {
          if (data.success) {
            this.jobList = data.result || []
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getExaminationN(this.searchData)
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
      this.dialogMethod = type
      switch (type) {
        case 'edit':
          this.dialogTitle = '编辑体检记录台账'
          this.visibleForm = true
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看体检记录台账'
          this.visibleForm = true
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此体检记录台账' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeExaminationBook(v.id)
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
            this.$message.error('删除失败')
          })
      })
    },
    resetSearch() {
      this.searchData.postName = ''
      this.searchData.userName = ''
      this.searchData.harmFactor = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        size="mini"
        label-width="100"
      >
        <el-row>
          <el-form-item label="人员姓名">
            <el-input
              v-model="searchData.userName"
              placeholder="请输入名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="岗位名称">
            <el-select
              v-model="searchData.postName"
              class="small-row"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in jobList"
                :key="item.id"
                :label="item.postName"
                :value="item.postName"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="体检类型">
            <el-select
              v-model="searchData.harmFactor"
              class="small-row"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('occupational_hazards')"
                :key="item.id"
                :label="item.dictName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <EButton
              type="primary"
              btnIcon="el-icon-search"
              @click="searchFn"
            >
              查询
            </EButton>
            <EButton
              class="reset"
              btnIcon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </EButton>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="100%"
        :border="false"
        class="customer-table"
      >
        <!-- <el-table-column type="index" width="50" align="center" label="序号" /> -->
        <el-table-column
          label="体检档案编号"
          align="center"
          prop="medicalExaminationNo"
          min-width="120"
        />
        <el-table-column
          label="姓名"
          align="center"
          prop="userName"
        />
        <el-table-column
          label="性别"
          align="center"
          prop="sex"
          min-width="150"
        />
        <el-table-column
          label="年龄"
          align="center"
          prop="age"
        />
        <el-table-column
          label="岗位"
          align="center"
          prop="postName"
        />
        <el-table-column
          label="体检类型"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ setHarmFactor(scope.row.harmFactor) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-for="item in yearData"
          :key="item.value"
          :label="item.label"
          align="center"
          min-width="180"
        >
          <template slot-scope="scope">
            <span v-if="item.type == 'examinationConclusionMap'">{{
              scope.row[item.type][item.year] == 1
                ? '合格'
                : scope.row[item.type][item.year] == 0
                  ? '不合格'
                  : '--'
            }}</span>
            <span v-else>{{ scope.row[item.type][item.year] || '--' }}</span>
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
              v-if="hasBtnPermission('physical_examination_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <!--          <el-button @click="changeFn('edit',scope.row)" style='color:var(&#45;&#45;ky-warning);' type='text'>编辑</el-button> -->
            <!--          <el-button @click='delFn(scope.row)' type='text' style='color:var(&#45;&#45;ky-danger);'>删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="710px"
      :visible.sync="visibleForm"
    >
      <NExaDialog
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
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
