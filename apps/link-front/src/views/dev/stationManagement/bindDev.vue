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
      organization: [{ required: true, message: "请选择所属组织", trigger: "blur" }],
      product: [{ required: true, message: "请选择所属产品", trigger: "blur" }],
      group: [{ required: true, message: "请输入终端分组", trigger: "blur" }],
      name: [{ required: true, message: "请输入终端名称", trigger: "blur" }],
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
    title="查询终端"
    class="normal-dialog"
    :visible.sync="dialogVisible"
    width="40%"
    @close="onCancel"
  >
    <el-form ref="formRef" :model="from" :rules="rules" label-width="100px">
      <el-form-item label="所属组织" prop="organization" required>
        <el-select v-model="from.organization" placeholder="请选择所属组织">
          <el-option label="湛江市民安片区" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属产品" prop="product" required>
        <el-select v-model="from.product" placeholder="请选择所属产品">
          <el-option label="两网四出网关" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="终端分组" prop="group" required>
        <el-input v-model="from.group" style="width: 70%" placeholder="请输入终端分组" />
      </el-form-item>
      <el-form-item label="终端名称" prop="name" required>
        <el-input v-model="from.name" style="width: 70%" placeholder="请输入终端名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel"> 取消 </el-button>
      <el-button type="primary" @click="onConfirm"> 确认绑定 </el-button>
    </div>
  </el-dialog>
</template>
