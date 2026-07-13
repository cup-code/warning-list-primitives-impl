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
import { getCompanyList, getProvinces } from '@/http/safe-production/company-manage-api'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import { addMachine } from '@/http/videoWarning/warning-api'
import PickPeople from '@/views/common-ui/PickPeople'

export default {
  name: 'AddMachine',
  components: {
    PickPeople,
  },
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    check: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const visible = ref(false)
    const isSubmitting = ref(false)
    const formRef = ref(null)

    const form = ref({
      machineName: '',
      machineCode: '',
      loginUrl: '',
      machineIp: '',
      pushUrls: '',
      apiVersion: '',
      systemVersion: '',
      companyId: '',
      companyName: '',
      departmentId: '',
      departmentName: '',
      industry: '',
      manufacturer: '',
      region: '',
      province: '',
    })

    const rules = reactive({
      machineName: [{ required: true, message: '请输入一体机名称', trigger: 'blur' }],
      machineCode: [{ required: true, message: '请输入一体机code', trigger: 'blur' }],
      loginUrl: [{ required: true, message: '请输入一体机登录地址', trigger: 'blur' }],
      machineIp: [{ required: true, message: '请输入一体机ip', trigger: 'blur' }],
      apiVersion: [{ required: true, message: '请输入接口版本', trigger: 'blur' }],
      systemVersion: [{ required: true, message: '请输入系统版本', trigger: 'blur' }],
      companyName: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
      departmentName: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
      industry: [{ required: true, message: '请选择行业', trigger: 'change' }],
      manufacturer: [{ required: true, message: '请选择厂商', trigger: 'change' }],
      region: [{ required: true, message: '请选择区域', trigger: 'change' }],
      province: [{ required: true, message: '请选择省份', trigger: 'change' }],
    })

    // 监听props.info变化，用于编辑模式
    watch(
      () => props.info,
      (newVal) => {
        if (!newVal)
          return
        const {
          companyId,
          companyName,
          departmentId,
          departmentName,
        } = newVal
        form.value = {
          ...newVal,
          companyName: companyName || companyId,
          departmentName: departmentName || departmentId,
          companyId,
          departmentId,
        }

        setTimeout(() => {
          companyId && getDepartmentList(companyId)
        }, 100)
      },
      { immediate: true },
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

    // 获取省份列表
    const provinceList = ref([])
    const getProvincesQuery = useQuery({
      queryKey: ['provinceList'],
      queryFn: () => getProvinces(),
      onSuccess: ({ data }) => {
        if (data.success) {
          provinceList.value = data.result.map(item => ({
            value: item.districtCode,
            label: item.districtName,
          }))
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
    const onChangeCompany = (item) => {
      const company = companyList.value.find(c => c.companyName === item)
      form.value.companyId = company.id
      form.value.companyName = company.companyName

      // 清空已选部门
      form.value.departmentId = ''
      form.value.departmentName = ''
      getDepartmentList(company.id)
    }

    // 部门选择变更处理
    const onChangeDepartment = (item) => {
      const department = departmentList.value.find(d => d.departmentName === item)
      form.value.departmentId = department.id
      form.value.departmentName = department.departmentName
    }

    const onOpen = () => {
      visible.value = true
    }

    const resetForm = () => {
      if (formRef.value) {
        vm.$refs.formRef.resetFields()
      }
      form.value = {
        machineName: '',
        machineCode: '',
        loginUrl: '',
        machineIp: '',
        pushUrls: '',
        apiVersion: '',
        systemVersion: '',
        companyId: '',
        companyName: '',
        departmentId: '',
        departmentName: '',
        industry: '',
        manufacturer: '',
        region: '',
        province: '',
      }
    }

    const onCancel = () => {
      resetForm()
      emit('update:info', {})
      emit('update:check', false)
      visible.value = false
    }

    const queryClient = useQueryClient()
    const { mutate: addMachineMutate } = useMutation({
      mutationFn: params => addMachine(params),
      onSuccess: ({ data }) => {
        if (data.success) {
          vm.$message.success('添加一体机成功')
          queryClient.invalidateQueries({ queryKey: ['machineList'] })
          onCancel()
        }
        else {
          vm.$message.error(data.message || '添加一体机失败')
        }
        isSubmitting.value = false
      },
      onError: (error) => {
        vm.$message.error(error.message || '添加一体机失败')
        isSubmitting.value = false
      },
    })

    const onSubmit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          isSubmitting.value = true
          const submitData = {
            ...form.value,
          }
          addMachineMutate(submitData)
        }
      })
    }

    return {
      visible,
      form,
      departmentList,
      companyList,
      companyListQuery,
      provinceList,
      getProvincesQuery,
      rules,
      formRef,
      isSubmitting,
      onOpen,
      onCancel,
      onSubmit,
      onChangeCompany,
      onChangeDepartment,
    }
  },
}
</script>

<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      title="新增一体机"
      class="normal-dialog"
      width="50%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="px-6 mb-6">
        <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
          <el-row>
            <el-col :span="12">
              <el-form-item label="一体机名称" prop="machineName" required>
                <el-input
                  v-model="form.machineName"
                  clearable
                  placeholder="请输入一体机名称"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="一体机code" prop="machineCode" required>
                <el-input
                  v-model="form.machineCode"
                  clearable
                  placeholder="请输入一体机code"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="一体机登录地址" prop="loginUrl">
                <el-input
                  v-model="form.loginUrl"
                  clearable
                  placeholder="请输入一体机登录地址"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="一体机ip" prop="machineIp">
                <el-input
                  v-model="form.machineIp"
                  clearable
                  placeholder="请输入一体机ip"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="预警推送地址" prop="pushUrls">
                <el-input
                  v-model="form.pushUrls"
                  clearable
                  placeholder="请输入预警推送地址"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="两山智联盒SN" prop="oraySn">
                <el-input
                  v-model="form.oraySn"
                  clearable
                  placeholder="请输入两山智联盒SN"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="接口版本" prop="apiVersion">
                <el-input
                  v-model="form.apiVersion"
                  clearable
                  placeholder="请输入接口版本"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="系统版本" prop="systemVersion">
                <el-input
                  v-model="form.systemVersion"
                  clearable
                  placeholder="请输入系统版本"
                  :disabled="check"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="行业" prop="industry">
                <el-select
                  v-model="form.industry"
                  placeholder="请选择行业"
                  clearable
                  :disabled="check"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('MachineIndustry')"
                    :key="item.dictCode"
                    :label="item.dictName"
                    :value="item.dictName"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="厂商" prop="manufacturer">
                <el-select
                  v-model="form.manufacturer"
                  placeholder="请选择厂商"
                  clearable
                  :disabled="check"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('MachineManufacturer')"
                    :key="item.dictCode"
                    :label="item.dictName"
                    :value="item.dictName"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="区域" prop="region">
                <el-select
                  v-model="form.region"
                  placeholder="请选择区域"
                  clearable
                  :disabled="check"
                >
                  <el-option
                    v-for="item in $dictUtils.getDictList('MachineRegion')"
                    :key="item.dictCode"
                    :label="item.dictName"
                    :value="item.dictName"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="省份" prop="province">
                <el-select
                  v-model="form.province"
                  placeholder="请选择省份"
                  clearable
                  :disabled="check || !form.region"
                >
                  <el-option
                    v-for="item in provinceList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="所属公司" prop="companyName">
                <el-select
                  v-model="form.companyName"
                  placeholder="请选择公司"
                  clearable
                  :disabled="check"
                  @change="onChangeCompany"
                >
                  <el-option
                    v-for="item in companyList"
                    :key="item.id"
                    :label="item.companyName"
                    :value="item.companyName"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属部门" prop="departmentName">
                <el-select
                  v-model="form.departmentName"
                  placeholder="请选择部门"
                  clearable
                  :disabled="check || !form.companyName"
                  @change="onChangeDepartment"
                >
                  <el-option
                    v-for="item in departmentList"
                    :key="item.id"
                    :label="item.departmentName"
                    :value="item.departmentName"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
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
  </div>
</template>
