<script>
import { CriticalityByTypeAdd } from '@/http/major-hazard/Anpi-chemical'

export default {
  name: 'criticalityByTypeDia',
  components: {},
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
    const validate = function (rule, value, callback) {
      const num = Number(value)
      if (/^\+?(\d+).?(\d+)$/.test(num) == false) {
        callback(new Error('请输入仅一位小数的正数'))
      }
      else {
        callback()
      }
    }
    return {
      isLoading: false,
      quantityRules: [
        { required: true, message: '临界值', trigger: 'blur' },
        { validator: validate, trigger: 'blur' },
      ],
      inputForm: {
        harmCategory: '',
        harmCharacter: '',
        harmDesc: '',
        quantity: '',
      },
    }
  },
  created() {
    if (this.Method !== 'add') {
      Object.assign(this.inputForm, JSON.parse(JSON.stringify(this.FromData)))
    }
    else {
    }
  },
  methods: {
    // 提交数据
    doSubmitPersonneDialog() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          this.inputForm.quantity = Number(this.inputForm.quantity)
          CriticalityByTypeAdd(this.inputForm)
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
        label="危害类别"
        prop="harmCategory"
        :rules="{
          required: true,
          message: '危害类别不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.harmCategory"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="危害类别符号"
        prop="harmCharacter"
        :rules="{
          required: true,
          message: '危害类别符号不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.harmCharacter"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="危险性分类及说明"
        prop="harmDesc"
        :rules="{
          required: true,
          message: '危险性分类及说明不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="inputForm.harmDesc"
          class="small-row"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="临界值/t"
        prop="quantity"
        :rules="quantityRules"
      >
        <el-input
          v-model="inputForm.quantity"
          class="small-row"
          placeholder="请输入"
          clearable
          type="number"
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
