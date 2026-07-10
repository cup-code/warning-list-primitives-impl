<script>
import { getAnalyseUnitAll, getRiskEventByPage } from '@/http/defense/shandong/riskControl-api.js'
import EventInfo from '@/views/doubleDefense/shandong/riskControl/components/EventInfo.vue'

export default {
  name: 'RiskEvent',
  components: {
    EventInfo,
  },
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
      riskLevelList: [
        {
          dictName: '低风险',
          dictCode: 0,
          color: '#2DAFF9',
        },
        {
          dictName: '一般风险',
          dictCode: 1,
          color: '#FFFF02',
        },
        {
          dictName: '较大风险',
          dictCode: 2,
          color: '#FFBF01',
        },
        {
          dictName: '重大风险',
          dictCode: 3,
          color: '#FE0001',
        },
      ],
      showInfoDialog: false,
      dialogTitle: '',
      propData: {}, // 弹窗绑定数据
    }
  },
  computed: {
    // 设置风险等级文字及颜色
    setRiskLevel() {
      return function (riskLv) {
        const riskLvInt = Number.parseInt(riskLv)
        let param = {}
        for (const item of this.riskLevelList) {
          if (item.dictCode == riskLvInt) {
            param = item
            break
          }
        }
        return param
      }
    },
  },
  async created() {
    this.form.analysisUnitId = this.formData.riskUnit
    this.getDataList()
    const unitRes = await getAnalyseUnitAll()
    this.unitList = unitRes.data.result
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getRiskEventByPage(this.form)
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
    seeFn(infoId, editable) {
      this.dialogTitle = '风险事件详情'
      this.propData = {
        infoId,
        editable,
        unitList: this.unitList,
      }
      this.showInfoDialog = true
    },
    // 关闭弹窗事件
    closeDialogEvt() {
      this.showInfoDialog = false
    },
  },
}
</script>

<template>
  <div class="riskEvent-majorHazard">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="60px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item
              label="风险事件"
              prop="fuzzyName"
            >
              <el-input
                v-model="form.fuzzyName"
                placeholder="风险事件"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="6"
            style="padding-left: 10px"
          >
            <el-form-item label="风险等级">
              <el-select
                v-model="form.riskLevel"
                placeholder="风险等级"
                style="width: 100%"
              >
                <el-option
                  v-for="item in riskLevelList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                />
              </el-select>
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
          border
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
            label="风险等级"
            prop="riskLevel"
            align="center"
          >
            <template slot-scope="scope">
              <span
                class="risk-des"
                :style="`background:${setRiskLevel(scope.row.riskLevel).color};`"
              >{{ setRiskLevel(scope.row.riskLevel).dictName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="风险描述"
            prop="eventDesc"
            align="center"
          />
          <el-table-column
            label="可能导致的事故"
            prop="d"
            align="center"
          />
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="seeFn(scope.row.id, false)"
              >
                查看
              </el-button>
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
      :title="dialogTitle"
      :visible.sync="showInfoDialog"
      :close-on-click-modal="false"
    >
      <EventInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.riskEvent-majorHazard {
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

  .risk-des {
    padding: 4px 6px;
    border-radius: 2px;
    background: #67c23a;
  }
}
</style>
