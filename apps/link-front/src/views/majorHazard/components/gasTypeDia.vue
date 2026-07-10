<script>
import { GasAdd } from '@/http/major-hazard/Anpi-chemical'

export default {
  name: 'gasTypeDia',
  props: {
    Method: {
      type: String,
      default: '',
    },
    FromData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      isLoading: false,
      inputForm: {
        businessCategory: 2,
        checkCoefficient: undefined,
        toxicityCharacter: '',
        toxicityName: '',
      },
    }
  },
  created() {
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
    }
  },
  methods: {
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.checkCoefficient = Number(this.inputForm.checkCoefficient)
          GasAdd(this.inputForm)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('提交成功')
                this.closeClick(true)
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch((err) => {
              this.$message.error('提交出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 关闭弹窗 */
    closeClick(isRefresh) {
      this.$emit('DialogClose', isRefresh)
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :inline="true"
      :model="inputForm"
      label-width="120px"
      :class="Method === 'view' ? 'readonly' : ''"
      :disabled="Method === 'view'"
      @submit.native.prevent
    >
      <el-form-item
        label="毒性气体名称"
        prop="toxicityName"
        :rules="{
          required: true,
          message: '毒性气体名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.toxicityName"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="毒性气体类别符号"
        prop="toxicityCharacter"
        :rules="{
          required: true,
          message: 'β校正系数不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.toxicityCharacter"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="β校正系数"
        prop="checkCoefficient"
        :rules="{
          required: true,
          message: 'β校正系数不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.checkCoefficient"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <span style="float: right">
        <el-button @click="closeClick(false)">关闭</el-button>
        <el-button
          v-if="Method !== 'view'"
          v-noMoreClick
          type="primary"
          @click="doSubmitPersonneDialog()"
        >确定保存</el-button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.small-row {
  width: 192px;
}

.big-row {
  width: 515px;
}

.paragraph-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
  .paragraph-title-item {
    display: inline-block;
    content: '';
    margin: 0 10px 0 0;
    width: 4px;
    height: 20px;
    background-color: #409eff;
  }
}
</style>
