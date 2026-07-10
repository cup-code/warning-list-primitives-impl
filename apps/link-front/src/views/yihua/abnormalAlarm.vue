<script>
import { mapGetters } from 'vuex'
import { getDeviceGroup } from '@/http/dev/group-api'
import {
  descAlarmRecord,
  exportAlarmRecordExcel,
  getDevAlarmRecord,
} from '@/http/yihua-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loading: false,
    drop: true, // 搜索条件框是否展开
    sDate: '',
    tableData: [],
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
    comList: [],
    devTypeList: [
      { name: '废水', value: 1 },
      { name: '废气', value: 2 },
    ],
    // 异常状态列表
    stateList: [],

    form_desc: {}, // 备注表单
    rules_desc: {},
  }),
  computed: {
    ...mapGetters(['dic']),
  },

  created() {
    this.getDataList()
    this.getComList() // 获取企业列表
    this.genDic()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getDevAlarmRecord(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = (resD.result || []).map((item) => {
              item.descLoading = false
              return item
            })
            this.total = resD.total
          }
          else {
            this.$message.error(msg || '查询失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询失败')
        })
    },
    // 获取企业列表（调 设备分组接口）
    getComList() {
      this.comList = []
      getDeviceGroup().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.comList = resD.result
        }
      })
    },
    // 根据store中的数据字典 生成 列表数据
    genDic() {
      if (this.dic.length === 0)
        return
      this.dic.forEach((item) => {
        if (item.code === 'alarmState') {
          // 异常状态
          this.stateList = item.uSDictionaryItemDTOList
        }
      })
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 备注
    descFn() {
      this.$set(this.form_desc, 'alarmState', '')
      this.$set(this.form_desc, 'memo', '')
    },
    // 备注 确定
    descDoneFn(v) {
      this.$refs[`descForm_${v.id}`].validate((valid) => {
        if (!valid)
          return

        v.descLoading = true

        // 调用接口
        const params = Object.assign({}, this.form_desc)
        params.id = v.id

        descAlarmRecord(params)
          .then((res) => {
            v.descLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              v.visible_desc = false
              this.$message.success(msg || '备注成功')
              this.getDataList()
            }
            else {
              this.$message.error(msg || '备注失败')
            }
          })
          .catch((err) => {
            v.descLoading = false
            this.$message.error('备注失败')
          })
      })
    },
    // 时间选择器
    dateChange(v) {
      const form = this.sForm
      if (v) {
        form.startDate = v[0]
        form.endDate = v[1]
      }
      else {
        delete form.startDate
        delete form.endDate
      }
    },

    // 搜索按钮
    searchFn() {
      this.sForm.page = 1
      this.getDataList()
    },

    // 导出excel
    exportExc() {
      const params = Object.assign({}, this.sForm)
      delete params.page
      delete params.pageSize

      exportAlarmRecordExcel(params)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            window.open(resD.result)
            this.$message.success(msg || '导出excel成功')
          }
          else {
            this.$message.error(msg || '导出excel失败')
          }
        })
        .catch((err) => {
          this.$message.error('导出excel失败')
        })
    },
  },
}
</script>

<template>
  <div class="abnormalAlarm-yihua">
    <!-- 搜索 -->
    <el-row>
      <el-col :span="24">
        <el-form
          ref="sForm"
          inline
          :model="sForm"
          label-width="65px"
          size="mini"
        >
          <el-form-item label="公司">
            <el-select
              v-model="sForm.companyId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in comList"
                :key="item.id"
                :label="item.groupName"
                :value="item.id"
              >
                <span>{{ item.groupName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker
              v-model="sDate"
              style="width: 100%"
              size="mini"
              value-format="timestamp"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="dateChange"
            />
          </el-form-item>
          <el-form-item label="排放类型">
            <el-select
              v-model="sForm.deviceType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in devTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 搜索条件的 隐藏区域  -->
          <span v-if="drop">
            <el-form-item label="异常状态">
              <el-select
                v-model="sForm.alarmState"
                placeholder="请选择"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in stateList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.name"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </span>

          <el-form-item style="margin-left: 20px">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="searchFn"
            >
              搜索
            </el-button>
            <el-button
              type="text"
              style="margin-left: 15px"
              @click="drop = !drop"
            >
              {{ drop ? '收起' : '展开' }}
              <i
                class="el-icon--right"
                :class="[drop ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
                style="margin-left: 0"
              />
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- 按钮 -->
    <el-row
      type="flex"
      align="middle"
    >
      <el-col :span="24">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          @click="exportExc"
        >
          Excel导出
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-document"
          size="mini"
        >
          PDF导出
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 表格 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="公司"
            prop="company"
            align="center"
          />
          <el-table-column
            label="排放类型"
            prop="paikouType"
            align="center"
          />
          <el-table-column
            label="排放口"
            prop="deviceName"
            align="center"
          />
          <el-table-column
            label="报警时间"
            prop="eventDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.eventDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="监测因子"
            prop="ioName"
            align="center"
          />
          <el-table-column
            label="指标值"
            prop="normalValue"
            align="center"
          />
          <el-table-column
            label="监测值"
            prop="eventValue"
            align="center"
          />
          <el-table-column
            label="异常状态"
            prop="message"
            align="center"
          />
          <el-table-column
            label="备注"
            prop="clearReason"
            align="center"
          />
          <el-table-column
            label="操作"
            width="80"
            align="center"
          >
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.visible_desc"
                width="260"
              >
                <el-form
                  :ref="`descForm_${scope.row.id}`"
                  :model="form_desc"
                  :rules="rules_desc"
                  label-width="60px"
                  size="mini"
                >
                  <el-form-item
                    label="异常状态"
                    prop="alarmState"
                  >
                    <el-select
                      v-model="form_desc.alarmState"
                      placeholder="请选择"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in stateList"
                        :key="item.value"
                        :label="item.name"
                        :value="item.name"
                      >
                        <span>{{ item.name }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="备注"
                    prop="memo"
                  >
                    <el-input v-model="form_desc.memo" />
                  </el-form-item>
                </el-form>

                <div style="text-align: right; margin: 0">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.visible_desc = false"
                  >
                    取消
                  </el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    :loading="scope.row.descLoading"
                    @click="descDoneFn(scope.row)"
                  >
                    确定
                  </el-button>
                </div>
                <el-button
                  slot="reference"
                  size="mini"
                  type="warning"
                  @click="descFn"
                >
                  备注
                </el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col
        :span="24"
        style="padding-top: 2vh"
      >
        <el-pagination
          style="text-align: right"
          :current-page="sForm.page"
          :page-sizes="[10, 20, 50]"
          :page-size="sForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.abnormalAlarm-yihua {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
