<script>
import {
  computed,
  defineComponent,
  getCurrentInstance,
  ref,
  watch,
} from 'vue'
import { saveOrUpdateCardSiren } from '@/http/videoWarning/warning-api'

export default defineComponent({
  name: 'CardSirenDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'add',
    },
    cardOptions: {
      type: Array,
      default: () => [],
    },
    sirenOptions: {
      type: Array,
      default: () => [],
    },
    record: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:visible', 'success', 'closed'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()
    const formRef = ref(null)
    const form = ref({
      id: '',
      sn: '',
      sirenIds: [],
      buildId: '',
    })

    const rules = {
      sn: [{ required: true, message: '请选择定位卡号', trigger: 'change' }],
      sirenIds: [
        { required: true, message: '请选择声光报警器', trigger: 'change' },
      ],
    }

    const title = computed(() => {
      if (props.type === 'edit') {
        return '编辑关联'
      }
      return '新增关联'
    })

    const normalizeRecord = (data = {}) => {
      form.value = {
        id: data.id || '',
        sn: data.sn || '',
        sirenIds: Array.isArray(data.sirenIds)
          ? data.sirenIds
          : data.sirenIds
            ? String(data.sirenIds)
              .split(',')
              .filter(Boolean)
            : [],
        buildId: data.buildId || '',
      }
      formRef.value?.clearValidate?.()
    }

    const handleSubmit = () => {
      formRef.value?.validate(async (valid) => {
        if (!valid)
          return

        const payload = {
          ...form.value,
          sirenIds: form.value.sirenIds.join(','),
        }

        try {
          const res = await saveOrUpdateCardSiren(payload)
          if (res.data?.success) {
            proxy.$message.success(props.type === 'edit' ? '更新成功' : '新增成功')
            emit('success')
            emit('update:visible', false)
          }
          else {
            proxy.$message.error(res.data?.message || '操作失败')
          }
        }
        catch (err) {
          console.error('保存定位卡关联失败', err)
          proxy.$message.error('保存定位卡关联失败')
        }
      })
    }

    const handleCancel = () => {
      emit('update:visible', false)
    }

    const handleClosed = () => {
      normalizeRecord()
      emit('closed')
    }

    watch(
      () => props.record,
      (val) => {
        if (props.visible) {
          normalizeRecord(val)
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => props.visible,
      (val) => {
        if (!val) {
          normalizeRecord()
        }
        else {
          normalizeRecord(props.record)
        }
      },
    )

    return {
      form,
      formRef,
      rules,
      title,
      handleSubmit,
      handleCancel,
      handleClosed,
    }
  },
})
</script>

<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="space-y-4 text-sm text-gray-700">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="96px"
        label-position="right"
        size="mini"
        class="space-y-3"
      >
        <el-form-item label="定位卡号" prop="sn">
          <el-select
            v-model="form.sn"
            filterable
            placeholder="请选择定位卡号"
            class="w-full"
          >
            <el-option
              v-for="item in cardOptions"
              :key="item.id || item.sn || item.value"
              :label="item.sn || item.label || item.name"
              :value="item.sn || item.value || ''"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="声光报警器" prop="sirenIds">
          <el-select
            v-model="form.sirenIds"
            filterable
            multiple
            placeholder="请选择声光报警器"
            class="w-full"
            collapse-tags
          >
            <el-option
              v-for="item in sirenOptions"
              :key="item.id"
              :label="item.deviceName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button size="mini" @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
