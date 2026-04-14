<script>
export default {
  data: () => ({
    weekList: [
      { name: '星期一', value: 'MON' },
      { name: '星期二', value: 'TUE' },
      { name: '星期三', value: 'WED' },
      { name: '星期四', value: 'THU' },
      { name: '星期五', value: 'FRI' },
      { name: '星期六', value: 'SAT' },
      { name: '星期日', value: 'SUN' },
    ],
    selWeek: [],
    selMode: 1,
    hour: '',
    minute: '',
    second: '',
    res: '',
  }),
  methods: {
    closeFn() {
      this.$emit('close')
    },
    doneFn() {
      const mode = this.selMode
      const sec = this.second
      const min = this.minute
      const hour = this.hour
      const weeks = this.selWeek
      if (mode === 1) {
        this.res = `${sec ? `0/${sec}` : 0} ${min ? `0/${min}` : 0} ${
          hour ? `0/${hour}` : 0
        } ? * ${weeks.join(',')} *`
      }
      else if (mode === 2) {
        this.res = `${sec || 0} ${min || 0} ${hour || 0} ? * ${weeks.join(',')} *`
      }

      this.$emit('change', this.res)
      this.closeFn()
    },
    // 由父组件触发
    genVal(cron) {
      const arr = cron.split(' ')

      this.selMode = !cron.includes('/') ? 2 : 1 // 确定执行模式： 1代表重复； 2代表定时
      this.selWeek = arr[5].split(',') // 确定周几;

      if (this.selMode == 1) {
        // 重复执行
        this.hour = arr[2].split('/')[1] // 确定小时
        this.minute = arr[1].split('/')[1] // 确定分钟
        this.second = arr[0].split('/')[1] // 确定秒
      }
      else {
        // 定时执行
        this.hour = arr[2] // 确定小时
        this.minute = arr[1] // 确定分钟
        this.second = arr[0] // 确定秒
      }
    },
  },
}
</script>

<template>
  <el-row class="task-time-set">
    <el-col :span="24">
      <el-checkbox-group v-model="selWeek">
        <el-checkbox
          v-for="item in weekList"
          :key="item.value"
          :label="item.value"
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col
      :span="24"
      class="middle"
    >
      <el-select
        v-model="hour"
        size="mini"
        placeholder="请选择"
        style="width: 100px"
      >
        <el-option
          v-for="n in 24"
          :key="n"
          :label="n - 1"
          :value="n - 1"
        />
      </el-select>
      <span class="p10">时</span>

      <el-select
        v-model="minute"
        size="mini"
        placeholder="请选择"
        style="width: 100px"
      >
        <el-option
          v-for="n in 60"
          :key="n"
          :label="n - 1"
          :value="n - 1"
        />
      </el-select>
      <span class="p10">分</span>

      <el-select
        v-model="second"
        size="mini"
        placeholder="请选择"
        style="width: 100px"
      >
        <el-option
          v-for="n in 60"
          :key="n"
          :label="n - 1"
          :value="n - 1"
        />
      </el-select>
      <span class="p10">秒</span>
    </el-col>
    <el-col :span="24">
      <el-radio-group v-model="selMode">
        <el-radio :label="1">
          重复执行
        </el-radio>
        <el-radio :label="2">
          定时执行
        </el-radio>
        <!-- <el-radio :label="3">执行一次</el-radio> -->
      </el-radio-group>
      <el-tooltip placement="top">
        <el-button
          type="text"
          icon="el-icon-question"
          style="margin: 0 16px"
        />
        <div slot="content">
          <div style="padding: 5px 0">
            重复执行：以上述选择的“时分秒”为间隔周期，循环执行下发，每星期执行，每天可执行多次。
          </div>
          <div style="padding: 5px 0">
            定时执行：以上述选择的“时分秒”为指定时间，定时执行下发，每星期执行，每天只执行一次。
          </div>
        </div>
      </el-tooltip>
    </el-col>

    <el-col
      :span="24"
      class="btns"
    >
      <el-button
        type="primary"
        size="mini"
        @click="doneFn"
      >
        确定
      </el-button>
      <el-button
        type="primary"
        size="mini"
        @click="closeFn"
      >
        关闭
      </el-button>
    </el-col>
  </el-row>
</template>

<style lang="scss" scope>
.task-time-set {
  .el-checkbox {
    margin-right: 16px;
  }
  .middle {
    padding: 20px 0;
  }
  .btns {
    padding-top: 30px;
    text-align: center;
  }
  .p10 {
    padding: 0 10px;
  }
}
</style>
