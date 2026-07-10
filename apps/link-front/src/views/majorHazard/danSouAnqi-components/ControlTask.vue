<script>
import { hiddenDangerCheckTaskByPage } from '@/http/defense/shandong/hidden-api.js'

export default {
  name: 'ControlTask',
  props: {
    formData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      form: {
        analysisUnitId: '',
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      data: [],
      total: 0,
      cycleList: [
        {
          label: '小时',
          value: 0,
        },
        {
          label: '天',
          value: 1,
        },
        {
          label: '周',
          value: 2,
        },
        {
          label: '月',
          value: 3,
        },
        {
          label: '年',
          value: 4,
        },
      ],
    }
  },
  computed: {
    // 翻译管控周期
    setCycleDes() {
      return function (controlCycle, controlCycleUnit, controlFrequency) {
        let des = '-'
        const cycleType = Number.parseInt(controlCycleUnit)
        let cycleTypeDes = ''
        for (const item of this.cycleList) {
          if (item.value == cycleType) {
            cycleTypeDes = item.label
            break
          }
        }
        des = `${controlCycle + cycleTypeDes + controlFrequency}次`
        return des
      }
    },
  },
  created() {
    this.form.analysisUnitId = this.formData.riskUnit
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await hiddenDangerCheckTaskByPage(this.form)
      this.loading = false
      if (data.code == 200) {
        this.data = data.result.list || []
        this.total = data.result.total
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.data = []
        this.total = 0
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
        analysisUnitId: this.formData.id,
      }
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="controlTask-majorHazard">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item label="风险事件">
              <el-input
                v-model="form.eventName"
                placeholder="风险事件"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="12"
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
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="data"
          style="width: 100%"
          size="mini"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
          />
          <el-table-column
            label="风险事件"
            prop="eventName"
            align="center"
          />
          <el-table-column
            label="管控措施类别"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{
                $dictUtils.getDictLabelById('measure_main', scope.row.controlMeasuresMainType, '--')
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="管控措施"
            align="center"
          >
            <template slot-scope="scope">
              <RichText :des="scope.row.controlMeasuresDesc" />
            </template>
          </el-table-column>
          <el-table-column
            label="隐患排查内容"
            prop="checkContent"
            align="center"
          />
          <el-table-column
            label="周期"
            align="center"
          >
            <template slot-scope="scope">
              <span>
                {{
                  setCycleDes(
                    scope.row.controlCycle,
                    scope.row.controlCycleUnit,
                    scope.row.controlFrequency,
                  )
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="排查人"
            prop="controlResponsible"
            align="center"
          />
          <el-table-column
            label="最近排查时间"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.recentCheckTime ? scope.row.recentCheckTime : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="最近排查结果"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.recentTroubleResult == '0'"
                type="success"
              >
                正常
              </el-tag>
              <el-tag
                v-if="scope.row.recentTroubleResult == '1'"
                type="danger"
              >
                存在隐患
              </el-tag>
              <el-tag
                v-if="scope.row.recentTroubleResult == '-1'"
                type="warning"
              >
                暂未排查
              </el-tag>
            </template>
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
</template>

<style lang="scss" scoped>
.controlTask-majorHazard {
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    .searchForm {
      padding: 18px 10px 0 20px;
      background: #fff;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 0 20px 10px;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
        margin: 10px 0;
        .el-button + .el-button {
          margin-left: 5px;
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
}
</style>
