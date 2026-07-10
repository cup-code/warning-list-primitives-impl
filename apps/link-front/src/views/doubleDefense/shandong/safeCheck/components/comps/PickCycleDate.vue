<script>
export default {
  props: {
    cycleUnit: {
      type: Number,
      default: 1,
    },
    cycleFrequency: {
      type: [Number, String],
      default: '',
    },
    cycleRule: {
      type: String,
      default: '',
    },
    cycleYear: {
      type: [Number, String],
      default: '',
    },
    durationDays: {
      type: [Number, String],
      default: '',
    },
  },
  data() {
    return {
      pickData: {
        cycleUnit: 3,
        cycleFrequency: '',
        cycleRule: [],
        cycleYear: 2022,
        durationDays: 1, // 任务天数
      },
      curYear: new Date().getFullYear(), // 作用年份下拉列表开始时间，以当前年份开始，往后10年 -- 方艺名
    }
  },
  computed: {
    /* 设置周描述 */
    setWeekDes() {
      return function (index) {
        let des = ''
        switch (index.toString()) {
          case '1':
            des = '周日'
            break
          case '2':
            des = '周一'
            break
          case '3':
            des = '周二'
            break
          case '4':
            des = '周三'
            break
          case '5':
            des = '周四'
            break
          case '6':
            des = '周五'
            break
          case '7':
            des = '周六'
            break
          default:
            console.log('week index error', index)
        }
        return des
      }
    },
  },
  created() {
    this.pickData.cycleYear = this.cycleYear
    this.pickData.cycleUnit = this.cycleUnit
    this.pickData.cycleFrequency = this.cycleFrequency
    this.pickData.durationDays = this.durationDays
    if (this.cycleRule == '') {
      this.pickData.cycleRule = []
    }
    else {
      this.pickData.cycleRule = this.cycleRule.split(',')
    }
  },
  methods: {
    /* 切换单位回调 */
    unitChangeEvt() {
      this.pickData.cycleFrequency = ''
      this.pickData.cycleRule = []
    },
    /* 选择星期/日期 */
    pickClick(item) {
      let isExist = false
      for (let i = 0; i < this.pickData.cycleRule.length; i++) {
        if (this.pickData.cycleRule[i] === item.toString()) {
          this.pickData.cycleRule.splice(i, 1)
          isExist = true
          break
        }
      }
      if (!isExist) {
        this.pickData.cycleRule.push(item.toString())
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', null)
    },
    /* 点击提交 */
    submitClick() {
      // 周期每周 默认设置周期为1
      if (this.pickData.cycleUnit === 2) {
        this.pickData.cycleFrequency = 1
      }
      this.$refs.cycleFrom.validate((valid) => {
        if (valid) {
          this.$emit('close', this.pickData)
        }
        return false
      })
    },
  },
}
</script>

<template>
  <div class="pick-date">
    <el-form
      ref="cycleFrom"
      :model="pickData"
      label-width="80px"
    >
      <el-form-item
        label="作用年度"
        prop="cycleYear"
        :rules="[
          {
            required: true,
            type: 'number',
            message: '请选择周期单位',
            trigger: 'change',
          },
        ]"
      >
        <el-select v-model="pickData.cycleYear">
          <el-option
            v-for="item in 10"
            :key="item"
            :label="`${curYear + item - 1}年`"
            :value="curYear + item - 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="周期单位"
        prop="cycleUnit"
        :rules="[
          {
            required: true,
            type: 'number',
            message: '请选择周期单位',
            trigger: 'change',
          },
        ]"
      >
        <el-radio-group
          v-model="pickData.cycleUnit"
          @change="unitChangeEvt"
        >
          <el-radio-button :label="1">
            日
          </el-radio-button>
          <el-radio-button :label="2">
            周
          </el-radio-button>
          <el-radio-button :label="3">
            月
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!-- 日 -->
      <el-form-item
        v-if="pickData.cycleUnit === 1"
        label="周期"
        prop="cycleFrequency"
        :rules="[{ required: true, message: '请输入检查频率', trigger: 'blur' }]"
      >
        每
        <el-input-number
          v-model="pickData.cycleFrequency"
          :step="1"
          controls-position="right"
          :min="1"
          :max="365"
          step-strictly
        />
        天
      </el-form-item>
      <!-- 周 -->
      <el-form-item
        v-if="pickData.cycleUnit === 2"
        label="按周"
        prop="cycleRule"
        :rules="[{ required: true, message: '请选择周天', trigger: 'change' }]"
      >
        <div class="text-box">
          <div
            v-for="item in 7"
            :key="item"
            class="text-item"
            :class="{
              active: pickData.cycleRule.includes(item.toString()),
            }"
            @click="pickClick(item)"
          >
            {{ setWeekDes(item) }}
          </div>
        </div>
      </el-form-item>
      <!-- 月 -->
      <template v-if="pickData.cycleUnit === 3">
        <el-form-item
          label="周期"
          prop="cycleFrequency"
          :rules="[{ required: true, message: '请输入检查频率', trigger: 'blur' }]"
        >
          每
          <el-input-number
            v-model="pickData.cycleFrequency"
            :step="1"
            controls-position="right"
            :min="1"
            :max="12"
            step-strictly
          />
          月
        </el-form-item>
        <el-form-item
          label="日期"
          prop="cycleRule"
          :rules="[{ required: true, message: '请选择日期', trigger: 'change' }]"
        >
          <div class="text-box">
            <div
              v-for="item in 31"
              :key="item"
              class="text-item"
              :class="{
                active: pickData.cycleRule.includes(item.toString()),
              }"
              @click="pickClick(item)"
            >
              {{ `${item}日` }}
            </div>
          </div>
        </el-form-item>
      </template>
      <el-form-item
        label="任务天数"
        prop="durationDays"
        :rules="[{ required: true, message: '请输入任务天数', trigger: 'blur' }]"
      >
        <el-input-number
          v-model="pickData.durationDays"
          :step="1"
          controls-position="right"
          :min="1"
          :max="365"
          step-strictly
        />
        天
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确定
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pick-date {
  .text-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;

    .text-item {
      margin: 0 10px 10px 0;
      border: 1px solid lightgray;
      border-radius: 5px;
      width: 60px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }

    .active {
      border: 1px solid #409eff;
      background: #409eff;
      color: white;
    }
  }
}
</style>
