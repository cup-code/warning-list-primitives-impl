<script>
// 导出表格 用到的  begin
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  exportHisDataById,
  getAllIoById,
  getDeviceListByPid,
  getHisDataById,
} from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'
import { formatDate } from '@/utils'
// 导出表格 用到的  end
export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      pid: '',
      did: '',
      page: 1,
      pageSize: 10,
    },
    total: 0,
    productList: [], // 产品列表
    devList: [], // 终端列表
    ioList: [],
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

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
    exDevList: [], // 导出滑框中的 终端列表
    exIoList: [], // 导出滑框中的 测点列表
    exDate: '',
  }),
  created() {
    this.getProList()
    this.getPrefix()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      const { pid, did } = this.sForm
      getHisDataById(pid, did, this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            if (resD.result) {
              this.tableData = resD.result.results || []
              this.total = resD.result.numResults
            }
            else {
              this.tableData = []
            }
          }
          else {
            this.$message.error(msg || '获取 历史测点数据 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 历史测点数据 失败')
        })
    },
    // 获取产品列表
    getProList() {
      getAllProduct().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.productList = resD.result || []
        }
      })
    },
    // 获取终端
    getDevices(id) {
      this.devList = []
      if (!id)
        return
      // let params = {productId: id};
      getDeviceListByPid(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.devList = resD.result || []
        }
      })
    },
    // 获取终端测点
    getDevIOs(id) {
      this.ioList = []
      getAllIoById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.ioList = resD.result || []
        }
      })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 查询
    searchFn() {
      if (!this.sForm.pid) {
        this.$message.error('请选择产品')
        return
      }
      if (!this.sForm.did) {
        this.$message.error('请选择终端')
        return
      }
      this.getDataList()
    },
    // 导出
    exportFn() {
      if (!this.sForm.pid) {
        this.$message.error('请选择产品')
        return
      }
      if (!this.sForm.did) {
        this.$message.error('请选择终端')
        return
      }

      const param = {
        raw: true, // 表示导出的数据 是否是未加工的
      }
      // 从表生成工作簿对象
      const wb = XLSX.utils.table_to_book(document.getElementById('point_table'), param)

      // 获取二进制字符串作为输出
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })

      // 生成文件名
      const pName = this.productList.find(item => item.id === this.sForm.pid).name // 产品名称
      const dName = this.devList.find(item => item.id === this.sForm.did).name // 终端名称
      const fileName = `${pName}_${dName}`

      try {
        FileSaver.saveAs(
          // Blob 对象表示一个不可变、原始数据的类文件对象。
          // Blob 表示的不一定是JavaScript原生格式的数据。//File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: 'application/octet-stream' }),
          // 设置导出文件名称
          `${fileName}.xlsx`,
        )
      }
      catch (e) {
        if (typeof console !== 'undefined')
          console.log(e, wbout)
      }
      return wbout
    },
    // 产品change
    productFn(v) {
      this.sForm.did = '' // 清空终端id
      this.$set(this.sForm, 'ioCode', '') // 清空终端测点
      this.ioList = [] // 清空终端测点列表

      this.getDevices(v)
    },
    // 终端change
    devFn(v) {
      this.sForm.ioCode = '' // 清空终端测点
      this.getDevIOs(v)
    },
    // 时间选择器
    dateChange(v) {
      const form = this.sForm
      if (v) {
        form.startTime = v[0]
        form.endTime = v[1]
      }
      else {
        delete form.startTime
        delete form.endTime
      }
    },

    // 后台导出 按钮
    backExportFn() {
      this.drawer_ex = true
      this.exForm = Object.assign({}, this.sForm)
      delete this.exForm.page
      delete this.exForm.pageSize
    },
    // 后台导出 确定
    backExportDoFn() {
      if (!this.exForm.pid) {
        this.$message.error('请选择产品')
        return
      }
      if (!this.exForm.did) {
        this.$message.error('请选择终端')
        return
      }
      exportHisDataById(this.exForm).then((res) => {
        const resD = res.data
        const msg = resD.message
        if (resD.success) {
          window.open(this.filePrefix + resD.result, '_self')
        }
        else {
          this.$message.error(msg || '导出失败')
        }
      })
    },
    // 导出滑框中的 时间选择器
    exDateChange(v) {
      const form = this.exForm
      if (v) {
        form.startTime = v[0]
        form.endTime = v[1]
      }
      else {
        delete form.startTime
        delete form.endTime
      }
    },
    // 导出滑框中的 产品change
    exProductFn(v) {
      this.exForm.did = '' // 清空终端id
      this.$set(this.exForm, 'ioCode', '') // 清空终端测点
      this.exIoList = [] // 清空终端测点列表

      this.exGetDevices(v)
    },
    // 导出滑框中的 终端change
    exDevFn(v) {
      this.exForm.ioCode = '' // 清空终端测点
      this.exGetDevIOs(v)
    },
    // 导出滑框中的 获取终端
    exGetDevices(id) {
      this.exDevList = []
      if (!id)
        return
      getDeviceListByPid(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.exDevList = resD.result || []
        }
      })
    },
    // 导出滑框中的 获取终端测点
    exGetDevIOs(id) {
      this.exIoList = []
      getAllIoById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.exIoList = resD.result || []
        }
      })
    },
    resetEvent() {
      this.sForm.pid = ''
      this.sForm.did = ''
      this.sForm.ioCode = ''
      this.sDate = ''
      this.getProList()
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <!-- 头部 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="sForm"
        :model="sForm"
        size="mini"
        inline
      >
        <el-form-item label="产品">
          <el-select
            v-model="sForm.pid"
            placeholder="请选择"
            style="width: 150px"
            filterable
            @change="productFn"
          >
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="终端">
          <el-select
            v-model="sForm.did"
            placeholder="请选择"
            style="width: 150px"
            filterable
            @change="devFn"
          >
            <el-option
              v-for="item in devList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测点">
          <el-select
            v-model="sForm.ioCode"
            placeholder="请选择"
            style="width: 150px"
            filterable
          >
            <el-option
              v-for="item in ioList"
              :key="item.id"
              :label="item.name"
              :value="item.code"
            >
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="时间"
          style="margin-bottom: 0"
        >
          <el-date-picker
            v-model="sDate"
            style="width: 100%"
            size="mini"
            value-format="timestamp"
            type="datetimerange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            @change="dateChange"
          />
        </el-form-item>
        <el-form-item>
          <EButton
            btnIcon="el-icon-search"
            size="mini"
            type="primary"
            @click="searchFn"
          >
            查询
          </EButton>
          <EButton
            icon="sync"
            plain
            size="mini"
            @click="resetEvent"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <!-- <el-button icon="el-icon-download" size="mini" type="success" @click="exportFn">导出</el-button> -->
        <EButton
          plain
          btnIcon="el-icon-download"
          type="info"
          size="mini"
          @click="backExportFn"
        >
          导出
        </EButton>
      </div>
      <el-table
        id="point_table"
        v-loading="loading"
        class="point-table"
        :data="tableData"
        size="mini"
        style="width: 100%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="测点名称"
          prop="name"
          align="center"
        />
        <el-table-column
          label="测点编码"
          prop="ioCode"
          align="center"
        />
        <el-table-column
          label="测点值"
          prop="value"
          align="center"
        />
        <el-table-column
          label="单位"
          prop="unit"
          align="center"
        />
        <el-table-column
          label="测点类型"
          prop="type"
          align="center"
        />
        <el-table-column
          label="事件时间"
          prop="eventDate"
          align="center"
        >
          <template slot-scope="props">
            {{ formatDate(props.row.eventDate) }}
          </template>
        </el-table-column>
        <el-table-column
          label="接收时间"
          prop="receivedDate"
          align="center"
        >
          <template slot-scope="props">
            {{ formatDate(props.row.receivedDate) }}
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <!-- 内容 -->

    <!-- 页码 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right; background: #ffffff"
        :current-page="sForm.page"
        :page-size="sForm.pageSize"
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="pageCurFn"
      />
    </ECard>

    <template slot="dialog">
      <!-- 后台导出 抽屉 -->
      <el-drawer
        :visible.sync="drawer_ex"
        :with-header="false"
      >
        <!-- 标题 -->
        <div class="drawer-title">
          筛选条件
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <el-form
            ref="exForm"
            :model="exForm"
            label-width="50px"
            size="mini"
          >
            <el-form-item label="产品">
              <el-select
                v-model="exForm.pid"
                placeholder="请选择"
                style="width: 100%"
                @change="exProductFn"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="终端">
              <el-select
                v-model="exForm.did"
                placeholder="请选择"
                style="width: 100%"
                @change="exDevFn"
              >
                <el-option
                  v-for="item in exDevList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="测点">
              <el-select
                v-model="exForm.ioCode"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in exIoList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.code"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="时间"
              style="margin-bottom: 0"
            >
              <el-date-picker
                v-model="exDate"
                style="width: 100%"
                size="mini"
                value-format="timestamp"
                type="datetimerange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                @change="exDateChange"
              />
            </el-form-item>
          </el-form>

          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="success"
              @click="backExportDoFn"
            >
              导出
            </el-button>
          </div>
        </div>
      </el-drawer>
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  // position: relative;
  // padding: 10px;
  // background: #f3f7f9;
  // .header {
  //   background: #ffffff;
  //   padding: 10px 5px 0 10px;
  // }
  .mid-con {
    padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
  .auxiliary-button {
    margin-top: 10px;
    padding: 10px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
