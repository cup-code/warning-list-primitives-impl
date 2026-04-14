<script>
import { useMutation, useQuery } from '@tanstack/vue-query'
import { getCurrentInstance, ref } from 'vue'
import {
  bindVideoSiren,
  deleteMachine,
  machineList,
} from '@/http/machineManage/index'
import BindSirenForm from './components/BindSirenForm.vue'
import { deviceListConfig } from './config.js'

export default {
  name: 'ScMachineList',
  components: {
    BindSirenForm,
  },
  setup() {
    const { proxy } = getCurrentInstance()

    // 搜索表单
    const searchForm = ref({
      pageNum: 1,
      pageSize: 10,
    })

    // 表格数据
    const tableData = ref([])
    const total = ref(0)

    // 设备状态选项
    const deviceStatusOptions = [
      { label: '正常', value: '1' },
      { label: '故障', value: '2' },
      { label: '维修中', value: '3' },
      { label: '停用', value: '4' },
    ]

    // 当前设备信息
    const currentDevice = ref({})

    const bindSirenFormRef = ref(null)

    // 弹窗控制
    const deviceDialogVisible = ref(false)

    // 查询设备列表
    const { refetch, isLoading } = useQuery({
      queryKey: ['deviceList'],
      queryFn: () => machineList(searchForm.value),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          const { list, total: totalCount } = data.result || {}
          tableData.value = list || []
          total.value = totalCount || 0
        }
        else {
          proxy.$message.error(data.message || '获取设备列表失败')
        }
      },
      onError: (error) => {
        console.error('获取设备列表失败:', error)
        proxy.$message.error('获取设备列表失败')
      },
    })

    // 删除设备
    const deleteMachineMutate = useMutation({
      mutationFn: params => deleteMachine(params),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          proxy.$message.success('删除成功')
          refetch()
        }
        else {
          proxy.$message.error(data.message || '删除失败')
        }
      },
      onError: (error) => {
        console.error('删除设备失败:', error)
        proxy.$message.error('删除设备失败')
      },
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const statusMap = {
        1: 'success',
        2: 'danger',
        3: 'warning',
        4: 'info',
      }
      return statusMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const option = deviceStatusOptions.find(item => item.value === status)
      return option ? option.label : '未知'
    }

    // 搜索条件变化
    const onChange = (key, value) => {
      if (value) {
        searchForm.value[key] = value
      }
      else {
        delete searchForm.value[key]
      }
      searchForm.value.pageNum = 1
      searchFn()
    }

    const bindVideoSirenMutate = useMutation({
      mutationFn: params => bindVideoSiren(params),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          proxy.$message.success('绑定成功')
          deviceDialogVisible.value = false
          refetch()
        }
      },
    })

    // 声光报警器绑定
    const onBindFn = () => {
      bindSirenFormRef.value.validateForm((valid, res) => {
        if (valid) {
          console.log(valid, res, 9999)
          bindVideoSirenMutate.mutate({
            deviceId: currentDevice.value.id,
            sirenIds: res.sirenIds,
          })
        }
      })
    }
    // 查询
    const searchFn = () => {
      refetch()
    }

    // 重置
    const resetFn = () => {
      searchForm.value = {
        pageNum: 1,
        pageSize: 10,
      }
      refetch()
    }

    // 查看设备
    const onBind = (info) => {
      currentDevice.value = { ...info }
      deviceDialogVisible.value = true
    }

    // 删除设备
    const onDelete = (info) => {
      proxy
        .$confirm('确定删除该设备吗？删除后将无法恢复！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          deleteMachineMutate.mutate({ deviceId: info.deviceId })
        })
        .catch(() => {})
    }

    // 分页大小变化
    const pageSizeFn = (size) => {
      searchForm.value.pageSize = size
      refetch()
    }

    // 当前页变化
    const pageCurFn = (cur) => {
      searchForm.value.pageNum = cur
      refetch()
    }

    return {
      searchForm,
      deviceListConfig,
      tableData,
      total,
      isLoading,
      deviceStatusOptions,
      currentDevice,
      deviceDialogVisible,
      bindSirenFormRef,
      bindVideoSirenMutate,
      getStatusType,
      getStatusText,
      onChange,
      searchFn,
      resetFn,
      onBind,
      onDelete,
      onBindFn,
      pageSizeFn,
      pageCurFn,
    }
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索区域 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        :model="searchForm"
        size="mini"
        inline
      >
        <el-form-item label="设备名称：">
          <el-input
            v-model="searchForm.deviceName"
            placeholder="请输入设备名称"
            clearable
            @change="onChange('deviceName', $event)"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <EButton
            type="primary"
            size="mini"
            icon="search"
            @click="searchFn"
          >
            查询
          </EButton>
          <EButton
            btnIcon="el-icon-refresh-right"
            size="mini"
            @click="resetFn"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <CTable
        :list="deviceListConfig"
        height="100%"
        :tableData="tableData"
        :loading="isLoading"
      >
        <template #operation="{ info }">
          <EButton type="text" @click="onBind(info)">
            声光绑定
          </EButton>
          <EButton
            type="text"
            icon="delete"
            @click="onDelete(info)"
          >
            删除
          </EButton>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区域 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <!-- 弹窗区域 -->
    <div slot="dialog">
      <!-- 设备查看弹窗 -->
      <el-dialog
        title="声光报警器绑定"
        :visible.sync="deviceDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        append-to-body
      >
        <BindSirenForm ref="bindSirenFormRef" :deviceInfo="currentDevice" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">关 闭</el-button>
          <el-button
            style="margin-left: 4px"
            type="primary"
            @click="onBindFn"
          >
            确定
          </el-button>
        </span>
      </el-dialog>
    </div>
  </KyTreeTable>
</template>

<style scoped lang="scss">
::v-deep .el-table {
  .el-button--text {
    padding: 0 5px;
  }
}

::v-deep .el-dialog__body {
  padding: 20px;
}
</style>
