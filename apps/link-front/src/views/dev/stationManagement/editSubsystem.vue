<script>
import { ref } from "vue";

export default {
  name: "BindDev",
  setup() {
    const dialogVisible = ref(false);
    const from = ref({
      organization: "",
      product: "",
      group: "",
      name: "",
    });

    const rules = {
      organization: [{ required: true, message: "请输入值", trigger: "blur" }],
    };

    const onCancel = () => {
      dialogVisible.value = false;
    };

    const onConfirm = () => {
      dialogVisible.value = false;
    };

    return {
      dialogVisible,
      from,
      rules,
      onCancel,
      onConfirm,
    };
  },
};
</script>

<template>
  <el-dialog
    title="修改值"
    class="normal-dialog"
    :visible.sync="dialogVisible"
    width="40%"
    @close="onCancel"
  >
    <el-form ref="formRef" :model="from" :rules="rules" label-width="100px">
      <el-form-item label="值" prop="organization" required>
        <el-input v-model="from.organization" style="width: 70%" placeholder="请输入值" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel"> 取消 </el-button>
      <el-button type="primary" @click="onConfirm"> 保存 </el-button>
    </div>
  </el-dialog>
</template>
