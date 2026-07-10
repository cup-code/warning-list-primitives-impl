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
import { addCamera, queryVideoSiren } from '@/http/videoWarning/warning-api'
import PickPeople from '@/views/common-ui/PickPeople'
import SelectMachine from './selectMachine.vue'

export default {
  name: 'AddCamera',
  components: {
    PickPeople,
    SelectMachine,
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
    check: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const visible = ref(false)
    const form = ref({
      cameraName: '',
      aiSkills: '',
      responsiblePerson: '',
      responsiblePersonCompany: '',
      responsiblePersonDepartment: '',
      machineName: '',
      machineId: '',
      companyId: '',
      departmentId: '',
    })
    const peopleProp = reactive({})
    const formRef = ref(null)
    const showPeopleDialog = ref(false)
    const queryClient = useQueryClient()
    const sirenId = ref([])
    const rules = reactive({
      cameraName: [{ required: true, message: '请输入摄像头名称', trigger: 'blur' }],
      machineName: [{ required: true, message: '请选择所属一体机', trigger: 'blur' }],
    })

    watch(
      () => props.info,
      (newVal) => {
        if (!newVal)
          return
        const {
          userId,
          userName,
          companyId,
          companyName,
          departmentId,
          departmentName,
          machineId,
          machineName,
          sirenIds,
        } = newVal
        sirenId.value = sirenIds ? sirenIds.split(',') : []
        form.value = {
          ...newVal,
          userId,
          responsiblePerson: userName,
          responsiblePersonCompany: companyName,
          responsiblePersonDepartment: departmentName,
          companyId,
          departmentId,
          machineId,
          machineName,
          sirenIds,
        }
      },
    )

    const onSelectPerson = () => {
      if (props.check) {
        return
      }

      if (props.info?.userId) {
        peopleProp.oldPickData = {
          id: props.info?.userId || '',
          fullName: props.info?.userName || '',
        }
      }
      peopleProp.isSingle = true
      peopleProp.listType = 'role'
      peopleProp.withoutChildrenDepartment = true
      showPeopleDialog.value = true
    }
    const onOpen = () => {
      visible.value = true
    }

    const onCancel = () => {
      vm.$refs.formRef.resetFields
      emit('update:info', {})
      visible.value = false
    }

    const onChangeMachine = (item) => {
      form.value.machineId = item.id
      form.value.machineName = item.machineName
    }

    const closePeopleEvt = (result) => {
      if (result === null) {
        showPeopleDialog.value = false
        return
      }

      const {
        companyId,
        companyName,
        departmentId,
        departmentName,
        id,
        fullName,
      } = result.data

      form.value.responsiblePerson = fullName
      form.value.responsiblePersonCompany = companyName
      form.value.responsiblePersonDepartment = departmentName
      form.value.companyId = companyId
      form.value.departmentId = departmentId
      form.value.userId = id

      showPeopleDialog.value = false
    }

    const { mutate: addCameraMutate } = useMutation({
      mutationFn: params => addCamera(params),
      onSuccess: ({ data }) => {
        if (data.success) {
          visible.value = false
        }
        queryClient.invalidateQueries({ queryKey: ['cameraList'] })
        onCancel()
      },
      onError: (error) => {
        vm.$message.error(error.message)
      },
    })

    // 获取表格数据
    const videoList = ref([])
    const videoListQuery = useQuery({
      queryKey: ['videoList'],
      queryFn: () =>
        queryVideoSiren({
          pageNum: 1,
          pageSize: 1000,
        }),
      onSuccess: ({ data }) => {
        if (data.success) {
          videoList.value = data.result.list || []
        }
      },
    })

    const onChange = (key, value) => {
      if (value) {
        form.value[key] = value.join(',')
      }
      else {
        form.value[key] = ''
      }
    }

    const onSubmit = () => {
      if (form.value.responsiblePerson === '') {
        vm.$message.error('请选择责任人')
        return
      }
      vm.$refs.formRef.validate((valid) => {
        if (valid) {
          addCameraMutate(form.value)
        }
        else {
          console.log('error submit!!')
        }
      })
    }

    return {
      visible,
      form,
      rules,
      videoList,
      sirenId,
      onSelectPerson,
      onChangeMachine,
      onChange,
      formRef,
      onOpen,
      videoListQuery,
      onCancel,
      onSubmit,
      showPeopleDialog,
      peopleProp,
      closePeopleEvt,
    }
  },
}
</script>

<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      title="新增摄像头"
      class="normal-dialog"
      width="50%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="mb-6 w-2/3">
        <el-form ref="formRef" :model="form" label-width="120px" :rules="rules">
          <el-form-item label="摄像头名称" prop="cameraName" required>
            <el-input
              v-model="form.cameraName"
              clearable
              placeholder="请输入摄像头名称"
              :disabled="check"
            />
          </el-form-item>
          <el-form-item label="ai技能" prop="aiSkills">
            <el-input
              v-model="form.aiSkills"
              clearable
              placeholder="请输入ai技能"
              :disabled="check"
            />
          </el-form-item>
          <el-form-item label="所属一体机" prop="machineName">
            <SelectMachine
              :value="form.machineName"
              :disabled="check"
              @change="onChangeMachine"
            />
          </el-form-item>
          <el-form-item label="责任人" prop="responsiblePerson">
            <div class="cursor-pointer" @click="onSelectPerson">
              <el-input
                v-model="form.responsiblePerson"
                clearable
                placeholder="请选择责任人"
                :disabled="check"
              />
            </div>
          </el-form-item>
          <el-form-item label="责任人所属公司" prop="responsiblePersonCompany">
            <el-input v-model="form.responsiblePersonCompany" disabled />
          </el-form-item>
          <el-form-item label="责任人所属部门" prop="responsiblePersonDepartment">
            <el-input v-model="form.responsiblePersonDepartment" disabled />
          </el-form-item>

          <el-form-item label="关联声光报警器">
            <el-select
              v-model="sirenId"
              :disabled="check"
              clearable
              multiple
              collapse-tags
              placeholder="请选择关联声光报警器"
              @change="onChange('sirenIds', $event)"
            >
              <el-option
                v-for="item in videoList"
                :key="item.id"
                :label="item.deviceName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <EButton type="default" @click="onCancel">
          取消
        </EButton>
        <EButton type="primary" @click="onSubmit">
          提交
        </EButton>
      </div>
    </el-dialog>

    <el-dialog
      class="normal-dialog"
      title="选择人员"
      :visible.sync="showPeopleDialog"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <PickPeople v-if="showPeopleDialog" v-bind="peopleProp" @close="closePeopleEvt" />
    </el-dialog>
  </div>
</template>
