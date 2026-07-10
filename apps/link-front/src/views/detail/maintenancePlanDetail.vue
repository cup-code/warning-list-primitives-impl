/* * @Author: xiaorui 维保计划详情页面 * @Date: 2022-07-14 14:35:29 * @Last Modified by: xiaorui *
@Last Modified time: 2022-08-10 18:46:27 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  addMaintenancePlanFn,
  getMaintenanceStandardListByIdFn,
  getPlanInfoByIdFn,
} from '@/http/dev_new/maintenance-api'
import { getDeviceListByDepartFn } from '@/http/dev_new/manage-api'
import { getAllUsersByCompany, getDepartListSimple } from '@/http/safe-production/depart-manage-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      loading: false,
      dataRule: {
        planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        cycleFiled: [{ required: true, message: '单位不能为空', trigger: 'change' }],
        cycleValue: [{ required: true, message: '周期不能为空', trigger: 'blur' }],
        deviceIdList: [{ required: true, message: '设备不能为空', trigger: 'change' }],
        departmentId: [{ required: true, message: '部门车间不能为空', trigger: 'change' }],
        executeUserIdList: [{ required: true, message: '执行人不能为空', trigger: 'change' }],
        planStartDate: [{ required: true, message: '请选择计划开始时间', trigger: 'change' }],
        planEndDate: [{ required: true, message: '请选择计划结束时间', trigger: 'change' }],
        maintenanceType: [{ required: true, message: '请选择维修类型', trigger: 'change' }],
        planState: [{ required: true, message: '请选择计划状态', trigger: 'change' }],
      },
      inputForm: {
        id: '',
        planName: '', // 计划名称
        cycleFiled: '', // 周期单位
        cycleValue: 1,
        departmentId: '', // 部门车间
        deviceIdList: [], // 设备
        executeUserIdList: [], // 执行人
        planStartDate: '', // 开始时间
        planEndDate: '', // 结束时间
        planState: '1', // 状态1：待发布；2：已发布；3：已停用
        maintenanceType: 'MINOR', // 维修类型MINOR：小修；MEDIUM：中修；ROUTINE：日常维修
        remarks: '',
        time: [],
      },
      method: 'add',
      pid: '', // 计划id
      departList: [], // 部门列表
      userList: [], // 维修人列表,登录用户所属公司的人员列表
      deviceList: [], // 部门下的设备列表
      cycleOptions: [
        {
          label: '时',
          value: 'HOUR',
          id: 1,
        },
        {
          label: '天',
          value: 'DAY',
          id: 2,
        },
        {
          label: '周',
          value: 'WEEK',
          id: 3,
        },
        {
          label: '月',
          value: 'MONTH',
          id: 4,
        },
        {
          label: '年',
          value: 'YEAR',
          id: 5,
        },
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
      },
      deviceTree: [], // 左侧的设备树
      defaultProps: {
        children: 'children',
        label: 'assetName',
      },
      currentDeviceId: '', // 记录当前左侧设备树选择的设备id
      deviceAndStandard: [], // 提交给后台的设备和维保标准
      currentStandard: [], // 右侧表格里展示的标准
      isDisabled: false,
    }
  },
  created() {
    this.pid = this.$route.params.id
    this.method = this.$route.params.method
    const companyId = this.$store.state.user.user.companyId
    // 获取部门列表和人员列表
    Promise.all([getDepartListSimple(), getAllUsersByCompany(companyId)])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.userList = res[1].data.result || []
        if (this.pid) {
          this.getInfoById()
        }
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    // 查询指定部门下的设备
    getDeviceByDepartId(id) {
      this.inputForm.departmentId = id
      if (!id)
        return
      getDeviceListByDepartFn(id).then(({ data }) => {
        this.deviceList = data.result || []
      })
    },
    // 查询指定维保计划的的信息
    getInfoById() {
      this.loading = true
      getPlanInfoByIdFn(this.pid).then(async ({ data }) => {
        this.loading = false
        if (data.success) {
          const res = await getDeviceListByDepartFn(data.result.departmentId)
          this.deviceList = res.data.result || []
          data.result.time = [data.result.planStartDate, data.result.planEndDate]
          this.inputForm = this.recover(this.inputForm, data.result)
          this.deviceAndStandard = data.result.deviceStandardList.map((item) => {
            return {
              deviceId: item.deviceId,
              standardIdList: (
                item.standardVOList.filter((standard) => {
                  return standard.selected
                }) || []
              ).map((selected) => {
                return selected.id
              }),
            }
          })
          this.$nextTick(() => {
            this.viewStandardContent()
          })
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      })
    },
    // 获取计划开始时间
    getPlanStartDateTime() {
      this.isDisabled = false
      if (!this.inputForm.planStartDate) {
        this.inputForm.planEndDate = ''
      }
    },
    // 获取计划结束时间
    getPlanEndDateTime(e) {
      if (!this.inputForm.planStartDate) {
        this.isDisabled = true
        this.$message.warning('请先选择计划开始时间')
      }
    },
    // 点击查看维保标准
    viewStandardContent() {
      // 生成左侧设备树的数据
      this.deviceTree = this.inputForm.deviceIdList.map((item) => {
        // 先判断设备维保数据里有没有这个设备，如果没有，再添加
        if (
          !this.deviceAndStandard.find((dev) => {
            return dev.deviceId === item
          })
        ) {
          this.deviceAndStandard.push({
            deviceId: item,
            standardIdList: [],
          })
        }
        // 生成左侧设备树的数据
        return this.deviceList.find((device) => {
          return device.id === item
        })
      })
      // 设置设备列表第一个为选中状态
      this.$nextTick(() => {
        this.$refs.deviceTree.setCurrentKey(this.inputForm.deviceIdList[0])
        this.handleNodeClick({ id: this.inputForm.deviceIdList[0] })
      })
    },
    // 左侧设备列表点击事件
    handleNodeClick(v) {
      if (!v)
        return
      const params = {
        deviceId: v.id,
      }
      this.currentDeviceId = v.id // 保存当前左侧设备树选中的设备id
      const currentChoosedStandard
        = this.deviceAndStandard.find((dev) => {
          return dev.deviceId === v.id
        }).standardIdList || [] // 获取当前设备id选中的维保标准
      // 根据设备id获取设备下所有的维保标准
      getMaintenanceStandardListByIdFn(params).then(({ data }) => {
        this.currentStandard = data.result || []
        this.$nextTick(() => {
          // 设置选中的维保标准
          currentChoosedStandard.forEach((item) => {
            const choosedObj = this.currentStandard.find((standard) => {
              return standard.id === item
            })
            this.$refs.standardTable.toggleRowSelection(choosedObj, true)
          })
        })
      })
    },
    // 多选维保标准事件
    handleSelectionChange(v) {
      const currentDevIndex = this.deviceAndStandard.findIndex((dev) => {
        return dev.deviceId === this.currentDeviceId
      })
      this.deviceAndStandard[currentDevIndex].standardIdList = v.map(item => item.id)
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // this.inputForm.planStartDate = this.inputForm.time[0]
          // this.inputForm.planEndDate = this.inputForm.time[1]
          // 解决设备选择框，删除了设备时，维保标准未删除的问题
          this.deviceAndStandard = this.deviceAndStandard.filter((item) => {
            return this.inputForm.deviceIdList.includes(item.deviceId)
          })
          this.inputForm.deviceAndStandardList = this.deviceAndStandard
          addMaintenancePlanFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.$router.go(-1)
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
    backFn() {
      this.$router.go(-1)
    },
  },
}
</script>

<template>
  <div class="maintenance-plan">
    <div class="btnArea">
      <el-button
        type="primary"
        :loading="loading"
        :disabled="method === 'view'"
        @click="doSubmit()"
      >
        保存
      </el-button>
      <el-button @click="backFn">
        返回
      </el-button>
    </div>
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row
        class="title"
        style="text-align: center"
      >
        <span>维保计划详情</span>
      </el-row>
      <el-row class="title">
        计划信息
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="计划名称"
            prop="planName"
          >
            <el-input v-model="inputForm.planName" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="部门车间"
            prop="departmentId"
          >
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="departList"
              :value="inputForm.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  getDeviceByDepartId(value)
                }
              "
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="执行人"
          prop="executeUserIdList"
        >
          <el-select
            v-model="inputForm.executeUserIdList"
            placeholder="请选择"
            style="width: 500px"
            filterable
            multiple
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="周期"
            prop="cycleValue"
          >
            <el-input-number
              v-model="inputForm.cycleValue"
              controls-position="right"
              :min="0"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="单位"
            prop="cycleFiled"
          >
            <el-select
              v-model="inputForm.cycleFiled"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in cycleOptions"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="计划开始时间"
          prop="planStartDate"
        >
          <el-date-picker
            v-model="inputForm.planStartDate"
            type="date"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            placeholder="选择开始日期"
            @change="getPlanStartDateTime"
          />
        </el-form-item>
        <el-form-item
          label="计划结束时间"
          prop="planEndDate"
        >
          <el-date-picker
            v-model="inputForm.planEndDate"
            type="date"
            value-format="yyyy-MM-dd"
            :disabled="isDisabled"
            :picker-options="pickerOptions"
            placeholder="选择结束日期"
            @focus="getPlanEndDateTime"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item
          label="保养设备"
          prop="deviceIdList"
          class="choose-decive"
        >
          <el-select
            v-model="inputForm.deviceIdList"
            placeholder="请选择"
            style="width: 500px"
            filterable
            multiple
          >
            <el-option
              v-for="item in deviceList"
              :key="item.id"
              :label="item.assetName"
              :value="item.id"
            />
          </el-select>
          <el-button
            style="margin-left: 10px"
            type="primary"
            @click="viewStandardContent"
          >
            查看维保内容
          </el-button>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="维修类型"
            prop="maintenanceType"
          >
            <el-radio-group v-model="inputForm.maintenanceType">
              <el-radio-button label="MINOR">
                小修
              </el-radio-button>
              <el-radio-button label="MEDIUM">
                中修
              </el-radio-button>
              <el-radio-button label="ROUTINE">
                日常维保
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="状态"
            prop="planState"
          >
            <el-radio-group v-model="inputForm.planState">
              <el-radio-button label="1">
                待发布
              </el-radio-button>
              <el-radio-button label="2">
                发布
              </el-radio-button>
              <el-radio-button label="3">
                停用
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="备注"
          prop="remarks"
        >
          <el-input
            v-model="inputForm.remarks"
            type="textarea"
            :rows="2"
            style="width: 500px"
          />
        </el-form-item>
      </el-row>
      <el-row class="title">
        设备维保内容
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-card class="box-card">
            <div
              slot="header"
              class="clearfix"
            >
              <span>设备列表</span>
            </div>
            <el-tree
              ref="deviceTree"
              :data="deviceTree"
              :props="defaultProps"
              node-key="id"
              @node-click="handleNodeClick"
            />
          </el-card>
        </el-col>
        <el-col :span="18">
          <el-table
            ref="standardTable"
            :data="currentStandard"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column
              label="排序"
              align="center"
              prop="sortOrder"
            />
            <el-table-column
              label="设备"
              align="center"
              prop="assetDeviceName"
            />
            <el-table-column
              label="维保内容"
              align="center"
              prop="maintenanceContent"
            />
            <el-table-column
              label="维保要求"
              align="center"
              prop="maintenanceRequirement"
              min-width="180"
            >
              <template slot-scope="scope">
                <rich-text :des="scope.row.maintenanceRequirement" />
              </template>
            </el-table-column>
            <el-table-column
              label="强制拍照"
              align="center"
              prop="mustPhotograph"
            >
              <template slot-scope="scope">
                <el-tag :type="scope.row.mustPhotograph ? 'success' : 'danger'">
                  {{
                    scope.row.mustPhotograph ? '是' : '否'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="常见故障"
              align="center"
              prop="commonFaults"
              min-width="180"
            >
              <template slot-scope="scope">
                <rich-text :des="scope.row.commonFaults" />
              </template>
            </el-table-column>
            <el-table-column
              label="可能故障原因"
              align="center"
              prop="possibleCause"
              min-width="180"
            >
              <template slot-scope="scope">
                <rich-text :des="scope.row.possibleCause" />
              </template>
            </el-table-column>
            <el-table-column
              label="故障处理方法"
              align="center"
              prop="disposalMethod"
              min-width="180"
              fixed="right"
            >
              <template slot-scope="scope">
                <rich-text :des="scope.row.disposalMethod" />
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.choose-decive ::v-deep {
  .el-form-item__content {
    display: inline-flex;
  }
}
.maintenance-plan {
  height: 80vh;
  padding: 10px;
  overflow: auto;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.title {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  padding-left: 32px;
  text-align: left;
}
.box-card {
  margin-left: 32px;
}
</style>
