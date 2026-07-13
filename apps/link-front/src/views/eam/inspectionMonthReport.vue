<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getReportTable } from '@/http/dev_new/inspectionMonthReport-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      loading: false,
      total: 0,
      dataRule: {
        companyId: [{ required: true, message: '所属公司不能为空', trigger: 'change' }],
      },
      // 巡检执行班次
      inspection: {
        total: 0,
        abnormal: 0,
        normal: 0,
      },
      monthList: [
        { label: '1月', value: 1 },
        { label: '2月', value: 2 },
        { label: '3月', value: 3 },
        { label: '4月', value: 4 },
        { label: '5月', value: 5 },
        { label: '6月', value: 6 },
        { label: '7月', value: 7 },
        { label: '8月', value: 8 },
        { label: '9月', value: 9 },
        { label: '10月', value: 10 },
        { label: '11月', value: 11 },
        { label: '12月', value: 12 },
      ],
      searchData: {
        pageNum: 1,
        pageSize: 10,
        companyId: '', // 所属企业
        departmentId: '', // 所属部门
        year: '',
        month: '',
      },
      tableData: [],
    }
  },
  computed: {
    informationShow() {
      let pr = ''
      if (this.tableData.length) {
        if (this.searchData.companyId) {
          pr += `${this.searchData.companyName}`
        }
        if (this.searchData.departmentId) {
          pr += `其中${this.searchData.departmentName}`
        }
        if (this.searchData.year) {
          pr += `，${this.searchData.year}年`
        }
        if (this.searchData.month) {
          pr += `${this.searchData.month}月`
        }
        if (this.inspection.total) {
          pr += `共巡检班次${this.inspection.total}班，`
        }
        if (this.inspection.normal) {
          const num = (this.inspection.normal / this.inspection.total) * 100
          pr += `正常${this.inspection.normal}班占${num}%。`
        }
        if (this.inspection.abnormal) {
          const num = (this.inspection.abnormal / this.inspection.total) * 100
          pr += `异常${this.inspection.abnormal}班占${num}%。`
        }
      }
      return pr
    },
  },
  created() {
    // this.getTableData()
  },
  methods: {
    // 获取公司名称部门名称
    getDepartmenName(value, name) {
      this.searchData.companyId = value
      this.searchData.companyName = name
      this.searchData.departmentId = ''
      this.searchData.departmentName = ''
    },
    // 搜索
    searchFn() {
      this.searchData.pageNum = 1
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.getTableData()
        }
      })
    },
    //  获取列表信息
    getTableData() {
      this.isLoading = true
      getReportTable(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.pageInfo.total // 条数
            // 巡检执行班次
            this.inspection.total = data.result.total || 0
            this.inspection.abnormal = data.result.abnormal || 0
            this.inspection.normal = data.result.normal || 0
            // 列表信息
            this.tableData = data.result.pageInfo.list || []
            this.tableData.forEach((item, index) => {
              item.companyId = this.searchData.companyId
              item.companyName = this.searchData.companyName
              item.scheduleTime = `${data.result.pageInfo.list[index].scheduleStartTime}至${data.result.pageInfo.list[index].scheduleEndTime}`
            })
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
    viewFn(id) {
      this.$router.push({
        path: `/detail/inspectionRecordDetail/${id}`,
      })
    },
    resetEvent() {
      this.searchData.companyId = ''
      this.searchData.departmentId = ''
      this.searchData.year = ''
      this.searchData.month = ''
    },
  },
}
</script>

<template>
  <div class="page-container">
    <!--  巡检月报表 -->
    <!-- <SearchTable v-loading="loading"> -->
    <!-- 搜索栏 -->
    <ECard typ="search">
      <el-form
        ref="inputForm"
        v-loading="loading"
        inline
        label-width="100"
        :model="searchData"
        :rules="dataRule"
      >
        <el-row>
          <el-form-item
            label="公司"
            prop="companyId"
          >
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="searchData.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="getDepartmenName"
            />
          </el-form-item>
          <el-form-item
            label="所属部门"
            prop="departmentId"
          >
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :url="
                searchData.companyId
                  ? `sysDepartment/companyDepartment/${searchData.companyId}`
                  : ''
              "
              :value="searchData.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="
                (value, name) => {
                  searchData.departmentId = value
                  searchData.departmentName = name
                }
              "
            />
          </el-form-item>
          <el-form-item
            label="年份"
            prop="year"
          >
            <el-date-picker
              v-model="searchData.year"
              format="yyyy"
              value-format="yyyy"
              type="year"
              placeholder="选择年"
            />
          </el-form-item>
          <el-form-item
            label="月份"
            prop="departmentId"
          >
            <el-select
              v-model="searchData.month"
              clearable
              filterable
              placeholder="请选择月份"
            >
              <el-option
                v-for="item in monthList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
              icon="el-icon-refresh-right"
              class="reset"
              @click="resetEvent"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
        <el-row>
          <el-tag
            v-if="informationShow"
            type="success"
          >
            {{ informationShow }}
          </el-tag>
        </el-row>
      </el-form>
    </ECard>
    <ECard style="height: calc(100vh - 260px)">
      <!-- 表格 -->
      <el-table
        :data="tableData"
        height="96%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="公司"
          align="center"
          prop="companyName"
        />
        <el-table-column
          label="任务名称"
          align="center"
          prop="taskName"
          min-width="180"
        />
        <el-table-column
          label="排班时间"
          align="center"
          prop="scheduleTime"
          min-width="200"
        />
        <el-table-column
          label="所属部门"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="巡检岗位"
          align="center"
          prop="postName"
        />
        <el-table-column
          label="责任人"
          align="center"
          prop="liableUserName"
        />
        <el-table-column
          label="巡检人"
          align="center"
          prop="executeUsersName"
        />
        <el-table-column
          label="开始时间"
          align="center"
          prop="executeStartTime"
        />
        <el-table-column
          label="结束时间"
          align="center"
          prop="executeEndTime"
        />
        <el-table-column
          label="结果"
          align="center"
          prop="abnormal"
        >
          <template slot-scope="props">
            <el-tag
              v-if="!props.row.abnormal"
              type="success"
            >
              正常
            </el-tag>
            <el-tag
              v-if="props.row.abnormal"
              type="danger"
            >
              异常
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="120"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="viewFn(scope.row.scheduleRecordId)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard type="footer">
      <!-- 分页器 -->
      <el-pagination
        style="text-align: right"
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

    <!-- </SearchTable> -->
  </div>
</template>
