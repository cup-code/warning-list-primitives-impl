<script>
import { reactive, ref } from 'vue'

export default {
  name: 'SubSystemConfig',
  setup() {
    const dialogVisible = ref(false)
    const from = reactive({
      waterQuality: true,
      waterVolume: true,
      sludge: true,
      medicine: true,
      deodorization: true,
      storage: true,
      biochemical: true,
      monitor: true,
    })

    const systemList = [
      { label: '水质系统', key: 'waterQuality', required: true },
      { label: '水量系统', key: 'waterVolume', required: true },
      { label: '污泥系统', key: 'sludge', required: true },
      { label: '加药系统', key: 'medicine', required: true },
      { label: '除臭系统', key: 'deodorization' },
      { label: '储渣系统', key: 'storage', required: true },
      { label: '生化系统', key: 'biochemical', required: true },
      { label: '设备监控系统', key: 'monitor', required: true },
    ]

    const rules = {
      organization: [{ required: true, message: '请选择所属组织', trigger: 'blur' }],
      product: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      group: [{ required: true, message: '请输入终端分组', trigger: 'blur' }],
      name: [{ required: true, message: '请输入终端名称', trigger: 'blur' }],
    }

    const onCancel = () => {
      dialogVisible.value = false
    }

    const onConfirm = () => {
      console.log(from)
      dialogVisible.value = false
    }

    return {
      dialogVisible,
      from,
      rules,
      onCancel,
      onConfirm,
      systemList,
    }
  },
}
</script>

<template>
  <el-dialog
    title="子系统配置"
    class="normal-dialog"
    :visible.sync="dialogVisible"
    width="40%"
    @close="onCancel"
  >
    <el-form
      ref="formRef"
      :model="from"
      :rules="rules"
      label-width="120px"
    >
      <div class="grid grid-cols-2 gap-4">
        <el-form-item
          v-for="item in systemList"
          :key="item.key"
          :label="item.label"
          :required="item.required"
        >
          <div
            class="toggle-switch"
            :class="{ active: from[item.key] }"
            @click="from[item.key] = !from[item.key]"
          >
            <span class="switch-text">{{ from[item.key] ? '开' : '关' }}</span>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">
        取消
      </el-button>
      <el-button
        type="primary"
        @click="onConfirm"
      >
        确认
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.toggle-switch {
  position: relative;
  width: 60px;
  height: 26px;
  border-radius: 13px;
  background-color: #ff4949;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  padding: 0 6px;

  &::after {
    content: '';
    position: absolute;
    left: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #fff;
    transition: all 0.3s;
  }

  &.active {
    background-color: #13ce66;

    &::after {
      left: 36px;
    }
  }

  .switch-text {
    color: #fff;
    font-size: 12px;
    position: relative;
    z-index: 1;
    margin-left: 24px;
    user-select: none;
  }

  &.active .switch-text {
    margin-left: 6px;
  }
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}
</style>
