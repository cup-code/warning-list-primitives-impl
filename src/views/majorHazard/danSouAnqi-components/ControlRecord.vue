<script>
import { hiddenDangerCheckRecordByPage } from '@/http/defense/shandong/hidden-api.js'
import SafeBookInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeBookInfo.vue'

export default {
  name: 'ControlRecord',
  components: { SafeBookInfo },
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
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      troubleResultList: [
        {
          label: '正常',
          value: 0,
          tag: 'success',
        },
        {
          label: '存在隐患',
          value: 1,
          tag: 'danger',
        },
        {
          label: '暂未排查',
          value: -1,
          tag: 'warning',
        },
      ],
      HiddenCheckType: [
        {
          label: '计划排查',
          value: 1,
        },
        {
          label: '扫码排查',
          value: 2,
        },
      ],
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
      // 隐患详情弹框是否显示
      showInfoDialog: false,
      // 传递给弹窗的数据
      propData: {},
    }
  },
  computed: {
    // 翻译排查类型
    setCheckType() {
      return function (type) {
        let des = '-'
        const typeInt = Number.parseInt(type)
        for (const item of this.HiddenCheckType) {
          if (item.value == typeInt) {
            des = item.label
            break
          }
        }
        return des
      }
    },
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
      const { data } = await hiddenDangerCheckRecordByPage(this.form)
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
        showMore: false,
        analysisUnitId: this.formData.id,
      }
      this.getDataList()
    },
    toggleMore() {
      this.form.showMore = !this.form.showMore
    },
    // 存在隐患时点击查看隐患详情
    showInfoClick(troubleId) {
      this.propData = {
        troubleId,
      }
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <div class="controlRecord-majorHazard">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="风险事件">
              <el-input
                v-model="form.eventName"
                placeholder="风险事件"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="隐患排查内容"
              label-width="90px"
            >
              <el-input
                v-model="form.checkContent"
                placeholder="隐患排查内容"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="排查结果">
              <el-select
                v-model="form.troubleResult"
                placeholder="排查结果"
                style="width: 100%"
              >
                <el-option
                  v-for="item in troubleResultList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="8"
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
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="toggleMore"
            >
              {{ form.showMore == true ? '收起' : '高级筛选' }}
              <i :class="form.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
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
            prop="riskEvent"
            align="center"
          />
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
            align="center"
          >
            <template slot-scope="scope">
              <RichText :des="scope.row.checkContent" />
            </template>
          </el-table-column>
          <el-table-column
            label="排查类型"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ setCheckType(scope.row.checkType) }}</span>
            </template>
          </el-table-column>
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
            label="计划排查人"
            prop="plannedCheckUserNameList"
            align="center"
          >
            <template slot-scope="scope">
              {{ (scope.row.plannedCheckUserNameList || []).join('、') }}
            </template>
          </el-table-column>
          <el-table-column
            label="任务下发时间"
            prop="taskStartDateTime"
            align="center"
            min-width="130"
          />
          <el-table-column
            label="实际排查人"
            prop="actualCheckUseNameList"
            align="center"
          >
            <template slot-scope="scope">
              {{ (scope.row.actualCheckUseNameList || []).join('、') }}
            </template>
          </el-table-column>
          <el-table-column
            label="排查时间"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.checkTime ? scope.row.checkTime : '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.taskStatus == 1"
                type="success"
              >
                已排查
              </el-tag>
              <el-tag
                v-else-if="
                  scope.row.taskStatus == 0
                    && new Date(scope.row.taskEndDateTime).getTime() > new Date().getTime()
                "
                type="warning"
              >
                未排查
              </el-tag>
              <el-tag
                v-else
                type="danger"
              >
                已过期
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="排查结果"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.troubleResult == '0'"
                type="success"
              >
                正常
              </el-tag>
              <el-tag
                v-else-if="scope.row.troubleResult == '1'"
                type="danger"
                style="cursor: pointer"
                @click="showInfoClick(scope.row.troubleId)"
              >
                存在隐患
              </el-tag>
              <el-tag
                v-else
                type="warning"
              >
                未排查
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

    <el-dialog
      class="large-dialog"
      :visible.sync="showInfoDialog"
      :close-on-click-modal="false"
    >
      <div
        slot="title"
        class="dialog-header"
      >
        <div class="dialog-title">
          隐患详情
        </div>
      </div>
      <SafeBookInfo
        v-if="showInfoDialog"
        v-bind="propData"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.controlRecord-majorHazard {
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
