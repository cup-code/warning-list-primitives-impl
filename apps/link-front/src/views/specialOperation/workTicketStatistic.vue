<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  getCorporateDepartmentQuantity,
  getCountTypeByCompanyTypeQuantity,
  getpageQuery,
  getTimeCompanyStateQuantity,
} from '@/http/specialOperation/specialWork-api.js'
import { getSubordinateCompany } from '@/http/user-api.js'
import ApprovalRecord from './components/approvalRecord.vue'
import BookInfo from './components/BookInfo.vue'
import { TicketStatusList, TicketTypeList } from './config/constant.js'

export default {
  components: {
    SelectTree,
    BookInfo,
    ApprovalRecord,
  },
  data() {
    const previousYearTime = this.moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm:ss')
    const currentTime = this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    return {
      TicketStatusList, // 作业票状态列表
      TicketTypeList,
      companyList: [],
      workTicketTime: [previousYearTime, currentTime], // 作业票统计时间
      departmentWorkTime: [previousYearTime, currentTime], // 各部门占比作业票时间
      workTypeTime: [previousYearTime, currentTime], // 作业各类型统计时间
      workTicketPaging: [previousYearTime, currentTime], // 获取分页数据时间
      showInfoDialog: false,
      showRecordDialog: false, // 审批记录的弹框
      propData: {},
      workData: {
        workTicket: {
          companyId: '',
          startDate: '',
          endDate: '',
        },
        departmentWork: {
          companyId: '',
          startDate: '',
          endDate: '',
        },
        workType: {
          companyId: '',
          startDate: '',
          endDate: '',
        },
        workTicketPaging: {
          companyId: '',
          pageNum: 1,
          pageSize: 10,
          startDate: '',
          endDate: '',
        },
      },
      tableData: [],
      total: 0, // 表格数据总数
      isLoading: false,
      numberOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        color: ['#D97559', '#E4C477', '#E4A67B', '#4E9C8F', '#4786B4'],
        legend: {},
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: ['2023'],
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: '作业未完成',
            type: 'bar',
            emphasis: {
              focus: 'series',
            },
            data: [],
          },
          {
            name: '作业验收完成',
            type: 'bar',
            emphasis: {
              focus: 'series',
            },
            data: [],
          },
          {
            name: '作业未验收',
            type: 'bar',
            emphasis: {
              focus: 'series',
            },
            data: [],
          },
          {
            name: '合计',
            type: 'bar',
            emphasis: {
              focus: 'series',
            },
            data: [],
          },
        ],
      },
      proportionOption: {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
        },
        color: ['#FAD782', '#EFB687', '#4E9C8F', '#4786B4', '#2E4552', '#EE8061'],
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [{ value: 0, name: '暂无数据' }],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
      typeOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        color: ['#5087EC', '#68BBC4', '#58A55C'],
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
        },
        yAxis: {
          type: 'category',
          data: [
            '动火作业',
            '高空作业',
            '动土作业',
            '吊装作业',
            '临时用电作业',
            '有限空间作业',
            '盲板抽堵作业',
          ],
        },
        series: [],
      },
    }
  },
  computed: {
    /* 翻译常量文字 */
    setConstant() {
      return function (value, constList) {
        let des = '-'
        for (const item of constList) {
          if (item.value == value) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  created() {
    this.workData.workTicket.startDate = this.workTicketTime[0]
    this.workData.workTicket.endDate = this.workTicketTime[1]
    this.workData.departmentWork.startDate = this.departmentWorkTime[0]
    this.workData.departmentWork.endDate = this.departmentWorkTime[1]
    this.workData.workType.startDate = this.workTypeTime[0]
    this.workData.workType.endDate = this.workTypeTime[1]
    this.workData.workTicketPaging.startDate = this.workTicketPaging[0]
    this.workData.workTicketPaging.endDate = this.workTicketPaging[1]
    this.getSubordinateCompany()
  },
  methods: {
    // 查询当前登录用户的公司及其子公司
    getSubordinateCompany() {
      getSubordinateCompany()
        .then(({ data }) => {
          if (data.success) {
            this.companyList = data.result || []
            setTimeout(() => {
              for (const item of this.companyList) {
                this.workData.workTicket.companyId = item.id
                this.workData.departmentWork.companyId = item.id
                this.workData.workType.companyId = item.id
                this.workData.workTicketPaging.companyId = item.id
              }
              this.query()
            }, 200)
          }
          else {
            this.$message.warning(data.message || '获取公司列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取公司列表数据失败', err)
        })
    },

    init() {
      this.myChart = this.$editorEcharts(document.getElementById('work-ticket-statistics'))
      this.myChart.setOption(this.numberOption)

      this.myChart = this.$editorEcharts(document.getElementById('department-work'))
      this.myChart.setOption(this.proportionOption)

      this.myChart = this.$editorEcharts(document.getElementById('work-type'))
      this.myChart.setOption(this.typeOption, true)
    },
    selectionTime(e, num) {
      switch (Number.parseInt(num)) {
        case 1:
          this.workData.workTicket.startDate = e[0]
          this.workData.workTicket.endDate = e[1]
          break
        case 2:
          this.workData.departmentWork.startDate = e[0]
          this.workData.departmentWork.endDate = e[1]
          break
        case 3:
          this.workData.workType.startDate = e[0]
          this.workData.workType.endDate = e[1]
          break
        case 4:
          this.workData.workTicketPaging.startDate = e[0]
          this.workData.workTicketPaging.endDate = e[1]
          break
      }
    },
    getApplicantDeptName(value, num) {
      switch (Number.parseInt(num)) {
        case 1:
          this.workData.workTicket.companyId = value
          break
        case 2:
          this.workData.departmentWork.companyId = value
          break
        case 3:
          this.workData.workType.companyId = value
          break
        case 4:
          this.workData.workTicketPaging.companyId = value
          break
      }
    },
    /* 点击查看 */
    checkClick(item) {
      this.propData = {
        sid: item.id,
      }
      this.showInfoDialog = true
    },
    /* 点击审批记录 */
    historyClick(item) {
      this.propData = {
        workTicketType: item.workTicketType,
        jobNumber: item.jobNumber,
        sid: item.id,
        approvalType: item.approvalType,
      }
      this.showRecordDialog = true
    },
    /* 关闭弹窗事件 */
    closeDialogEvt() {
      this.showInfoDialog = false
    },
    // 查询
    query() {
      this.getTimeCompanyStateQuantity()
      this.getCorporateDepartmentQuantity()
      this.getCountTypeByCompanyTypeQuantity()

      this.workData.workTicketPaging.pageNum = 1
      this.getpageQuery()
    },
    // 获取指定时间指定公司作业票(状态)数量
    getTimeCompanyStateQuantity() {
      getTimeCompanyStateQuantity(this.workData.workTicket)
        .then(({ data }) => {
          if (data.success) {
            this.numberOption.xAxis[0].data = []
            this.numberOption.series[0].data = []
            this.numberOption.series[1].data = []
            this.numberOption.series[2].data = []
            this.numberOption.series[3].data = []
            for (const key of data.result) {
              this.numberOption.xAxis[0].data.push(key.year.toString())
              this.numberOption.series[0].data.push(key.incomplete)
              this.numberOption.series[1].data.push(key.accepted)
              this.numberOption.series[2].data.push(key.notAccepted)
              this.numberOption.series[3].data.push(key.total)
            }
            this.init()
          }
          else {
            this.$message.error('作业票统计暂无数据')
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 获取指定时间指定公司各部门(作业)票数量
    getCorporateDepartmentQuantity() {
      getCorporateDepartmentQuantity(this.workData.departmentWork)
        .then(({ data }) => {
          if (data.success) {
            this.proportionOption.series[0].data = data.result.map((res) => {
              return {
                value: res.count,
                name: res.departmentName,
              }
            })
            this.init()
          }
          else {
            this.$message.error('各部门作业票占比暂无数据')
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 获取指定时间指定公司作业票(类型)数量
    getCountTypeByCompanyTypeQuantity() {
      this.typeOption.series = []
      getCountTypeByCompanyTypeQuantity(this.workData.workType)
        .then(({ data }) => {
          if (data.success) {
            this.typeOption.series = data.result.map((item) => {
              return {
                name: item.year.toString(),
                type: 'bar',
                data: [item.dh, item.dg, item.dt, item.dz, item.ls, item.sx, item.mb],
              }
            })
            this.init()
          }
          else {
            this.$message.error('作业类型统计暂无数据')
          }
        })
        .catch((err) => {
          this.$message.error(err)
        })
    },
    // 获取分页时间段内作业票
    getpageQuery() {
      this.isLoading = true
      getpageQuery(this.workData.workTicketPaging)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
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
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    class="statistic-form"
  >
    <el-form
      :model="workData"
      label-width="80px"
    >
      <div class="statistic-box">
        <div class="info">
          <h3>作业票统计</h3>
          <el-form-item label="时间">
            <el-date-picker
              v-model="workTicketTime"
              class="small-box"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="selectionTime($event, 1)"
            />
          </el-form-item>
          <el-form-item label="归属公司">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="companyList"
              :value="workData.workTicket.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  getApplicantDeptName(value, 1)
                }
              "
            />
          </el-form-item>
          <div
            id="work-ticket-statistics"
            class="figure-box"
          />
        </div>
        <div class="info">
          <h3>各部门作业票占比</h3>
          <el-form-item label="时间">
            <el-date-picker
              v-model="departmentWorkTime"
              class="small-box"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="selectionTime($event, 2)"
            />
          </el-form-item>
          <el-form-item label="归属公司">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="companyList"
              :value="workData.departmentWork.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  getApplicantDeptName(value, 2)
                }
              "
            />
          </el-form-item>
          <div
            id="department-work"
            class="figure-box"
          />
        </div>
        <div class="info">
          <h3>作业各类型统计</h3>
          <el-form-item label="时间">
            <el-date-picker
              v-model="workTypeTime"
              class="small-box"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="selectionTime($event, 3)"
            />
          </el-form-item>
          <el-form-item label="归属公司">
            <SelectTree
              class="small-box"
              :props="{
                value: 'id', // ID字段名
                label: 'companyName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="companyList"
              :value="workData.workType.companyId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  getApplicantDeptName(value, 3)
                }
              "
            />
          </el-form-item>
          <div
            id="work-type"
            class="figure-box"
          />
        </div>
      </div>

      <!-- 列表 -->
      <div class="table-box">
        <el-row>
          <el-col :span="8">
            <el-form-item label="作业发生时间">
              <el-date-picker
                v-model="workTicketPaging"
                class="small-box"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="selectionTime($event, 4)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="归属公司">
              <SelectTree
                class="small-box"
                :props="{
                  value: 'id', // ID字段名
                  label: 'companyName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="companyList"
                :value="workData.workTicketPaging.companyId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    getApplicantDeptName(value, 4)
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button
              type="primary"
              @click="query"
            >
              查询
            </el-button>
          </el-col>
        </el-row>

        <el-table
          :data="tableData"
          height="400px"
          row-key="sort"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
          align="center"
        >
          <el-table-column
            label="序号"
            align="center"
            type="index"
          />
          <el-table-column
            label="申请单位"
            align="center"
            prop="applyUnitName"
          />
          <el-table-column
            label="申请人"
            align="center"
            prop="applyUserName"
          />
          <el-table-column
            label="作业编号"
            align="center"
            prop="jobNumber"
          />
          <el-table-column
            label="作业类型"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ setConstant(scope.row.workTicketType, TicketTypeList) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="作业内容"
            align="center"
            prop="workInfo"
          />
          <el-table-column
            label="作业位置"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.workSite.appendPlace }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="作业开始时间"
            align="center"
            prop="workStartDate"
          />
          <el-table-column
            label="作业结束时间"
            align="center"
            prop="workEndDate"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="applyUnitName"
          >
            <template slot-scope="scope">
              <span>{{ setConstant(scope.row.ticketStatus, TicketStatusList) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="mini"
                @click="checkClick(scope.row)"
              >
                详情
              </el-button>
              <el-button
                type="text"
                size="mini"
                style="color: var(--ky-warning)"
                @click="historyClick(scope.row)"
              >
                审批记录
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          slot="page"
          style="display: flex; justify-content: flex-end"
          :current-page.sync="workData.workTicketPaging.pageNum"
          :page-size.sync="workData.workTicketPaging.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          @current-change="getpageQuery"
          @size-change="getpageQuery"
        />
      </div>
    </el-form>

    <!-- 弹窗 -->
    <div slot="dialog">
      <el-dialog
        class="large-dialog"
        width="1200px"
        title="作业详情"
        :visible.sync="showInfoDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <BookInfo
          v-if="showInfoDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
      <el-dialog
        class="normal-dialog"
        width="1200px"
        title="审批记录"
        :visible.sync="showRecordDialog"
        append-to-body
        :close-on-click-modal="false"
      >
        <ApprovalRecord
          v-if="showRecordDialog"
          v-bind="propData"
          @close="closeDialogEvt"
        />
      </el-dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.statistic-form {
  padding: 15px;
  box-sizing: border-box;
  .statistic-box {
    height: 370px;
    display: flex;
    .info {
      flex: 1;
      h3 {
        position: relative;
        text-indent: 15px;
      }
      h3::before {
        content: '';
        width: 8px;
        height: 24px;
        background: #93d2f3;
        position: absolute;
        top: -2px;
        left: 0;
      }
    }
  }
  .table-box {
    margin-top: 25px;
  }
  .small-box {
    width: 320px;
  }
  .figure-box {
    width: 400px;
    height: 250px;
  }
}
</style>
