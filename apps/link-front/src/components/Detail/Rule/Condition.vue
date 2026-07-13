<script>
import { getAllIoById, getDeviceListByPid } from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'
import {
  addRuleCondition,
  changeTriggerType,
  deleteRuleCondition,
  editRuleCondition,
  getRuleBaseInfo,
  getRuleCondition,
} from '@/http/rule/rule-api'

export default {
  props: ['rid'],
  data: () => ({
    loading: false,
    tableData: [],
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    productList: [], // 产品列表
    deviceList: [], // 终端列表
    ioList: [], // 产品测点列表
    // 符号列表
    symbolList: [
      { name: '大于', value: '1', id: 1 },
      { name: '小于', value: '2', id: 2 },
      { name: '等于', value: '3', id: 3 },
      { name: '不等于', value: '4', id: 4 },
      { name: '上报即触发', value: '5', id: 5 },
    ],

    // 触发方式 (ANY：任一满足；ALL：全部满足)
    triggerType: '',
    // 触发方式列表
    typeList: [
      { name: '任一满足', value: 'ANY' },
      { name: '全部满足', value: 'ALL' },
    ],
  }),
  created() {
    this.getDataList()
    this.getProList()
    this.getTrigger() // 获取条件的触发方式
  },
  methods: {
    getDataList() {
      getRuleCondition(this.rid)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            resD.result.forEach((item) => {
              item.symbolName = item.symbol
                ? (
                    this.symbolList.find((sym) => {
                      return sym.value === item.symbol
                    }) || {}
                  ).name
                : ''
              item.thresholdValue = item.symbol === '5' ? '上报即触发' : item.thresholdValue
            })
            this.tableData = resD.result || []
          }
          else {
            this.$message.error(msg || '获取 规则条件 失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('获取 规则条件 失败')
        })
    },
    getTrigger() {
      getRuleBaseInfo(this.rid).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.triggerType = (resD.result || {}).triggerType
        }
      })
    },
    // 获取产品列表
    getProList() {
      getAllProduct().then((res) => {
        const resD = res.data
        const msg = resD.message
        if (resD.success === true) {
          this.productList = resD.result || []
        }
      })
    },
    // 根据产品id获取终端
    getDevList(pid) {
      if (!pid)
        return
      getDeviceListByPid(pid).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.deviceList = resD.result || []
        }
      })
    },
    // 根据终端id获取测点列表
    getIOsByDevId(id) {
      getAllIoById(id).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.ioList = resD.result
        }
      })
    },
    // 产品列表的 change
    productFn(v) {
      // 0. 先清空上次所选
      this.deviceList = []
      this.ioList = []

      this.form.productName = '' // 产品的
      this.$set(this.form, 'did', '') // 终端的
      this.form.deviceName = ''
      this.form.deviceCode = ''
      this.$set(this.form, 'ioCode', '') // io的
      this.form.ioName = ''

      // 1. 在 form 中记录 产品名字
      let i
      let tar
      const list = this.productList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.id == v) {
          this.form.productName = tar.name
          break
        }
      }
      // 2. 请求该产品下的终端列表
      this.getDevList(v)
    },
    // 终端列表的 change
    devFn(v) {
      // 0. 先清空上次所选
      this.ioList = []
      this.$set(this.form, 'ioCode', '') // io的
      this.form.ioName = ''

      // 1.  在form 中记录 终端编码 和 终端名称
      let i
      let tar
      const list = this.deviceList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.id == v) {
          this.form.deviceName = tar.name
          this.form.deviceCode = tar.code
          break
        }
      }
      // 2. 请求该终端下的 测点列表
      this.getIOsByDevId(v)
    },
    // io列表的 change
    ioFn(v) {
      // 在form 中记录 测点名称
      let i
      let tar
      const list = this.ioList
      const len = list.length
      for (i = 0; i < len; i++) {
        tar = list[i]
        if (tar.code == v) {
          this.form.ioName = tar.name
          break
        }
      }
    },

    // 新增
    addFn() {
      this.form = {}
      this.drawerTitle = '添加触发条件'
      this.drawerType = 0
      this.drawer = true

      this.deviceList = [] // 清空终端列表
      this.ioList = [] // 清空测点列表
    },
    // 编辑
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '修改触发条件'
      this.drawerType = 1
      this.drawer = true

      // 请求该产品下的终端列表
      this.getDevList(v.pid)
      // 请求该终端下的 测点列表
      this.getIOsByDevId(v.did)
    },
    // 删除
    delFn(v) {
      this.$confirm('您确认要删除条件?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteRuleCondition(v.id)
            .then((res) => {
              const resD = res.data
              const msg = resD.message

              if (resD.success === true) {
                this.$message.success('删除成功')
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
    // 提交
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        // 添加
        if (this.drawerType === 0) {
          this.form.ruleId = this.rid // 添加当前的规则id

          addRuleCondition(this.form)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success === true) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          editRuleCondition(this.form)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success === true) {
                this.$message.success(msg || '修改成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '修改失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('修改失败')
            })
        }
      })
    },
    // 触发方式列表 change
    triggerFn(v) {
      const params = {
        id: this.rid,
        type: v,
      }
      changeTriggerType(params)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '设置成功')
          }
          else {
            this.$message.error(msg || '设置失败')
          }
        })
        .catch((err) => {
          this.$message.error('设置失败')
        })
    },
  },
}
</script>

<template>
  <div class="option-rule-template">
    <!-- 按钮 -->
    <el-row>
      <el-col
        :span="12"
        style="text-align: left"
      >
        <span style="margin-right: 6px">触发方式: </span>
        <el-select
          v-model="triggerType"
          placeholder="请选择"
          size="mini"
          @change="triggerFn"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          >
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
        <el-button
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          添加触发条件
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loading"
          class="option-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            label="终端"
            prop="deviceName"
            align="center"
          />
          <el-table-column
            label="测点"
            prop="ioName"
            align="center"
          />
          <el-table-column
            label="条件"
            prop="symbolName"
            align="center"
          />
          <el-table-column
            label="阈值"
            prop="thresholdValue"
            align="center"
          />
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <EButton
                icon="edit"
                size="mini"
                type="text"
                @click="editFn(scope.row)"
              >
                编辑
              </EButton>
              <EButton
                icon="delete"
                size="mini"
                type="text"
                @click="delFn(scope.row)"
              >
                删除
              </EButton>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
          tabindex="0"
        >
          <el-form-item
            label="产品列表"
            prop="pid"
          >
            <el-select
              v-model="form.pid"
              placeholder="请选择"
              style="width: 100%"
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
          <el-form-item
            label="终端列表"
            prop="did"
          >
            <el-select
              v-model="form.did"
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="devFn"
            >
              <el-option
                v-for="item in deviceList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="选择测点"
            prop="ioCode"
          >
            <el-select
              v-model="form.ioCode"
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="ioFn"
            >
              <el-option
                v-for="item in ioList"
                :key="item.id"
                :label="`${item.name}-${item.code}`"
                :value="item.code"
              >
                <!-- <span>{{ item.name }}</span> -->
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="选择条件"
            prop="symbol"
          >
            <el-select
              v-model="form.symbol"
              placeholder="请选择"
              style="width: 100%"
              filterable
              @change="ioFn"
            >
              <el-option
                v-for="item in symbolList"
                :key="item.id"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="form.symbol === '1' || form.symbol === '2'"
            label="阈值"
            prop="thresholdValue"
          >
            <el-input-number
              key="number"
              v-model="form.thresholdValue"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item
            v-if="form.symbol === '3' || form.symbol === '4'"
            label="阈值"
            prop="thresholdValue"
          >
            <el-input
              key="string"
              v-model="form.thresholdValue"
            />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.option-rule-template {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .option-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
