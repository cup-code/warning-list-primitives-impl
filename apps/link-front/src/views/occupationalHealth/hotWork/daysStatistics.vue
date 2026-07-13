<script>
import { getAuthToken } from '@/utils/tab-session'
import moment from 'moment'
import {
  getHotWork,
  InspectionRecordIMPORT,
  removeHotWork,
} from '@/http/occupationalHealth/sanitation-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'

export default {
  name: 'hazardIdentification',
  components: { ExcelExport },
  data() {
    return {
      dateArr: [
        {
          tiem: '2023-06-02',
          name: '张三',
        },
        {
          tiem: '2023-06-10',
          name: '李四',
        },
        {
          tiem: '2023-06-20',
          name: '王五',
        },
      ],
      calendarDate: '',
      isLoading: false,
      isShow: true,
      total: 0,
      uploadLimit: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      searchData: {
        pageNum: 1,
        pageSize: 10,
        year: '',
        moon: '',
      },
      monthList: [
        {
          value: 1,
        },
        {
          value: 2,
        },
        {
          value: 3,
        },
        {
          value: 4,
        },
        {
          value: 5,
        },
        {
          value: 6,
        },
        {
          value: 7,
        },
        {
          value: 8,
        },
        {
          value: 9,
        },
        {
          value: 10,
        },
        {
          value: 11,
        },
        {
          value: 12,
        },
      ],
      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      formData: {},
      showExportDialog: false, // excel导出弹窗开关
      exportProp: {}, // excel导出弹窗参数
    }
  },
  watch: {
    calendarDate(newVal, oldVal) {
      if (newVal && moment(newVal).format('YYYY-MM-DD') != moment(oldVal).format('YYYY-MM-DD')) {
        console.log('新值=====', moment(newVal).format('YYYY-MM-DD'))
        this.calendarDate = ''
      }
    },
  },
  created() {
    this.getMonths()
    this.getTableData()
  },
  methods: {
    // 导出
    getExport() {
      const params = {}
      for (const key in this.searchData) {
        if (this.searchData[key] && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.searchData[key]
        }
      }
      this.exportProp = {
        businessData: {
          key: 'hotWork',
          name: '高温作业',
        },
        reqData: params,
      }
      this.showExportDialog = true
    },
    dialogEvt() {
      this.showExportDialog = false
    },
    // 下载模板
    getImportTemplate() {
      this.$utils.download('/excel/getImportTemplate/TemperatureInvestigateRecord', '')
    },
    getImport(data) {
      const params = {
        file: data.file,
      }
      this.isLoading = true
      InspectionRecordIMPORT(params, 'TemperatureInvestigateRecord')
        .then(({ data }) => {
          if (data.success) {
            this.$message.success('导入成功')
            this.getTableData()
          }
          else {
            this.$message.warning(data.message || '导入失败')
          }
        })
        .catch((err) => {
          this.$message.error('导入出错', err)
        })
        .finally(() => {
          this.isLoading = false
          this.$refs.fileUpload.clearFiles()
        })
    },

    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getHotWork(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    getData(e) {
      console.log(e)
    },
    // 打开表单弹窗(添加、查看、修改)
    // changeFn(type, infoData) {
    //   this.visibleForm = true
    //   this.dialogMethod = type
    //   switch (type) {
    //     case 'add':
    //       this.dialogTitle = '新增职业危害因数辨识'
    //       this.formData = {}
    //       break
    //     case 'edit':
    //       this.dialogTitle = '编辑职业危害因数辨识'
    //       this.formData = infoData
    //       break
    //     case 'view':
    //       this.dialogTitle = '查看职业危害因数辨识'
    //       this.formData = infoData
    //       break
    //   }
    // },

    // 删除弹窗
    delFn(v) {
      this.$confirm('确认删除此条记录' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeHotWork(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    resetSearch() {
      this.searchData.year = ''
      this.searchData.moon = ''
      this.getTableData()
    },
    // 获取当前时间赋值给select
    getMonths() {
      const date = new Date()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      this.searchData.year = JSON.stringify(year)
      this.searchData.moon = month
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard>
      <div class="header">
        <div>
          <span>2023年5月</span>
          <span>高温4天</span>
        </div>
        <div>
          <el-button-group>
            <el-button @click="getData(0)">
              上一年
            </el-button>
            <el-button @click="getData(1)">
              下一年
            </el-button>
            <el-button @click="getData(2)">
              上一月
            </el-button>
            <el-button @click="getData(3)">
              下一月
            </el-button>
          </el-button-group>
        </div>
      </div>
      <el-calendar
        ref="calendar"
        v-model="calendarDate"
      >
        <template
          slot="dateCell"
          slot-scope="{ date, data }"
        >
          {{ data.day.split('-').slice(2).join('-') }}
          <p
            v-for="(item, index) in dateArr"
            :key="index"
            :class="data.day == item.tiem ? 'is-selected' : ''"
          >
            <span v-if="data.day == item.tiem">{{ data.day.split('-').slice(2).join('-') }}</span>
          </p>
        </template>
      </el-calendar>
    </ECard>
  </div>

  <!-- <TreeTable v-loading="isLoading" :isShowLeft="false">
    <el-form slot="search" inline label-width="100">
      <el-form-item prop="year" label="年份">
        <el-date-picker v-model="searchData.year" value-format="yyyy" type="year" placeholder="选择年"> </el-date-picker>
      </el-form-item>
      <el-form-item prop="moon" label="月份">
        <el-select v-model="searchData.moon" placeholder="请选择" clearable>
          <el-option v-for="item in monthList" :key="item.value" :label="item.value" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchFn" size="small" icon="el-icon-search">查询</el-button>
        <el-button @click="resetSearch()" class="reset" size="small" icon="el-icon-refresh-right">重置</el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary" class="auxiliary-button">
      <el-button type="primary" @click="getExport">Excel导出</el-button>
      <el-button @click="getImportTemplate" plain size="mini" icon="el-icon-download">模板下载</el-button>
      <el-upload
        style="display: inline-flex; margin-left: 10px"
        action="#"
        ref="fileUpload"
        :headers="uploadLimit.header"
        :limit="1"
        :accept="uploadLimit.accept.toString()"
        :http-request="getImport"
        :show-file-list="false"
      >
        <el-button size="mini" type="primary" icon="el-icon-upload">Excel导入</el-button>
        <div slot="tip" class="el-upload__tip">只允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload>
    </div>
    <el-table slot="table" :data="tableData" :header-cell-style="{ background:'var(--ky-head-color)'}" align="center" height="100%">
      <el-table-column label="年份" align="center" prop="year" />
      <el-table-column label="月份" align="center" prop="moon"  />
      <el-table-column label="日期" align="center" prop="date" />
      <el-table-column label="最高温度" align="center" prop="maxTemperature" />
      <el-table-column label="最低温度" align="center" prop="minTemperature" />
      <el-table-column label="是否发放高温津贴" align="center" prop="isGrantAllowance"  />
      <el-table-column label="室内>=30/室外>=35" align="center" prop="isExceedingTemperature" />
      <el-table-column label="操作" min-width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button @click="delFn(scope.row)" type="text" style="color: var(--ky-danger)">清空</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      slot="page"
      @size-change="getTableData"
      @current-change="getTableData"
      :current-page.sync="searchData.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      style="padding-top: 10px"
      :page-size.sync="searchData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    />

    <el-dialog slot="dialog" class="normal-dialog" title="Excel导出" :visible.sync="showExportDialog" width="650px" append-to-body :close-on-click-modal="false" >
      <ExcelExport v-if="showExportDialog" v-bind="exportProp" @close="dialogEvt($event, 'export')" />
    </el-dialog>
  </TreeTable> -->
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin: 10px 0;
  margin-top: 20px;
  box-sizing: border-box;
  span {
    font-size: 20px;
    font-weight: bold;
    margin-right: 15px;
  }
}

.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

::v-deep .el-calendar-table td.is-today {
  color: #000 !important;
}
::v-deep .el-calendar-table td.is-selected {
  background-color: red !important;
  color: #fff !important;
}

// 取消hover样式
::v-deep .el-calendar-table {
  pointer-events: none;
}
// ::v-deep .el-calendar-table .el-calendar-day:hover {
//   background-color: red !important;
//   color: #fff !important;
// }
::v-deep .el-calendar-table td {
  position: relative;
}
.is-selected {
  width: 100%;
  height: 100%;
  position: absolute;
  top: -10px;
  left: 0;
  padding: 6px 6px;
  box-sizing: border-box;
  background-color: red;
  color: #fff;
}

::v-deep .el-calendar__header {
  display: none;
}

::v-deep .el-button {
  margin: 0 !important;
}
</style>
