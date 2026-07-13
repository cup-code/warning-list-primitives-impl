<script>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue'
import {
  saveOrUpdateVideoModelSkillGlobal,
  saveOrUpdateVideoModelSkillTenant,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'AddModelSkill',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    editInfo: {
      type: Object,
      default: () => ({}),
    },
    // 'global' | 'tenant' —— 决定调用哪套接口与失效哪个 queryKey
    scope: {
      type: String,
      default: 'global',
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()
    const queryClient = useQueryClient()
    const formRef = ref(null)

    // 表单数据
    const form = reactive({
      skillName: '',
      skillPrompt: '',
      skillWords: '',
    })

    // 表单校验规则（skillName 必填为最低；其余默认必填，实现期与后端 DTO 对齐）
    const rules = reactive({
      skillName: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
      skillPrompt: [{ required: true, message: '请输入技能提示词', trigger: 'blur' }],
      skillWords: [{ required: true, message: '请输入技能关键词', trigger: 'blur' }],
    })

    // 弹窗标题
    const title = computed(() => (props.editInfo?.id ? '编辑技能配置' : '新增技能配置'))

    // 弹窗显隐代理：用计算属性承接 .sync，避免直接修改 prop（vue/no-mutating-props）
    const dialogVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    })

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      if (form) {
        Object.keys(form).forEach((key) => {
          form[key] = ''
        })
      }
    }

    // 按 scope 选取保存接口
    const saveFn = formData =>
      props.scope === 'tenant'
        ? saveOrUpdateVideoModelSkillTenant(formData)
        : saveOrUpdateVideoModelSkillGlobal(formData)

    // 提交（新增/编辑共用）
    const { mutate: submitForm, isPending: isSubmitting } = useMutation({
      mutationFn: formData => saveFn(formData),
      onSuccess: ({ data }) => {
        if (data?.success) {
          proxy.$message.success('保存成功')
          // 失效对应 scope 的列表查询，触发刷新
          queryClient.invalidateQueries({ queryKey: ['modelSkillList', props.scope] })
          emit('update:visible', false)
          resetForm()
        }
        else {
          proxy.$message.error(data?.message || '保存失败')
        }
      },
      onError: () => {
        proxy.$message.error('保存失败')
      },
    })

    // 编辑回填
    watch(
      () => props.editInfo,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          Object.keys(form).forEach((key) => {
            if (newVal[key] !== undefined) {
              form[key] = newVal[key]
            }
          })
        }
      },
      { immediate: true },
    )

    // 提交校验
    const onSubmit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          const submitData = { ...form }
          // 编辑时带上 id
          if (props.editInfo?.id) {
            submitData.id = props.editInfo.id
          }
          submitForm(submitData)
        }
        else {
          return false
        }
      })
    }

    // 取消
    const onCancel = () => {
      emit('update:visible', false)
      resetForm()
    }

    return {
      form,
      rules,
      formRef,
      title,
      dialogVisible,
      isSubmitting,
      onSubmit,
      onCancel,
    }
  },
}
</script>

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    class="normal-dialog"
    width="50%"
    :close-on-click-modal="false"
    destroy-on-close
    @close="onCancel"
  >
    <div class="mb-6 w-2/3">
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item label="技能名称" prop="skillName" required>
          <el-input
            v-model="form.skillName"
            placeholder="请输入技能名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="技能提示词" prop="skillPrompt" required>
          <el-input
            v-model="form.skillPrompt"
            type="textarea"
            :rows="4"
            placeholder="请输入技能提示词"
          />
        </el-form-item>
        <el-form-item label="技能关键词" prop="skillWords" required>
          <el-input
            v-model="form.skillWords"
            type="textarea"
            :rows="4"
            placeholder="请输入技能关键词"
          />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <EButton type="default" @click="onCancel">
        取消
      </EButton>
      <EButton
        type="primary"
        :loading="isSubmitting"
        @click="onSubmit"
      >
        提交
      </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
// 弹窗样式（按需补充）
</style>
