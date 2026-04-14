<!-- @description：statisticalChart 事故统计图表 -->
<script>
import moment from 'moment'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import {
  accidentClassificationStatistics,
  accidentNatureStatistics,
  proportionOfAccidentsInEachDepartment,
} from '@/http/accidentManage/investigation'
import Bar from './bar.vue'
import Pie from './pie.vue'
import ReverseBar from './reverseBar.vue'
import TableVue from './table.vue'

export default {
  name: 'statisticalChart',
  components: {
    Bar,
    Pie,
    TableVue,
    TreeSelect,
    ReverseBar,
  },
  data() {
    const userCompanyId = this.$store.state.user.user.companyId
    const format = 'YYYY-MM-DD HH:mm:ss'
    const prevDate = moment().subtract(1, 'year').format(format)
    const currDate = moment().format(format)
    return {
      dateRange: [prevDate, currDate],
      inputForm: {
        date: '近三年',
        startDate: prevDate,
        endDate: currDate,
        occurringUnit: userCompanyId,
        occurringUnit1: userCompanyId,
        occurringUnitClass: userCompanyId,
      },
      barData: '',
      pieData: '',
      classData: '',
      format: 'yyyy-MM-dd HH:mm:ss',
    }
  },
  watch: {
    dateRange(val, oldVal) {
      this.inputForm.startDate = val?.[0] || ''
      this.inputForm.endDate = val?.[1] || ''
    },
  },
  created() {
    this.getPieData()
    this.getBarData()
    this.getAccidentClassData()
  },
  methods: {
    getDepartmentId(value, name) {
      this.inputForm.occurringUnit = value
      this.inputForm.companyName = name
      this.getBarData()
    },
    getDepartmentId1(value, name) {
      this.inputForm.occurringUnit1 = value
      this.inputForm.companyName1 = name
      this.getPieData()
    },
    getDepartmentIdClass(value, name) {
      this.inputForm.occurringUnitClass = value
      this.getAccidentClassData()
    },
    getCurrentDate() {
      const now = new Date()
      const year = now.getFullYear() // 获取年份
      const endyear = now.getFullYear() - 3 // 获取年份
      let month = now.getMonth() // 获取月份
      let date = now.getDate() // 获取日期
      const day = now.getDay() // 获取周几
      let hour = now.getHours() // 获取小时
      let minu = now.getMinutes() // 获取分钟
      let sec = now.getSeconds() // 获取秒
      let MS = now.getMilliseconds() // 获取毫秒
      month = month + 1
      if (month < 10)
        month = `0${month}`
      if (date < 10)
        date = `0${date}`
      if (hour < 10)
        hour = `0${hour}`
      if (minu < 10)
        minu = `0${minu}`
      if (sec < 10)
        sec = `0${sec}`
      if (MS < 100)
        MS = `0${MS}`
      let time = ''
      let time1 = ''
      time = `${year}-${month}-${date} ${hour}:${minu}:${sec} `
      time1 = `${endyear}-${month}-${date} ${hour}:${minu}:${sec} `

      return [time, time1]
    },
    getPieData() {
      if (this.dateRange == null) {
        this.inputForm.startDate = ''
        this.inputForm.endDate = ''
      }
      proportionOfAccidentsInEachDepartment({
        startDate: this.inputForm.startDate,
        endDate: this.inputForm.endDate,
        occurringUnit: this.inputForm.occurringUnit1,
      }).then((res) => {
        if (res.success) {
          this.pieData = res.result
        }
      })
    },
    getBarData() {
      accidentNatureStatistics({
        startDate: this.getCurrentDate()[1],
        endDate: this.getCurrentDate()[0],
        occurringUnit: this.inputForm.occurringUnit,
      }).then((res) => {
        if (res.success) {
          this.barData = res.result
        }
      })
    },
    getAccidentClassData() {
      accidentClassificationStatistics({
        startDate: this.getCurrentDate()[1],
        endDate: this.getCurrentDate()[0],
        occurringUnit: this.inputForm.occurringUnitClass,
      }).then(({ data }) => {
        if (data.success) {
          this.classData = data.result
        }
      })
    },
  },
}
</script>

<template>
  <div class="statistical">
    <div class="chartContant">
      <div class="chart">
        <div class="title">
          事故性质统计
        </div>
        <!-- 搜索栏 -->
        <el-form
          slot="search"
          inline
        >
          <el-form-item
            label="时间"
            prop="date"
          >
            <el-input
              v-model="inputForm.date"
              readonly
            />
            <!-- <el-date-picker v-model="inputForm.date" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions"> </el-date-picker> -->
          </el-form-item>
          <el-form-item
            label="归属公司"
            prop="occurringUnit"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.occurringUnit"
              :clearable="false"
              :accordion="true"
              @getValue="getDepartmentId"
            />
          </el-form-item>
        </el-form>
        <div style="height: 260px">
          <Bar
            v-if="barData"
            :barData="barData"
          />
        </div>
      </div>
      <div class="chart">
        <div class="title">
          各部门事故占比
        </div>
        <!-- 搜索栏 -->
        <el-form
          slot="search"
          inline
        >
          <el-form-item label="时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 200px"
              :format="format"
              :value-format="format"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="false"
              @change="getPieData"
            />
          </el-form-item>
          <el-form-item
            label="归属公司"
            prop="occurringUnit1"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.occurringUnit1"
              :clearable="false"
              :accordion="true"
              @getValue="getDepartmentId1"
            />
          </el-form-item>
        </el-form>
        <div style="height: 260px">
          <Pie
            v-if="pieData"
            :pieData="pieData"
          />
        </div>
      </div>
      <div class="chart">
        <div class="title">
          事故分类统计
        </div>
        <!-- 搜索栏 -->
        <el-form
          slot="search"
          inline
        >
          <el-form-item
            label="时间"
            prop="date"
          >
            <el-input
              v-model="inputForm.date"
              readonly
            />
          </el-form-item>
          <el-form-item
            label="归属公司"
            prop="occurringUnit"
          >
            <TreeSelect
              ref="officeTree"
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              url="sysCompany/getSubordinateCompany"
              :value="inputForm.occurringUnitClass"
              :clearable="false"
              :accordion="true"
              @getValue="getDepartmentIdClass"
            />
          </el-form-item>
        </el-form>
        <div style="height: 260px">
          <ReverseBar
            v-if="classData"
            :classData="classData"
          />
        </div>
      </div>
    </div>
    <table-vue />
  </div>
</template>

<style scoped lang="scss">
.statistical {
  width: 100%;
  background: #f3f7f9;
  font-size: 13px;
}

.chartContant {
  padding: 15px;
  display: flex;

  .chart {
    flex: 1;

    .title {
      font-weight: 700;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .title::before {
      display: inline-block;
      content: '';
      margin: 0 10px 0 0;
      width: 4px;
      height: 10px;
      background-color: #409eff;
    }
  }
}
</style>
