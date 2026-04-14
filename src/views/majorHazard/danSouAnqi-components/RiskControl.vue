<script>
import { getLevelCtrlByPage, getLevelCtrlExpand } from '@/http/defense/shandong/riskControl-api.js'
import CtrlExpand from '@/views/doubleDefense/shandong/riskControl/components/ctrlComps/CtrlExpand.vue'
import CtrlInfo from '@/views/doubleDefense/shandong/riskControl/components/ctrlComps/CtrlInfo.vue'

export default {
  name: 'RiskControl',
  components: {
    CtrlExpand,
    CtrlInfo,
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
        showMore: false,
      },
      loading: false,
      data: [],
      total: 0,
      expandLoading: false,
      expandKeys: [], // 需要展开的keys列表
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
      expandProp: {}, // 展开行传参

      propData: {}, // 管控弹窗绑定数据
      showInfoDialog: false,
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
  created() {
    this.form.analysisUnitId = this.formData.riskUnit
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const { data } = await getLevelCtrlByPage(this.form)
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
    // 展开行回调
    expandEvt(row) {
      // 判断是否已展开
      let isExist = false
      for (const id of this.expandKeys) {
        if (id === row.id) {
          isExist = true
          break
        }
      }
      // 如果已展开就关闭，
      if (isExist) {
        this.expandKeys = []
      }
      // 否则展开,并请求数据
      else {
        this.expandKeys = []
        this.expandKeys.push(row.id)
        this.expandLoading = true
        this.expandProp.expandList = []
        // 请求展开数据
        getLevelCtrlExpand(row.id)
          .then((res) => {
            if (res.data.success) {
              this.expandProp.expandList = res.data.result
            }
            else {
              this.$message.warning(res.data.message || '获取展开数据失败')
            }
          })
          .catch((err) => {
            this.$message.error('获取展开数据出错', err)
          })
          .finally(() => {
            this.expandLoading = false
          })
      }
    },
    // 编辑/查看表格行
    editClick(infoId, editable) {
      this.propData = {
        infoId,
        editable,
      }
      this.showInfoDialog = true
    },
    // 关闭弹窗回调
    closeDialogEvt() {
      this.showInfoDialog = false
    },
  },
}
</script>

<template>
  <div class="riskControl-majorHazard">
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
                v-model="form.fuzzyName"
                placeholder="风险事件"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
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
          <el-col
            v-if="form.showMore"
            :span="8"
            style="padding-left: 10px"
          >
            <el-form-item label="管控层级">
              <el-select
                v-model="form.controlHierarchy"
                placeholder="管控层级"
                style="width: 100%"
              >
                <el-option
                  v-for="item in $dictUtils.getDictList('control_level')"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
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
          :expand-row-keys="expandKeys"
          row-key="id"
          @expand-change="expandEvt"
        >
          <!-- 展开行 -->
          <CtrlExpand
            v-bind="expandProp"
            :loading="expandLoading"
          />
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
            align="center"
          >
            <template slot-scope="scope">
              <RichText :des="scope.row.eventDesc" />
            </template>
          </el-table-column>
          <el-table-column
            label="管控层级"
            align="center"
          >
            <template slot-scope="scope">
              <span>
                {{ $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="editClick(scope.row.id, false)"
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
      title="风险管控"
      :visible.sync="showInfoDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <CtrlInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @close="closeDialogEvt"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.riskControl-majorHazard {
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
