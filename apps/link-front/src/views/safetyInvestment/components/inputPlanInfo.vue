<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { addSafetyInvestment } from '@/http/safetyInvestment/safety-api.js'

export default {
  components: {
    TreeSelect,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据
    info: {
      type: Object,
      default() {
        return {}
      },
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      // 编辑的数据
      changeData: {},
      dataRule: {
        companyName: [{ required: true, message: '请选择公司', trigger: 'change' }],
        planYear: [{ required: true, message: '请选择年份', trigger: 'change' }],
      },
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    getInfoData() {
      // 查看或修改
      if (this.info.id) {
        this.changeData = this.info
        this.changeData.planYear = this.changeData.planYear.toString()
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
        }
      }
    },
    /* 下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.areaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          addSafetyInvestment(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <!-- 安全投入计划详情 -->
  <div v-loading="isLoading">
    <el-form
      ref="areaForm"
      :model="changeData"
      label-width="100px"
      style="width: 750px"
      inline
      :disabled="!editable"
      :rules="dataRule"
    >
      <el-form-item
        label="公司"
        prop="companyName"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="depChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="年份"
        prop="planYear"
      >
        <el-date-picker
          v-model="changeData.planYear"
          type="year"
          value-format="yyyy"
          format="yyyy"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="上年营业额度"
        prop="lastYearTurnover"
      >
        <el-input
          v-model="changeData.lastYearTurnover"
          placeholder="请输入数字金额"
          style="width: 250px"
          type="number"
          :min="0"
        />万元
      </el-form-item>
      <el-form-item
        label="年度提取额度"
        prop="yearWithdrawalAmount"
      >
        <el-input
          v-model="changeData.yearWithdrawalAmount"
          placeholder="请输入数字金额"
          style="width: 250px"
          type="number"
          :min="0"
        />万元
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tips-box {
  width: 710px;
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid #e6a23c;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  i {
    margin: 0 10px 0 0;
  }
}
.money {
  color: rgb(161, 159, 159);
  width: 70px;
  height: 30px;
  line-height: 30px;
  border: 1px solid rgb(75, 73, 73);
  text-align: center;
}
</style>
