/* * @Author: xiaorui 专岗排班的弹框 * @Date: 2022-05-10 17:33:21 * @Last Modified by: xiaorui *
@Last Modified time: 2022-11-24 16:22:48 */
<script>
import { addScheduleFn, getScheduleInfoByTypeFn } from '@/http/dev_new/inspection-api'
import { getAllPostByDepartFn, getUsersByPostFn } from '@/http/safe-production/post-manage-api'

export default {
  props: {
    planBaseInfo: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      postList: [], // 岗位列表
      users: [], // 用户列表
      inputForm: {
        id: '',
        holidaysInclude: [], // 节假日设置
        completionCondition: 0, // 	班次任务完成条件
        scheduleDetails: [],
      },
      dataRule: {
        postId: [{ required: true, message: '岗位不能为空', trigger: 'change' }],
        executeUserIdList: [{ required: true, message: '责任人不能为空', trigger: 'change' }],
      },
      inspectionCycle: '', // 输入框显示的排班形式
      inspectionType: '', // 巡检类型，日巡检、周巡检、月巡检
      cycleNumber: 1, // 巡检次数
      cycleOptions: [
        {
          label: '每天',
          value: 'DAY',
          id: 1,
        },
        {
          label: '每周',
          value: 'WEEK',
          id: 2,
        },
        {
          label: '每月',
          value: 'MONTH',
          id: 3,
        },
        {
          label: '每年',
          value: 'YEAR',
          id: 4,
        },
      ],
      weekOptions: [
        {
          value: '02',
          label: '周一',
        },
        {
          value: '03',
          label: '周二',
        },
        {
          value: '04',
          label: '周三',
        },
        {
          value: '05',
          label: '周四',
        },
        {
          value: '06',
          label: '周五',
        },
        {
          value: '07',
          label: '周六',
        },
        {
          value: '01',
          label: '周日',
        },
      ],
      monthOptions: [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
      ],
      hourOptions: [
        '00',
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
      ],
      minuteOptions: [
        '00',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
        '39',
        '40',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '49',
        '50',
        '51',
        '52',
        '53',
        '54',
        '55',
        '56',
        '57',
        '58',
        '59',
      ],
    }
  },
  methods: {
    init(planId, year, type) {
      this.visible = true
      this.planId = planId // 提交的时候使用
      this.planYear = year // 提交的时候使用
      this.scheduleType = type // 提交的时候使用
      this.inspectionType = this.planBaseInfo.cycleFiled // 巡检类型，日巡检、周巡检、月巡检
      this.cycleNumber = this.planBaseInfo.frequency
      this.inspectionCycle = `${
        this.getCycleLabel(this.planBaseInfo.cycleFiled) + this.planBaseInfo.frequency
      }次`
      this.loading = true
      getAllPostByDepartFn(this.planBaseInfo.departmentId).then(({ data }) => {
        this.postList = data.result || []
      })
      // 获取排班详情，如果返回的没有result，则说明是新增
      getScheduleInfoByTypeFn(planId, year, type).then(async ({ data }) => {
        this.loading = false
        // 如果返回的没有result，则说明是新增
        this.inputForm.scheduleDetails = []
        if (!data.result) {
          // 如果是新增，默认获取计划中岗位的用户
          const postId = this.planBaseInfo.postId
          const res = await getUsersByPostFn(postId)
          const users = res.data.result || []
          if (this.inspectionType === 'WEEK' || this.inspectionType === 'MONTH') {
            for (let i = 0; i < this.cycleNumber; i++) {
              this.inputForm.scheduleDetails.push({
                scheduleSort: i + 1,
                startDay: '',
                endDay: '',
                expireHours: 0,
                id: '',
                postId,
                executeUserIdList: [],
                users, // 每行可选的用户
              })
            }
          }
          else if (this.inspectionType === 'DAY') {
            for (let i = 0; i < this.cycleNumber; i++) {
              this.inputForm.scheduleDetails.push({
                scheduleSort: i + 1,
                startHour: '00',
                startMinute: '00',
                endHour: '00',
                endMinute: '00',
                expireHours: 0,
                id: '',
                postId,
                executeUserIdList: [],
                users, // 每行可选的用户
              })
            }
          }
        }
        else {
          this.inputForm.id = data.result.id
          this.inputForm.holidaysInclude = data.result.holidaysInclude
          this.inputForm.completionCondition = data.result.completionCondition
          // 通过每行设置的岗位id获取对应的每行可选的用户
          const arr = []
          const scheduleDetails = data.result.scheduleDetails
          scheduleDetails.forEach((item) => {
            arr.push(getUsersByPostFn(item.postId))
          })
          Promise.all(arr).then((res) => {
            res.forEach((item, index) => {
              if (this.inspectionType === 'WEEK' || this.inspectionType === 'MONTH') {
                this.inputForm.scheduleDetails.push({
                  scheduleSort: scheduleDetails[index].scheduleSort,
                  startDay: scheduleDetails[index].executeStart,
                  endDay: scheduleDetails[index].executeEnd,
                  expireHours: scheduleDetails[index].expireHours,
                  id: scheduleDetails[index].id,
                  postId: scheduleDetails[index].postId,
                  executeUserIdList: scheduleDetails[index].executeUserIdList,
                  users: item.data.result || [],
                })
              }
              else if (this.inspectionType === 'DAY') {
                this.inputForm.scheduleDetails.push({
                  scheduleSort: scheduleDetails[index].scheduleSort,
                  startHour: scheduleDetails[index].executeStart.split(':')[0],
                  startMinute: scheduleDetails[index].executeStart.split(':')[1],
                  endHour: scheduleDetails[index].executeEnd.split(':')[0],
                  endMinute: scheduleDetails[index].executeEnd.split(':')[1],
                  expireHours: scheduleDetails[index].expireHours,
                  id: scheduleDetails[index].id,
                  postId: scheduleDetails[index].postId,
                  executeUserIdList: scheduleDetails[index].executeUserIdList,
                  users: item.data.result || [],
                })
              }
            })
          })
        }
      })
    },
    // 每行岗位变化时，获取对应的用户
    getRowUsers(v, row) {
      getUsersByPostFn(v).then(({ data }) => {
        row.users = data.result || []
        row.executeUserIdList = []
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let scheduleDetails = []
          if (this.inspectionType === 'WEEK' || this.inspectionType === 'MONTH') {
            scheduleDetails = this.inputForm.scheduleDetails.map((item) => {
              return {
                executeStart: item.startDay,
                executeEnd: item.endDay,
                id: item.id,
                executeUserIdList: item.executeUserIdList,
                postId: item.postId,
                scheduleSort: item.scheduleSort,
                expireHours: item.expireHours,
              }
            })
          }
          else if (this.inspectionType === 'DAY') {
            scheduleDetails = this.inputForm.scheduleDetails.map((item) => {
              return {
                executeStart: `${item.startHour}:${item.startMinute}`,
                executeEnd: `${item.endHour}:${item.endMinute}`,
                id: item.id,
                executeUserIdList: item.executeUserIdList,
                postId: item.postId,
                scheduleSort: item.scheduleSort,
                expireHours: item.expireHours,
              }
            })
          }
          const params = {
            holidaysInclude: this.inputForm.holidaysInclude,
            completionCondition: this.inputForm.completionCondition,
            id: this.inputForm.id,
            planId: this.planId,
            planYear: this.planYear,
            scheduleType: this.scheduleType,
            scheduleDetails,
          }
          addScheduleFn(params).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
    getCycleLabel(val) {
      return this.cycleOptions.find((item) => {
        return item.value === val
      }).label
    },
  },
}
</script>

<template>
  <el-dialog

    title="巡检专岗排班"
    :close-on-click-modal="false"
    width="800px"
    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <el-form-item label="排班形式">
        <el-input
          v-model="inspectionCycle"
          disabled
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item
        label="节假日设置"
        prop="holidaysInclude"
      >
        <el-checkbox-group v-model="inputForm.holidaysInclude">
          <el-checkbox label="includeSaturday">
            包含周六
          </el-checkbox>
          <el-checkbox label="includeSunday">
            包含周日
          </el-checkbox>
          <el-checkbox label="includeHoliday">
            包含节假日
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        label="班次完成条件"
        prop="completionCondition"
      >
        <el-radio-group v-model="inputForm.completionCondition">
          <el-radio :label="0">
            任意执行人巡检完成
          </el-radio>
          <el-radio :label="1">
            所有执行人巡检完成
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-table
        v-loading="loading"
        :data="inputForm.scheduleDetails"
      >
        <el-table-column
          type="index"
          label="序号"
          width="50"
          column-key="index"
        />
        <el-table-column
          prop="scheduleSort"
          align="center"
          label="班次"
          width="80"
          column-key="scheduleSort"
        >
          <template slot-scope="scope">
            第 {{ scope.row.scheduleSort }} 班
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="排班时间"
          width="300"
          column-key="scheduleTime"
        >
          <div
            v-if="inspectionType === 'DAY'"
            slot-scope="scope"
          >
            <el-select
              v-model="scope.row.startHour"
              filterable
              style="width: 60px"
            >
              <el-option
                v-for="item in hourOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select
              v-model="scope.row.startMinute"
              filterable
              style="width: 60px"
            >
              <el-option
                v-for="item in minuteOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select
              v-model="scope.row.endHour"
              filterable
              style="width: 60px"
            >
              <el-option
                v-for="item in hourOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-select
              v-model="scope.row.endMinute"
              filterable
              style="width: 60px"
            >
              <el-option
                v-for="item in minuteOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
          <div
            v-else-if="inspectionType === 'WEEK'"
            slot-scope="scope"
          >
            <el-select
              v-model="scope.row.startDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in weekOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select
              v-model="scope.row.endDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in weekOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div
            v-else-if="inspectionType === 'MONTH'"
            slot-scope="scope"
          >
            <el-select
              v-model="scope.row.startDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <span>&nbsp; 至 &nbsp;</span>
            <el-select
              v-model="scope.row.endDay"
              placeholder="请选择"
              filterable
              style="width: 120px"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
        </el-table-column>
        <el-table-column
          align="center"
          label="过期时间(时)"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.expireHours"
              controls-position="right"
              :min="0"
              :max="24"
              style="width: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="岗位角色/巡检人"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.postId"
              placeholder="请选择"
              filterable
              style="width: 120px"
              @change="getRowUsers($event, scope.row)"
            >
              <el-option
                v-for="item in postList"
                :key="item.id"
                :label="item.postName"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-model="scope.row.executeUserIdList"
              placeholder="请选择"
              filterable
              style="width: 120px; margin-top: 8px"
              multiple
            >
              <el-option
                v-for="item in scope.row.users"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
