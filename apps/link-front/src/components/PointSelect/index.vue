<script>
import { getDeviceListByPid, getRealDataById } from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'

export default {
  props: {
    selectData: {
      type: Array,
      default: () => {
        return []
      },
    },
    title: {
      type: String,
      default: () => {
        return '绑定点位'
      },
    },
    limit: {
      type: Number,
      default: 999999,
    },
    autoSelectFirst: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dataListAllSelections: [], // 所有选中的数据包含跨页数据
      dataListSelections: [],
      idKey: 'id', // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      dataList: [], // 测点列表
      total: 0,
      loading: false,
      visible: false,
      sForm: {
        page: 1,
        pageSize: 10,
        productType: '',
        deviceId: '',
        ioName: '',
        ioCode: '',
      },
      productList: [], // 产品类型列表
      deviceList: [], // 终端列表
    }
  },
  methods: {
    async init() {
      this.visible = true
      await this.$nextTick()
      this.dataListAllSelections = JSON.parse(JSON.stringify(this.selectData))
      this.$refs.sForm.resetFields()
      this.deviceList = []
      this.dataList = []
      this.total = 0

      const productList = await this.getAllProduct()
      if (!this.autoSelectFirst)
        return

      const firstProduct = productList[0]
      if (!firstProduct)
        return

      this.sForm.productType = firstProduct.id
      const deviceList = await this.getDeviceList(firstProduct.id)
      const firstDevice = deviceList[0]
      if (!firstDevice)
        return

      this.sForm.deviceId = firstDevice.id
      this.search()
    },
    getAllProduct() {
      return getAllProduct().then(({ data }) => {
        this.productList = data.result || []
        return this.productList
      })
    },
    getDeviceList(pid) {
      if (!pid) {
        this.deviceList = []
        return Promise.resolve([])
      }
      return getDeviceListByPid(pid).then(({ data }) => {
        this.deviceList = data.result || []
        return this.deviceList
      })
    },
    getTemplateRow(index, row) {
      // 获取选中数据
      this.dataListSelections = [row]
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.dataListAllSelections || this.dataListAllSelections.length <= 0) {
        this.$refs.pointTable.clearSelection()
        return
      }
      // 标识当前行的唯一键的名称
      const idKey = this.idKey
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      this.$refs.pointTable.clearSelection()
      for (let i = 0; i < this.dataList.length; i++) {
        if (selectAllIds.includes(this.dataList[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.pointTable.toggleRowSelection(this.dataList[i], true)
        }
      }
    },
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = this.idKey
      const that = this
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.dataListAllSelections.length <= 0) {
        this.dataListSelections.forEach((row) => {
          that.dataListAllSelections.push(row)
        })
        return
      }
      // 总选择里面的key集合
      const selectAllIds = []
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey])
      })
      const selectIds = []
      // 获取当前页选中的id
      this.dataListSelections.forEach((row) => {
        selectIds.push(row[idKey])
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (!selectAllIds.includes(row[idKey])) {
          that.dataListAllSelections.push(row)
        }
      })
      const noSelectIds = []
      // 得到当前页没有选中的id
      this.dataList.forEach((row) => {
        if (!selectIds.includes(row[idKey])) {
          noSelectIds.push(row[idKey])
        }
      })
      noSelectIds.forEach((id) => {
        if (selectAllIds.includes(id)) {
          for (let i = 0; i < that.dataListAllSelections.length; i++) {
            if (that.dataListAllSelections[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.dataListAllSelections.splice(i, 1)
              break
            }
          }
        }
      })
    },
    del(tag) {
      this.dataListAllSelections.splice(this.dataListAllSelections.indexOf(tag), 1)
      this.$nextTick(() => {
        this.setSelectRow()
      })
    },
    // 获取数据列表
    refreshList() {
      this.loading = true
      getRealDataById(this.sForm.productType, this.sForm.deviceId, this.sForm)
        .then(({ data }) => {
          this.loading = false
          if (data.success && data.result) {
            if (data.result.list && data.result.list.length) {
              data.result.list.forEach((item) => {
                item.deviceId = this.sForm.deviceId // 给测点数据加上终端id，保存的时候使用
                const currentDevice = this.deviceList.find((device) => {
                  return device.id === this.sForm.deviceId
                })
                item.deviceName = currentDevice ? currentDevice.name : ''
              })
            }
            this.dataList = data.result.list
            this.total = data.result.total
          }
          else {
            this.$message.error(data.message || '查询测点失败')
          }
          this.$nextTick(() => {
            this.setSelectRow()
          })
        })
        .catch((_err) => {
          this.loading = false
          this.$message.error('查询测点失败')
        })
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    search() {
      this.sForm.page = 1
      this.refreshList()
    },
    handleNodeClick(data) {
      this.sForm.departmentId = data.id
      this.refreshList()
    },
    // 每页数
    sizeChangeHandle(val) {
      this.sForm.pageSize = val
      this.sForm.page = 1
      this.refreshList()
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    // 当前页
    currentChangeHandle(val) {
      this.sForm.page = val
      this.refreshList()
      this.$nextTick(() => {
        this.changePageCoreRecordData()
      })
    },
    doSubmit() {
      if (this.limit < this.dataListAllSelections.length) {
        this.$message.error(`你最多只能选择${this.limit}个测点`)
        return
      }
      this.visible = false
      this.$emit('doSubmit', this.dataListAllSelections)
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    width="1000px"
    :close-on-click-modal="false"
    :append-to-body="true"
    class="normal-dialog"
    :visible.sync="visible"
  >
    <el-container style="height: 500px">
      <el-container>
        <el-header style="text-align: left; font-size: 12px; height: 80px">
          <el-form
            ref="sForm"
            size="small"
            :inline="true"
            :model="sForm"
            @submit.native.prevent
          >
            <el-form-item prop="productType" label="产品类型">
              <el-select
                v-model="sForm.productType"
                placeholder="请选择"
                style="width: 100%"
                filterable
                @change="getDeviceList"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item prop="deviceId" label="终端名称">
              <el-select
                v-model="sForm.deviceId"
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in deviceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item prop="ioName" label="测点名称">
              <el-input
                v-model="sForm.ioName"
                size="small"
                placeholder="测点名称"
                clearable
              />
            </el-form-item>
            <el-form-item prop="ioCode" label="测点编码">
              <el-input
                v-model="sForm.ioCode"
                size="small"
                placeholder="测点编码"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-search"
                @click="search()"
              >
                查询
              </el-button>
            </el-form-item>
          </el-form>
        </el-header>
        <el-main>
          <el-table
            ref="pointTable"
            v-loading="loading"
            :data="dataList"
            size="small"
            height="calc(100% - 42px)"
            style="width: 100%"
            @selection-change="selectionChangeHandle"
          >
            <el-table-column
              v-if="limit <= 1"
              header-align="center"
              align="center"
              width="50"
            >
              <template slot-scope="scope">
                <el-radio
                  :label="scope.row.id"
                  :value="dataListAllSelections[0] && dataListAllSelections[0].id"
                  @change.native="getTemplateRow(scope.$index, scope.row)"
                >
                  <span />
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column
              v-if="limit > 1"
              type="selection"
              header-align="center"
              align="center"
              width="50"
            />
            <el-table-column type="index" label="序号" width="50" />
            <el-table-column label="测点名称" prop="name" align="center" />
            <el-table-column label="测点编号" prop="code" align="center" />
            <el-table-column label="测点值" prop="value" align="center">
              <template slot-scope="props">
                <span>{{
                  props.row.value
                    ? typeof props.row.value === "number"
                      ? props.row.value.toFixed(2)
                      : Number(props.row.value).toFixed(2)
                    : "--"
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="测点类型" prop="type" align="center">
              <template slot-scope="props">
                <span>{{ $dictUtils.getDictLabel("output_type", props.row.type) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="测点值输出类型"
              prop="varType"
              align="center"
              width="150"
            >
              <template slot-scope="props">
                <span v-if="props.row.varType === 1">整型(Int)</span>
                <span v-if="props.row.varType === 2">浮点型(Double)</span>
                <span v-if="props.row.varType === 3">字符串(String)</span>
                <span v-if="props.row.varType === 4">布尔型(Boolean)</span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :current-page="sForm.page"
            :page-sizes="[10, 20, 30]"
            background
            :page-size="sForm.pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 10px; text-align: right"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </el-main>
      </el-container>
      <el-aside width="200px">
        <div
          v-if="dataListAllSelections.length"
          style="font-weight: bold; margin-bottom: 10px"
        >
          已绑点位
        </div>
        <el-tag
          v-for="tag in dataListAllSelections"
          :key="tag.id"
          closable
          :disable-transitions="false"
          @close="del(tag)"
        >
          {{ `${tag.deviceName}-${tag.name}` }}
        </el-tag>
      </el-aside>
    </el-container>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button size="small" type="primary" @click="doSubmit()">确认保存</el-button>
    </span>
  </el-dialog>
</template>
