<script>
import moment from 'moment'
import {
  jobOperation,
  paging,
  updatePermission,
} from '@/http/data-report/dataReport-api'
import {
  dataTypes,
  dateTimeRangeTypes,
  jobOperationTypes,
  tableDynamicColHeaders,
} from '@/views/dataReport/common/constants'

export default {
  data() {
    return {
      queryForm: {
        pickerOptions: null,
        dateTimeRange: [],
        dataTypeOptions: [],
        dataTypeSelected: null,
        rules: {
          dateTimeRange: [{ required: true, message: '请选择时间范围', trigger: 'blur' }],
          dataTypeSelected: [{ required: true, message: '请选择数据类型', trigger: 'blur' }],
        },
      },
      queryParams: {
        page: 1,
        limit: 20,
        field: 'create_date',
        type: 'desc',
        startDateTime: '',
        endDateTime: '',
        dataType: '',
        isPermission: '',
        isReported: '',
      },
      updateParams: {
        id: '',
        isPermission: '',
      },
      tableCols: [],
      tableData: [],
      totalCount: 0,
      loading: true,
      multipleSelection: [],
      oneTimeJobButton: {
        type: 'info',
        disabled: true,
        text: '手动上报',
      },
      timingJobButton: {
        type: 'info',
        disabled: true,
        icon: 'el-icon-video-play',
        text: '自动上报',
      },
      jobParams: {
        dataType: '',
      },
      loginInfo: null,
      reportInfo: null,
    }
  },
  created() {
    const me = this
    me.queryForm.dateTimeRange = me.computedDateTimeRange(dateTimeRangeTypes.today)
    me.queryForm.pickerOptions = {
      shortcuts: [
        {
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', me.computedDateTimeRange(dateTimeRangeTypes.today))
            me.searchClick()
          },
        },
        {
          text: '最近一周',
          onClick(picker) {
            picker.$emit('pick', me.computedDateTimeRange(dateTimeRangeTypes.oneWeek))
            me.searchClick()
          },
        },
        {
          text: '最近一个月',
          onClick(picker) {
            picker.$emit('pick', me.computedDateTimeRange(dateTimeRangeTypes.oneMonth))
            me.searchClick()
          },
        },
        {
          text: '最近三个月',
          onClick(picker) {
            picker.$emit('pick', me.computedDateTimeRange(dateTimeRangeTypes.threeMonth))
            me.searchClick()
          },
        },
      ],
    }
    me.loginInfo = JSON.parse(sessionStorage.getItem('user'))
    me.reportInfo = window.g.DATA_REPORT_URL.kde.find(item => me.loginInfo.companyId === item.id)
    me.dataTypeBuilder()
  },
  mounted() {
    const me = this
    if (me.loginInfo) {
      if (me.reportInfo) {
        me.dataTypeChange(me.queryForm.dataTypeSelected)
        return
      }
      me.$message.error('没有找到当前登录企业的数据上报配置信息，请查证后重试')
      return
    }
    me.$message.error('请先登录')
  },
  methods: {
    jobButtonsChange() {
      const me = this
      const msgTxt = '数据上报按钮将被禁用'
      if (me.loginInfo && me.reportInfo) {
        if (me.reportInfo.enableReport) {
          me.jobParams.dataType = me.queryForm.dataTypeSelected[2]
          jobOperation(
            jobOperationTypes.checkJobStatus,
            me.queryForm.dataTypeSelected,
            me.jobParams,
          )
            .then((r) => {
              switch (r.data.code) {
                case 200:
                  me.oneTimeJobButtonChange('success', false)
                  me.timingJobButtonChange('success', false)
                  break
                case 888:
                  me.oneTimeJobButtonChange('success', false)
                  me.timingJobButtonChange('danger', false)
                  break
                default:
                  me.oneTimeJobButtonChange('info', true)
                  me.timingJobButtonChange('info', true)
                  me.$message.warning(`${msgTxt}，${r.data.msg}`)
              }
            })
            .catch((err) => {
              me.$message.error(`${msgTxt}，检测任务状态异常：${err}`)
              me.oneTimeJobButtonChange('info', true)
              me.timingJobButtonChange('info', true)
            })
          return
        }
        me.$message.warning(`数据上报功能暂未开启，${msgTxt}`)
      }
    },
    computedDateTimeRange(v) {
      const now = moment()
      let end = moment(now).add(1, 'd')
      let start
      switch (v) {
        case dateTimeRangeTypes.oneWeek:
          start = moment(now).subtract(7, 'd')
          break
        case dateTimeRangeTypes.oneMonth:
          start = moment(now).subtract(1, 'M')
          break
        case dateTimeRangeTypes.threeMonth:
          start = moment(now).subtract(3, 'M')
          break
        default:
          start = now
      }
      start = moment([start.year(), start.month(), start.date(), 0, 0, 0]).format(
        'yyyy-MM-DD HH:mm:ss',
      )
      end = moment([end.year(), end.month(), end.date(), 0, 0, 0]).format('yyyy-MM-DD HH:mm:ss')
      return [start, end]
    },
    searchClick() {
      const me = this
      me.queryParams.dataType = me.queryForm.dataTypeSelected[2]
      me.queryParams.startDateTime = me.queryForm.dateTimeRange[0]
      me.queryParams.endDateTime = me.queryForm.dateTimeRange[1]
      me.$refs.queryForm.validate((valid) => {
        if (valid) {
          me.tableData = []
          paging(me.queryForm.dataTypeSelected, me.queryParams)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.tableData = res.data
                me.totalCount = res.count
                return
              }
              me.totalCount = 0
              me.$message.warning(res.msg)
            })
            .catch((err) => {
              me.$message.error(`数据查询异常：${err}`)
            })
            .finally(() => {
              me.loading = false
            })
        }
      })
    },
    dataTypeBuilder() {
      const me = this
      let dataTypesParent
      let dataTypesChildren
      if (me.reportInfo) {
        dataTypesParent = JSON.parse(JSON.stringify(dataTypes.find(item => item.value === 'kde')))
        if (dataTypesParent) {
          dataTypesChildren = dataTypesParent.children.find(
            item => me.reportInfo.name === item.value,
          )
          if (dataTypesChildren) {
            dataTypesParent.children = []
            dataTypesParent.children.push(dataTypesChildren)
          }
        }
        me.queryForm.dataTypeOptions = [dataTypesParent]
        me.queryForm.dataTypeSelected = [
          dataTypesParent.value,
          dataTypesParent.children[0].value,
          dataTypesParent.children[0].children[0].value,
        ]
        return
      }
      me.$message.error('请登陆后重试......')
    },
    dataTypeChange(v) {
      try {
        this.tableCols = tableDynamicColHeaders[v[0]].find(
          item => item.dataType === v[2],
        ).tableColumns
      }
      catch (e) {
        console.log(e)
      }

      this.jobButtonsChange()
      this.searchClick()
    },
    handleSelectChange(v) {
      this.multipleSelection = v
    },
    rowClick(r) {
      this.$refs.dataReportTable.toggleRowSelection(r)
    },
    getSelectedIds() {
      return this.multipleSelection
        .filter((v) => {
          return v.isReported !== 1
        })
        .map((v) => {
          return v.id
        })
        .join(',')
    },
    permissionClick(v) {
      const me = this
      let msg = ''

      switch (typeof v) {
        case 'number':
          me.updateParams.id = me.getSelectedIds()
          if (me.updateParams.id) {
            msg
              = v === 0
                ? '此操作将【允许】所有选中的数据上报，是否继续？'
                : '此操作将【禁止】所有选中的数据上报，是否继续？'
            me.updateParams.isPermission = v
            break
          }
          me.$message.warning('请先选择要批量操作的记录')
          return
        case 'object':
          me.updateParams.id = v.id
          if (v.isPermission === 0) {
            msg = '此操作将【禁止】本条数据上报, 是否继续?'
            me.updateParams.isPermission = 1
          }
          else {
            msg = '此操作将【允许】本条数据上报, 是否继续?'
            me.updateParams.isPermission = 0
          }
          break
        default:
          me.$message.warning('参数错误，请查证后重试')
          return
      }

      me.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          me.updateParams.dataType = me.queryForm.dataTypeSelected[2]
          updatePermission(me.queryForm.dataTypeSelected, me.updateParams)
            .then((res) => {
              const data = res.data
              if (data.success) {
                me.searchClick()
                return
              }
              me.$message.success(data.msg)
            })
            .catch((err) => {
              me.$message.error(`操作异常：${err}`)
            })
        })
        .catch(() => {
          me.$message.info('已取消')
        })
    },
    oneTimeJobButtonChange(type, isDisabled) {
      const me = this
      me.oneTimeJobButton.type = type
      me.oneTimeJobButton.disabled = isDisabled
    },
    timingJobButtonChange(type, isDisabled) {
      const me = this
      me.timingJobButton.type = type
      me.timingJobButton.disabled = isDisabled

      switch (me.timingJobButton.type) {
        case 'success':
          me.timingJobButton.type = 'success'
          me.timingJobButton.icon = 'el-icon-video-play'
          me.timingJobButton.text = '启动自动上报'
          break
        case 'danger':
          me.timingJobButton.type = 'danger'
          me.timingJobButton.icon = 'el-icon-video-pause'
          me.timingJobButton.text = '停止自动上报'
          break
        case 'info':
          me.timingJobButton.type = 'info'
          me.timingJobButton.icon = 'el-icon-video-play'
          me.timingJobButton.text = '启动自动上报'
          break
        default:
      }
    },
    triggerJobClick() {
      const me = this
      me.jobParams.dataType = me.queryForm.dataTypeSelected[2]
      jobOperation(jobOperationTypes.trigger, me.queryForm.dataTypeSelected, me.jobParams)
        .then((r) => {
          const res = r.data
          if (res.code === 200) {
            me.$message.success(res.msg)
          }
          else {
            me.$message.error(res.msg)
          }
        })
        .catch((err) => {
          me.$message.error(`手动上报异常：${err}`)
        })
    },
    timingJobClick() {
      const me = this
      me.jobParams.dataType = me.queryForm.dataTypeSelected[2]
      jobOperation(jobOperationTypes.checkJobStatus, me.queryForm.dataTypeSelected, me.jobParams)
        .then((r) => {
          let res = r.data
          switch (res.code) {
            case 200:
              jobOperation(
                jobOperationTypes.startup,
                me.queryForm.dataTypeSelected,
                me.jobParams,
              ).then((s) => {
                res = s.data
                if (res.code === 200) {
                  me.$message.success(res.msg)
                  me.timingJobButtonChange('danger', false)
                }
                else {
                  me.$message.error(res.msg)
                }
              })
              break
            case 888:
              jobOperation(
                jobOperationTypes.shutdown,
                me.queryForm.dataTypeSelected,
                me.jobParams,
              ).then((t) => {
                res = t.data
                if (res.code === 200) {
                  me.$message.success(res.msg)
                  me.timingJobButtonChange('success', false)
                }
                else {
                  me.$message.error(res.msg)
                }
              })
              break
            default:
              me.$message.error(res.msg)
          }
        })
        .catch((err) => {
          me.$message.error(`自动上报异常：${err}`)
        })
    },
  },
}
</script>

<template>
  <SearchTable>
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="queryForm"
      inline
      :rules="queryForm.rules"
      :model="queryForm"
    >
      <el-form-item
        label="时间范围"
        prop="dateTimeRange"
      >
        <el-date-picker
          v-model="queryForm.dateTimeRange"
          type="datetimerange"
          :picker-options="queryForm.pickerOptions"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          align="right"
        />
      </el-form-item>

      <el-form-item
        label="数据类型"
        prop="dataTypeSelected"
      >
        <el-cascader
          v-model="queryForm.dataTypeSelected"
          :options="queryForm.dataTypeOptions"
          :props="{ expandTrigger: 'hover' }"
          :show-all-levels="false"
          @change="dataTypeChange"
        />
      </el-form-item>

      <el-form-item label="是否上报">
        <el-select
          v-model="queryParams.isPermission"
          style="width: 90px"
          @change="searchClick"
        >
          <el-option
            label="全部"
            value=""
          />
          <el-option
            label="允许"
            value="0"
          />
          <el-option
            label="禁止"
            value="1"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="上报状态">
        <el-select
          v-model="queryParams.isReported"
          style="width: 90px"
          @change="searchClick"
        >
          <el-option
            label="全部"
            value=""
          />
          <el-option
            label="未上报"
            value="0"
          />
          <el-option
            label="已上报"
            value="1"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="searchClick"
        >
          查询
        </el-button>
        <el-button
          :type="oneTimeJobButton.type"
          :disabled="oneTimeJobButton.disabled"
          icon="el-icon-upload"
          @click="triggerJobClick"
        >
          {{ oneTimeJobButton.text }}
        </el-button>
        <el-button
          :type="timingJobButton.type"
          :disabled="timingJobButton.disabled"
          :icon="timingJobButton.icon"
          @click="timingJobClick"
        >
          {{ timingJobButton.text }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      ref="dataReportTable"
      slot="table"
      v-loading="loading"
      height="100%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      @selection-change="handleSelectChange"
      @row-click="rowClick"
    >
      <el-table-column
        align="center"
        type="selection"
        width="45"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        v-for="(item, index) in tableCols"
        :key="index"
        min-width="60"
        align="center"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span v-if="item.prop === 'isPermission'">
            <el-tag
              v-if="scope.row.isPermission === 0"
              type="success"
              size="medium"
            >是</el-tag>
            <el-tag
              v-if="scope.row.isPermission !== 0"
              type="info"
              size="medium"
            >否</el-tag>
          </span>
          <span v-else-if="item.prop === 'isReported'">
            <el-tag
              v-if="scope.row.isReported === 0"
              type="info"
              size="medium"
            >未上报</el-tag>
            <el-tag
              v-if="scope.row.isReported !== 0"
              type="success"
              size="medium"
            >已上报</el-tag>
          </span>
          <span v-else-if="item.prop === 'deleted'">
            <el-tag
              v-if="scope.row.deleted === '0'"
              type="success"
              size="medium"
            >正常</el-tag>
            <el-tag
              v-if="scope.row.deleted !== '0'"
              type="danger"
              size="medium"
            >已删除</el-tag>
          </span>
          <span v-else>
            <span>{{ scope.row[item.prop] }}</span>
          </span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="其它"
        width="60px"
      >
        <template #default="scope">
          <el-popover
            trigger="hover"
            placement="top"
          >
            <p>
              <el-tag size="medium">
                创建人：{{ scope.row.createBy }}
              </el-tag>
            </p>
            <p>
              <el-tag size="medium">
                修改人：{{ scope.row.updateBy }}
              </el-tag>
            </p>
            <p>
              <el-tag size="medium">
                修改时间：{{ scope.row.updateDate }}
              </el-tag>
            </p>
            <div
              slot="reference"
              class="name-wrapper"
            >
              <el-tag size="medium">
                <el-icon class="el-icon-info" />
              </el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="操作"
        width="130px"
      >
        <template #header="scope">
          <el-button-group>
            <el-tooltip
              class="item"
              effect="dark"
              content="批量允许"
              placement="top"
            >
              <el-button
                type="success"
                icon="el-icon-key"
                @click="permissionClick(0)"
              />
            </el-tooltip>

            <el-tooltip
              class="item"
              effect="dark"
              content="批量禁止"
              placement="top"
            >
              <el-button
                type="danger"
                icon="el-icon-lock"
                @click="permissionClick(1)"
              />
            </el-tooltip>
          </el-button-group>
        </template>

        <template #default="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="仅禁止本条数据"
            placement="left"
          >
            <el-button
              v-if="scope.row.isPermission === 0 && scope.row.isReported === 0"
              type="danger"
              icon="el-icon-lock"
              @click.stop="permissionClick(scope.row)"
            >
              禁止上报
            </el-button>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="仅允许本条数据"
            placement="left"
          >
            <el-button
              v-if="scope.row.isPermission !== 0 && scope.row.isReported === 0"
              type="success"
              icon="el-icon-key"
              @click.stop="permissionClick(scope.row)"
            >
              允许上报
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      slot="page"
      style="margin: 0 auto"
      background
      :current-page.sync="queryParams.page"
      :page-size.sync="queryParams.limit"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="totalCount"
      @current-change="searchClick"
      @size-change="searchClick"
    />
  </SearchTable>
</template>
