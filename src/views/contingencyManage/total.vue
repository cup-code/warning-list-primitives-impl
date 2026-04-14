<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getEmergencyStatistics } from '@/http/contingency/total.js'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      resData: null,
      sourData: {},
      allCharts: {
        chart_play: null, // 演练类别统计
        chart_plan: null, // 应急预案类型统计
      },
      form: {
        pageNum: 1,
        pageSize: 10,
        drillDateType: 'moon',
      },
      departList: [],
      loading: false,
      data: [],
      total: 0,
    }
  },
  watch: {
    resData(v) {
      if (v) {
        // 头部统计数据
        const {
          teamCount,
          expertCount,
          resourceSum,
        } = v
        this.sourData = { teamCount, expertCount, resourceSum }

        // 头部图表
        this.set_chart_play(v.drillRecordGroupByDrillWay)
        this.set_chart_plan(v.planGroupByType)

        // 表格数据
        this.data = v.list
      }
    },
  },
  async created() {
    this.getDataList()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = (departRes.data.result || []).filter((item) => {
      return item.departmentType === 'DEPARTMENT'
    })
  },
  mounted() {
    this.initAll()
  },
  methods: {
    async getDataList() {
      const { data } = await getEmergencyStatistics(this.form)
      if (data.code === 200) {
        this.resData = data.result
      }
    },
    pageSizeFn(v) {
      this.form.pageNum = 1
      this.form.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.form.pageNum = v
      this.getDataList()
    },
    // 重置
    resetFn() {
      this.form = {
        pageNum: 1,
        pageSize: 10,
        drillDateType: 'moon',
      }
      this.getDataList()
    },
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 演练类别统计
      this.initChart('chart_play', {
        color: ['#4070e7', '#59aeb7', '#49984a', '#eeb134', '#e75f25', '#ce3a32'],
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            height: '100%',
            radius: ['40%', '70%'],
            labelLine: {
              show: true,
              length: 5,
              length2: 10,
            },
            label: {
              show: true,
              fontSize: 10,
              color: '#000',
              formatter(param) {
                return `${param.name}\n${param.value}`
              },
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: [
              { name: '实战演练', value: 0 },
              { name: '桌面演练', value: 0 },
              { name: '实操演练', value: 0 },
              { name: '实战+实操', value: 0 },
              { name: '桌面+实战', value: 0 },
              { name: '实操+桌面', value: 0 },
            ],
          },
        ],
      })
      // 应急预案类型统计
      this.initChart('chart_plan', {
        color: ['#4070e7', '#59aeb7', '#49984a'],
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            height: '100%',
            radius: ['40%', '70%'],
            labelLine: {
              show: true,
              length: 5,
              length2: 10,
            },
            label: {
              show: true,
              fontSize: 10,
              color: '#000',
              formatter(param) {
                return `${param.name}\n${param.value}`
              },
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: [
              { name: '综合预案', value: 0 },
              { name: '专项预案', value: 0 },
              { name: '现场处置预案', value: 0 },
            ],
          },
        ],
      })
    },
    drillDateTypeFn(v) {
      this.getDataList()
    },
    set_chart_play(dt) {
      if (JSON.stringify(dt) !== '{}') {
        const res = Object.keys(dt).map((k) => {
          return {
            name: this.$dictUtils.getDictLabel('drillWay', k),
            value: dt[k],
            itemStyle: {
              color:
                k == 1
                  ? '#4070e7'
                  : k == 2
                    ? '#59aeb7'
                    : k == 3
                      ? '#49984a'
                      : k == 4
                        ? '#eeb134'
                        : k == 5
                          ? '#e75f25'
                          : k == 6
                            ? '#ce3a32'
                            : '',
            },
          }
        })
        this.allCharts.chart_play.setOption({
          series: [{ data: res }],
        })
      }
    },
    set_chart_plan(dt) {
      if (JSON.stringify(dt) !== '{}') {
        const res = Object.keys(dt).map((k) => {
          return {
            name: this.$dictUtils.getDictLabel('planType', k),
            value: dt[k],
            itemStyle: {
              color: k == 1 ? '#4070e7' : k == 2 ? '#59aeb7' : k == 3 ? '#49984a' : '',
            },
          }
        })
        this.allCharts.chart_plan.setOption({
          series: [{ data: res }],
        })
      }
    },
  },
}
</script>

<template>
  <div class="total-contingencyManage">
    <div class="rightCon">
      <div class="top">
        <div>
          <div class="barSty">
            应急资源统计
          </div>
          <div class="emeSource">
            <div style="background: #fac109">
              应急队伍{{ sourData.teamCount || 0 }}支
            </div>
            <div style="background: #3480de">
              应急专家{{ sourData.expertCount || 0 }}人
            </div>
            <div style="background: #d5707d">
              应急物资{{ sourData.resourceSum || 0 }}套
            </div>
          </div>
        </div>
        <div>
          <div class="barSty">
            演练类别统计
          </div>
          <el-radio-group
            v-model="form.drillDateType"
            class="monYear"
            @change="drillDateTypeFn"
          >
            <el-radio-button label="moon">
              按月
            </el-radio-button>
            <el-radio-button label="year">
              按年
            </el-radio-button>
          </el-radio-group>
          <div
            id="chart_play"
            style="flex: 1"
          />
        </div>
        <div>
          <div class="barSty">
            应急预案类型统计
          </div>
          <div
            id="chart_plan"
            style="flex: 1"
          />
        </div>
      </div>
      <el-divider />
      <div class="bottom">
        <!-- 查询条件 -->
        <el-form
          :model="form"
          label-width="38px"
          class="searchForm"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="部门">
                <!-- <SelectTree
                                    :props="{
                                        value: 'id', // ID字段名
                                        label: 'departmentName', // 显示名称
                                        children: 'children' // 子级字段名
                                    }"
                                    :list="departList"
                                    :value="form.departmentId"
                                    :clearable="true"
                                    :accordion="true"
                                    @getValue="value => { form.departmentId = value }"
                                /> -->
                <el-select
                  v-model="form.departmentId"
                  placeholder="请选择"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in departList"
                    :key="item.id"
                    :label="item.departmentName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :span="6"
              style="padding-left: 10px"
            >
              <el-form-item label="日期">
                <el-date-picker
                  v-model="form.startTime"
                  placeholder="开始时间"
                  style="width: 100%"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>
            <el-col
              :span="6"
              style="padding-left: 10px"
            >
              <el-form-item
                label="至"
                label-width="26px"
              >
                <el-date-picker
                  v-model="form.endTime"
                  placeholder="结束时间"
                  style="width: 100%"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-col>

            <!-- 按钮 -->
            <el-col
              :span="6"
              style="padding-left: 10px"
            >
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="getDataList"
              >
                查询
              </el-button>
              <el-button
                icon="el-icon-refresh-right"
                @click="resetFn"
              >
                重置
              </el-button>
              <el-button>导出</el-button>
            </el-col>
          </el-row>
        </el-form>

        <div class="main-bottom">
          <!-- 表格 -->
          <el-table
            v-loading="loading"
            :data="data"
            style="width: 100%"
            border
            size="mini"
            :header-cell-style="{ background: '#f5f5f5' }"
            height="100%"
          >
            <el-table-column
              class-name="plan-header"
              label="应急预案统计"
              align="center"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              />
              <el-table-column
                label="所属公司"
                prop="companyName"
                align="center"
              />
              <el-table-column
                label="部门"
                prop="departmentName"
                align="center"
              />
              <el-table-column
                label="预案数量"
                prop="planTotal"
                align="center"
              />
              <el-table-column
                label="已执行预案"
                prop="planExecuteCount"
                align="center"
                width="90"
              />
              <el-table-column
                label="未执行预案"
                prop="notPlanExecuteCount"
                align="center"
                width="90"
              />
              <el-table-column
                label="预案执行率"
                prop="planRate"
                align="center"
                width="90"
              />
            </el-table-column>
            <el-table-column
              class-name="play-header"
              label="应急演练统计"
              align="center"
            >
              <el-table-column
                label="演练计划总数"
                prop="drillPlanTotal"
                align="center"
                width="100"
              />
              <el-table-column
                label="已执行的演练计划"
                prop="drillPlanExecuteCount"
                align="center"
                width="120"
              />
              <el-table-column
                label="未执行的演练计划"
                prop="notDrillPlanExecuteCount"
                align="center"
                width="120"
              />
              <el-table-column
                label="计划完成率"
                prop="drillPlanRate"
                align="center"
                width="90"
              />
              <el-table-column
                label="计划参与人数"
                prop="drillPlanPersonTotal"
                align="center"
                width="100"
              />
              <el-table-column
                label="实际参与人数"
                prop="realityDrillPlanPersonCount"
                align="center"
                width="100"
              />
              <el-table-column
                label="人均占比"
                prop="personProportion"
                align="center"
              />
              <el-table-column
                label="人均参与频次"
                prop="personFrequency"
                align="center"
                width="100"
              />
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            :current-page.sync="form.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="form.pageSize"
            layout="total, prev, pager, next, jumper, sizes"
            :total="total"
            @size-change="pageSizeFn"
            @current-change="pageCurFn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.total-contingencyManage {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .rightCon {
    flex: 1;
    height: 100%;
    overflow: hidden;
    background: #fff;
    padding: 10px;
    display: flex;
    flex-direction: column;
    .top {
      height: 30%;
      display: flex;
      overflow: hidden;
      & > div {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .emeSource {
        flex: 1;
        overflow: hidden;
        padding: 0 40px 0 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        & > div {
          padding: 10px;
          height: 30%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .monYear {
        .el-radio-button__inner {
          padding: 4px 10px;
        }
      }
    }
    .bottom {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .main-bottom {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .el-table {
          flex: 1;
          margin-bottom: 10px;
          .el-button + .el-button {
            margin-left: 5px;
          }
          .plan-header {
            color: #000;
            font-weight: 400;
          }
          .play-header {
            color: #000;
            font-weight: 400;
            background: #fac109 !important;
          }
        }
        .el-pagination {
          text-align: right;
          padding: 0;
          .el-pagination__sizes {
            margin-right: 0;
            .el-input {
              margin-right: 0;
            }
          }
        }
      }
    }

    .barSty {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      &::before {
        display: inline-block;
        content: '';
        margin-right: 6px;
        width: 5px;
        height: 14px;
        background-color: #409eff;
      }
    }
  }
}
</style>
