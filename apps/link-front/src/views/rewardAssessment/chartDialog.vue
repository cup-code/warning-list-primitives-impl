/* * @Author: xiaorui 汇总分析页面查看详情弹框 * @Date: 2023-07-27 18:15:02 * @Last Modified by:
xiaorui * @Last Modified time: 2023-07-28 09:30:25 */
<script>
export default {
  data() {
    return {
      visible: false,
      colWidth: 12,
      title: '汇总分析台账详情',
      inputForm: {
        userName: '',
        departmentName: '',
        post: '',
        date: '',
        politicalAttribute: '',
        illustrate: '',
        factDes: '',
        category: '',
        type: '',
        count: '',
      },
    }
  },
  methods: {
    init(row, type) {
      this.visible = true
      this.$nextTick(() => {
        this.inputForm = this.recover(this.inputForm, row)
        if (type === 1) {
          this.inputForm.userName = row.examineUserName
          this.inputForm.departmentName = row.examineDepartmentName
          this.inputForm.post = row.examineUserPost
          this.inputForm.date = row.assessDate
          this.inputForm.category = '三违考核'
          this.inputForm.type = this.$dictUtils.getDictLabel('assess_category', row.assessCategory)
          this.inputForm.count = row.assessTotalAmount
        }
        else if (type === 2) {
          this.inputForm.userName = row.rewardUserName
          this.inputForm.departmentName = row.rewardDepartmentName
          this.inputForm.post = row.rewardUserPost
          this.inputForm.date = row.rewardDate
          this.inputForm.category = '安全奖励'
          this.inputForm.type = this.$dictUtils.getDictLabel('reward_category', row.rewardCategory)
          this.inputForm.count = row.rewardTotalAmount
        }
        this.inputForm.politicalAttribute = this.$dictUtils.getDictLabel(
          'politics_status',
          row.politicalAttribute,
        )
        this.inputForm.illustrate = row.illustrate
        this.inputForm.factDes = row.factDes
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :modal-append-to-body="false"

    :visible.sync="visible"
    class="normal-dialog"
    width="800px"
  >
    <el-form
      ref="inputForm"
      :model="inputForm"
      label-width="90px"
      disabled
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="姓名"
            prop="userName"
          >
            <el-input v-model="inputForm.userName" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="部门"
            prop="departmentName"
          >
            <el-input v-model="inputForm.departmentName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="岗位"
            prop="post"
          >
            <el-input v-model="inputForm.post" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="日期"
            prop="date"
          >
            <el-input v-model="inputForm.date" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="政治面貌"
            prop="politicalAttribute"
          >
            <el-input v-model="inputForm.politicalAttribute" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="处理结果"
            prop="illustrate"
          >
            <el-input v-model="inputForm.illustrate" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="事实描述"
          prop="factDes"
        >
          <el-input
            v-model="inputForm.factDes"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励考核类别"
            prop="category"
          >
            <el-input v-model="inputForm.category" />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励考核类型"
            prop="type"
          >
            <el-input v-model="inputForm.type" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="奖励考核金额"
            prop="count"
          >
            <el-input v-model="inputForm.count" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
  </el-dialog>
</template>
