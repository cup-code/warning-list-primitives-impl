<script>
import { LOGIN_LOG_LIST } from '@/http/excel-api'
import {
  deleteLog,
  getLog,
  getLogType,
} from '@/http/manage-api'
import { formatDate } from '@/utils'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport.vue'

export default {
  components: {
    ExcelExport,
  },
  data: () => ({
    tableData: [],
    loading: false,
    pageFlag: true,
    sForm: {
      page: 1, // 当前页
      pageSize: 10, // 页大小
      period: 1, // 默认最近7天 (0: 今天;  1: 最近7天;  2: 最近一个月;  3: 最近三个月;)
      sortType: 'desc', // 降序
      logType: '',
    },
    total: 0,
    drawer: false,
    sDate: '',
    pickerOptions: {
      shortcuts: [
        {
          text: '今天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          },
        },
      ],
    },
    typeList: [],
    showExportDialog: false, // excel导出弹窗开关
    exportProp: {}, // excel导出弹窗参数
  }),
  mounted() {
    this.init()
  },
  methods: {
    formatDate,
    init() {
      // 获取表单数据
      this.getDataList()
      // 获取日志类型
      this.getTypeList()
    },
    // 下拉框的选择
    dropFn(v) {
      let msg
      switch (v) {
        case 1:
          msg = '您确认要删除 一周 之前的所有日志么'
          break
        case 2:
          msg = '您确认要删除 一月 之前的所有日志么'
          break
        case 3:
          msg = '您确认要删除 三月 之前的所有日志么'
          break
        case 4:
          msg = '您确认要删除所有日志么'
          break
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteLog(v)
            .then((res) => {
              const resD = res.data
              const msg = resD.message

              if (resD && resD.success) {
                this.$message.success(msg || '删除成功')
                // 重置搜索条件, 默认第一页,每页10个,周期一周
                const form = this.sForm
                form.page = 1
                form.pageSize = 10
                form.period = 1
                form.logType = ''
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 查询条件 按钮
    showFn() {
      this.drawer = true
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
    // 查询
    doFn() {
      this.drawer = false
      const form = this.sForm

      // 重置页码、 大小
      form.page = 1
      form.pageSize = 10

      this.getDataList()
    },
    // 时间选择器
    dateChange(v) {
      const form = this.sForm
      if (v) {
        delete form.period
        const v0 = `${v[0]} 00:00:00`
        const v1 = `${v[1]} 00:00:00`
        form.startTm = +new Date(v0)
        form.endTm = +new Date(v1)
      }
      else {
        delete form.startTm
        delete form.endTm
        form.period = 1
      }
    },

    // 解决 分页器 当前页选中态不切换的 问题
    fixPageFn() {
      this.pageFlag = false
      this.$nextTick(() => {
        this.pageFlag = true
      })
    },

    getDataList() {
      // 解决 分页器 当前页选中态不切换的问题
      this.fixPageFn()

      this.loading = true
      this.tableData = []
      this.total = 0

      getLog(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.tableData = resD.result.list || []
            this.total = resD.result.total
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
    // 查询日志类型
    getTypeList() {
      this.typeList = []
      getLogType().then((res) => {
        const resD = res.data
        if (resD.success) {
          (resD.result || []).filter((item) => {
            if (item === 'LOGIN' || item === 'OPERATION') {
              const obj = {
                id: item,
                title: item === 'LOGIN' ? '登录日志' : '操作日志',
              }
              this.typeList.push(obj)
            }
          })
          this.typeList.unshift({
            id: '',
            title: '所有',
          })
        }
      })
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if (this.sForm[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: LOGIN_LOG_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
    dialogEvt() {
      this.showExportDialog = false
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="false"
    :isShowSearch="false"
  >
    <ECard slot="table">
      <div class="card-cell">
        <div>
          <el-button
            type="success"
            plain
            icon="el-icon-upload2"
            @click="exportClick"
          >
            导出登录情况
          </el-button>
          <el-button
            icon="el-icon-refresh-right"
            size="mini"
            @click="getDataList"
          >
            刷新
          </el-button>
        </div>
        <div>
          <el-button
            icon="el-icon-search"
            type="primary"
            size="mini"
            @click="showFn"
          >
            查询条件
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        size="small"
        style="width: 100%"
        height="92%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <!-- <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" size="mini" class="expand-form">
                    <el-form-item label="IP地址:">
                      <span>{{ props.row.ip }}</span>
                    </el-form-item>
                    <el-form-item label="执行结果描述:">
                      <span>{{ props.row.executionInfo }}</span>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column> -->
        <el-table-column
          label="操作时间"
          prop="logTm"
          align="center"
        >
          <template slot-scope="props">
            {{ formatDate(props.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作用户"
          prop="createdBy"
          align="center"
        />
        <el-table-column
          label="系统功能"
          prop="moduleName"
          align="center"
        />
        <el-table-column
          label="操作类型"
          prop="operationInfo"
          align="center"
        />
        <el-table-column
          label="执行结果"
          prop="executeSuccess"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.executeSuccess === true"
              size="medium"
              plain
              type="success"
            >
              成功
            </el-tag>
            <el-tag
              v-else
              size="medium"
              plain
              type="danger"
            >
              失败
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[10, 20, 50]"
        background
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <div slot="dialog">
      <!-- 查询 抽屉 -->
      <el-drawer :visible.sync="drawer" :with-header="false">
        <!-- 标题 -->
        <div class="drawer-title">
          查询条件
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="form"
            :model="sForm"
            label-width="85px"
            size="mini"
          >
            <el-form-item label="日志类型" prop="logType">
              <el-radio-group v-model="sForm.logType">
                <el-radio
                  v-for="item in typeList"
                  :key="item.id"
                  :label="item.id"
                >
                  {{
                    item.title
                  }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="操作用户" prop="operationUser">
              <el-input v-model="sForm.operationUser" />
            </el-form-item>
            <el-form-item label="操作时间">
              <el-date-picker
                v-model="sDate"
                style="width: 100%"
                size="mini"
                value-format="yyyy-MM-dd"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                @change="dateChange"
              />
            </el-form-item>
            <!-- <el-form-item label="IP地址" prop="ip">
            <el-input v-model="sForm.ip"></el-input>
          </el-form-item> -->
            <el-form-item label="操作类型" prop="operationType">
              <el-input v-model="sForm.operationType" />
            </el-form-item>
            <el-form-item label="功能模块" prop="moduleName">
              <el-input v-model="sForm.moduleName" />
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              @click="doFn"
            >
              查询
            </el-button>
          </div>
        </div>
      </el-drawer>
      <!-- excel导出 -->
      <el-dialog
        class="normal-dialog"
        title="导出登录情况"
        :visible.sync="showExportDialog"
        width="650px"
        append-to-body
        :close-on-click-modal="false"
      >
        <ExcelExport
          v-if="showExportDialog"
          v-bind="exportProp"
          @close="dialogEvt($event, 'export')"
        />
      </el-dialog>
    </div>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.app-main {
  padding: 10px;
  padding-bottom: 0;
  background: #f3f7f9;
  box-sizing: border-box;
}

.card-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.log-manage {
  padding: 10px;
  position: relative;

  .operation {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    button {
      margin-right: 5px;
    }
  }
  .bot-table {
    .expand-form {
      .el-form-item {
        margin-bottom: 0;
        .el-form-item__label {
          padding-right: 6px;
        }
      }
    }
  }
}
.head-search {
  width: 100%;
  padding: 10px 0;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
</style>
