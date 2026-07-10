<script>
export default {
  data() {
    return {
      levelList: [],
      formData: {},
    }
  },
  created() {
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.levelList = dicList.suggest_level
  },
  methods: {
    closeClick() {
      this.$emit('close', null)
    },
    submitClick() {
      this.$refs.addExtraForm.validate((valid) => {
        if (valid) {
          this.$emit('close', this.formData)
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-form
      ref="addExtraForm"
      :model="formData"
      label-width="100px"
      style="width: 700px"
    >
      <el-form-item
        label="检查内容"
        prop="checkContent"
        :rules="{ required: true, message: '请输入检查内容', trigger: 'blur' }"
      >
        <el-input
          v-model="formData.checkContent"
          type="textarea"
          :rows="4"
          resize="none"
        />
      </el-form-item>
      <el-form-item
        label="检查依据"
        prop="checkBasis"
      >
        <el-input v-model="formData.checkBasis" />
      </el-form-item>
      <el-form-item
        label="建议等级"
        prop="recommendedLevel"
      >
        <el-select
          v-model="formData.recommendedLevel"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="item in levelList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="closeClick"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>
