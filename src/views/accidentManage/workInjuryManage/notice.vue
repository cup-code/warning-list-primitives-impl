<script>
import { queryWorkInjuryNotice, saveWorkInjuryNotice } from '@/http/accidentManage/investigation'

export default {
  props: {
    personData: Object,
    isDialog: Boolean,
  },
  data: () => ({
    detail: {},
    inputForm:
      '<p>根据《湖北省工伤职工停工留薪期分类目录》与医疗机构诊断证明，经确认，杨碧春</p><p>同志停工留薪期为4个月 (从2021年1月24日至2021年 月 日)。</p><p>根据《湖北省工伤职工停工留新期管理办法》规定，若您对我单位确定的停工留薪期有异议，可以在收到本通知之日起5个工作内向统筹地区劳动能力鉴定委员会提出申请，确认停工留薪期。停工留薪期满(停工留薪期应连续计算，包括法定节假日和休息日)，因伤情尚未稳定或未痊愈，不能恢复工作，需要延长停工留薪期的，请您在停工留薪期满前5个工作日内向统筹地区劳动能力鉴定委员会申请延长停工留薪期，并提交相关证明，经鉴定委员会确认，可以延长停工留薪期，但延长停工留薪期累计不得超过12个月。未在停工留薪期满前向统筹地区劳动能力鉴定委员会提出延长停工留薪期申请的，停工留薪期到期终止。停工留薪期未满，协议医疗机构出具工伤治愈诊断证明并经确认的，</p><p>停工留薪期终止。停工留薪期(含延长期)满或者终止，工伤职工经治疗伤情相对稳定后拒不接受劳动能力鉴定的，用人单位停发停工留薪期的工资福利待遇，经办机构暂停支付工伤医疗费用。</p>',
  }),
  created() {
    this.detail = this.$route.query
    if (this.isDialog) {
      this.detail = this.personData
    }
    queryWorkInjuryNotice({}).then((res) => {
      if (res.success) {
        this.inputForm = res.result.note
      }
    })
  },
  methods: {
    // 获取当前日期函数
    getNowFormatDate() {
      const date = new Date()
      const year = date.getFullYear()
      let month = date.getMonth() + 1
      let strDate = date.getDate()
      if (month < 10)
        month = `0${month}`
      if (strDate < 10)
        strDate = `0${strDate}`

      return `${year}年${month}月${strDate}日`
    },
    save() {
      saveWorkInjuryNotice({ note: this.inputForm }).then((res) => {
        if (res.success) {
          this.$message.success(res.message || '保存成功')
          if (this.isDialog) {
            this.$emit('close')
          }
        }
        else {
          this.$message.warning(res.message || '保存失败')
        }
      })
    },
  },
}
</script>

<template>
  <div class="notice">
    <h3>工伤职工停工留薪期确认通知书</h3>
    <div>
      <span>受伤职工姓名: ({{ detail.name }})</span>
      <span>性别: ({{ detail.gender }})</span>
      <span>身份证号:{{ detail.idNumber }}</span>
    </div>
    <div>
      <span>工作单位和部门: ({{ detail.companyDepartment }})</span>
      <span>伤害部位:{{ detail.injuryLocation }}</span>
    </div>
    <div style="height: 360px">
      <vue-editor
        v-model="inputForm"
        class="no-select"
      />
    </div>
    <div>
      <span>受伤职工或家属签收:</span>
      <span>(单位盖章)</span>
    </div>
    <div>
      <span>年月日</span>
      <span>{{ getNowFormatDate() }}</span>
    </div>
    <div>此通知一式两联，此为第一联，由职工阅读签收后自己留存。</div>
    <el-button
      style="display: block; margin: 10px auto"
      type="primary"
      @click="save"
    >
      确认
    </el-button>
  </div>
</template>

<style scoped lang="scss">
::v-deep .ql-container {
  height: 260px;
}
.notice {
  font-size: 13px;
  h3,
  div {
    text-align: center;
    height: 30px;
    line-height: 30px;
  }
  span {
    margin-right: 15px;
  }
  .no-select {
    cursor: not-allowed;
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #333;
    cursor: not-allowed;
  }
}
</style>
