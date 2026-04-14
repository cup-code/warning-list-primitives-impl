<script>
import {
  addDutyPlay,
  delDutyPlay,
  getAllDutyPlayByPage,
  getArrangeByPage,
} from '@/http/pipeRack/Ontodu/arrange-api.js'

export default {
  data() {
    return {
      sForm: {
        pageNum: 1,
        pageSize: 20,
      },
      // 后台数据
      list: [],
      dates: [],
      // 控制弹窗
      visible: false,
      title: '编辑值班计划',
      // 表单数据
      form: {},
      rules: {
        teamId: [{ required: true, message: '请选择小组', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择开始日期', trigger: 'change,blur' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change,blur' }],
      },
      teamList: [], // 小组列表
      submitLoading: false, // 控制保存按钮
    }
  },
  mounted() {
    this.getDataList()
    this.getTeamList()
  },
  methods: {
    // 删除值班信息
    delItem() {
      this.$confirm(`您确定要删除这条值班计划信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        delDutyPlay(this.form.id)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('删除成功！')
              this.getDataList()
            }
          })
          .finally(() => {
            this.visible = false
          })
      })
    },
    // 查询
    async getDataList() {
      const { data } = await getArrangeByPage(this.sForm)
      if (data.code === 200) {
        this.list = data.result.list || []
        this.genDates() // 生成选中的日历数据
      }
      else {
        this.$message.error(data.message || '请求出错!')
      }
    },
    // 查询所有小组
    getTeamList() {
      getAllDutyPlayByPage().then(({ data }) => {
        this.teamLis = []
        this.teamList = data.result || []
        if (data.code === 200) {
          this.teamList = data.result || []
        }
      })
    },
    // 生成选中的日历数据
    genDates() {
      this.dates = []
      this.list.forEach((item) => {
        item.dates = this.getAllDate(item.startDate, item.endDate)
        // 得到 合并并去重后 的结果
        this.dates = [...new Set(this.dates.concat(item.dates))]
      })
    },
    // 根据起始时间生成中间日期
    getAllDate(start, end) {
      const format = (time) => {
        let ymd = time.getFullYear()
        let month = time.getMonth() + 1
        month = month >= 10 ? month : `0${month}`
        let day = time.getDate()
        day = day >= 10 ? day : `0${day}`
        ymd += `-${month}-`
        ymd += day
        return ymd
      }

      const dateArr = []
      const startArr = start.split('-')
      const endArr = end.split('-')
      const db = new Date()
      db.setUTCFullYear(startArr[0], startArr[1] - 1, startArr[2])
      const de = new Date()
      de.setUTCFullYear(endArr[0], endArr[1] - 1, endArr[2])
      const unixDb = db.getTime()
      const unixDe = de.getTime()

      let stamp
      const oneDay = 24 * 60 * 60 * 1000

      for (stamp = unixDb; stamp <= unixDe;) {
        dateArr.push(format(new Date(Number.parseInt(stamp))))
        stamp = stamp + oneDay
      }
      return dateArr
    },
    // 日期点击
    tapFn(data) {
      this.visible = true
      if (this.dates.includes(data.day)) {
        this.title = '编辑排班计划'
        const tar = this.list.find(item => item.dates.includes(data.day))
        this.form = JSON.parse(JSON.stringify(tar))
        this.form.teamMemberNameList = this.form.teamMemberNameList.join(', ')
      }
      else {
        this.title = '新增排班计划'
        this.form = {}
      }
    },
    // 小组change
    teamFn(val) {
      const tar = this.teamList.find(item => item.id === val)
      if (tar) {
        this.form.teamLeaderName = tar.teamLeaderName
        this.form.teamMemberNameList = tar.teamMemberNameList.join(', ')
      }
    },
    // 弹窗确定
    doneFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          id,
          teamId,
          startDate,
          endDate,
          remarks,
        } = this.form
        const params = { id, teamId, startDate, endDate, remarks }
        if (!id) {
          delete params.id
        }
        addDutyPlay(params)
          .then(({ data }) => {
            if (data.code === 200) {
              this.visible = false
              // 刷新数据
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '保存失败!')
            }
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
  },
}
</script>

<template>
  <div class="arrange-pipe">
    <el-calendar>
      <template
        slot="dateCell"
        slot-scope="{ data }"
      >
        <div
          class="base-cell"
          :class="dates.includes(data.day) ? 'is-selected' : ''"
          @click="tapFn(data)"
        >
          <div class="title">
            {{ data.day.split('-').slice(1).join('-') }}
          </div>
          <div class="bar">
            <template v-for="item in list">
              <span
                v-if="item.dates.indexOf(data.day) === 0"
                :key="item.id"
                style="padding-left: 8px"
              >{{ item.teamName }}
              </span>
            </template>
          </div>
        </div>
      </template>
    </el-calendar>

    <el-dialog
      class="normal-dialog arrangePipe-dialog"
      :title="title"
      width="50%"
      :close-on-click-modal="false"
      center
      :visible.sync="visible"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="70px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="小组名称"
              prop="teamId"
            >
              <el-select
                v-model="form.teamId"
                placeholder="请选择"
                style="width: 100%"
                @change="teamFn"
              >
                <el-option
                  v-for="item in teamList"
                  :key="item.id"
                  :label="item.teamName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组长">
              <el-input
                v-model="form.teamLeaderName"
                placeholder="暂无"
                readonly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="组员">
              <el-input
                v-model="form.teamMemberNameList"
                placeholder="暂无"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="开始时间"
              prop="startDate"
            >
              <el-date-picker
                v-model="form.startDate"
                clearable
                type="date"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="结束时间"
              prop="endDate"
            >
              <el-date-picker
                v-model="form.endDate"
                clearable
                type="date"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
            >
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="5"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="visible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="doneFn"
        >
          保存
        </el-button>
        <el-button
          type="danger"
          @click="delItem"
        >
          删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.arrange-pipe {
  .el-calendar-day {
    position: relative;
    .base-cell {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      .title {
        padding: 8px;
      }
      &.is-selected {
        .bar {
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 30px;
          background: rgb(121, 187, 255);
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
.arrangePipe-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
