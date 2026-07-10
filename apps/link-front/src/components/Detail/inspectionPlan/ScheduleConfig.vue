/* * @Author: xiaorui 巡检计划详情页的计划排班 * @Date: 2022-05-07 17:27:55 * @Last Modified by:
xiaorui * @Last Modified time: 2023-01-11 16:01:54 */
<script>
import {
  generateScheduleFn,
  getPlanInfoByIdFn,
  getScheduleInfoFn,
} from '@/http/dev_new/inspection-api'
import PersonSchedule from './dialog/personSchedule'
import PostSchedule from './dialog/postSchedule'
import RollSchedule from './dialog/rollSchedule'

export default {
  components: {
    PersonSchedule,
    PostSchedule,
    RollSchedule,
  },
  props: {
    id: String,
    method: String,
  },
  data() {
    const currentYear = new Date().getFullYear()
    return {
      loading: false,
      year: currentYear,
      planBaseInfo: {},
      scheduleList: [],
      yearOption: [
        {
          value: currentYear - 1,
          label: currentYear - 1,
        },
        {
          value: currentYear,
          label: currentYear,
        },
        {
          value: currentYear + 1,
          label: currentYear + 1,
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
    }
  },
  async created() {
    // 如果有计划id，先获取计划的排班信息
    // 获取计划的基础信息
    if (this.id !== 'null') {
      const planInfo = await getPlanInfoByIdFn(this.id)
      this.planBaseInfo = planInfo.data.result || {}
      this.getScheduleInfo()
    }
  },
  methods: {
    // 查询巡检计划的基础信息
    // getPlanInfoById() {
    //   getPlanInfoByIdFn(this.id).then(({data}) => {
    //     this.planBaseInfo = data.result || {}
    //   })
    // },
    // 查询指定计划/年份的排班信息
    getScheduleInfo() {
      this.loading = true
      getScheduleInfoFn(this.id, this.year).then(({ data }) => {
        this.loading = false
        if (data.result && data.result.length) {
          data.result.forEach((item, index) => {
            if (item.scheduleType === '滚动排班') {
              item.executeStart = this.getExecuteStart(item.executeStart, item.duration, index)
              item.executeEnd = this.getExecuteEnd(item.executeEnd, item.duration, index)
            }
            else if (this.planBaseInfo.cycleFiled === 'WEEK') {
              item.executeStart = this.getWeekLabel(item.executeStart)
              item.executeEnd = this.getWeekLabel(item.executeEnd)
            }
            else if (this.planBaseInfo.cycleFiled === 'MONTH') {
              item.executeStart = `${item.executeStart}号`
              item.executeEnd = `${item.executeEnd}号`
            }
          })
        }
        this.scheduleList = data.result || []
      })
    },
    // 专人排班
    addPersonSchedule() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.$refs.personSchedule.init(this.id, this.year, '专人')
    },
    // 专岗排班
    addPostSchedule() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.$refs.postSchedule.init(this.id, this.year, '专岗')
    },
    // 滚动排班
    addRollSchedule() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.$refs.rollSchedule.init(this.id, this.year, '滚动排班')
    },
    // 生成排班
    generateSchedule() {
      if (this.id === 'null' || this.planBaseInfo.planState === '2') {
        this.$message.error('请先保存巡检计划基础信息或停用计划')
        return
      }
      generateScheduleFn(this.id, this.year).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '生成任务班次完成')
        }
        else {
          this.$message.error(data.message || '生成任务班次失败')
        }
      })
    },
    searchFn() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.getScheduleInfo()
    },
    backFn() {
      this.$router.back(-1)
    },
    getExecuteStart(start, duration, index) {
      const hour = start.split(':')[0]
      const minite = start.split(':')[1]
      const startHour
        = (Number(hour) + duration * index) % 24 < 10
          ? `0${(Number(hour) + duration * index) % 24}`
          : (Number(hour) + duration * index) % 24
      return `${startHour}:${minite}`
    },
    getExecuteEnd(end, duration, index) {
      const hour = end.split(':')[0]
      const minite = end.split(':')[1]
      const startHour
        = (Number(hour) + duration * index) % 24 < 10
          ? `0${(Number(hour) + duration * index) % 24}`
          : (Number(hour) + duration * index) % 24
      const endHour
        = (Number(startHour) + duration) % 24 < 10
          ? `0${(Number(startHour) + duration) % 24}`
          : (Number(startHour) + duration) % 24
      return `${endHour}:${minite}`
    },
    getWeekLabel(val) {
      return (
        this.weekOptions.find((item) => {
          return item.value === val
        }) || {}
      ).label
    },
  },
}
</script>

<template>
  <div class="schedule-config">
    <el-row>
      <el-col :span="14">
        <el-button
          v-if="planBaseInfo.scheduleMode === 'CYCLE'"
          type="primary"
          :disabled="method === 'view'"
          @click="addPersonSchedule"
        >
          专人排班
        </el-button>
        <el-button
          v-if="planBaseInfo.scheduleMode === 'CYCLE'"
          type="primary"
          :disabled="method === 'view'"
          @click="addPostSchedule"
        >
          专岗排班
        </el-button>
        <el-button
          v-if="planBaseInfo.scheduleMode === 'ROLL'"
          type="primary"
          :disabled="method === 'view'"
          @click="addRollSchedule"
        >
          滚动排班
        </el-button>
        <el-button
          type="success"
          :disabled="method === 'view'"
          @click="generateSchedule"
        >
          生成任务班次
        </el-button>
      </el-col>
      <el-col
        :span="10"
        class="btnArea"
      >
        <el-select v-model="year">
          <el-option
            v-for="item in yearOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button
          type="primary"
          style="margin-left: 10px"
          @click="searchFn"
        >
          查询
        </el-button>
        <el-button
          style="margin-left: 10px"
          @click="backFn"
        >
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="scheduleList"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      style="width: 80%"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50"
      />
      <el-table-column
        prop="scheduleType"
        align="center"
        label="类型"
      >
        <template slot-scope="scope">
          {{ `${scope.row.scheduleType + scope.row.scheduleSort}班` }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="排班时间"
      >
        <template slot-scope="scope">
          {{ `${scope.row.executeStart}至${scope.row.executeEnd}` }}
        </template>
      </el-table-column>
      <el-table-column
        prop="postName"
        align="center"
        label="岗位角色"
      />
      <el-table-column
        prop="executeUserNameList"
        align="center"
        label="巡检人"
      >
        <template slot-scope="scope">
          {{ scope.row.executeUserNameList.join('、') }}
        </template>
      </el-table-column>
    </el-table>
    <PersonSchedule
      ref="personSchedule"
      :planBaseInfo="planBaseInfo"
      @refreshDataList="getScheduleInfo"
    />
    <PostSchedule
      ref="postSchedule"
      :planBaseInfo="planBaseInfo"
      @refreshDataList="getScheduleInfo"
    />
    <RollSchedule
      ref="rollSchedule"
      :planBaseInfo="planBaseInfo"
      @refreshDataList="getScheduleInfo"
    />
  </div>
</template>

<style lang="scss" scoped>
.schedule-config {
  padding-left: 32px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
