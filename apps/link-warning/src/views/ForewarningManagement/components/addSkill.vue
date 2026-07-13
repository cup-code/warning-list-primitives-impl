<script>
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import {
  getCurrentInstance,
  reactive,
  ref,
  watch,
} from 'vue'
import {
  getWarningTypeList,
  machineList,
  saveOrUpdateAiSkill,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'AddSkill',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    editInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()
    const queryClient = useQueryClient()
    const formRef = ref(null)

    // 表单数据
    const form = reactive({
      machineId: '',
      companyId: '',
      departmentId: '',
      companyName: '',
      departmentName: '',
      skills: [],
      enableState: false,
    })

    // 表单验证规则
    const rules = reactive({
      machineId: [{ required: true, message: '请选择一体机', trigger: 'change' }],
    })

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }

      // 避免form为null/undefined时执行Object.keys报错
      if (form) {
        Object.keys(form).forEach((key) => {
          if (Array.isArray(form[key])) {
            form[key] = []
          }
          else {
            form[key] = ''
          }
        })
      }
    }

    // 一体机列表
    const machineLists = ref([])
    const { refetch: fetchMachines } = useQuery({
      queryKey: ['machineList'],
      queryFn: () =>
        machineList({
          isPage: false,
        }),
      onSuccess: ({ data }) => {
        if (data?.success) {
          machineLists.value = data.result?.list || []
        }
        else {
          proxy.$message.error(data?.message || '获取一体机列表失败')
        }
      },
      enabled: false, // 默认不执行查询，手动触发
    })

    // 技能列表
    const skillList = ref([])
    const { refetch: fetchSkills } = useQuery({
      queryKey: ['warningTypeList'],
      queryFn: () => getWarningTypeList(),
      onSuccess: ({ data }) => {
        if (data?.success) {
          skillList.value = data.result || []
        }
        else {
          proxy.$message.error(data?.message || '获取技能列表失败')
        }
      },
      enabled: false, // 默认不执行查询，手动触发
    })

    // 提交表单
    const { mutate: submitForm, isPending: isSubmitting } = useMutation({
      mutationFn: formData => saveOrUpdateAiSkill(formData),
      onSuccess: ({ data }) => {
        if (data?.success) {
          proxy.$message.success('保存成功')
          // 刷新列表数据
          queryClient.invalidateQueries({
            queryKey: ['aiAuditSkillList'],
            refetchType: 'all',
          })
          // 关闭弹窗
          emit('update:visible', false)

          resetForm()
        }
        else {
          proxy.$message.error(data?.message || '保存失败')
        }
      },
      onError: (error) => {
        proxy.$message.error('保存失败')
      },
    })

    // 监听弹窗可见性
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          // 弹窗打开时获取数据
          fetchMachines()
          fetchSkills()
        }
      },
      { immediate: true },
    )

    // 监听编辑信息变化
    watch(
      () => props.editInfo,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          // 编辑模式，填充表单数据
          Object.keys(form).forEach((key) => {
            if (key === 'skills') {
              form.skills = newVal[key].split(',')
            }
            else if (key === 'enableState') {
              form.enableState = Boolean(newVal[key])
            }
            else if (newVal[key] !== undefined) {
              form[key] = newVal[key]
            }
          })
        }
      },
      { immediate: true },
    )

    // 选择一体机时设置公司和部门
    const onChangeMachine = (machineId) => {
      if (machineId) {
        const selectedMachine = machineLists.value.find(item => item.id === machineId)
        if (selectedMachine) {
          form.companyId = selectedMachine.companyId
          form.departmentId = selectedMachine.departmentId
          form.companyName = selectedMachine.companyName
          form.departmentName = selectedMachine.departmentName
        }
      }
      else {
        // 清空相关字段
        form.companyId = ''
        form.departmentId = ''
        form.companyName = ''
        form.departmentName = ''
      }
    }

    // 提交表单
    const onSubmit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          const submitData = {
            ...form,
            skills: form.skills.join(','),
            enableState: Number(form.enableState),
          }
          if (props.editInfo?.id) {
            submitData.id = props.editInfo?.id
          }
          delete submitData.companyName
          delete submitData.departmentName
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
      machineLists,
      skillList,
      isSubmitting,
      onChangeMachine,
      onSubmit,
      onCancel,
    }
  },
}
</script>

<template>
  <el-dialog
    :visible.sync="visible"
    title="审核技能配置"
    class="normal-dialog"
    width="50%"
    :close-on-click-modal="false"
    destroy-on-close
    @close="onCancel"
  >
    <div class="mb-6 w-2/3">
      <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
        <el-form-item label="一体机" prop="machineId" required>
          <el-select
            v-model="form.machineId"
            placeholder="请选择一体机"
            clearable
            @change="onChangeMachine"
          >
            <el-option
              v-for="item in machineLists"
              :key="item.id"
              :label="item.machineName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司" prop="companyId" required>
          <el-input v-model="form.companyName" placeholder="公司信息" disabled />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId" required>
          <el-input v-model="form.departmentName" placeholder="部门信息" disabled />
        </el-form-item>
        <el-form-item label="技能" prop="skills">
          <el-select
            v-model="form.skills"
            placeholder="请选择技能"
            multiple
            clearable
            collapse-tags
            style="width: 100%"
          >
            <el-option
              v-for="item in skillList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="enableState">
          <el-switch v-model="form.enableState" />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <EButton type="default" @click="onCancel">
        取消
      </EButton>
      <EButton type="primary" :loading="isSubmitting" @click="onSubmit">
        提交
      </EButton>
    </div>
  </el-dialog>
</template>
