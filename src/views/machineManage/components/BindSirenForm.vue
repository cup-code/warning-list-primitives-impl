<script>
import { useQuery } from '@tanstack/vue-query'
import {
  getCurrentInstance,
  ref,
  watch,
} from 'vue'
import { queryVideoSiren } from '@/http/videoWarning/warning-api'

export default {
  name: 'BindSirenForm',
  props: {
    deviceInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { expose }) {
    const { proxy } = getCurrentInstance()
    const formRef = ref(null)

    // 表单数据
    const formData = ref({
      sirenIds: [],
    })

    // 声光报警器列表
    const sirenList = ref([])

    // 已绑定的声光报警器

    // 查询声光报警器列表
    const { refetch: fetchSirenList, isLoading } = useQuery({
      queryKey: ['videoSirenList'],
      queryFn: () =>
        queryVideoSiren({
          pageNum: 1,
          pageSize: 1000,
          enableState: '1', // 只查询启用状态的设备
        }),
      enabled: false, // 默认不自动查询
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          sirenList.value = data.result?.list || []
        }
        else {
          proxy.$message.error(data.message || '获取声光报警器列表失败')
        }
      },
      onError: (error) => {
        console.error('获取声光报警器列表失败:', error)
        proxy.$message.error('获取声光报警器列表失败')
      },
    })
    fetchSirenList()

    // 表单验证规则
    const formRules = {
      sirenIds: [
        { required: true, message: '请选择声光报警器', trigger: 'change' },
        {
          type: 'array',
          min: 1,
          message: '至少选择一个声光报警器',
          trigger: 'change',
        },
      ],
    }

    // // 下拉框展开时加载数据
    // const onSelectVisibleChange = (visible) => {
    //   if (visible && sirenList.value.length === 0) {
    //     fetchSirenList();
    //   }
    // };

    // 监听设备信息变化
    watch(
      () => props.deviceInfo,
      (newVal) => {
        if (newVal && newVal.sirenIds) {
          // 这里可以根据设备ID查询已绑定的声光报警器
          // 暂时使用模拟数据
          formData.value = {
            sirenIds: newVal.sirenIds.split(','),
          }
        }
        else {
          formRef.value?.clearValidate()
          formData.value = {
            sirenIds: [],
          }
        }
      },
      { immediate: true, deep: true },
    )

    // 表单验证方法
    const validateForm = (callback) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          // 将多选的ID转换为逗号分隔的字符串
          const submitData = {
            ...formData.value,
            sirenIds: formData.value.sirenIds.join(','),
          }
          callback(true, submitData)
        }
        else {
          callback(false)
        }
      })
    }

    expose({ validateForm })

    return {
      formRef,
      formData,
      formRules,
      sirenList,
      isLoading,
      // onSelectVisibleChange,
      validateForm,
    }
  },
}
</script>

<template>
  <div class="bind-siren-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
    >
      <el-form-item label="设备信息">
        <el-tag type="primary" size="medium">
          {{ deviceInfo.deviceName || "未选择设备" }}
        </el-tag>
      </el-form-item>

      <el-form-item label="声光报警器" prop="sirenIds">
        <el-select
          v-model="formData.sirenIds"
          placeholder="请选择声光报警器（可多选）"
          multiple
          filterable
          style="width: 80%"
        >
          <el-option
            v-for="item in sirenList"
            :key="item.id"
            :label="item.deviceName"
            :value="item.id"
          >
            <span style="float: left">{{ item.deviceName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ item.deviceNum }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.bind-siren-form {
  padding: 10px 20px;

  ::v-deep .el-form-item {
    margin-bottom: 20px;
  }

  .binded-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  ::v-deep .el-alert {
    margin-bottom: 0;
  }

  ::v-deep .el-tag {
    cursor: default;
  }

  ::v-deep .el-empty {
    padding: 20px 0;
  }
}
</style>
