<script>
import { getExaminationBookDetails } from '@/http/occupationalHealth/sanitation-api'

export default {
  name: 'NExaDialog',
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      inputForm: {
        companyId: '',
        departmentId: '',
        workshopId: '',
        userId: '',
        userName: '',
        sex: '',
        age: '',
        postName: '',
        examinationConclusionData: {},
      },
      // -------
      searchData: {
        pageSize: 4,
        pageNum: 1,
        harmFactor: '',
        userId: '',
      },
      infoData: {},
      tableData: [
        {
          medicalExaminationNo: '635345454',
          userName: '张三',
          sex: '男',
          age: 26,
          postName: '经理',
        },
        {
          medicalExaminationNo: '635345454',
          userName: '张三',
          sex: '男',
          age: 26,
          postName: '经理',
        },
        {
          medicalExaminationNo: '635345454',
          userName: '张三',
          sex: '男',
          age: 26,
          postName: '经理',
        },
        {
          medicalExaminationNo: '635345454',
          userName: '张三',
          sex: '男',
          age: 26,
          postName: '经理',
        },
      ],
      total: null,

      // -------
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
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, this.FromData)
      if (this.inputForm.userId) {
        this.searchData.harmFactor = this.inputForm.harmFactor
        this.searchData.userId = this.inputForm.userId
        this.getExaminationBookDetailsFn()
      }
    }
  },
  methods: {
    getExaminationBookDetailsFn() {
      getExaminationBookDetails(this.searchData).then(({ data }) => {
        if (data.success) {
          this.infoData = data.result || {}
          this.tableData = data.result.examinationPage.list || []
          this.total = data.result.examinationPage.total
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div class="data-box">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      label-position="left"
      :model="infoData"
      label-width="100px"
      :class="Method === 'view' ? 'readonly' : ''"
      disabled
      @submit.native.prevent
    >
      <el-form-item
        label="人员姓名:"
        prop="fullName"
      >
        <span class="small-row">{{ infoData.fullName || '--' }}</span>
      </el-form-item>
      <el-form-item
        label="性别:"
        prop="sex"
      >
        <span class="small-row">{{ infoData.sex || '--' }}</span>
      </el-form-item>
      <el-form-item
        label="年龄:"
        prop="age"
      >
        <span class="small-row">{{ infoData.age || '--' }}</span>
      </el-form-item>
      <el-form-item
        label="所属岗位:"
        prop="postName"
      >
        <span class="small-row">{{ infoData.postName || '--' }}</span>
      </el-form-item>
      <el-form-item
        label="档案编号:"
        prop="medicalExaminationNo"
      >
        <span class="small-row">{{ infoData.medicalExaminationNo }}</span>
      </el-form-item>
      <el-form-item
        label="体检类型:"
        prop="harmFactor"
      >
        <span class="small-row">{{ setHarmFactor(infoData.harmFactor) }}</span>
      </el-form-item>
      <div class="tabl-title">
        各年度体检明细
      </div>
      <div class="big-row">
        <!-- 表格 -->
        <el-table
          slot="table"
          :data="tableData"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
          align="center"
        >
          <el-table-column
            label="年份"
            align="center"
            prop="year"
          />
          <el-table-column
            label="体检性质"
            align="center"
            prop="examinationNature"
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.examinationNature == 1
                  ? '岗前'
                  : scope.row.examinationNature == 2
                    ? '岗中'
                    : '离岗'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="体检状态"
            align="center"
            prop="occupationalDiseasesType"
          />
          <el-table-column
            label="体检结果"
            align="center"
            prop="examinationResult"
          />
          <el-table-column
            label="体检结论"
            align="center"
            prop="examinationConclusion"
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.examinationConclusion == 1
                  ? '合格'
                  : scope.row.examinationConclusion == 0
                    ? '不合格'
                    : '--'
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <!-- 分页器 -->
    <div style="display: flex; justify-content: flex-end">
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[4, 8, 12, 16]"
        background
        style="padding-top: 10px"
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getExaminationBookDetailsFn"
        @current-change="getExaminationBookDetailsFn"
      />
    </div>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button
          type="primary"
          @click="closeClick(false)"
        >好的,知道了</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.small-row {
  display: inline-block;
  width: 200px;
}
.tabl-title {
  font-size: 12px;
  margin-bottom: 10px;
}
.big-row {
  width: 650px;
}
</style>
