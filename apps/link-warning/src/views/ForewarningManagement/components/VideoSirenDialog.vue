<script>
import { useMutation, useQuery } from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  ref,
  watch,
} from 'vue'
import { getCompanyList } from '@/http/safe-production/company-manage-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { saveOrUpdateVideoSiren } from '@/http/videoWarning/warning-api'

export default {
  name: 'VideoSirenDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: 'add', // add or edit
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()

    // 表单数据
    const form = ref({
      id: '',
      companyId: '',
      departmentId: '',
      deviceName: '',
      deviceModel: '',
      deviceNum: '',
      enableState: 1,
      ipAddr: '',
      portNum: '',
      cloudUrl: '',
      remark: '',
      repeatTimes: 1,
    })
    const forms = ref(null)

    // 表单校验规则
    const rules = {
      companyId: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
      departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
      deviceName: [{ required: true, message: '请输入声光报警器名称', trigger: 'blur' }],
      enableState: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
      repeatTimes: [{ required: true, message: '请输入重复播报次数', trigger: 'blur' }],
    }

    // 加载状态
    const loading = ref(false)

    // 是否禁用选择（用于编辑模式）
    const check = ref(false)

    // 计算属性：对话框可见性
    const dialogVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    })

    // 监听表单数据变化
    watch(
      () => props.formData,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          Object.assign(form.value, newVal)
        }

        setTimeout(() => {
          newVal.companyId && getDepartmentList(newVal.companyId)
        }, 100)
      },
      { deep: true, immediate: true },
    )

    // 获取部门列表
    const departmentList = ref([])
    const { mutate: getDepartmentList } = useMutation({
      mutationFn: companyId => getAllDepartByCompanyFn(companyId),
      onSuccess: ({ data }) => {
        if (data.success) {
          departmentList.value = data.result || []
        }
      },
    })

    // 获取公司列表
    const companyList = ref([])
    const companyListQuery = useQuery({
      queryKey: ['companyList'],
      queryFn: () => getCompanyList(),
      onSuccess: ({ data }) => {
        if (data.success) {
          companyList.value = data.result || []
        }
      },
    })

    // 公司选择变更处理
    const onChangeCompany = (companyId) => {
      // 清空已选部门
      form.value.departmentId = ''
      departmentList.value = []

      // 如果选择了公司，则加载对应的部门列表
      if (companyId) {
        getDepartmentList(companyId)
      }
    }

    // 部门选择变更处理
    const onChangeDepartment = (departmentId) => {
      // 这里可以添加部门选择后的逻辑，如果需要的话
    }

    // 提交表单
    const handleSubmit = async () => {
      forms.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            const res = await saveOrUpdateVideoSiren(form.value)
            if (res.data && res.data.success) {
              proxy.$message.success(
                props.dialogType === 'add' ? '添加成功' : '更新成功',
              )
              dialogVisible.value = false
              emit('success')
            }
            else {
              proxy.$message.error(res.data?.message || '操作失败')
            }
          }
          catch (error) {
            console.error('保存声光报警器失败:', error)
            proxy.$message.error('操作失败')
          }
          finally {
            loading.value = false
          }
        }
      })
    }

    // 关闭对话框时重置表单
    const handleDialogClosed = () => {
      forms.value.resetFields()
      Object.keys(form.value).forEach((key) => {
        if (key !== 'enableState') {
          form.value[key] = ''
        }
        else {
          form.value[key] = '1'
        }
      })
    }

    return {
      form,
      forms,
      rules,
      loading,
      check,
      dialogVisible,
      companyListQuery,
      companyList,
      departmentList,
      onChangeCompany,
      onChangeDepartment,
      handleSubmit,
      handleDialogClosed,
    }
  },
}
</script>

<template>
  <el-dialog
    :title="dialogType === 'add' ? '新增声光报警器' : '编辑声光报警器'"
    :visible.sync="dialogVisible"
    width="50%"
    class="normal-dialog"
    :close-on-click-modal="false"
    @closed="handleDialogClosed"
  >
    <el-form
      ref="forms"
      :model="form"
      :rules="rules"
      :disabled="dialogType === 'view'"
      label-width="120px"
      size="small"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="报警器名称" prop="deviceName">
            <el-input v-model="form.deviceName" placeholder="请输入声光报警器名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="设备型号" prop="deviceModel">
            <el-input v-model="form.deviceModel" placeholder="请输入设备型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备序列号" prop="deviceNum">
            <el-input v-model="form.deviceNum" placeholder="请输入设备序列号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="IP地址" prop="ipAddr">
            <el-input v-model="form.ipAddr" placeholder="请输入IP地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="端口号" prop="portNum">
            <el-input v-model="form.portNum" placeholder="请输入端口号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="云端推送地址" prop="cloudUrl">
            <el-input v-model="form.cloudUrl" placeholder="请输入云端推送地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="所属公司" prop="companyId">
            <el-select
              v-model="form.companyId"
              placeholder="请选择公司"
              clearable
              :disabled="check"
              @change="onChangeCompany"
            >
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.companyName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <el-select
              v-model="form.departmentId"
              placeholder="请选择部门"
              clearable
              :disabled="check || !form.companyId"
              @change="onChangeDepartment"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="启用状态" prop="enableState">
            <el-radio-group v-model="form.enableState">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                禁用
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重复播报次数" prop="repeatTimes">
            <el-input-number v-model="form.repeatTimes" :min="1" :max="10" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.el-row {
  margin-bottom: 10px;
}
</style>
